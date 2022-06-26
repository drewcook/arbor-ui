require('dotenv').config()
require('@nomiclabs/hardhat-ethers')
require('@nomiclabs/hardhat-waffle')
require('hardhat-dependency-compiler')
require('hardhat-gas-reporter')
require('./tasks/deploy')

// You need to export an object to set up your config
// Go to https://hardhat.org/config/ to learn more
/**
 * @type import('hardhat/config').HardhatUserConfig
 */
const config = {
	solidity: '0.8.4',
	dependencyCompiler: {
		paths: ['@semaphore-protocol/contracts/verifiers/Verifier20.sol'],
	},
	networks: {
		localhost: {
			url: 'http://127.0.0.1:8545',
			chainId: 31337,
		},
		harmonyDevnet: {
			url: 'https://api/s0.ps.hmny.io',
			accounts: process.env.PRIVATE_KEY !== undefined ? [process.env.PRIVATE_KEY] : [],
		},
	},
	gasReporter: {
		enabled: process.env.REPORT_GAS !== undefined,
		currency: 'USD',
	},
}

module.exports = config
