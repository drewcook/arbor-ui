import { withSentry } from '@sentry/nextjs'
import type { NextApiRequest, NextApiResponse } from 'next'

import logger from '../../../lib/logger'
import connectMongo from '../../../lib/mongoClient'
import redisClient, { allStemsKey, connectRedis, DEFAULT_EXPIRY, disconnectRedis } from '../../../lib/redisClient'
import type { IStemDoc } from '../../../models/stem.model'
import { IStem, Stem } from '../../../models/stem.model'

type CreateStemPayload = IStem

async function handler(req: NextApiRequest, res: NextApiResponse) {
	const { body, method } = req

	// open mongodb connection
	await connectMongo()

	switch (method) {
		case 'GET':
			try {
				let stems: IStemDoc[]
				// Connect to Redis
				await connectRedis()
				// Check if Redis has the desired data
				const redisData = await redisClient.hGetAll(allStemsKey)
				if (Object.keys(redisData).length) {
					// Redis data exists, parse and return it
					logger.magenta('Redis hit')
					stems = Object.values(redisData).map((stemString: string) => JSON.parse(stemString))
				} else {
					// Redis data does not exist, fetch from MongoDB and cache it in Redis
					logger.magenta('Redis miss')
					stems = await Stem.find({})
					const multi = redisClient.multi()
					stems.forEach(stem => {
						const stemKey = String(stem.id)
						multi.hSet(allStemsKey, stemKey, JSON.stringify(stem))
						multi.expire(stemKey, DEFAULT_EXPIRY)
					})
					await multi.exec()
				}
				// Return 200
				return res.status(200).json({ success: true, data: stems })
			} catch (e) {
				logger.red(e)
				// Return 400
				res.status(400).json({ success: false, error: e })
			} finally {
				// Close Redis connection
				await disconnectRedis()
			}
			break
		case 'POST':
			try {
				// Create the new stem record in MongoDB
				const payload: CreateStemPayload = {
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
				const stem: IStemDoc = await Stem.create(payload)
				// Write stem to Redis hash
				await connectRedis()
				const stemKey = String(stem.id)
				if (await redisClient.exists(allStemsKey)) {
					// Redis key exists, add new stem to hash and set expiry
					logger.magenta('Redis hit')
					await redisClient.hSet(allStemsKey, stemKey, JSON.stringify(stem))
					await redisClient.expire(stemKey, DEFAULT_EXPIRY)
				} else {
					// Redis key does not exist (expired), create hash and add new stem with expiry
					logger.magenta('Redis miss')
					const multi = redisClient.multi()
					multi.hSet(allStemsKey, stemKey, JSON.stringify(stem))
					multi.expire(stemKey, DEFAULT_EXPIRY)
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
