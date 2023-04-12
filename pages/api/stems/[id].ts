import { withSentry } from '@sentry/nextjs'
import type { NextApiRequest, NextApiResponse } from 'next'

import logger from '../../../lib/logger'
import connectMongo from '../../../lib/mongoClient'
import { getEntityById, updateEntityById } from '../../../lib/redisClient'
import { Stem, StemDoc } from '../../../models'

async function handler(req: NextApiRequest, res: NextApiResponse) {
	const {
		query: { id },
		body,
		method,
	} = req

	// Connect to MongoDB
	await connectMongo()

	switch (method) {
		case 'GET':
			try {
				// Get the cached entity or fetch it from MongoDB
				const stem: StemDoc | null = await getEntityById('stem', id)

				// Return 200
				return res.status(200).json({ success: true, data: stem })
			} catch (error) {
				logger.red(error)
				return res.status(400).json({ success: false, error })
			}

		case 'PUT':
			try {
				// Update NFT in MongoDB and Redis cache
				const stem: StemDoc | null = await updateEntityById('stem', id, body)

				// Return 200
				return res.status(200).json({ success: true, data: stem })
			} catch (error) {
				logger.red(error)
				return res.status(400).json({ success: false, error })
			}

		case 'DELETE':
			try {
				const deletedStem = await Stem.deleteOne({ _id: id })
				if (!deletedStem) {
					return res.status(400).json({ success: false, error: 'failed to delete stem' })
				}

				// TODO: Delete from user's stems

				res.status(200).json({ success: true, data: deletedStem })
			} catch (e) {
				res.status(400).json({ success: false, error: e })
			}
			break

		default:
			res.status(400).json({ success: false, error: `HTTP method '${method}' is not supported` })
			break
	}
}

// Use Sentry as a logging tool when running production environments
export default process.env.NODE_ENV === 'production' ? withSentry(handler) : handler
