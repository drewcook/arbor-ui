import type { ReactNode} from 'react'
import type { Wallet } from 'bnc-onboard/dist/src/interfaces'
import { createContext, useContext, useEffect, useState } from 'react'
import getWeb3 from '../utils/getWeb3'
import Onboard from 'bnc-onboard'
import FullPageLoading from './FullPageLoading'
import Web3Fallback from './Web3Fallback'
import wallets from '../utils/web3wallets'
import type { NFTStorage } from 'nft.storage'
import NFTStorageClient from '../utils/NFTStorageClient'

// Context types
type Web3ContextProps = {
	web3: any,
	accounts: any,
  onboard: any,
  NFTStore: NFTStorage,
}

type ProviderProps = {
  children: ReactNode
}

// Create context
const Web3Context = createContext<Partial<Web3ContextProps>>({})

// Context provider
export const Web3Provider = ({children}: ProviderProps): JSX.Element => {
  const [NFTStore, setNFTStore] = useState<NFTStorage>()
	const [web3, setWeb3] = useState(null)
	const [accounts, setAccounts] = useState<string[]|null>(null)
  const [onboard, setOnboard] = useState<unknown|null>(null)
	const [loading, setLoading] = useState(true)
	const [error, setError] = useState<string|null>(null)

	useEffect(() => {
    const loadWeb3 = async () => {
      try {
        // Get network provider and web3 instance
        let web3Instance = await getWeb3()
        setWeb3(web3Instance)

        // initialize onboard
        const onboardInstance = Onboard({
          dappId: process.env.BLOCKNATIVE_KEY,
          networkId: 4, // Rinkeby
          darkMode: true,
          subscriptions: {
            address: async (address: string) => {
              setAccounts([address])
            },
            wallet: async (wallet: Wallet) => {
              console.log(`${wallet.name} connected!`)
            },
          },
          walletSelect: { wallets }
        })
        setOnboard(onboardInstance)

        // Connect to NFT.storage
        await connectNFTStorage()


        // Prompt user to select a wallet
        const walletSelected = await onboardInstance.walletSelect('MetaMask')
        if (walletSelected) {
          // Run wallet checks to make sure that user is ready to transact
          const readyToTransact = await onboardInstance.walletCheck()
        }


        // Get accounts initially
        const connectedAccounts = await web3Instance.eth.getAccounts()
        setAccounts(connectedAccounts)

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

        setLoading(false)
      } catch (error) {
        // Catch any errors for any of the above operations.
        setError('Failed to load web3, accounts, or contract. Check console for details.')
        console.error(error)
        setLoading(false)
      }
    }
		loadWeb3()
	}, [])

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

	if (loading) return <FullPageLoading />
	if (error) return <Web3Fallback />

	return <Web3Context.Provider value={{ web3, accounts, NFTStore, onboard }}>{children}</Web3Context.Provider>
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
