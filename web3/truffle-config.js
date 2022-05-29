 // Truffle config <http://truffleframework.com/docs/advanced/configuration>

/* eslint-disable @typescript-eslint/no-var-requires */
const path = require('path')
const HDWalletProvider = require('@truffle/hdwallet-provider')
require('dotenv').config()
/* eslint-enable @typescript-eslint/no-var-requires */

const networkIds = {
	mainnet: 1,
	ropsten: 3,
	rinkeby: 4,
	goerli: 5,
	kovan: 42,
}

const getInfuraNetworkConfig = networkName => {
	return {
		provider: () =>
			new HDWalletProvider({
				mnemonic: {
					phrase: process.env.MNEMONIC,
				},
				providerOrUrl: `https://${networkName}.infura.io/v3/${process.env.INFURA_KEY}`,
			}),
		network_id: networkIds[networkName],
	}
}

module.exports = {
	compilers: {
		solc: {
			version: '0.8.1',
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
		// Mainnet
		// mainnet: getInfuraNetworkConfig('mainnet'),
		// Rinkeby
		rinkeby: getInfuraNetworkConfig('rinkeby'),
		kovan: getInfuraNetworkConfig('kovan'),
		// Polygon testnet
		matic: {
			provider: () => new HDWalletProvider({
				mnemonic: process.env.MNEMONIC,
				providerOrUrl: `https://polygon-mumbai.g.alchemy.com/v2/${process.env.ALCHEMY_POLYGON_TESTNET_KEY}`,
			}),
			network_id: 80001,
		},
		// Polygon mainnet
		// matic: {
		// 	provider: () =>
		// 		new HDWalletProvider(
		// 			process.env.MNEMONIC,
		// 			`https://polygon-mainnet.g.alchemy.com/v2/${process.env.ALCHEMY_POLYGON_KEY}`,
		// 		),
		// 	network_id: 137,
		// },
	},
}
