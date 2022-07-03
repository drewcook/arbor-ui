// Rinkeby
// const contractAddress = '0xe9b33abb18c5ebe1edc1f15e68df651f1766e05e'
// const chainId = 4

// Kovan
// const contractAddress = '0xaeca10e3d2db048db77d8c3f86a9b013b0741ba2'
// const chainId = 42

// Polygon Testnet - https://mumbai.polygonscan.com/address/0xBd0136694e9382127602abFa5AA0679752eaD313
// const contractAddress = '0xBd0136694e9382127602abFa5AA0679752eaD313'
// const chainId = 80001

// Supported networks
const networks = {
	localhost: {
		networkId: 31337, // Hardhat, otherwise 1337 for Ganache
		networkHex: '0x7A69',
		displayName: 'Localhost',
		rpc: 'http://127.0.0.1:8545/',
		currency: 'LOCAL',
		explorer: '',
	},
	harmonyDevnet: {
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
// Prod: Harmony Devnet
const preferredNetwork = process.env.NODE_ENV === 'development' ? 'localhost' : 'harmonyDevnet'

// Onboard takes hexadecimal values
export const NETWORK_HEX = networks[preferredNetwork].networkHex

// Covalent takes in decimal value
export const NETWORK_ID = networks[preferredNetwork].networkId

export const NETWORK_NAME = networks[preferredNetwork].displayName

export const NETWORK_RPC = networks[preferredNetwork].rpc

export const NETWORK_CURRENCY = networks[preferredNetwork].currency

export const NETWORK_EXPLORER = networks[preferredNetwork].explorer
