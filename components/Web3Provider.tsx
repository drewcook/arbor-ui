import Onboard from 'bnc-onboard'
import type { API, Wallet } from 'bnc-onboard/dist/src/interfaces'
import type { NFTStorage } from 'nft.storage'
import type { ReactNode } from 'react'
import { createContext, useContext, useState } from 'react'
import SampleNFTContract from '../contracts/PolyechoSample.json'
import getWeb3 from '../utils/getWeb3'
import { get, post } from '../utils/http'
import NFTStorageClient from '../utils/NFTStorageClient'
import wallets from '../utils/web3wallets'
import Web3Fallback from './Web3Fallback'

// Context types
type Web3ContextProps = {
	web3: any
	NFTStore: any
	onboard: any
	accounts: any
	contract: any
	connected: boolean
	handleConnectWallet: any
	handleDisconnectWallet: any
}

type ProviderProps = {
	children: ReactNode
}

// Rinkeby
const NETWORK_ID = 4

// Create context
// @ts-ignore
const Web3Context = createContext<Web3ContextProps>({})

// Context provider
export const Web3Provider = ({ children }: ProviderProps): JSX.Element => {
	const [error, setError] = useState<string | null>(null)
	const [web3, setWeb3] = useState(null)
	const [contract, setContract] = useState(null)
	const [accounts, setAccounts] = useState<string[]>([])
	const [NFTStore, setNFTStore] = useState<NFTStorage | null>(null)
	const [onboard, setOnboard] = useState<API | null>(null)
	const [connected, setConnected] = useState<boolean>(false)

	const loadWeb3 = async (): Promise<any> => {
		try {
			// Connect to NFT.storage
			await connectNFTStorage()

			// Get network provider and web3 instance
			const web3Instance = await getWeb3()

			if (!web3Instance) throw new Error('Must be in a Web3 supported browser')

			setWeb3(web3Instance)

			// // Get SampleNFT contract
			const networkId = await web3Instance.eth.net.getId()
			/* @ts-ignore */
			const deployedNetwork = SampleNFTContract.networks[networkId]
			const sampleContract = new web3Instance.eth.Contract(
				SampleNFTContract.abi,
				deployedNetwork && deployedNetwork.address,
			)
			setContract(sampleContract)

			// // Get accounts initially
			const connectedAccounts = await web3Instance.eth.getAccounts()
			setAccounts(connectedAccounts)
			if (connectedAccounts.length > 0) setConnected(true)

			// Listen for account changes
			web3Instance.currentProvider.on('accountsChanged', async (newAccounts: string[]) => {
				console.info('Switching wallet accounts')
				setAccounts(newAccounts)
			})

			// Listen for chain changes
			web3Instance.currentProvider.on('chainChanged', (chainId: string) => {
				console.info(`Switching wallet networks: Network ID ${chainId} is supported`)
				// Correctly handling chain changes can be complicated
				// Reload the page as simple solution
				window.location.reload()
			})

			// Initialize Onboard.js for production builds (bypass for local dev)
			const onboardInstance = Onboard({
				dappId: process.env.BLOCKNATIVE_KEY,
				networkId: process.env.NODE_ENV === 'production' ? NETWORK_ID : 1337,
				darkMode: true,
				subscriptions: {
					address: async (address: string) => {
						setAccounts([address])
					},
					wallet: async (wallet: Wallet) => {
						console.log(`${wallet.name} connected!`)
					},
				},
				walletSelect: {
					wallets,
				},
			})
			setOnboard(onboardInstance)

			// Connect wallet
			const connected = await onboardInstance.walletSelect()
			if (connected) {
				setConnected(true)
				const readyToTransact = await onboardInstance.walletCheck()
			}

			return {
				connectedAccounts,
			}
		} catch (e: any) {
			// Catch any errors for any of the above operations.
			setError('Failed to load Web3 tooling. Check console for details.')
			console.error(e)
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
			const { connectedAccounts } = await loadWeb3()
			// If there is not a user created for this connected account, create one
			const res = await get(`/users/${connectedAccounts[0]}`)
			let data: IDBRequestReadyState | null = res.success ? res.data : null
			console.log('existing', {
				data,
				accounts,
				connectedAccounts,
			})
			if (!data) {
				const res = await post('/users', {
					address: connectedAccounts[0],
				})
				data = res.success ? res.data : null
				console.log('created', {
					data,
					accounts,
					connectedAccounts,
				})
			}
			// If there is a user, great
		} catch (e) {
			console.error(e)
		}
	}

	/**
	 * Allow for components to update connected status and sign out with Onboard.js
	 */
	const handleDisconnectWallet = async () => {
		try {
			await onboard?.walletReset()
			setConnected(false)
		} catch (e) {
			console.error(e)
		}
	}

	if (error) return <Web3Fallback />

	return (
		<Web3Context.Provider
			value={{
				web3,
				accounts,
				contract,
				NFTStore,
				onboard,
				connected,
				handleConnectWallet,
				handleDisconnectWallet,
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
