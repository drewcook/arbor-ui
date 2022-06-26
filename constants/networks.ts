// Supported networks
const networks = {
	localhost: {
		networkId: 31337, // Hardhat, otherwise 1337 for Ganache
		networkHex: '0x7A69',
		displayName: 'Localhost',
		rpc: 'http://127.0.0.1:8545/',
	},
	harmonyDevnet: {
		networkId: 1666900000,
		networkHex: '0x635AE020',
		displayName: 'Harmony Devnet',
		rpc: 'https://api/s0.ps.hmny.io',
	},
}

// Preferred network
// Dev: localhost
// Prod: Harmony Devnet
const preferredNetwork = process.env.NODE_ENV === 'development' ? 'localhost' : 'harmonyDevnet'

// Onboard takes hexadecimal values
export const NETWORK_HEX = networks[preferredNetwork].networkHex

// Covalent takes in decimal value
export const NETWORK_ID = networks[preferredNetwork].networkId

export const NETWORK_NAME = networks[preferredNetwork].displayName

export const NETWORK_RPC = networks[preferredNetwork].rpc
