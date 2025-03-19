import newIdentity from '@interep/identity'
import { calculateReputation, OAuthProvider } from '@interep/reputation'
import detectEthereumProvider from '@metamask/detect-provider'
import { Contract, providers } from 'ethers'
import type { NFTStorage } from 'nft.storage'
import type { ReactNode } from 'react'
import { createContext, useContext, useState } from 'react'

import { collectionsContract, stemQueueContract } from '../constants/contracts'
import { NETWORK_CURRENCY, NETWORK_EXPLORER, NETWORK_HEX, NETWORK_NAME, NETWORK_RPC } from '../constants/networks'
import { get, post } from '../lib/http'
import logger from '../lib/logger'
import NFTStorageClient from '../lib/NFTStorageClient'
import type { UserDoc } from '../models'

// Context types
// NOTE: We have to use 'any' because I believe the Partial<Web3ContextProps> makes them possibly undefined
type Web3ContextProps = {
	contracts: any
	NFTStore: any
	connected: boolean
	handleConnectWallet: any
	handleDisconnectWallet: any
	currentUser: UserDoc | null
	updateCurrentUser: any
	createIdentity: any
	calculateUserReputation: any
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
	const [connected, setConnected] = useState<boolean>(false)
	const [currentUser, setCurrentUser] = useState<UserDoc | null>(null)
	const [contracts, setContracts] = useState<PolyechoContracts>({ nft: {} as Contract, stemQueue: {} as Contract })

	const checkForSupportedNetwork = async (provider: any) => {
		const chainId = await provider.request({ method: 'eth_chainId' })

		if (chainId.toUpperCase() !== NETWORK_HEX.toUpperCase()) {
			try {
				console.warn(
					`Network ID ${chainId} is not supported. Please switch back to the ${NETWORK_NAME} in your wallet for full support.`,
				)
				// Prompt user to connect to the correct network
				await provider.request({
					method: 'wallet_switchEthereumChain',
					params: [
						{
							chainId: NETWORK_HEX,
						},
					],
				})
			} catch (error: any) {
				// This error code indicates that the chain has not been added to MetaMask
				// if it is not, then install it into the user MetaMask
				if (error.code === 4902) {
					try {
						await provider.request({
							method: 'wallet_addEthereumChain',
							params: [
								{
									chainId: NETWORK_HEX,
									chainName: NETWORK_NAME,
									nativeCurrency: {
										name: NETWORK_CURRENCY,
										symbol: NETWORK_CURRENCY,
										decimals: 18,
									},
									rpcUrls: [NETWORK_RPC],
									blockExplorerUrls: [NETWORK_EXPLORER],
								},
							],
						})
					} catch (addError) {
						logger.red(addError)
					}
				}
				logger.red(error)
			}
		} else {
			console.info(`Network ID ${chainId} is supported`)
		}
	}

	const loadWeb3 = async (): Promise<any> => {
		try {
			// Get Web3 instance based off browser support
			const provider = (await detectEthereumProvider()) as any
			if (!provider) return alert('Please make sure you have installed Metamask or another Web3 wallet.')

			// Check that user is connected to the supported network
			await checkForSupportedNetwork(provider)

			// Request accounts to connect to dApp
			await provider.request({ method: 'eth_requestAccounts' })

			// Get signer and provider
			const ethersProvider = new providers.Web3Provider(provider)
			const signer = ethersProvider.getSigner()
			const signerAddress = await signer.getAddress()

			// Check that we're on the supported network

			// Setup contracts with signer of connected address
			const nft = collectionsContract.connect(signer)
			const stemQueue = stemQueueContract.connect(signer)
			setContracts({ nft, stemQueue })

			// Connect to NFT.storage
			await connectNFTStorage()

			// Listen for account changes from browser wallet UI
			provider.on('accountsChanged', async (newAccounts: string[]) => {
				const newAccount = newAccounts[0]
				console.info(`Switching wallet accounts to ${newAccount}`)
				await findOrCreateUser(newAccount)
				// window.location.reload()
			})

			// Listen for chain changes from browser wallet UI
			provider.on('chainChanged', async (chainId: string) => {
				console.info(`Switching wallet networks to ${chainId}...`)
				// Ensure the network is supported
				checkForSupportedNetwork(provider)
				// window.location.reload()
			})

			setConnected(true)
			return { connectedAccount: signerAddress }
		} catch (e: any) {
			// Catch any errors for any of the above operations.
			logger.red(e.message)
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
			logger.red(`Failed to connect to NFT.storage - ${err}`)
		}
	}

	/**
	 * Allow for components to update connected status and sign in with Onboard.js
	 */
	const handleConnectWallet = async () => {
		try {
			await createIdentity('Twitter')
			const { connectedAccount } = await loadWeb3()
			if (connectedAccount) await findOrCreateUser(connectedAccount)
		} catch (e: any) {
			logger.red(e.message)
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
			logger.red(e.message)
		}
	}

	/**
	 * Allow for components to update connected status
	 */
	const handleDisconnectWallet = async () => {
		try {
			// Set provider local state
			setConnected(false)
			setCurrentUser(null)
			console.info('Successfully disconnected wallet')
			window.location.reload()
		} catch (e: any) {
			logger.red(e.message)
		}
	}

	/**
	 * Utility handler for updating the global state of the current user so that UI's can respond
	 */
	const updateCurrentUser = (newUserData: UserDoc) => {
		setCurrentUser(newUserData)
	}

	/**
	 * Creates an identity that the user can identify with
	 * @param provider - Provider should be either 'Twitter' 'Github' or 'Reddit'
	 * @returns identity - The identity of that user
	 */
	const createIdentity = async (provider: string) => {
		const ethereumProvider = (await detectEthereumProvider()) as any
		const ethersProvider = new providers.Web3Provider(ethereumProvider)
		const signer = ethersProvider.getSigner()
		await calculateUserReputation('TWITTER', { followers: 10000 })

		const identity = await newIdentity(message => signer.signMessage(message), provider)

		return identity
	}

	/**
	 * Calculates a user reputation for the desired platform
	 * @param provider - Provider is the platform the user is authorized on
	 * @param params - Params is an object taking in details based off the social platform the user is using
	 * @returns reputation - The reputation level of that user
	 */
	const calculateUserReputation = async (provider: string, params: object) => {
		const reputation = calculateReputation(OAuthProvider[provider], params)

		return reputation
	}

	return (
		<Web3Context.Provider
			value={{
				contracts,
				NFTStore,
				connected,
				handleConnectWallet,
				handleDisconnectWallet,
				currentUser,
				updateCurrentUser,
				createIdentity,
				calculateUserReputation,
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
