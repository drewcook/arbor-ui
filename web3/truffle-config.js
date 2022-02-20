// Truffle config <http://truffleframework.com/docs/advanced/configuration>

const path = require('path')
const HDWalletProvider = require('@truffle/hdwallet-provider')
require('dotenv').config()

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
				mnemonic: process.env.MNEMONIC,
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
		mainnet: getInfuraNetworkConfig('mainnet'),
		// Rinkeby
		rinkeby: getInfuraNetworkConfig('rinkeby'),
		// Polygon
		matic: {
			provider: () =>
				new HDWalletProvider(
					process.env.MNEMONIC,
					`https://polygon-mumbai.g.alchemy.com/v2/${process.env.ALCHEMY_POLYGON_KEY}`,
				),
			network_id: 80001,
		},
	},
}
