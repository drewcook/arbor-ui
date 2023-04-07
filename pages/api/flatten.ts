import { withSentry } from '@sentry/nextjs'
import axios from 'axios'
import type { NextApiRequest, NextApiResponse } from 'next'

import logger from '../../lib/logger'

const pythonServer = axios.create({ baseURL: process.env.PYTHON_HTTP_HOST })

/**
 * Hits an external Python service to combine and flatten individual stems into a singular stem
 * @param req.body - An array of IPFS CIDs that represent individual stems
 * @returns res.data - A singular IPFS CID that represents the newly, flattened stem
 */
async function handler(req: NextApiRequest, res: NextApiResponse) {
	const { method } = req

	if (method === 'POST') {
		const { body } = req

		try {
			const response = await pythonServer.post('/merge', body)
			return res.status(200).json(response.data) // { success: true, cid: '...' }
		} catch (e: any) {
			logger.red(e)
			return { success: false, error: e }
		}
	}
}

// Use Sentry as a logging tool when running production environments
export default process.env.NODE_ENV === 'production' ? withSentry(handler) : handler
