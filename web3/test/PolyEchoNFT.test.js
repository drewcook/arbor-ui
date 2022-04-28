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

contract('PolyEchoNFT: properties', accounts => {
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

contract('PolyEchoNFT: mintAndBuy()', accounts => {
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
	it('Should be able to mint NFTs with proper metadata', async () => {
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
		const tokenIdURIState = await contract.tokenIdToUri()[tokenId - 1]
		assert.equal(tokenIdURIState, actualMetadataURI, 'state should be equal')
	})

	// TODO:
	it.skip('Should pay out the mint price evenly to contributors', async () => {
		const mintPrice = await contract.mintPrice()
		const expectedContributorCut = mintPrice / contributors.length
		const tx = await contract.mintAndBuy(minter, metadataURI1, contributors, {
			value: mintPrice,
		})
		// It is possible that we should emit an event for each transfer to a contributor, and test that way
		const actualContributors = await contract.tokenIdToContributors(0)
		assert.equal(actualContributors, contributors, 'contributors should be tied to the newly minted tokenID')
	})
})
