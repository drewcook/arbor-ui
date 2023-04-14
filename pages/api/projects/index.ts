import { withSentry } from '@sentry/nextjs'
import type { NextApiRequest, NextApiResponse } from 'next'

import { update } from '../../../lib/http'
import logger from '../../../lib/logger'
import connectMongo from '../../../lib/mongoClient'
import { createEntity, getAllEntitiesOfType } from '../../../lib/redisClient'
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

	// Connect to MongoDB
	await connectMongo()

	switch (method) {
		case 'GET':
			try {
				const projects: ProjectDoc[] = await getAllEntitiesOfType('project')
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

				const project: ProjectDoc = await createEntity('project', payload)

				// Add new project to creator's user details
				const userUpdated = await update(`/users/${body.createdBy}`, { newProject: project._id })
				if (!userUpdated) {
					logger.red('Failed to update user')
					await Project.findByIdAndDelete(project.id) // Delete the project record if user update fails
					return res.status(400).json({ success: false, error: "Failed to update user's projects" })
				}

				// Return 201 with new project data
				return res.status(201).json({
					success: true,
					data: {
						...project,
						votingGroupId: payload.votingGroupId, // Include the votingGroupId in the response data
					},
				})
			} catch (error) {
				logger.red(error)
				return res.status(400).json({ success: false, error })
			}

		default:
			res.status(400).json({ success: false, error: `HTTP method '${method}' not supported` })
			break
	}
}

// Use Sentry as a logging tool when running production environments
export default process.env.NODE_ENV === 'production' ? withSentry(handler) : handler
