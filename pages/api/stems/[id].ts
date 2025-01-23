import type { NextApiRequest, NextApiResponse } from 'next'

import logger from '../../../lib/logger'
import connectMongo from '../../../lib/mongoClient'
import { deleteEntityById, getEntityById, updateEntityById, UpdateEntityOptions } from '../../../lib/redisClient'
import { StemDoc } from '../../../models'

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
				const stem: StemDoc = await getEntityById('stem', id)

				// Return 200
				return res.status(200).json({ success: true, data: stem })
			} catch (error) {
				logger.red(error)
				return res.status(400).json({ success: false, error })
			}

		case 'PUT':
			try {
				// Update NFT in MongoDB and Redis cache
				const options: UpdateEntityOptions = { set: body }
				const stem: StemDoc = await updateEntityById('stem', id, options)

				// Return 200
				return res.status(200).json({ success: true, data: stem })
			} catch (error) {
				logger.red(error)
				return res.status(400).json({ success: false, error })
			}

		case 'DELETE':
			try {
				// Delete Stem from MongoDB and Redis
				const deletedStem: StemDoc = await deleteEntityById('stem', id)

				// TODO: delete stem from user object

				// Return 200
				return res.status(200).json({ success: true, data: deletedStem })
			} catch (error) {
				logger.red(error)
				return res.status(400).json({ success: false, error })
			}

		default:
			res.status(400).json({ success: false, error: `HTTP method '${method}' is not supported` })
			break
	}
}

export default handler
