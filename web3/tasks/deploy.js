const { Group } = require('@semaphore-protocol/group')
const { task, types } = require('hardhat/config')

task('deploy', 'Deploy the entire suite of smart contracts')
	.addOptionalParam('logs', 'Print the logs', true, types.boolean)
	.setAction(async ({ logs }, { ethers }) => {
		// Deploy PolyechoNFT
		// const PolyechoNFTContract = await ethers.getContractFactory('PolyechoNFT')
		// const nft = await PolyechoNFTContract.deploy()
		// await nft.deployed()
		// logs && console.log(`PolyechoNFT contract has been deployed to: ${nft.address}`)

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
		const tree = await IncrementalBinaryTree.deploy()
		await tree.deployed()
		logs && console.log(`IncrementalBinaryTree contract has been deployed to: ${tree.address}`)

		// Deploy StemQueue
		const StemQueueContract = await ethers.getContractFactory('StemQueue', {
			libraries: {
				IncrementalBinaryTree: tree.address,
			},
		})
		const group = new Group() // Create empty group for constructor usage
		const stemQueue = await StemQueueContract.deploy(group.root, verifier.address)
		await stemQueue.deployed()
		logs && console.log(`StemQueue contract has been deployed to: ${stemQueue.address}`)

		// Return our contracts
		return {
			nft,
			verifier,
			hash,
			tree,
			stemQueue,
		}
	})
