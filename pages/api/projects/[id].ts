import { withSentry } from '@sentry/nextjs'
import type { NextApiRequest, NextApiResponse } from 'next'

import logger from '../../../lib/logger'
import connectMongo from '../../../lib/mongoClient'
import redisClient, {
	allProjectsKey,
	connectRedis,
	DEFAULT_EXPIRY,
	disconnectRedis,
	getEntityById,
} from '../../../lib/redisClient'
import { Project, ProjectDoc } from '../../../models'

async function handler(req: NextApiRequest, res: NextApiResponse) {
	// Extract request params
	const {
		query: { id },
		body,
		method,
	} = req

	// Redis keys
	const projectKey = String(id)
	const fullKey = `${allProjectsKey}:${projectKey}`

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
				// Update project in MongoDB
				const { approvedStem, queuedStem, ...update } = body
				const project = await Project.findByIdAndUpdate(
					id,
					{
						$set: update,
						// Add the approved stem to the queue with the amount of votes it has
						// Or, add the newly accepted queued stem to the queue with zero votes
						// Otherwise, don't push anything
						$push: approvedStem
							? { queue: { stem: approvedStem, votes: approvedStem.votes } }
							: queuedStem
							? { queue: { stem: queuedStem, votes: 0 } }
							: {},
					},
					{
						new: true,
						runValidators: true,
					},
				)

				// Catch error
				if (!project) {
					return res.status(400).json({ success: false, error: 'Failed to update project' })
				} else {
					// Update entity Redis cache, checking if exists first
					await connectRedis()
					if (await redisClient.exists(fullKey)) {
						logger.magenta('Redis hit')
						// Update the 'projects:all' key in Redis
						const cachedProjects = await redisClient.hGetAll(allProjectsKey)
						if (cachedProjects) {
							const updatedProjects = {
								...cachedProjects,
								[projectKey]: JSON.stringify(project),
							}

							await redisClient.hSet(allProjectsKey, updatedProjects)
						}
					} else {
						// Redis key does not exist (expired), create hash and add new project with expiry
						logger.magenta('Redis miss')
						const multi = redisClient.multi()
						multi.hSet(allProjectsKey, projectKey, JSON.stringify(project))
						multi.expire(fullKey, DEFAULT_EXPIRY)
						await multi.exec()
					}
					// Return 200
					return res.status(200).json({ success: true, data: project })
				}
			} catch (e) {
				logger.red(e)
				return res.status(400).json({ success: false, error: e })
			} finally {
				// Close Redis connection
				await disconnectRedis()
			}

		case 'DELETE':
			try {
				// Connect to Redis
				await connectRedis()
				// Check if the project exists in Redis and delete if so
				const redisExists = await redisClient.hExists(allProjectsKey, projectKey)
				if (redisExists) await redisClient.hDel(allProjectsKey, projectKey)
				// Delete the project from MongoDB
				const result = await Project.findByIdAndDelete(id)
				// Check if the project was found and deleted
				if (result) {
					return res.status(200).json({ success: true, message: `Project with '${id}' was deleted successfully` })
				} else {
					return res.status(404).json({ success: false, error: `Project with '${id}' not found` })
				}
			} catch (error) {
				logger.red(error)
				return res.status(400).json({ success: false, error })
			} finally {
				// Close Redis connection
				await disconnectRedis()
			}

		default:
			res.status(400).json({ success: false, error: `HTTP method '${method}' is not supported` })
			break
	}
}

// Use Sentry as a logging tool when running production environments
export default process.env.NODE_ENV === 'production' ? withSentry(handler) : handler
