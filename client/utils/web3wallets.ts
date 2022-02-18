/**
 * These are web3 wallet configs that we support via Blocknative's Onboard.js
 */

interface IWeb3Wallet {
	walletName: string;
	preferred?: boolean;
	infuraKey?: string;
}

const wallets: IWeb3Wallet[] = [
	{ walletName: 'tally', preferred: true }, // preferred
	{ walletName: 'coinbase', preferred: true }, // mobile wallet
	{ walletName: 'metamask' },
	{ walletName: 'torus' },
	{ walletName: 'opera' },
	{ walletName: 'operaTouch' },
	{ walletName: 'status' },
	{ walletName: 'meetone' },
	{ walletName: 'hyperpay' },
	{ walletName: 'atoken' },
	{ walletName: 'frame' },
	{ walletName: 'ownbit' },
	{ walletName: 'alphawallet' },
	{ walletName: 'gnosis' },
	{ walletName: 'xdefi' },
	{ walletName: 'bitpie' },
	{ walletName: 'binance' },
	{ walletName: 'liquality' },
	{ walletName: 'blankwallet' },
	{ walletName: 'mathwallet' },
	{ walletName: '1inch' },
	{ walletName: 'ronin' },
]

export default wallets
