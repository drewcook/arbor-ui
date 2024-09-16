import { NFTStorage } from 'nft.storage'

// Production (NFT Storage)
const NFTStorageClient = new NFTStorage({
	token: process.env.NFT_STORAGE_KEY || '',
})

export * from 'nft.storage'
export default NFTStorageClient
