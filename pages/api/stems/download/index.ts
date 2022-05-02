// import axios from 'axios'
import type { NextApiRequest, NextApiResponse } from 'next'
import path from 'path'
import downloadURL from '../../../../utils/downloadURL'

/**
 * Takes in a URL to download from and writes the file to a stream
 * @param req.body.url - An IPFS CID that represent an individual stem
 * @returns res.data - A file to write to
 */
async function handler(req: NextApiRequest, res: NextApiResponse) {
	const { method, query } = req

	const url: string = typeof query.url === 'object' ? query.url[0] : query.url
	const projectId: string = typeof query.projectId === 'object' ? query.projectId[0] : query.projectId
	const filename: string = typeof query.filename === 'object' ? query.filename[0] : query.filename

	// Set downloads path to OS /Downloads folder
	// Dynamically generated filename
	const downloadsPath = path.resolve(
		process.env.HOME || __dirname,
		'Downloads',
		`PolyechoStem_${projectId}_${filename.trim().replace(' ', '_')}`, // Includes .wav in most cases,
	)

	switch (method) {
		case 'GET':
			// Get a file from NFT.storage
			try {
				// 1. Use downloadURL utility and send to user's filesystem, handle IPFS:// links
				let uri = url
				// If is ipfs uri, transform to web link
				if (url.includes('ipfs://')) {
					uri = url.replace('ipfs://', '').replace('/blob', '')
					uri = 'https://' + uri + '.ipfs.dweb.link/blob'
				}
				const downloadRes = await downloadURL(uri, downloadsPath)
				console.log({ downloadRes })

				// 2. Use NFT.storage API to download
				// const nftStorage = axios.create({
				// 	baseURL: 'https://api.nft.storage',
				// 	responseType: 'arraybuffer',
				// 	headers: {
				// 		authorization: `Bearer ${process.env.NFT_STORAGE_KEY}`,
				// 	},
				// })
				// cid = cid.replace('ipfs://', '').split('/')[0]
				// console.log({ cid })
				// const response = await nftStorage.get(`/${cid}`)
				// const buffer = Buffer.from(response.data, 'utf-8') // same as response.data

				return res.status(200).json({ success: true, data: 'ok' })
			} catch (e: any) {
				console.error(e)
				return res.status(400).json({ success: false, error: e })
			}
		default:
			return res.status(400).json({ success: false, error: `HTTP method '${method}' not supported` })
	}
}

export default handler
