 // Truffle config <http://truffleframework.com/docs/advanced/configuration>

/* eslint-disable @typescript-eslint/no-var-requires */
const path = require('path')
require('dotenv').config()
/* eslint-enable @typescript-eslint/no-var-requires */

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
		// Kardiachain Testnet and Mainnet deployed via Remix IDE
	},
}
