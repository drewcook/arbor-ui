import { withSentry } from '@sentry/nextjs'
import type { NextApiRequest, NextApiResponse } from 'next'

import { update } from '../../../lib/http'
import logger from '../../../lib/logger'
import connectMongo from '../../../lib/mongoClient'
import redisClient, {
	allProjectsKey,
	connectRedis,
	DEFAULT_EXPIRY,
	disconnectRedis,
	getAllEntitiesOfType,
} from '../../../lib/redisClient'
import { Project, ProjectDoc } from '../../../models'

export type CreateProjectPayload = {
	createdBy: string
	collaborators: string[]
	name: string
	description: string
	bpm: number
	trackLimit: number
	tags: string[]
	votingGroupId?: number // Added upon creation
}

async function handler(req: NextApiRequest, res: NextApiResponse) {
	const { body, method } = req

	// open mongodb connection
	await connectMongo()

	switch (method) {
		case 'GET':
			try {
				const projects = await getAllEntitiesOfType('project')
				return res.status(200).json({ success: true, data: projects })
			} catch (error) {
				logger.red(error)
				return res.status(400).json({ success: false, error })
			}

		case 'POST':
			try {
				// Create the new project record in MongoDB
				const payload: CreateProjectPayload = {
					createdBy: body.createdBy,
					collaborators: body.collaborators,
					name: body.name,
					description: body.description,
					bpm: body.bpm,
					trackLimit: body.trackLimit,
					tags: body.tags,
					votingGroupId: body.votingGroupId,
				}
				const project: ProjectDoc = await Project.create(payload)
				if (!project) throw new Error('Failed to create the project')
				// Write project to Redis hash
				await connectRedis()
				const projectKey = String(project.id)
				if (await redisClient.exists(allProjectsKey)) {
					// Redis key exists, add new project to hash and set expiry
					logger.magenta('Redis hit')
					await redisClient.hSet(allProjectsKey, projectKey, JSON.stringify(project))
					await redisClient.expire(`${allProjectsKey}:${projectKey}`, DEFAULT_EXPIRY)
				} else {
					// Redis key does not exist (expired), create hash and add new project with expiry
					logger.magenta('Redis miss')
					const multi = redisClient.multi()
					multi.hSet(allProjectsKey, projectKey, JSON.stringify(project))
					multi.expire(`${allProjectsKey}:${projectKey}`, DEFAULT_EXPIRY)
					await multi.exec()
				}
				// Add new project to creator's user details
				const userUpdated = await update(`/users/${body.createdBy}`, { newProject: projectKey })
				if (!userUpdated) {
					logger.red('Failed to update user')
					await Project.findByIdAndDelete(project.id) // Delete the project record if user update fails
					return res.status(400).json({ success: false, error: "Failed to update user's projects" })
				}
				// Return 201 with new project data
				return res.status(201).json({
					success: true,
					data: {
						...project.toJSON(),
						votingGroupId: payload.votingGroupId, // Include the votingGroupId in the response data
					},
				})
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
			res.status(400).json({ success: false, error: `HTTP method '${method}' not supported` })
			break
	}
}

// Use Sentry as a logging tool when running production environments
export default process.env.NODE_ENV === 'production' ? withSentry(handler) : handler
