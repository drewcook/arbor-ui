/**
 * These are web3 wallet configs that we support via Blocknative's Web3 Onboard product
 */
import Onboard from '@web3-onboard/core'
import injectedModule from '@web3-onboard/injected-wallets'
import ledgerModule from '@web3-onboard/ledger'
import walletConnectModule from '@web3-onboard/walletconnect'
import { NETWORK_HEX, NETWORK_NAME, NETWORK_RPC } from '../constants/networks'

// See https://docs.blocknative.com/onboard/injected-wallets
const injectedWallets = injectedModule()

// See https://docs.blocknative.com/onboard/ledger
const ledger = ledgerModule()

// See https://docs.blocknative.com/onboard/wallet-connect
const walletConnect = walletConnectModule({
	qrcodeModalOptions: {
		mobileLinks: ['rainbow', 'metamask', 'argent', 'trust', 'imtoken', 'pillar', 'ledger', 'crypto.com'],
	},
})

// Our one and only chain we want to support, for now
const CHAIN = {
	id: NETWORK_HEX,
	token: 'ONE',
	label: NETWORK_NAME,
	rpcUrl: NETWORK_RPC,
}

// Initialize Onboard
// See https://docs.blocknative.com/onboard/core#initialization
const web3Onboard = Onboard({
	wallets: [injectedWallets, ledger, walletConnect],
	appMetadata: {
		name: 'Polyecho',
		icon: '/polyecho_logo_square.png',
		description:
			'Polyecho is a schelling game where the objective is to publicly co-create songs worthy of purchase by NFT collectors. Collectors can explore, curate, and own a wild world of memetic music. Proceeds are distributed to the artists, including future royalties.',
		recommendedInjectedWallets: [
			{ name: 'MetaMask', url: 'https://metamask.io' },
			{ name: 'Coinbase', url: 'https://wallet.coinbase.com/' },
		],
	},
	chains: [CHAIN],
	accountCenter: {
		desktop: {
			enabled: false, // Disable the built in wallet UI and rely on native extensions/apps for switching accounts and networks
		},
	},
	i18n: {
		en: {
			connect: {
				selectingWallet: {
					header: 'Available Wallets',
					sidebar: {
						heading: 'Get Started',
						subheading: 'Connect your wallet',
						paragraph:
							'Connecting your wallet is like “logging in” to Web3. Select your wallet from the options to get started.',
					},
					recommendedWalletsPart1: 'Polyecho only supports',
					recommendedWalletsPart2: 'on this platform. Please use or install one of the supported wallets to continue',
					installWallet: 'You do not have any wallets installed that Polyecho supports, please use a supported wallet',
					agreement: {
						agree: 'I agree to the',
						terms: 'Terms & Conditions',
						and: 'and',
						privacy: 'Privacy Policy',
					},
				},
				connectingWallet: {
					header: '{connectionRejected, select, false {Connecting to {wallet}...} other {Connection Rejected}}',
					sidebar: {
						subheading: 'Approve Connection',
						paragraph: 'Please approve the connection in your wallet and authorize access to continue.',
					},
					mainText: 'Connecting...',
					paragraph: 'Make sure to select all accounts that you want to grant access to.',
					rejectedText: 'Connection Rejected!',
					rejectedCTA: 'Click here to try again',
					primaryButton: 'Back to wallets',
				},
				connectedWallet: {
					header: 'Connection Successful',
					sidebar: {
						subheading: 'Connection Successful!',
						paragraph: 'Your wallet is now connected to Polyecho',
					},
					mainText: 'Connected',
				},
			},
			modals: {
				actionRequired: {
					heading: 'Action required in {wallet}',
					paragraph: 'Please switch the active account in your wallet.',
					linkText: 'Learn more.',
					buttonText: 'Okay',
				},
				switchChain: {
					heading: 'Switch Chain',
					paragraph1: 'Polyecho requires that you switch your wallet to the {nextNetworkName} network to continue.',
					paragraph2:
						'*Some wallets may not support changing networks. If you can not change networks in your wallet you may consider switching to a different wallet.',
				},
				confirmDisconnectAll: {
					heading: 'Disconnect all Wallets',
					description: 'Are you sure that you would like to disconnect all your wallets?',
					confirm: 'Confirm',
					cancel: 'Cancel',
				},
			},
			accountCenter: {
				connectAnotherWallet: 'Connect another Wallet',
				disconnectAllWallets: 'Disconnect all Wallets',
				currentNetwork: 'Current Network',
				appInfo: 'App Info',
				learnMore: 'Learn More',
				gettingStartedGuide: 'Getting Started Guide',
				smartContracts: 'Smart Contract(s)',
				explore: 'Explore',
				backToApp: 'Back to App',
				poweredBy: 'powered by',
				addAccount: 'Add Account',
				setPrimaryAccount: 'Set Primary Account',
				disconnectWallet: 'Disconnect Wallet',
			},
		},
	},
})

/**
 * The below subscribers really only work well if using the built-in Account Center actions
 */

// Subscribe to wallet changes and update local storage
const walletsSubscriber = web3Onboard.state.select('wallets')
walletsSubscriber.subscribe(wallets => {
	const connectedWallets = wallets.map(({ label }) => label)
	window.localStorage.setItem('connectedWallets', JSON.stringify(connectedWallets))
})

// Subscribe to chain changes
const chainsSubscriber = web3Onboard.state.select('chains')
chainsSubscriber.subscribe(chains => {
	const connectedChains = chains.map(({ label }) => label)
	console.log('Chain changed to', connectedChains[0])
})

export default web3Onboard
