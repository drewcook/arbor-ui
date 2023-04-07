import { withSentry } from '@sentry/nextjs'
import type { NextApiRequest, NextApiResponse } from 'next'

import { IProject, IProjectDoc, Project } from '../../../models/project.model'
import dbConnect from '../../../utils/db'
import { update } from '../../../utils/http'
import logger from '../../../utils/logger'
import redisClient from '../../../utils/redisClient'

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
	await dbConnect()

	switch (method) {
		case 'GET':
			try {
				// check redis cache
				let projects: IProject[]
				const redisData = await redisClient.get('projects')
				// return from cache if so
				if (redisData !== null) {
					logger.magenta('Redis hit')
					projects = JSON.parse(redisData) as IProject[]
				} else {
					logger.magenta('Redis miss')
					// find all the data in our database
					projects = await Project.find({})
					// write projects to cache for subsequent calls
					await redisClient.set('projects', JSON.stringify(projects))
				}
				return res.status(200).json({ success: true, data: projects })
			} catch (e) {
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

				// Add new project to creator's user details
				const userUpdated = await update(`/users/${req.body.createdBy}`, { newProject: project._id })
				if (!userUpdated) {
					return res.status(400).json({ success: false, error: "Failed to update user's projects" })
				}

				// Return back the new Project record
				res.status(201).json({ success: true, data: project })
			} catch (e: any) {
				console.error(e.message)
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
