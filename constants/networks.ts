// Supported networks
const networks = {
	localhost: {
		networkId: 31337, // Local Hardhat node, otherwise 1337 for Truffle/Ganache
		networkHex: '0x7A69',
		displayName: 'Localhost',
		rpc: 'http://127.0.0.1:8545/',
		currency: 'LOCAL',
		explorer: '',
	},
	polygon: {
		networkId: 137,
		networkHex: '0x89',
		displayName: 'Polygon Mainnet',
		rpc: `https://polygon-mainnet.g.alchemy.com/v2/${process.env.ALCHEMY_POLYGON_KEY}`,
		currency: 'MATIC',
		explorer: 'https://polygonscan.com',
	},
	polygonTest: {
		networkId: 80001,
		networkHex: '0x13881',
		displayName: 'Polygon Testnet',
		rpc: `https://polygon-mumbai.g.alchemy.com/v2/${process.env.ALCHEMY_POLYGON_TESTNET_KEY}`,
		currency: 'MATIC',
		explorer: 'https://mumbai.polygonscan.com',
	},
	harmony: {
		networkId: 1666600000,
		networkHex: '0x63564C40',
		displayName: 'Harmony Mainnet',
		rpc: 'https://api.s0.t.hmny.io',
		currency: 'ONE',
		explorer: 'https://explorer.harmony.one',
	},
	harmonyTest: {
		networkId: 1666700000,
		networkHex: '0x6357D2E0',
		displayName: 'Harmony Testnet',
		rpc: 'https://api.s0.b.hmny.io',
		currency: 'ONE',
		explorer: 'https://explorer.pops.one',
	},
	harmonyDev: {
		networkId: 1666900000,
		networkHex: '0x635AE020',
		displayName: 'Harmony Devnet',
		rpc: 'https://api.s0.ps.hmny.io',
		currency: 'ONE',
		explorer: 'https://explorer.ps.hmny.io',
	},
}

// Preferred network
// Dev: localhost
// Prod: Polygon Testnet
const preferredNetwork = process.env.NODE_ENV === 'development' ? 'harmonyDev' : 'harmonyTest'

// Onboard takes hexadecimal values
export const NETWORK_HEX = networks[preferredNetwork].networkHex

// Covalent takes in decimal value
export const NETWORK_ID = networks[preferredNetwork].networkId

export const NETWORK_NAME = networks[preferredNetwork].displayName

export const NETWORK_RPC = networks[preferredNetwork].rpc

export const NETWORK_CURRENCY = networks[preferredNetwork].currency

export const NETWORK_EXPLORER = networks[preferredNetwork].explorer
