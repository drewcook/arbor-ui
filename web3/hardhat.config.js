require('dotenv').config()
require('@nomiclabs/hardhat-ethers')
require('@nomiclabs/hardhat-waffle')
require('hardhat-dependency-compiler')
require('hardhat-gas-reporter')

// This is a sample Hardhat task. To learn how to create your own go to
// https://hardhat.org/guides/create-task.html
task('accounts', 'Prints the list of accounts', async (taskArgs, hre) => {
	const accounts = await hre.ethers.getSigners()

	for (const account of accounts) {
		console.log(account.address)
	}
})

// Deploy our smart contracts
require('./tasks/deploy')

// You need to export an object to set up your config
// Go to https://hardhat.org/config/ to learn more
/**
 * @type import('hardhat/config').HardhatUserConfig
 */
const config = {
	solidity: {
		version: '0.8.4',
		settings: {
			optimizer: {
				enabled: true,
				runs: 200,
			},
		},
	},
	dependencyCompiler: {
		paths: ['@semaphore-protocol/contracts/verifiers/Verifier20.sol'],
	},
	networks: {
		// If needing to use Infura for Ethereum networks, use `https://${networkName}.infura.io/v3/${process.env.INFURA_KEY}
		localhost: {
			url: 'http://127.0.0.1:8545',
			chainId: 31337,
		},
		polygonMainnet: {
			url: `https://polygon-mainnet.g.alchemy.com/v2/${process.env.ALCHEMY_POLYGON_KEY}`,
			accounts: [process.env.PRIVATE_KEY],
		},
		polygonTestnet: {
			url: `https://polygon-mumbai.g.alchemy.com/v2/${process.env.ALCHEMY_POLYGON_TESTNET_KEY}`,
			accounts: [process.env.PRIVATE_KEY],
		},
		harmonyMainnet: {
			url: 'https://api.s0.t.hmny.io', // or 'https://api.harmony.one'
			accounts: [process.env.PRIVATE_KEY],
		},
		harmonyTestnet: {
			url: 'https://api.s0.b.hmny.io',
			accounts: [process.env.PRIVATE_KEY],
		},
		harmonyDevnet: {
			url: 'https://api.s0.ps.hmny.io',
			accounts: [process.env.PRIVATE_KEY],
		},
	},
	gasReporter: {
		enabled: process.env.REPORT_GAS !== undefined,
		currency: 'USD',
	},
}

module.exports = config
