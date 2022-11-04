////////////////////////////////////////////////////////////////////////////////////
/// This is not being used but is kept for reference.
///	This file implements Onboard.js in the mix of wallet and account management.
////////////////////////////////////////////////////////////////////////////////////
import type { OnboardAPI, WalletState } from '@web3-onboard/core'
import { Contract } from 'ethers'
import type { NFTStorage } from 'nft.storage'
import type { ReactNode } from 'react'
import { createContext, useContext, useState } from 'react'

import { collectionsContract, stemQueueContract } from '../constants/contracts'
import { NETWORK_HEX, NETWORK_NAME } from '../constants/networks'
import type { IUserDoc } from '../models/user.model'
import getWeb3 from '../utils/getWeb3'
import { get, post } from '../utils/http'
import NFTStorageClient from '../utils/NFTStorageClient'
import web3Onboard from '../utils/web3Onboard'

// Context types
// NOTE: We have to use 'any' because I believe the Partial<Web3ContextProps> makes them possibly undefined
type Web3ContextProps = {
	NFTStore: any
	onboard: any // Blocknative Onboard instance for easy use
	connected: boolean
	handleConnectWallet: any
	handleDisconnectWallet: any
	currentUser: IUserDoc | null
	contracts: any
}

type Web3ProviderProps = {
	children: ReactNode
}

type PolyechoContracts = {
	nft: Contract
	stemQueue: Contract
}

// Create context
// @ts-ignore
const Web3Context = createContext<Web3ContextProps>({})

// Context provider
export const Web3Provider = ({ children }: Web3ProviderProps): JSX.Element => {
	const [NFTStore, setNFTStore] = useState<NFTStorage | null>(null)
	const [onboard, setOnboard] = useState<OnboardAPI | null>(null)
	const [connected, setConnected] = useState<boolean>(false)
	const [currentUser, setCurrentUser] = useState<IUserDoc | null>(null)
	const [contracts, setContracts] = useState<PolyechoContracts>({ nft: {} as Contract, stemQueue: {} as Contract })

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

			const wallet = web3Onboard.state.get().wallets[0]

			// If wallet was selected and connected to the app via the wallet UI, then do several more things...
			if (wallet) {
				console.log(walletState)
				// If wallet was selected successfully, but not on a supported chain, prompt to switch to a supported one
				let switchedToSupportedChain: boolean
				switchedToSupportedChain = await web3Onboard.setChain({ chainId: NETWORK_HEX })
				if (!switchedToSupportedChain) {
					// If rejecting, disconnect and exit
					handleDisconnectWallet()
					return { connectedAccount: null }
				}

				// Set onboard instance state
				setOnboard(web3Onboard)

				// Get Web3 instance based off browser support
				const { provider, signer } = await getWeb3()
				if (!provider || !signer) throw new Error('Must be in a Web3 supported browser')
				console.log({ provider, signer })
				// const signerAddress = await signer.getAddress()

				// Setup contracts with signer of connected address
				// const signer = web3Instance.getSigner(wallet.accounts[0].address)
				// console.log(signer)
				const nft = collectionsContract.connect(signer)
				const stemQueue = stemQueueContract.connect(signer)
				setContracts({ nft, stemQueue })

				// Connect to NFT.storage
				await connectNFTStorage()

				// Listen for account changes from browser wallet UI
				provider.on('accountsChanged', async (newAccounts: string[]) => {
					const newAccount = newAccounts[0]
					// Since this listener could be called after connecting then disconnecting and then switching accounts, unconnected to the app, check again that we're connected to the right network before attempting to find or create the new user
					if (wallet.chains[0].id === NETWORK_HEX) {
						console.info(`Switching wallet accounts to ${newAccount}`)
						await findOrCreateUser(newAccount)
					}
				})

				// Listen for chain changes from browser wallet UI
				provider.on('chainChanged', async (chainId: string) => {
					// Check if the new chain is supported
					if (
						!web3Onboard.state
							.get()
							.chains.map(chain => chain.id.toUpperCase())
							.includes(chainId.toUpperCase())
					) {
						// Since this listener could be called after connecting then disconnecting and then switching accounts, unconnected to the app, check again that a wallet is connected, and then prompt to switch to a supported network (prevent them from switching to some degree)
						if (web3Onboard.state.get().wallets[0]) {
							console.warn(
								`Switching wallet networks: Network ID ${chainId} is not supported. Please switch back to the ${NETWORK_NAME} in your wallet for full support.`,
							)
							switchedToSupportedChain = await web3Onboard.setChain({ chainId: NETWORK_HEX })
							// If rejecting, disconnect and exit
							if (!switchedToSupportedChain) {
								handleDisconnectWallet()
								return { connectedAccount: null }
							}
						}
					} else {
						console.info(`Switching wallet networks: Network ID ${chainId} is supported`)
					}
				})

				// Set connected state after all the above has succeeded
				setConnected(true)
				return { connectedAccount: wallet.accounts[0].address }
			} else {
				return { connectedAccount: null }
			}
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
				NFTStore,
				onboard,
				connected,
				handleConnectWallet,
				handleDisconnectWallet,
				currentUser,
				contracts,
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
