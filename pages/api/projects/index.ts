import type { NextApiRequest, NextApiResponse } from 'next'

import { IProject, IProjectDoc, Project } from '../../../models/project.model'
import dbConnect from '../../../utils/db'
import { update } from '../../../utils/http'

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
				/* find all the data in our database */
				const projects: IProject[] = await Project.find({})
				res.status(200).json({ success: true, data: projects })
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
				console.log({ project })

				// Add new project to creator's user details
				const userUpdated = await update(`/users/${req.body.createdBy}`, { newProject: project._id })
				if (!userUpdated) {
					return res.status(400).json({ success: false, error: "Failed to update user's projects" })
				}
				console.log({ userUpdated })

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

export default handler
