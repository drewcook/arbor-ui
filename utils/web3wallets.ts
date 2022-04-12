/**
 * These are web3 wallet configs that we support via Blocknative's Onboard.js
 */

interface IWeb3Wallet {
	walletName: string
	label?: string
	preferred?: boolean
	rpc?: any
	bridge?: string
	display?: { desktop: boolean; mobile: boolean }
	infuraKey?: string
	rpcUrl?: string
}

const rpcUrl = `https://polygon-mumbai.g.alchemy.com/v2/${process.env.ALCHEMY_POLYGON_TESTNET_KEY}`

const wallets: IWeb3Wallet[] = [
	{ walletName: 'metamask', preferred: true },
	{
		walletName: 'walletConnect',
		rpc: {
			'137': 'https://polygon-rpc.com', // Polygon Mainnet
			// '80001': 'https://matic-mumbai.chainstacklabs.com', // Polygon Mumbai
			'80001': rpcUrl,
			'1337': rpcUrl,
		},
		preferred: true,
	},
	{ walletName: 'ledger', rpcUrl, preferred: true },
	{ walletName: 'tally', preferred: true },
	{ walletName: 'coinbase', preferred: true, display: { desktop: true, mobile: true } },
	{ walletName: 'gnosis' },
	{ walletName: 'torus' },
	{ walletName: 'xdefi' },
	{ walletName: 'binance' },
	{ walletName: 'liquality' },
	{ walletName: 'blankwallet' },
	{ walletName: 'mathwallet' },
	{ walletName: 'ronin' },
]

export default wallets
