import { withSentry } from '@sentry/nextjs'
import type { NextApiRequest, NextApiResponse } from 'next'

import { update } from '../../../lib/http'
import logger from '../../../lib/logger'
import connectMongo from '../../../lib/mongoClient'
import redisClient, { allProjectsKey, connectRedis, DEFAULT_EXPIRY, disconnectRedis } from '../../../lib/redisClient'
import { IProjectDoc, Project } from '../../../models/project.model'

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
				let projects: IProjectDoc[]
				// Connect to Redis
				await connectRedis()
				// Check if Redis has the desired data
				const redisData = await redisClient.hGetAll(allProjectsKey)
				if (Object.keys(redisData).length) {
					// Redis data exists, parse and return it
					logger.magenta('Redis hit')
					projects = Object.values(redisData).map((projectString: string) => JSON.parse(projectString))
				} else {
					// Redis data does not exist, fetch from MongoDB and cache it in Redis
					logger.magenta('Redis miss')
					projects = await Project.find({})
					const multi = redisClient.multi()
					projects.forEach(project => {
						const projectKey = String(project.id)
						multi.hSet(allProjectsKey, projectKey, JSON.stringify(project))
						multi.expire(projectKey, DEFAULT_EXPIRY)
					})
					await multi.exec()
				}
				// Return 200
				return res.status(200).json({ success: true, data: projects })
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
				const project: IProjectDoc = await Project.create(payload)
				if (!project) throw new Error('Failed to create the project')
				// Write project to Redis hash
				await connectRedis()
				const projectKey = String(project.id)
				if (await redisClient.exists(allProjectsKey)) {
					// Redis key exists, add new project to hash and set expiry
					logger.magenta('Redis hit')
					await redisClient.hSet(allProjectsKey, projectKey, JSON.stringify(project))
					await redisClient.expire(projectKey, DEFAULT_EXPIRY)
				} else {
					// Redis key does not exist (expired), create hash and add new project with expiry
					logger.magenta('Redis miss')
					const multi = redisClient.multi()
					multi.hSet(allProjectsKey, projectKey, JSON.stringify(project))
					multi.expire(projectKey, DEFAULT_EXPIRY)
					await multi.exec()
				}
				// Add new project to creator's user details
				const userUpdated = await update(`/users/${body.createdBy}`, { newProject: projectKey })
				if (!userUpdated) {
					return res.status(400).json({ success: false, error: "Failed to update user's projects" })
				}
				// Return 201 with new project data
				return res.status(201).json({ success: true, data: project })
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
