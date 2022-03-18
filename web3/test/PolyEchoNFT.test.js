const NFTContract = artifacts.require('PolyEchoNFT')

contract('PolyEchoNFT', accounts => {
	let nft
	let tokenId

	// Tests it can be deployed
	it('has been deployed', async () => {
		const contract = await NFTContract.deployed()
		assert(contract, 'PolyEchoNFT contract was not deployed')
		assert.notEqual(contract, undefined)
	})

	// // Tests address for the EternalNFT contract
	// it('Should have an address', async () => {
	// 	const contract = await NFTContract.deployed()
	// 	const address = await contract.address()
	// 	assert.notEqual(address, 0x0)
	// 	assert.notEqual(address, '')
	// 	assert.notEqual(address, null)
	// 	assert.notEqual(address, undefined)
	// })

	// // Tests name for the token of EternalNFT contract
	// it('Should have a name', async () => {
	// 	// Returns the name of the token
	// 	const name = await nft.collectionName()

	// 	assert.equal(name, 'EternalNFT')
	// })

	// // Tests symbol for the token of EternalNFT contract
	// it('Should have a symbol', async () => {
	// 	// Returns the symbol of the token
	// 	const symbol = await nft.collectionSymbol()

	// 	assert.equal(symbol, 'ENFT')
	// })

	// // Tests for NFT minting function of EternalNFT contract using tokenID of the minted NFT
	// it('Should be able to mint NFT', async () => {
	// 	// Mints a NFT
	// 	let txn = await nft.createEternalNFT()
	// 	let tx = await txn.wait()

	// 	// tokenID of the minted NFT
	// 	let event = tx.events[0]
	// 	let value = event.args[2]
	// 	tokenId = value.toNumber()

	// 	assert.equal(tokenId, 0)

	// 	// Mints another NFT
	// 	txn = await nft.createEternalNFT()
	// 	tx = await txn.wait()

	// 	// tokenID of the minted NFT
	// 	event = tx.events[0]
	// 	value = event.args[2]
	// 	tokenId = value.toNumber()

	// 	assert.equal(tokenId, 1)
	// })
})
