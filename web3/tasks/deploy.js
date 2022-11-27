const { Group } = require('@semaphore-protocol/group')
const { task, types } = require('hardhat/config')
const circomlib = require('circomlibjs')
const { writeFileSync } = require('fs')

const NETWORK = 'Localhost'

task('deploy', 'Deploy the entire suite of smart contracts')
	.addOptionalParam('logs', 'Print the logs', true, types.boolean)
	.setAction(async ({ logs }, { ethers }) => {
		// Deploy ArborAudioCollections
		const ArborAudioCollectionsContract = await ethers.getContractFactory('ArborAudioCollections')
		const nft = await ArborAudioCollectionsContract.deploy()
		await nft.deployed()
		logs && console.log(`ArborAudioCollections contract has been deployed to: ${nft.address}`)

		// Deploy Verifier
		const VerifierContract = await ethers.getContractFactory('Verifier20')
		const verifier = await VerifierContract.deploy()
		await verifier.deployed()
		logs && console.log(`Verifier20 contract has been deployed to: ${verifier.address}`)

		// Deploy PoseidonT3
		const poseidonABI = circomlib.poseidonContract.generateABI(2)
		const poseidonBytecode = circomlib.poseidonContract.createCode(2)
		const [signer] = await ethers.getSigners()
		const PoseidonLibFactory = new ethers.ContractFactory(poseidonABI, poseidonBytecode, signer)
		const poseidonLib = await PoseidonLibFactory.deploy()
		await poseidonLib.deployed()
		logs && console.log(`Poseidon library has been deployed to: ${poseidonLib.address}`)

		// Deploy IncrementalBinaryTree
		const IncrementalBinaryTree = await ethers.getContractFactory('IncrementalBinaryTree', {
			libraries: {
				PoseidonT3: poseidonLib.address,
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

		// const [auctioneer] =
		// await hre.ethers.getSigners();

		// Circuit verifier contract
		const highestBidderContractFactory = await hre.ethers.getContractFactory('HighestBidderVerifier')
		const highestBidderVerifierContract = await highestBidderContractFactory.deploy()
		await highestBidderVerifierContract.deployed()
		console.log('Verifier deployed to:', highestBidderVerifierContract.address)

		// Blind auction contract implementation
		const blindAuctionContractFactory = await hre.ethers.getContractFactory('BlindAuction')
		//  address _verifierAddress,
		//  uint256 _biddingTime,
		//  uint256 _revealTime,
		//  address payable _beneficiaryAddress
		const blindAuctionContract = await blindAuctionContractFactory.deploy()
		await blindAuctionContract.deployed()
		console.log('Blind Auction deployed to:', blindAuctionContract.address)

		// Blind auction factory contract
		const blindAuctionFactoryContractFactory = await hre.ethers.getContractFactory('BlindAuctionFactory')
		const blindAuctionFactoryContract = await blindAuctionFactoryContractFactory.deploy(
			blindAuctionContract.address,
			highestBidderVerifierContract.address,
			nft.address,
		)
		await blindAuctionFactoryContract.deployed()
		console.log('Blind Auction Factory deployed to:', blindAuctionFactoryContract.address)

		const text = `const contracts = {
	${NETWORK}: {
		nft: "${nft.address}",
		verifier: "${verifier.address}",
		poseidonT3: "${poseidonLib.address}",
		incrementalBinaryTree: "${tree.address}",
		stemQueue: "${stemQueue.address}",
		highestBidderVerifier: "${highestBidderVerifierContract.address}",
		blindAuction: "${blindAuctionContract.address}",
		blindAuctionFactory: "${blindAuctionFactoryContract.address}",
	}
}

export default contracts`

		writeFileSync(`./contracts.js`, text)

		// Return our contracts
		return {
			nft,
			verifier,
			poseidonLib,
			tree,
			stemQueue,
		}
	})
