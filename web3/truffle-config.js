// Truffle config <http://truffleframework.com/docs/advanced/configuration>
/* eslint-disable @typescript-eslint/no-var-requires */
const HDWalletProvider = require('@truffle/hdwallet-provider')
const path = require('path')
require('dotenv').config()

module.exports = {
	compilers: {
		solc: {
			version: '0.8.1',
			settings: {
				// See the solidity docs for advice about optimization and evmVersion
				optimizer: {
					enabled: false,
					runs: 200,
				},
			},
		},
	},
	// Contracts
	contracts_build_directory: path.join(__dirname, '/../contracts'),
	// Networks
	networks: {
		// Local
		develop: {
			host: '127.0.0.1',
			port: 8545,
			network_id: 1337,
		},
		harmonyTestnet: {
			provider: () =>
				new HDWalletProvider({
					mnemonic: process.env.MNEMONIC,
					providerOrUrl: 'https://api.s0.b.hmny.io',
				}),
			network_id: 1666700000,
		},
		harmonyMainnet: {
			provider: () =>
				new HDWalletProvider({
					mnemonic: process.env.MNEMONIC,
					providerOrUrl: 'https://api.harmony.one',
				}),
			network_id: 1666600000,
		},
	},
}
