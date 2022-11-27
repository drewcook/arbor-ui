// TODO: Migrate this syntax over from truffle to hardhat

const { expect, assert } = require('chai')
const web3 = require('web3')
// const { Contract, providers } = require('ethers')
// const ArborAudioCollections = require('../artifacts/contracts/ArborAudioCollections.sol/ArborAudioCollections.json')
const { loadFixture } = require('@nomicfoundation/hardhat-network-helpers')
const { Group } = require('@semaphore-protocol/group')
const circomlib = require('circomlibjs')
const { ethers } = require('hardhat')

console.clear()

// Quick helpers
const toEth = wei => web3.utils.fromWei(`${wei}`, 'ether')
const toWei = eth => web3.utils.toWei(`${eth}`, 'ether')

// ArborAudioCollections instance
async function deployment() {
	const ArborAudioCollectionsContract = await ethers.getContractFactory('ArborAudioCollections')
	const nftContract = await ArborAudioCollectionsContract.deploy()
	await nftContract.deployed()
	console.log(`ArborAudioCollections contract has been deployed to: ${nftContract.address}`)

	// Deploy Verifier
	const VerifierContract = await ethers.getContractFactory('Verifier20')
	const verifier = await VerifierContract.deploy()
	await verifier.deployed()
	console.log(`Verifier20 contract has been deployed to: ${verifier.address}`)

	// Deploy PoseidonT3
	const poseidonABI = circomlib.poseidonContract.generateABI(2)
	const poseidonBytecode = circomlib.poseidonContract.createCode(2)
	const [signer] = await ethers.getSigners()
	const PoseidonLibFactory = new ethers.ContractFactory(poseidonABI, poseidonBytecode, signer)
	const poseidonLib = await PoseidonLibFactory.deploy()
	await poseidonLib.deployed()
	console.log(`Poseidon library has been deployed to: ${poseidonLib.address}`)

	// Deploy IncrementalBinaryTree
	const IncrementalBinaryTree = await ethers.getContractFactory('IncrementalBinaryTree', {
		libraries: {
			PoseidonT3: poseidonLib.address,
		},
	})
	const tree = await IncrementalBinaryTree.deploy()
	await tree.deployed()
	console.log(`IncrementalBinaryTree contract has been deployed to: ${tree.address}`)

	// Deploy StemQueue
	const StemQueueContract = await ethers.getContractFactory('StemQueue', {
		libraries: {
			IncrementalBinaryTree: tree.address,
		},
	})
	const group = new Group() // Create empty group for constructor usage
	const stemQueue = await StemQueueContract.deploy(group.root, verifier.address)
	await stemQueue.deployed()
	console.log(`StemQueue contract has been deployed to: ${stemQueue.address}`)

	const accts = await ethers.getSigners()
	return { accts, nftContract }
}

describe('ArborAudioCollections: deployment', () => {
	let nftContract
	before(async () => {
		;({ nftContract } = await loadFixture(deployment))
	})

	it('has been deployed', async () => {
		assert(nftContract, 'ArborAudioCollections contract was not deployed')
		expect(nftContract).to.not.equal(undefined)
	})

	it('Should have an address', () => {
		const address = nftContract.address
		expect(address).to.not.equal(0x0)
		expect(address).to.not.equal('')
		expect(address).to.not.equal(null)
		expect(address).to.not.equal(undefined)
	})

	it('Should have a name', async () => {
		const name = await nftContract.name()
		expect(name).to.equal('ArborAudioCollections')
	})

	it('Should have a symbol', async () => {
		const symbol = await nftContract.symbol()
		expect(symbol).to.equal('ARBOR')
	})

	it('Should have a collection name', async () => {
		const name = await nftContract.collectionName()
		expect(name).to.equal('Arbor Audio NFTs')
	})
})

describe('ArborAudioCollections: state properties', () => {
	let nftContract
	before(async () => {
		;({ nftContract } = await loadFixture(deployment))
	})

	it('Should have a static mint price', async () => {
		const actualMintPrice = await nftContract.mintPrice()
		const expectedMintPrice = toWei(0.01)
		expect(actualMintPrice).to.equal(expectedMintPrice)
	})

	describe('editing collectionName', () => {
		let nftContract
		before(async () => {
			;({ accounts, nftContract } = await loadFixture(deployment))
			;[owner, nonOwner] = await ethers.getSigners()
		})

		it('Should prevent non-owners from updating the collection name', async () => {
			try {
				await nftContract.updateCollectionName('Polyecho Branches')
			} catch (err) {
				expect(err.reason).to.equal('Ownable: caller is not the owner')
			}
		})

		it('Should allow owners to be able to update the collection name', async () => {
			const tx = await nftContract.updateCollectionName('Polyecho Branches')

			const res = await tx.wait()
			const expectedValue = 'Polyecho Branches'

			const actualValue = res.events[0].args.name
			expect(actualValue).to.equal(expectedValue, 'events should match')
		})

		it('should emit the CollectionNameUpdated event', async () => {
			const tx = await nftContract.updateCollectionName('Genesis Collection')
			const res = await tx.wait()
			const expectedEvent = 'CollectionNameUpdated'
			const actualEvent = res.events[0].event
			expect(actualEvent).to.equal(expectedEvent, 'events should match')
		})
	})
})

describe('ArborAudioCollections: minting an NFT', () => {
	let nftContract, accts, accounts, owner, minter, metadataURI1, metadataURI2, contributor
	before(async () => {
		;({ accts, nftContract } = await loadFixture(deployment))
		//   accts = await ethers.getSigners()
		accounts = accts.map(a => a.address)
		let contract
		owner = accounts[0]
		minter = accounts[1]
		metadataURI1 = 'ipfs://some-test-CID-1'
		metadataURI2 = 'ipfs://some-test-CID-2'
		contributors = [accounts[2], accounts[3], accounts[3]]
	})

	it('Throws an error if sender sends less than the mint price', async () => {
		try {
			await nftContract.mintAndBuy(minter, metadataURI1, contributors)
		} catch (err) {
			const expectedError = 'Sent ether value is not enough to mint'
			const actualError = err.reason
			expect(actualError).to.equal(expectedError, 'should not be permitted')
		}
	})

	// Tests for NFT minting function of ArborAudioCollections contract using tokenID of the minted NFT
	it('Should be able to mint a token with proper metadata', async () => {
		// Mint a token
		const mintPrice = await nftContract.mintPrice()
		let tx = await nftContract.mintAndBuy(minter, metadataURI1, contributors, {
			value: mintPrice,
		})

		const res = await tx.wait()
		// Test tokenID and URI
		console.log(res.events[2])

		let tokenId = res.events[2].args[0].toNumber()
		let actualMetadataURI = res.events[2].args._tokenURI
		expect(tokenId).to.equal(1, 'tokenID should start with 1')
		expect(actualMetadataURI).to.equal(metadataURI1, 'metadata URIs should match')

		// Emits the custom TokenCreated event
		const expectedEvent = 'TokenCreated'

		let actualEvent = res.events[2].event
		expect(actualEvent).to.equal(expectedEvent, 'events should match')

		// Mint another token and test incremented tokenID
		tx = await nftContract.mintAndBuy(minter, metadataURI2, contributors, {
			value: mintPrice,
		})
		tokenId = res.events[2].args[0].toNumber()
		actualMetadataURI = res.events[2].args._tokenURI
		expect(tokenId).to.equal(2, 'tokenID should be incremented')
		expect(actualMetadataURI).to.equal(metadataURI2, 'metadata URIs should match')
	})

	// TODO: It is possible that we should emit an event for each transfer to a contributor, and test that way
	// it('Should pay out the mint price evenly to contributors', async () => {
	// 	const mintPrice = await nftContract.mintPrice()
	// 	const expectedContributorCut = mintPrice / contributors.length
	// 	const tx = await nftContract.mintAndBuy(minter, metadataURI1, contributors, {
	// 		value: mintPrice,
	// 	})
	// 	const actualContributors = await nftContract.tokenIdToContributors(0)
	// 	expect(actualContributors).to.equal(contributors, 'contributors should be tied to the newly minted tokenID')
	// 	// TODO: check the balance of the contributor addresses for the difference
	// })
	// })

	// describe('ArborAudioCollections: listing and un-listing an NFT', async accts => {
	// 	const accounts = accts.map(a => a.toLowerCase())
	// 	let tokenId
	// 	let contributorBalance
	// 	let sellerBalance
	// 	const minter = accounts[1]
	// 	const nonminter = accounts[0]
	// 	const buyer1 = accounts[2]
	// 	const buyer2 = accounts[3]
	// 	const contributors = [accounts[4], accounts[5], accounts[6]]
	// 	const salePrice1 = toWei(0.02)
	// 	const salePrice2 = toWei(0.05)

	// 	beforeEach(async () => {
	// 		const mintPrice = await nftContract.mintPrice()
	// 		const tx = await nftContract.mintAndBuy(minter, 'ipfs://test-metadata-uri', contributors, {
	// 			value: mintPrice,
	// 			from: minter,
	// 		})
	// 		tokenId = res.events[2].args[0].toNumber()

	// 		// Get seller balance
	// 		web3.eth.getBalance(minter, async (err, result) => {
	// 			if (err) {
	// 				console.log(err)
	// 			} else {
	// 				sellerBalance = toEth(result)
	// 			}
	// 		})

	// 		// Get contributor balance once (will be used for all though)
	// 		web3.eth.getBalance(contributors[0], (err, result) => {
	// 			if (err) {
	// 				console.log(err)
	// 			} else {
	// 				contributorBalance = toEth(result)
	// 			}
	// 		})
	// 	})

	// 	describe('Listing for sale', () => {
	// 		it('Should throw an error if a non-owner tries to list it for sale', async () => {
	// 			try {
	// 				await nftContract.allowBuy(tokenId, salePrice1, {
	// 					from: nonminter,
	// 				})
	// 			} catch (err) {
	// 				const expectedError = 'Not owner of this token'
	// 				const actualError = err.reason
	// 				expect(actualError).to.equal(expectedError, 'should not be permitted')
	// 			}
	// 		})

	// 		it('Should allow an owner to list it for sale', async () => {
	// 			const tx = await nftContract.allowBuy(tokenId, salePrice1, {
	// 				from: minter,
	// 			})
	// 			const actualLog = res.events
	// 			expect(tx.receipt.from.toLowerCase()).to.equal( minter.toLowerCase(), 'minter not tied to transaction')
	// 			expect(actualLog.event).to.equal( 'ListedForSale', 'event names should match')
	// 			expect(actualLog.args._tokenId).to.equal( tokenId, 'event tokenId should match')
	// 			expect(actualLog.args._price).to.equal( salePrice1, 'event price should match')
	// 			// expect(await nftContrac).to.equal(tokenIdToPrice(1), salePrice1, 'should update state with sale price for token')
	// 		})

	// 		it('Should require a list price greater than zero', async () => {
	// 			try {
	// 				await nftContract.allowBuy(tokenId, 0, {
	// 					from: minter,
	// 				})
	// 			} catch (err) {
	// 				const expectedError = 'Price zero'
	// 				const actualError = err.reason
	// 				expect(actualError).to.equal(expectedError, 'should not be permitted')
	// 			}
	// 		})
	// 	})

	// 	describe('Un-listing it for sale', () => {
	// 		it('Should throw an error if a non-owner tries to un-list it for sale', async () => {
	// 			try {
	// 				await nftContract.disallowBuy(tokenId, {
	// 					from: nonminter,
	// 				})
	// 			} catch (err) {
	// 				const expectedError = 'Not owner of this token'
	// 				const actualError = err.reason
	// 				expect(actualError).to.equal(expectedError, 'should not be permitted')
	// 			}
	// 		})

	// 		it('Should allow an owner to un-list it for sale', async () => {
	// 			const tx = await nftContract.disallowBuy(tokenId, {
	// 				from: minter,
	// 			})
	// 			const actualLog = res.events
	// 			expect(tx.receip).to.equal(from.toLowerCase(), minter, 'minter not tied to transaction')
	// 			expect(actualLog.event).to.equal( 'RemovedForSale', 'event names should match')
	// 			expect(actualLog.args._lister.toLowerCase()).to.equal( minter, 'event lister should match')
	// 			expect(actualLog.args._tokenId, tokenId).to.equal( 'event price should match')
	// 			// expect(await nftContrac).to.equal(tokenIdToPrice(1), undefined, 'should remove from state of tokens listed')
	// 		})
	// 	})

	// 	describe('Buying and selling a token on the market', () => {
	// 		it('Should throw an error if trying to buy a token not for sale', async () => {
	// 			const tokenIdNotForSale = 10
	// 			try {
	// 				await nftContract.buy(tokenIdNotForSale, {
	// 					from: buyer1,
	// 					value: salePrice1,
	// 				})
	// 			} catch (err) {
	// 				const expectedError = 'This token is not for sale'
	// 				const actualError = err.reason
	// 				expect(actualError).to.equal(expectedError, 'should not be permitted')
	// 			}
	// 		})

	// 		it('Should throw an error if trying to buy with the incorrect listed price', async () => {
	// 			try {
	// 				// Minter lists it for sale
	// 				await nftContract.allowBuy(tokenId, salePrice1, {
	// 					from: minter,
	// 				})
	// 				// Buyer pays wrong price
	// 				await nftContract.buy(tokenId, {
	// 					from: buyer1,
	// 					value: salePrice2,
	// 				})
	// 			} catch (err) {
	// 				const expectedError = 'Incorrect value'
	// 				const actualError = err.reason
	// 				expect(actualError).to.equal(expectedError, 'should not be permitted')
	// 			}
	// 		})

	// 		it('Should transfer ownership to the buyer', async () => {
	// 			// Minter lists it for sale
	// 			await nftContract.allowBuy(tokenId, salePrice1, {
	// 				from: minter,
	// 			})

	// 			// Buyer buys it for correct sale price
	// 			const tx = await nftContract.buy(tokenId, {
	// 				from: buyer1,
	// 				value: salePrice1,
	// 			})

	// 			// Events emitted
	// 			const actualEvents = tx.logs.map(l => l.event)
	// 			expect(actualEvents[2]).to.equal('Transfer','transfer events should match')
	// 			expect(actualEvents[3]).to.equal('NftBought','NFT bought events should match')
	// 			expect(actualEvents[4]).to.equal('SellerPaid','seller paid events should match')
	// 			expect(actualEvents[5]).to.equal('RoyaltiesPaid','royalties paid events should match')

	// 			// Test event arguments
	// 			const actualEventArgs = tx.logs.map(l => l.args)
	// 			expect(actualEventArgs[4]._price).to.equal( salePrice1 * 0.9, 'seller should receive 90% take from sale')
	// 			expect(actualEventArgs[5]._price).to.equal( salePrice1 * 0.1, 'contributors should receive 10% take from sale')
	// 			// console.log(actualEventArgs[5]._contributors.map(c => c.toLowerCase()) === contributors)
	// 			// expect(
	// 			//).to.equal(	actualEventArgs[5]._contributors.map(c => c.toLowerCase()),
	// 			// 	contributors,
	// 			// 	'contributors should match',
	// 			// )

	// 			// Check the balance of the seller's address for the 90% difference
	// 			// const sellersCut = salePrice1 * 0.9
	// 			// web3.eth.getBalance(minter, (err, result) => {
	// 			// 	if (err) {
	// 			// 		console.log(err)
	// 			// 	} else {
	// 			// 		const newSellerBalance = toEth(result)
	// 			// 		const gasCost = toEth(tx.receipt.gasUsed)
	// 			// 		console.log(sellerBalance + ' ETH')
	// 			// 		console.log(newSellerBalance + ' ETH')
	// 			// 		console.log(gasCost + ' ETH')
	// 			// 		expect(
	// 			//).to.equal(			sellerBalance.toBN() - gasCost.toBN(),
	// 			// 			newBalanceSeller.toBN(),
	// 			// 			'seller should receive 90% take on sale price',
	// 			// 		)
	// 			// 	}
	// 			// })

	// 			// Check the balance of the contributor addresses for the 10% difference
	// 			// const royaltyValue = 200000000000000
	// 			// contributors.map(contributor => {
	// 			// 	web3.eth.getBalance(contributor, (err, result) => {
	// 			// 		if (err) {
	// 			// 			console.log(err)
	// 			// 		} else {
	// 			// 			console.log(web3.utils.fromWei(result, 'ether') + ' ETH')
	// 			// 		}
	// 			// 	})
	// 			// })
	// 			// console.log(newBalanceSeller - startBalanceSeller, sellersCut, contributorBalancesStart, contributorBalancesEnd)
	// 		})
	// 	})
})
