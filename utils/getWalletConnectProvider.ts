import WalletConnectClient, { CLIENT_EVENTS } from '@walletconnect/client'
import EthereumProvider from '@walletconnect/ethereum-provider'
import { PairingTypes, SessionTypes } from '@walletconnect/types'
import QRCodeModal from '@walletconnect/qrcode-modal'

// interface RequestArguments {
// 	method: string;
// 	params?: unknown[] | object;
// }
// Send JSON RPC requests
// const result = await provider.request(payload: RequestArguments);
// // Close provider session
// // await provider.disconnect()

const getWalletConnectProvider = async () => {
	// 1. Create a WalletConnect Client
	const client = await WalletConnectClient.init({
		projectId: '5ec3a95710d8e9fb81e4a59630ea6068',
		relayUrl: 'wss://relay.walletconnect.com',
		metadata: {
			name: 'PolyEcho Dapp',
			description: 'PolyEcho Dapp',
			url: 'https://polyecho.xyz',
			icons: ['https://polyecho.xyz/nft_thumb.png'],
		},
	})
	// 2. Subscribe to client events
	client.on(CLIENT_EVENTS.pairing.proposal, async (proposal: PairingTypes.Proposal) => {
		// Display the QRCode modal on a new pairing request.
		const { uri } = proposal.signal.params
		console.log('EVENT', 'QR Code Modal opened')
		QRCodeModal.open(uri, () => {
			console.log('EVENT', 'QR Code Modal closed')
		})
	})
	client.on(CLIENT_EVENTS.session.deleted, (deletedSession: SessionTypes.Settled) => {
		// Perform some cleanup after session was deleted (e.g. via `provider.disconnect()`)
	})

	// 3. Create EthereumProvider (with default RPC configuration) by passing in the `client` instance.
	return new EthereumProvider({
		chainId: 80001,
		client,
		rpc: {
			custom: {
				// Polygon testnet
				80001: 'https://polygon-mumbai.g.alchemy.com/v2/i8OIU2SPbetnyROU9osWyYo6M-eYOfLi',
				// ...and any other networks
			},
		},
		// qrcodeModalOptions: {
		// 	mobileLinks: ['rainbow', 'metamask', 'argent', 'trust', 'imtoken', 'pillar'],
		// },
	})
}

// 4. Enable session (triggers `CLIENT_EVENTS.pairing.proposal` event).
export default getWalletConnectProvider
