import { withSentry } from '@sentry/nextjs'
import type { NextApiRequest, NextApiResponse } from 'next'

import { update } from '../../../lib/http'
import logger from '../../../lib/logger'
import connectMongo from '../../../lib/mongoClient'
import { createEntity, getAllEntitiesOfType } from '../../../lib/redisClient'
import { StemDoc } from '../../../models'

// Increase the limit for this route to allow for transferring audio files
// See: https://nextjs.org/docs/api-routes/request-helpers#custom-config
export const config = {
	api: {
		bodyParser: {
			sizeLimit: '100mb',
		},
	},
}

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

				// Add new stem to user's stems' details
				const user = await update(`/users/${body.createdBy}`, { newStem: stem._id })
				if (!user.success) throw new Error(user.error)

				// Add the new stem to the project stem queue
				const project = await update(`/projects/${body.projectId}`, { queuedStem: stem })
				if (!project.success) throw new Error(project.error)

				// Return 201 with new data from all three updates for use on client
				return res.status(201).json({ success: true, data: { stem, project: project.data, user: user.data } })
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
