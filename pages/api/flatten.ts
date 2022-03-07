import type { NextApiRequest, NextApiResponse } from 'next'
import axios from 'axios'

const pythonServer = axios.create({ baseURL: process.env.PYTHON_HTTP_HOST })

/**
 * Hits an external Python service to combine and flatten individual samples into a singular sample
 * @param req.body - An array of IPFS CIDs that represent individual samples
 * @returns res.data - A singular IPFS CID that represents the newly, flattened sample
 */
async function handler(req: NextApiRequest, res: NextApiResponse) {
	const { method } = req

	if (method === 'POST') {
		const { body } = req

		try {
			const response = await pythonServer.post('/merge', body)
			return res.status(200).json(response.data) // { success: true, cid: '...' }
		} catch (e: any) {
			return { success: false, error: e }
		}
	}
}

export default handler
