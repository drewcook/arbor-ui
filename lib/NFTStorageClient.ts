import type { NFTStorage as INFTStorage } from 'nft.storage'
import { NFTStorage } from 'nft.storage'

// Production (NFT Storage)
const NFTStorageClient: INFTStorage = new NFTStorage({
	token: process.env.NFT_STORAGE_KEY || '',
})

export default NFTStorageClient
