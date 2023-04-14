// TODO: Migrate this syntax over from truffle to hardhat

const web3 = require('web3')
const { Contract, providers } = require('ethers')
const ArborAudioCollections = require('../artifacts/contracts/ArborAudioCollections.sol/ArborAudioCollections.json')

// Quick helpers
const toEth = wei => web3.utils.fromWei(`${wei}`, 'ether')
const toWei = eth => web3.utils.toWei(`${eth}`, 'ether')

// ArborAudioCollections instance
const provider = new providers.JsonRpcProvider('http://localhost:8545')
const arborAudioCollectionsContract = new Contract(
	'0x7bc06c482dead17c0e297afbc32f6e63d3846650',
	ArborAudioCollections.abi,
)
const nftContract = arborAudioCollectionsContract.connect(provider.getSigner())

contract('ArborAudioCollections: deployment', () => {
	it('has been deployed', async () => {
		assert(nftContract, 'ArborAudioCollections contract was not deployed')
		assert.notEqual(contract, undefined)
	})

	it('Should have an address', () => {
		const address = nftContract.address
		assert.notEqual(address, 0x0)
		assert.notEqual(address, '')
		assert.notEqual(address, null)
		assert.notEqual(address, undefined)
	})

	it('Should have a name', async () => {
		const name = await nftContract.name()
		assert.equal(name, 'ArborAudioCollections')
	})

	it('Should have a symbol', async () => {
		const symbol = await nftContract.symbol()
		assert.equal(symbol, 'ARBOR')
	})

	it('Should have a collection name', async () => {
		const name = await nftContract.collectionName()
		assert.equal(name, 'Arbor Audio NFTs')
	})
})

contract('ArborAudioCollections: state properties', accounts => {
	it('Should have a static mint price', async () => {
		const actualMintPrice = await nftContract.mintPrice()
		const expectedMintPrice = toWei(0.01)
		assert.equal(actualMintPrice, expectedMintPrice)
	})

	describe('editing collectionName', () => {
		const owner = accounts[0]
		const nonOwner = accounts[1]

		it('Should prevent non-owners from updating the collection name', async () => {
			try {
				await nftContract.updateCollectionName('Arbor Branches', {
					from: nonOwner,
				})
			} catch (err) {
				assert.equal(err.reason, 'Ownable: caller is not the owner')
			}
		})

		it('Should allow owners to be able to update the collection name', async () => {
			const tx = await nftContract.updateCollectionName('Arbor Branches', { from: owner })
			const expectedValue = 'Arbor Branches'
			const actualValue = tx.logs[0].args.name
			assert.equal(actualValue, expectedValue, 'events should match')
		})

		it('should emit the CollectionNameUpdated event', async () => {
			const tx = await nftContract.updateCollectionName('Genesis Collection', {
				from: owner,
			})
			const expectedEvent = 'CollectionNameUpdated'
			const actualEvent = tx.logs[0].event
			assert.equal(actualEvent, expectedEvent, 'events should match')
		})
	})
})

contract('ArborAudioCollections: minting an NFT', accts => {
	const accounts = accts.map(a => a.toLowerCase())
	let contract
	const owner = accounts[0]
	const minter = accounts[1]
	const metadataURI1 = 'ipfs://some-test-CID-1'
	const metadataURI2 = 'ipfs://some-test-CID-2'
	const contributors = [accounts[2], accounts[3], accounts[3]]

	it('Throws an error if sender sends less than the mint price', async () => {
		try {
			await nftContract.mintAndBuy(minter, metadataURI1, contributors)
		} catch (err) {
			const expectedError = 'Sent ether value is not enough to mint'
			const actualError = err.reason
			assert.equal(actualError, expectedError, 'should not be permitted')
		}
	})

	// Tests for NFT minting function of ArborAudioCollections contract using tokenID of the minted NFT
	it('Should be able to mint a token with proper metadata', async () => {
		// Mint a token
		const mintPrice = await nftContract.mintPrice()
		let tx = await nftContract.mintAndBuy(minter, metadataURI1, contributors, {
			value: mintPrice,
		})

		// Test tokenID and URI
		let tokenId = tx.logs[0].args[2].toNumber()
		let actualMetadataURI = tx.logs[2].args._tokenURI
		assert.equal(tokenId, 1, 'tokenID should start with 1')
		assert.equal(actualMetadataURI, metadataURI1, 'metadata URIs should match')

		// Emits the custom TokenCreated event
		const expectedEvent = 'TokenCreated'
		let actualEvent = tx.logs[2].event
		assert.equal(actualEvent, expectedEvent, 'events should match')

		// Mint another token and test incremented tokenID
		tx = await nftContract.mintAndBuy(minter, metadataURI2, contributors, {
			value: mintPrice,
		})
		tokenId = tx.logs[0].args[2].toNumber()
		actualMetadataURI = tx.logs[2].args._tokenURI
		assert.equal(tokenId, 2, 'tokenID should be incremented')
		assert.equal(actualMetadataURI, metadataURI2, 'metadata URIs should match')
	})

	// TODO: It is possible that we should emit an event for each transfer to a contributor, and test that way
	// it('Should pay out the mint price evenly to contributors', async () => {
	// 	const mintPrice = await nftContract.mintPrice()
	// 	const expectedContributorCut = mintPrice / contributors.length
	// 	const tx = await nftContract.mintAndBuy(minter, metadataURI1, contributors, {
	// 		value: mintPrice,
	// 	})
	// 	const actualContributors = await nftContract.tokenIdToContributors(0)
	// 	assert.equal(actualContributors, contributors, 'contributors should be tied to the newly minted tokenID')
	// 	// TODO: check the balance of the contributor addresses for the difference
	// })
})

contract('ArborAudioCollections: listing and un-listing an NFT', async accts => {
	const accounts = accts.map(a => a.toLowerCase())
	let tokenId
	let contributorBalance
	let sellerBalance
	const minter = accounts[1]
	const nonminter = accounts[0]
	const buyer1 = accounts[2]
	const buyer2 = accounts[3]
	const contributors = [accounts[4], accounts[5], accounts[6]]
	const salePrice1 = toWei(0.02)
	const salePrice2 = toWei(0.05)

	beforeEach(async () => {
		const mintPrice = await nftContract.mintPrice()
		const tx = await nftContract.mintAndBuy(minter, 'ipfs://test-metadata-uri', contributors, {
			value: mintPrice,
			from: minter,
		})
		tokenId = tx.logs[0].args[2].toNumber()

		// Get seller balance
		web3.eth.getBalance(minter, async (err, result) => {
			if (err) {
				console.log(err)
			} else {
				sellerBalance = toEth(result)
			}
		})

		// Get contributor balance once (will be used for all though)
		web3.eth.getBalance(contributors[0], (err, result) => {
			if (err) {
				console.log(err)
			} else {
				contributorBalance = toEth(result)
			}
		})
	})

	describe('Listing for sale', () => {
		it('Should throw an error if a non-owner tries to list it for sale', async () => {
			try {
				await nftContract.allowBuy(tokenId, salePrice1, {
					from: nonminter,
				})
			} catch (err) {
				const expectedError = 'Not owner of this token'
				const actualError = err.reason
				assert.equal(actualError, expectedError, 'should not be permitted')
			}
		})

		it('Should allow an owner to list it for sale', async () => {
			const tx = await nftContract.allowBuy(tokenId, salePrice1, {
				from: minter,
			})
			const actualLog = tx.logs[0]
			assert.equal(tx.receipt.from.toLowerCase(), minter.toLowerCase(), 'minter not tied to transaction')
			assert.equal(actualLog.event, 'ListedForSale', 'event names should match')
			assert.equal(actualLog.args._tokenId, tokenId, 'event tokenId should match')
			assert.equal(actualLog.args._price, salePrice1, 'event price should match')
			// assert.equal(await nftContract.tokenIdToPrice(1), salePrice1, 'should update state with sale price for token')
		})

		it('Should require a list price greater than zero', async () => {
			try {
				await nftContract.allowBuy(tokenId, 0, {
					from: minter,
				})
			} catch (err) {
				const expectedError = 'Price zero'
				const actualError = err.reason
				assert.equal(actualError, expectedError, 'should not be permitted')
			}
		})
	})

	describe('Un-listing it for sale', () => {
		it('Should throw an error if a non-owner tries to un-list it for sale', async () => {
			try {
				await nftContract.disallowBuy(tokenId, {
					from: nonminter,
				})
			} catch (err) {
				const expectedError = 'Not owner of this token'
				const actualError = err.reason
				assert.equal(actualError, expectedError, 'should not be permitted')
			}
		})

		it('Should allow an owner to un-list it for sale', async () => {
			const tx = await nftContract.disallowBuy(tokenId, {
				from: minter,
			})
			const actualLog = tx.logs[0]
			assert.equal(tx.receipt.from.toLowerCase(), minter, 'minter not tied to transaction')
			assert.equal(actualLog.event, 'RemovedForSale', 'event names should match')
			assert.equal(actualLog.args._lister.toLowerCase(), minter, 'event lister should match')
			assert.equal(actualLog.args._tokenId, tokenId, 'event price should match')
			// assert.equal(await nftContract.tokenIdToPrice(1), undefined, 'should remove from state of tokens listed')
		})
	})

	describe('Buying and selling a token on the market', () => {
		it('Should throw an error if trying to buy a token not for sale', async () => {
			const tokenIdNotForSale = 10
			try {
				await nftContract.buy(tokenIdNotForSale, {
					from: buyer1,
					value: salePrice1,
				})
			} catch (err) {
				const expectedError = 'This token is not for sale'
				const actualError = err.reason
				assert.equal(actualError, expectedError, 'should not be permitted')
			}
		})

		it('Should throw an error if trying to buy with the incorrect listed price', async () => {
			try {
				// Minter lists it for sale
				await nftContract.allowBuy(tokenId, salePrice1, {
					from: minter,
				})
				// Buyer pays wrong price
				await nftContract.buy(tokenId, {
					from: buyer1,
					value: salePrice2,
				})
			} catch (err) {
				const expectedError = 'Incorrect value'
				const actualError = err.reason
				assert.equal(actualError, expectedError, 'should not be permitted')
			}
		})

		it('Should transfer ownership to the buyer', async () => {
			// Minter lists it for sale
			await nftContract.allowBuy(tokenId, salePrice1, {
				from: minter,
			})

			// Buyer buys it for correct sale price
			const tx = await nftContract.buy(tokenId, {
				from: buyer1,
				value: salePrice1,
			})

			// Events emitted
			const actualEvents = tx.logs.map(l => l.event)
			assert.equal(actualEvents[2], 'Transfer', 'transfer events should match')
			assert.equal(actualEvents[3], 'NftBought', 'NFT bought events should match')
			assert.equal(actualEvents[4], 'SellerPaid', 'seller paid events should match')
			assert.equal(actualEvents[5], 'RoyaltiesPaid', 'royalties paid events should match')

			// Test event arguments
			const actualEventArgs = tx.logs.map(l => l.args)
			assert.equal(actualEventArgs[4]._price, salePrice1 * 0.9, 'seller should receive 90% take from sale')
			assert.equal(actualEventArgs[5]._price, salePrice1 * 0.1, 'contributors should receive 10% take from sale')
			// console.log(actualEventArgs[5]._contributors.map(c => c.toLowerCase()) === contributors)
			// assert.equal(
			// 	actualEventArgs[5]._contributors.map(c => c.toLowerCase()),
			// 	contributors,
			// 	'contributors should match',
			// )

			// Check the balance of the seller's address for the 90% difference
			// const sellersCut = salePrice1 * 0.9
			// web3.eth.getBalance(minter, (err, result) => {
			// 	if (err) {
			// 		console.log(err)
			// 	} else {
			// 		const newSellerBalance = toEth(result)
			// 		const gasCost = toEth(tx.receipt.gasUsed)
			// 		console.log(sellerBalance + ' ETH')
			// 		console.log(newSellerBalance + ' ETH')
			// 		console.log(gasCost + ' ETH')
			// 		assert.equal(
			// 			sellerBalance.toBN() - gasCost.toBN(),
			// 			newBalanceSeller.toBN(),
			// 			'seller should receive 90% take on sale price',
			// 		)
			// 	}
			// })

			// Check the balance of the contributor addresses for the 10% difference
			// const royaltyValue = 200000000000000
			// contributors.map(contributor => {
			// 	web3.eth.getBalance(contributor, (err, result) => {
			// 		if (err) {
			// 			console.log(err)
			// 		} else {
			// 			console.log(web3.utils.fromWei(result, 'ether') + ' ETH')
			// 		}
			// 	})
			// })
			// console.log(newBalanceSeller - startBalanceSeller, sellersCut, contributorBalancesStart, contributorBalancesEnd)
		})
	})
})
