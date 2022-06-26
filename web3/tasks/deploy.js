const { Group } = require('@semaphore-protocol/group')
const { task, types } = require('hardhat/config')

task('deploy', 'Deploy the StemQueue contract')
	.addOptionalParam('logs', 'Print the logs', true, types.boolean)
	.setAction(async ({ logs }, { ethers }) => {
		// Deploy Verifier
		const VerifierContract = await ethers.getContractFactory('Verifier20')
		const verifier = await VerifierContract.deploy()
		await verifier.deployed()
		logs && console.log(`Verifier20 contract has been deployed to: ${verifier.address}`)

		// Deploy Hashes
		const Hash = await ethers.getContractFactory('PoseidonT3')
		const hash = await Hash.deploy()
		await hash.deployed
		logs && console.log(`PoseidonT3 contract has been deployed to: ${hash.address}`)

		// Deploy IncrementalBinaryTree
		const IncrementalBinaryTree = await ethers.getContractFactory('IncrementalBinaryTree', {
			libraries: {
				PoseidonT3: hash.address,
			},
		})
		const incrementalBinaryTree = await IncrementalBinaryTree.deploy()
		await incrementalBinaryTree.deployed()
		logs && console.log(`IncrementalBinaryTree contract has been deployed to: ${incrementalBinaryTree.address}`)

		// Deploy StemQueue
		const StemQueueContract = await ethers.getContractFactory('StemQueue', {
			libraries: {
				IncrementalBinaryTree: incrementalBinaryTree.address,
			},
		})
		const tree = new Group() // Create empty group for constructor usage
		const stemQueue = await StemQueueContract.deploy(tree.root, verifier.address)
		await stemQueue.deployed()
		logs && console.log(`StemQueue contract has been deployed to: ${stemQueue.address}`)

		// Return our StemQueue
		return stemQueue
	})
