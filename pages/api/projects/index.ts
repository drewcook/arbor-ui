import { withSentry } from '@sentry/nextjs'
import type { NextApiRequest, NextApiResponse } from 'next'

import dbConnect from '../../../lib/connectMongo'
import { update } from '../../../lib/http'
import logger from '../../../lib/logger'
import redisClient, { connectRedis, DEFAULT_EXPIRY, disconnectRedis } from '../../../lib/redisClient'
import { IProject, IProjectDoc, Project } from '../../../models/project.model'

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
	const { method } = req

	// open mongodb connection
	await dbConnect()

	switch (method) {
		case 'GET':
			try {
				// check redis cache
				let projects: IProject[]
				// open redis connection
				await connectRedis()
				// check and return from cache
				const redisData = await redisClient.get('projects')
				if (redisData !== null) {
					logger.magenta('Redis hit')
					projects = JSON.parse(redisData)
				} else {
					logger.magenta('Redis miss')
					// find projects in database
					projects = await Project.find({})
					// write to cache for subsequent calls
					await redisClient.setEx('projects', DEFAULT_EXPIRY, JSON.stringify(projects))
				}
				// close redis connection
				await disconnectRedis()
				// return 200
				return res.status(200).json({ success: true, data: projects })
			} catch (e) {
				// close redis connection as failsafe
				await disconnectRedis()
				res.status(400).json({ success: false, error: e })
			}
			break
		case 'POST':
			try {
				// Create the new project record
				const { createdBy, collaborators, name, description, bpm, trackLimit, tags, votingGroupId } = req.body
				const payload: CreateProjectPayload = {
					createdBy,
					collaborators,
					name,
					description,
					bpm,
					trackLimit,
					tags,
					votingGroupId,
				}
				const project: IProjectDoc = await Project.create(payload)

				// open redis connection
				await connectRedis()
				// add to redis both project and update existing projects array
				await redisClient.setEx(`projects:${project.id}`, DEFAULT_EXPIRY, JSON.stringify(project))
				const existingCachedProjects = await redisClient.get('projects')
				if (existingCachedProjects !== null) {
					JSON.parse(existingCachedProjects).push(project)
					await redisClient.setEx('projects', DEFAULT_EXPIRY, JSON.stringify(existingCachedProjects))
				}
				// close redis connection
				await disconnectRedis()

				// Add new project to creator's user details
				const userUpdated = await update(`/users/${req.body.createdBy}`, { newProject: project._id })
				if (!userUpdated) {
					return res.status(400).json({ success: false, error: "Failed to update user's projects" })
				}

				// Return back the new Project record
				res.status(201).json({ success: true, data: project })
			} catch (e: any) {
				// close redis connection as failsafe
				await disconnectRedis()
				res.status(400).json({ success: false, error: e })
			}
			break
		default:
			res.status(400).json({ success: false, error: `HTTP method '${method}' not supported` })
			break
	}
}

// Use Sentry as a logging tool when running production environments
export default process.env.NODE_ENV === 'production' ? withSentry(handler) : handler
