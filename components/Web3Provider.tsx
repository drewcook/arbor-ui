import type { NFTStorage } from 'nft.storage'
import type { OnboardAPI, WalletState } from '@web3-onboard/core'
import type { ReactNode } from 'react'
import { createContext, useContext, useState } from 'react'
import NFTContract from '../contracts/PolyechoNFT.json'
import { IUser } from '../models/user.model'
import getWeb3 from '../utils/getWeb3'
import { get, post } from '../utils/http'
import NFTStorageClient from '../utils/NFTStorageClient'
import web3Onboard from '../utils/web3Onboard'

// Context types
type Web3ContextProps = {
	web3: any // web3.js instance for easy use
	NFTStore: any
	onboard: any // Blocknative Onboard instance for easy use
	contract: any // The smart contract deployed on the given selected network ID
	connected: boolean
	handleConnectWallet: any
	handleDisconnectWallet: any
	currentUser: IUser | null
}

type Web3ProviderProps = {
	children: ReactNode
}

// Supported network: KardiaChain Testnet
// Onboard takes hexadecimal values
const PREFERRED_NETWORK_ID = '0xF2'

// Create context
// @ts-ignore
const Web3Context = createContext<Web3ContextProps>({})

// Context provider
export const Web3Provider = ({ children }: Web3ProviderProps): JSX.Element => {
	const [web3, setWeb3] = useState(null)
	const [contract, setContract] = useState(null)
	const [NFTStore, setNFTStore] = useState<NFTStorage | null>(null)
	const [onboard, setOnboard] = useState<OnboardAPI | null>(null)
	const [connected, setConnected] = useState<boolean>(false)
	const [currentUser, setCurrentUser] = useState<IUser | null>(null)

	const loadWeb3 = async (): Promise<any> => {
		try {
			// Auto-select wallet by checking local storage
			// See https://docs.blocknative.com/onboard/core#auto-selecting-a-wallet
			// @ts-ignore
			const previouslyConnectedWallets = JSON.parse(window.localStorage.getItem('connectedWallets'))
			let walletState: WalletState[]
			if (previouslyConnectedWallets && previouslyConnectedWallets.length > 0) {
				// Auto connect "silently" and disable all onboard modals to avoid them flashing on page load
				walletState = await web3Onboard.connectWallet({
					autoSelect: { label: previouslyConnectedWallets[0], disableModals: true },
				})
			} else {
				// Otherwise, connect a new wallet
				walletState = await web3Onboard.connectWallet()
			}

			// If wallet was selected and connected to the app via the wallet UI, then do several more things...
			if (web3Onboard.state.get().wallets[0]) {
				// If wallet was selected successfully, but not on a supported chain, prompt to switch to a supported one
				let switchedToSupportedChain: boolean
				switchedToSupportedChain = await web3Onboard.setChain({ chainId: PREFERRED_NETWORK_ID })
				if (!switchedToSupportedChain) {
					// If rejecting, disconnect and exit
					handleDisconnectWallet()
					return { connectedAccount: null }
				}

				// Set onboard instance state
				setOnboard(web3Onboard)

				// Set Web3 instance based off browser support
				const web3Instance = await getWeb3()
				if (!web3Instance) throw new Error('Must be in a Web3 supported browser')
				setWeb3(web3Instance)

				// Set PolyechoNFT smart contract based off network ABI
				const networkId = await web3Instance.eth.net.getId()
				const deployedNetwork = NFTContract.networks[networkId]
				const nftContract = new web3Instance.eth.Contract(NFTContract.abi, deployedNetwork && deployedNetwork.address)
				setContract(nftContract)

				// Connect to NFT.storage
				await connectNFTStorage()

				// Listen for account changes from browser wallet UI
				web3Instance.currentProvider.on('accountsChanged', async (newAccounts: string[]) => {
					const newAccount = newAccounts[0]
					// Since this listener could be called after connecting then disconnecting and then switching accounts, unconnected to the app, check again that we're connected to the right network before attempting to find or create the new user
					if (web3Onboard.state.get().wallets[0]?.chains[0].id === PREFERRED_NETWORK_ID) {
						console.info(`Switching wallet accounts to ${newAccount}`)
						await findOrCreateUser(newAccount)
					}
				})

				// Listen for chain changes from browser wallet UI
				web3Instance.currentProvider.on('chainChanged', async (chainId: string) => {
					// Check if the new chain is supported
					if (
						!web3Onboard.state
							.get()
							.chains.map(chain => chain.id)
							.includes(web3Instance.utils.toHex(chainId))
					) {
						// Since this listener could be called after connecting then disconnecting and then switching accounts, unconnected to the app, check again that a wallet is connected, and then prompt to switch to a supported network (prevent them from switching to some degree)
						if (web3Onboard.state.get().wallets[0]) {
							console.warn(
								`Switching wallet networks: Network ID ${chainId} is not supported. Please switch back to the Polygon Testnet in your wallet for full support.`,
							)
							switchedToSupportedChain = await web3Onboard.setChain({ chainId: PREFERRED_NETWORK_ID })
							// If rejecting, disconnect and exit
							if (!switchedToSupportedChain) {
								handleDisconnectWallet()
								return { connectedAccount: null }
							}
						}
					} else {
						console.info(`Switching wallet networks: Network ID ${chainId} is supported`)
						// TODO: Set the new contract instance to interact with after switching to a supported network
						// const deployedNetwork = NFTContract.networks[networkId]
						// const nftContract = new web3Instance.eth.Contract(NFTContract.abi, deployedNetwork && deployedNetwork.address)
						// setContract(nftContract)
					}
				})

				// Set connected state after all the above has succeeded
				setConnected(true)
			} else {
				return { connectedAccount: null }
			}

			// We have a connected account on a supported chain and have switched to that network...
			// Set the currently connected account to the most recently connected one that was chosen if so
			return { connectedAccount: walletState[0].accounts[0].address }
		} catch (e: any) {
			// Catch any errors for any of the above operations.
			console.error(e.message)
			// Disconnect and clean up for fail safe
			handleDisconnectWallet()
			return { connectedAccount: null }
		}
	}

	/**
	 * Connect to the NFT.storage Node (or local IPFS client)
	 */
	const connectNFTStorage = async () => {
		try {
			const node = NFTStorageClient
			if (node) {
				setNFTStore(node)
				console.info('Connected to NFT.storage')
			}
		} catch (err) {
			console.error('Failed to connect to NFT.storage', err)
		}
	}

	/**
	 * Allow for components to update connected status and sign in with Onboard.js
	 */
	const handleConnectWallet = async () => {
		try {
			const { connectedAccount } = await loadWeb3()
			if (connectedAccount) await findOrCreateUser(connectedAccount)
		} catch (e: any) {
			console.error(e.message)
		}
	}

	/**
	 * This is responsible for finding or creating a user based off of a given wallet address.
	 * This is called when connecting a wallet or switching wallet accounts.
	 * This will set our current user state based on the record data
	 */
	const findOrCreateUser = async (account: string) => {
		try {
			// If there is not a user found for this connected account, create a new user record
			const findRes = await get(`/users/${account.toLowerCase()}`)
			if (findRes.data) {
				setCurrentUser(findRes.data)
			} else {
				const createRes = await post('/users', {
					address: account.toLowerCase(),
				})
				setCurrentUser(createRes.data)
			}
		} catch (e: any) {
			console.error(e.message)
		}
	}

	/**
	 * Allow for components to update connected status and sign out with Onboard.js
	 */
	const handleDisconnectWallet = async () => {
		try {
			// Disconnect the first wallet in the wallets array
			if (!onboard) return
			const primaryWallet = onboard.state.get().wallets[0]
			await onboard.disconnectWallet({ label: primaryWallet.label })
			// Set provider local state
			setConnected(false)
			setCurrentUser(null)
			console.info('Successfully disconnected wallet')
		} catch (e: any) {
			console.error(e.message)
		}
	}

	return (
		<Web3Context.Provider
			value={{
				web3,
				contract,
				NFTStore,
				onboard,
				connected,
				handleConnectWallet,
				handleDisconnectWallet,
				currentUser,
			}}
		>
			{children}
		</Web3Context.Provider>
	)
}

// Context hook
export const useWeb3 = () => {
	const context: Partial<Web3ContextProps> = useContext(Web3Context)

	if (context === undefined) {
		throw new Error('useWeb3 must be used within an Web3Provider component.')
	}
	return context
}

export default Web3Context
