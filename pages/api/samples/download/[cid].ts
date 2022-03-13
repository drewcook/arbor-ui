import axios from 'axios'
import type { NextApiRequest, NextApiResponse } from 'next'

const nftStorage = axios.create({
	baseURL: 'https://api.nft.storage',
	responseType: 'arraybuffer',
	headers: {
		authorization: `Bearer ${process.env.NFT_STORAGE_KEY}`,
	},
})

/**
 * Takes in a URL to download from and writes the file to a stream
 * @param req.body.url - An IPFS CID that represent an individual sample
 * @returns res.data - A file to write to
 */
async function handler(req: NextApiRequest, res: NextApiResponse) {
	const { method, query } = req

	switch (method) {
		case 'GET':
			// Get a file from NFT.storage
			try {
				let cid: string = typeof query.cid === 'object' ? query.cid[0] : query.cid
				cid = cid.replace('ipfs://', '').split('/')[0]
				console.log({ cid })
				const response = await nftStorage.get(`/${cid}`)
				// const buffer = Buffer.from(response.data, 'utf-8') // same as response.data

				return res.status(200).json({ success: true, data: response.data }) // { success: true, cid: '...' }
			} catch (e: any) {
				console.error(e)
				return res.status(400).json({ success: false, error: e })
			}
		default:
			return res.status(400).json({ success: false, error: `HTTP method '${method}' not supported` })
	}
}

export default handler
