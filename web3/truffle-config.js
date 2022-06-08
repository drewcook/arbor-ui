// Truffle config <http://truffleframework.com/docs/advanced/configuration>

/* eslint-disable @typescript-eslint/no-var-requires */
const path = require('path')
const HDWalletProvider = require('@truffle/hdwallet-provider')
require('dotenv').config()
/* eslint-enable @typescript-eslint/no-var-requires */

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
		// KardiaChain Mainnet and Testnet
		// See - https://docs.kardiachain.io/docs/for-developers/tutorials/smart-contract-development/dev-environment/ide-and-tools/truffle
		kardiachain: {
			provider: () => new HDWalletProvider(process.env.MNEMONIC, `https://rpc.kardiachain.io`),
			network_id: 0,
			confirmations: 2, // # of confirmations to wait between deployments. (default: 0)
			timeoutBlocks: 2000, // # of blocks before a deployment times out, (minimum/default: 50)
			production: true,
		},
		kardiachain_testnet: {
			provider: () =>
				new HDWalletProvider({
					mnemonic: process.env.MNEMONIC,
					providerOrUrl: `https://dev.kardiachain.io`,
					pollingInterval: 1000,
				}),
			network_id: 69,
			timeoutBlocks: 2000,
			skipDryRun: true,
		},
	},
}
