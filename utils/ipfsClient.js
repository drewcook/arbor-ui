import { create } from 'ipfs-http-client'

// Development (Local)
const localNode = '/ip4/127.0.0.1/tcp/5001'

// Production (NFT Storage)
// import { NFTStorage } from 'nft.storage'
// const nftStorageNode = new NFTStorage({ token: process.env.NFT_STORAGE_KEY })

// Production (Infura)
// Decode token for Infura
// const b64 = 'MjRjUnBlVFYzT2Q1N1ptTzNLQmZQdUt5NVhKOjExNGUxNzhhZjUyYTg5YWVhZjU2NzY1YmVhYzhlYzhl'
// const bearerToken = 'Basic ' + Buffer.from(b64).toString()
const infuraNode = {
	host: 'ipfs.infura.io',
	port: 5001,
	protocol: 'https',
	headers: {
		authorization:
			'Basic MjRjUnBlVFYzT2Q1N1ptTzNLQmZQdUt5NVhKOjExNGUxNzhhZjUyYTg5YWVhZjU2NzY1YmVhYzhlYzhl',
	},
}

const ipfsClientConfig = process.env.NODE_ENV === 'production' ? infuraNode : localNode
const ipfsClient = create(ipfsClientConfig)

export default ipfsClient
