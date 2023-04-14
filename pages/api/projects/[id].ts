import { withSentry } from '@sentry/nextjs'
import type { NextApiRequest, NextApiResponse } from 'next'

import logger from '../../../lib/logger'
import connectMongo from '../../../lib/mongoClient'
import { deleteEntityById, getEntityById, updateEntityById, UpdateEntityOptions } from '../../../lib/redisClient'
import { ProjectDoc } from '../../../models'

async function handler(req: NextApiRequest, res: NextApiResponse) {
	// Extract request params
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
				const project: ProjectDoc | null = await getEntityById('project', id)

				// Return 200
				return res.status(200).json({ success: true, data: project })
			} catch (error) {
				logger.red(error)
				return res.status(400).json({ success: false, error })
			}

		case 'PUT':
			try {
				// Update Project in MongoDB and Redis cache
				const { approvedStem, queuedStem, ...bodyToUpdate } = body
				let options: UpdateEntityOptions = {}

				// Add the approved stem to the queue with the amount of votes it has
				// Or, add the newly accepted queued stem to the queue with zero votes
				// Otherwise, don't push anything
				if (approvedStem) {
					options = {
						push: { queue: { stem: approvedStem, votes: approvedStem.votes } },
					}
				} else if (queuedStem) {
					options = {
						push: { queue: { stem: queuedStem, votes: 0 } },
					}
				} else {
					options = {
						set: bodyToUpdate,
					}
				}

				const project: ProjectDoc = await updateEntityById('project', id, options)

				// Return 200
				return res.status(200).json({ success: true, data: project })
			} catch (error) {
				logger.red(error)
				return res.status(400).json({ success: false, error })
			}

		case 'DELETE':
			try {
				// Delete Project from MongoDB and Redis
				const deletedProject: ProjectDoc = await deleteEntityById('project', id)

				// Return 200
				return res.status(200).json({ success: true, data: deletedProject })
			} catch (error) {
				logger.red(error)
				return res.status(400).json({ success: false, error })
			}

		default:
			res.status(400).json({ success: false, error: `HTTP method '${method}' is not supported` })
			break
	}
}

// Use Sentry as a logging tool when running production environments
export default process.env.NODE_ENV === 'production' ? withSentry(handler) : handler
