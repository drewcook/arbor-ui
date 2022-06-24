// Supported networks
const networks = {
	harmonyDevnet: {
		networkId: 1666900000,
		networkHex: '0x635AE020',
		displayName: 'Harmony Devnet',
		rpc: 'https://api/s0.ps.hmny.io',
	},
}

// Onboard takes hexadecimal values
export const NETWORK_HEX = networks.harmonyDevnet.networkHex

// Covalent takes in decimal value
export const NETWORK_ID = networks.harmonyDevnet.networkId

export const NETWORK_NAME = networks.harmonyDevnet.displayName

export const NETWORK_RPC = networks.harmonyDevnet.rpc
