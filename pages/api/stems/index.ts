import { withSentry } from '@sentry/nextjs'
import type { NextApiRequest, NextApiResponse } from 'next'

import logger from '../../../lib/logger'
import connectMongo from '../../../lib/mongoClient'
import redisClient, {
	allStemsKey,
	connectRedis,
	DEFAULT_EXPIRY,
	disconnectRedis,
	getAllEntitiesOfType,
} from '../../../lib/redisClient'
import { Stem, StemDoc } from '../../../models'

async function handler(req: NextApiRequest, res: NextApiResponse) {
	const { body, method } = req

	// open mongodb connection
	await connectMongo()

	switch (method) {
		case 'GET':
			try {
				const stems = await getAllEntitiesOfType('stem')
				return res.status(200).json({ success: true, data: stems })
			} catch (error) {
				logger.red(error)
				return res.status(400).json({ success: false, error })
			}
		case 'POST':
			try {
				// Create the new stem record in MongoDB
				const payload = {
					name: body.name,
					type: body.type,
					metadataUrl: body.metadataUrl,
					audioUrl: body.audioUrl,
					audioHref: body.audioHref,
					filename: body.filename,
					filetype: body.filetype,
					filesize: body.filesize,
					createdBy: body.createdBy,
				}
				const stem: StemDoc = await Stem.create(payload)
				// Write stem to Redis hash
				await connectRedis()
				const stemKey = String(stem.id)
				if (await redisClient.exists(allStemsKey)) {
					// Redis key exists, add new stem to hash and set expiry
					logger.magenta('Redis hit')
					await redisClient.hSet(allStemsKey, stemKey, JSON.stringify(stem))
					await redisClient.expire(`${allStemsKey}:${stemKey}`, DEFAULT_EXPIRY)
				} else {
					// Redis key does not exist (expired), create hash and add new stem with expiry
					logger.magenta('Redis miss')
					const multi = redisClient.multi()
					multi.hSet(allStemsKey, stemKey, JSON.stringify(stem))
					multi.expire(`${allStemsKey}:${stemKey}`, DEFAULT_EXPIRY)
					await multi.exec()
				}
				// Return 201 with new stem data
				return res.status(201).json({ success: true, data: stem })
			} catch (e) {
				logger.red(e)
				// Return 400
				res.status(400).json({ success: false, error: e })
			} finally {
				// Close Redis connection
				await disconnectRedis()
			}
			break
		default:
			// return 400
			res.status(400).json({ success: false, error: `HTTP method '${method}' not supported` })
			break
	}
}

// Use Sentry as a logging tool when running production environments
export default process.env.NODE_ENV === 'production' ? withSentry(handler) : handler
