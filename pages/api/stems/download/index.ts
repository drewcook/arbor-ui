// import axios from 'axios'
import type { NextApiRequest, NextApiResponse } from 'next'
import path from 'path'
import fs from 'fs'
import downloadStem from '../../../../utils/downloadStem'
import logger from '../../../../utils/logger'

/**
 * Takes in a URL to download from and writes the file to a stream
 * @param req.body.url - An IPFS CID that represent an individual stem
 * @returns res.data - A file to write to
 */
// TODO: Put a much longer timeout for this handler as downloading/zipping files could take a bit of time
// i.e. https://github.com/expressjs/timeout
async function handler(req: NextApiRequest, res: NextApiResponse) {
	const { method, body } = req
	const projectId: string = body.projectId
	const stemData: { url: string; filename: string }[] = body.stemData

	switch (method) {
		case 'POST':
			try {
				// 1. Use downloadURL utility to download each stem to a blob
				await Promise.all(
					stemData.map(async stem => {
						let uri = stem.url
						// If is ipfs uri, transform to web link
						if (stem.url.includes('ipfs://')) {
							uri = stem.url.replace('ipfs://', '').replace('/blob', '')
							uri = 'https://' + uri + '.ipfs.dweb.link/blob'
						}
						await downloadStem(uri)
					}),
				)
				// TODO: Noah - Use binary data returned from stem download to create and return zip file
				// 2. Compress the temp directory to a .zip file to prep for a single file download
				// if (!zippedRes) return res.status(400).json({ success: false })
				return res.status(200).json({ success: true, data: stemData })
			} catch (e: any) {
				console.error('Error downloading stems', e)
				return res.status(400).json({ success: false, error: e })
			}
		default:
			return res.status(400).json({ success: false, error: `HTTP method '${method}' not supported` })
	}
}

export default handler
