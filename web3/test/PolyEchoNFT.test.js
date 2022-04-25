const NFTContract = artifacts.require('PolyEchoNFT')

contract('PolyEchoNFT: deployment', () => {
	let contract
	let nft
	let tokenId

	beforeEach(async () => {
		contract = await NFTContract.deployed()
	})

	// Tests it can be deployed
	it('has been deployed', async () => {
		assert(contract, 'PolyEchoNFT contract was not deployed')
		assert.notEqual(contract, undefined)
	})

	// Tests address for the PolyEchoNFT contract
	it('Should have an address', () => {
		const address = contract.address
		assert.notEqual(address, 0x0)
		assert.notEqual(address, '')
		assert.notEqual(address, null)
		assert.notEqual(address, undefined)
	})

	// Tests name for the token of PolyEchoNFT contract
	it('Should have a name', async () => {
		// Returns the name of the token
		const name = await contract.name()
		assert.equal(name, 'PolyEcho')
	})

	// Tests symbol for the token of PolyEchoNFT contract
	it('Should have a symbol', async () => {
		// Returns the symbol of the token
		const symbol = await contract.symbol()
		assert.equal(symbol, 'ECHO')
	})
})

contract('PolyEchoNFT: minting', () => {
	// Tests for NFT minting function of PolyEchoNFT contract using tokenID of the minted NFT
	it.skip('Should be able to mint NFT', async () => {
		// Mints a NFT
		let txn = await nft.createPolyEchoNFT()
		let tx = await txn.wait()

		// tokenID of the minted NFT
		let event = tx.events[0]
		let value = event.args[2]
		tokenId = value.toNumber()

		assert.equal(tokenId, 0)

		// Mints another NFT
		txn = await nft.createPolyEchoNFT()
		tx = await txn.wait()

		// tokenID of the minted NFT
		event = tx.events[0]
		value = event.args[2]
		tokenId = value.toNumber()

		assert.equal(tokenId, 1)
	})
})
