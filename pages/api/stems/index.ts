import { withSentry } from '@sentry/nextjs'
import type { NextApiRequest, NextApiResponse } from 'next'

import logger from '../../../lib/logger'
import connectMongo from '../../../lib/mongoClient'
import { createEntity, getAllEntitiesOfType } from '../../../lib/redisClient'
import { StemDoc } from '../../../models'

async function handler(req: NextApiRequest, res: NextApiResponse) {
	const { body, method } = req

	// Connect to MongoDB
	await connectMongo()

	switch (method) {
		case 'GET':
			try {
				const stems: StemDoc[] = await getAllEntitiesOfType('stem')
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
				const stem: StemDoc = await createEntity('stem', payload)

				// Return 201 with new stem data
				return res.status(201).json({ success: true, data: stem })
			} catch (error) {
				logger.red(error)
				return res.status(400).json({ success: false, error })
			}
		default:
			// return 400
			res.status(400).json({ success: false, error: `HTTP method '${method}' not supported` })
			break
	}
}

// Use Sentry as a logging tool when running production environments
export default process.env.NODE_ENV === 'production' ? withSentry(handler) : handler
