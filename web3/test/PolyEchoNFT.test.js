const NFTContract = artifacts.require('PolyEchoNFT')

contract('PolyEchoNFT: deployment', () => {
	let contract

	beforeEach(async () => {
		contract = await NFTContract.deployed()
	})

	it('has been deployed', async () => {
		assert(contract, 'PolyEchoNFT contract was not deployed')
		assert.notEqual(contract, undefined)
	})

	it('Should have an address', () => {
		const address = contract.address
		assert.notEqual(address, 0x0)
		assert.notEqual(address, '')
		assert.notEqual(address, null)
		assert.notEqual(address, undefined)
	})

	it('Should have a name', async () => {
		const name = await contract.name()
		assert.equal(name, 'PolyEcho')
	})

	it('Should have a symbol', async () => {
		const symbol = await contract.symbol()
		assert.equal(symbol, 'ECHO')
	})
})

contract('PolyEchoNFT: state properties', accounts => {
	let contract
	const owner = accounts[0]

	beforeEach(async () => {
		contract = await NFTContract.deployed()
	})

	it('Should have a display name', async () => {
		const displayName = await contract.displayName()
		assert.equal(displayName, 'PolyEcho Audio NFT')
	})

	it('Should have a company name', async () => {
		const companyName = await contract.companyName()
		assert.equal(companyName, 'PolyEcho')
	})

	describe('editing displayName', () => {
		it('Should be able to update the display name', async () => {
			const displayName = await contract.displayName()
			assert.equal(displayName, 'PolyEcho Audio NFT')
		})

		it('should emit the NameUpdated event', async () => {
			const tx = await contract.updateDisplayName('Genesis Collection', {
				from: owner,
			})
			const expectedEvent = 'NameUpdated'
			const actualEvent = tx.logs[0].event
			assert.equal(actualEvent, expectedEvent, 'events should match')
		})
	})
})

contract('PolyEchoNFT: minting an NFT', accounts => {
	let contract
	const owner = accounts[0]
	const minter = accounts[1]
	const metadataURI1 = 'ipfs://some-test-CID-1'
	const metadataURI2 = 'ipfs://some-test-CID-2'
	const contributors = [accounts[2], accounts[3], accounts[3]]

	beforeEach(async () => {
		contract = await NFTContract.deployed()
	})

	it('Should have a static mint price', async () => {
		const mintPrice = await contract.mintPrice()
		assert.equal(mintPrice, 10000000000000000)
	})

	it('Throws an error if sender sends less than the mint price', async () => {
		try {
			await contract.mintAndBuy(minter, metadataURI1, contributors)
		} catch (err) {
			const expectedError = 'Sent ether value is not enough to mint'
			const actualError = err.reason
			assert.equal(actualError, expectedError, 'should not be permitted')
		}
	})

	// Tests for NFT minting function of PolyEchoNFT contract using tokenID of the minted NFT
	it('Should be able to mint a token with proper metadata', async () => {
		// Mint a token
		const mintPrice = await contract.mintPrice()
		let tx = await contract.mintAndBuy(minter, metadataURI1, contributors, {
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
		tx = await contract.mintAndBuy(minter, metadataURI2, contributors, {
			value: mintPrice,
		})
		tokenId = tx.logs[0].args[2].toNumber()
		actualMetadataURI = tx.logs[2].args._tokenURI
		assert.equal(tokenId, 2, 'tokenID should be incremented')
		assert.equal(actualMetadataURI, metadataURI2, 'metadata URIs should match')
	})

	// TODO: It is possible that we should emit an event for each transfer to a contributor, and test that way
	it.skip('Should pay out the mint price evenly to contributors', async () => {
		const mintPrice = await contract.mintPrice()
		const expectedContributorCut = mintPrice / contributors.length
		const tx = await contract.mintAndBuy(minter, metadataURI1, contributors, {
			value: mintPrice,
		})
		const actualContributors = await contract.tokenIdToContributors(0)
		assert.equal(actualContributors, contributors, 'contributors should be tied to the newly minted tokenID')
	})
})

contract('PolyEchoNFT: listing and selling an NFT', async accounts => {
	let contract
	let tokenId
	const minter = accounts[1]
	const nonminter = accounts[0]
	const buyer1 = accounts[2]
	const buyer2 = accounts[3]
	const contributors = [accounts[4], accounts[5], accounts[6]]
	const salePrice1 = 2000000000000000
	const salePrice2 = 5000000000000000

	beforeEach(async () => {
		contract = await NFTContract.deployed()
		const mintPrice = await contract.mintPrice()
		const tx = await contract.mintAndBuy(minter, 'ipfs://test-metadata-uri', contributors, {
			value: mintPrice,
			from: minter,
		})
		tokenId = tx.logs[0].args[2].toNumber()
	})

	describe('Listing for sale', () => {
		it('Should throw an error if a non-owner tries to list it for sale', async () => {
			try {
				await contract.allowBuy(tokenId, salePrice1, {
					from: nonminter,
				})
			} catch (err) {
				const expectedError = 'Not owner of this token'
				const actualError = err.reason
				assert.equal(actualError, expectedError, 'should not be permitted')
			}
		})

		// TODO: emit an event when listed successfully and test against it
		it('Should allow an owner to list it for sale', async () => {
			const tx = await contract.allowBuy(tokenId, salePrice1, {
				from: minter,
			})
			assert.equal(tx.receipt.from.toLowerCase(), minter.toLowerCase(), 'minter not tied to transaction')
			// assert.equal(await contract.tokenIdToPrice(1), salePrice1, 'should update state with sale price for token')
		})

		it('Should require a list price greater than zero', async () => {
			try {
				await contract.allowBuy(tokenId, 0, {
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
				await contract.disallowBuy(tokenId, {
					from: nonminter,
				})
			} catch (err) {
				const expectedError = 'Not owner of this token'
				const actualError = err.reason
				assert.equal(actualError, expectedError, 'should not be permitted')
			}
		})

		// TODO: emit an event when listed successfully and test against it
		it('Should allow an owner to un-list it for sale', async () => {
			const tx = await contract.disallowBuy(tokenId, {
				from: minter,
			})
			assert.equal(tx.receipt.from.toLowerCase(), minter.toLowerCase(), 'minter not tied to transaction')
			// assert.equal(await contract.tokenIdToPrice(1), undefined, 'should remove from state of tokens listed')
		})
	})
})
