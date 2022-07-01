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
				/*
					Increment the global voting group counter, and use this as the ID for the new Semaphore group
					- Call PUT /api/voting-groups to increment the value
					- Get the returned data, inspect the new totalGroupCount value
					- Use this as the new groupId for the on-chain group
					  - This will need to be done on the client-side, so we'll get this from the response
					- Use this as the groupId value for the new project record as well
					- TODO: revert this, or decrement if any of the following requests fail
				*/
				const votingGroupRes = await update('/voting-groups')
				if (!votingGroupRes || !votingGroupRes.success) {
					return res.status(400).json({ success: false, error: 'Failed to increment voting group count' })
				}
				console.log({ votingGroupRes })

				/*
					Create the new project record
					- Should reference the off-chain groupId which maps to the Semaphore group we just created on-chain
				*/
				const payload: CreateProjectPayload = {
					createdBy: req.body.createdBy,
					collaborators: req.body.collaborators,
					name: req.body.name,
					description: req.body.description,
					bpm: req.body.bpm,
					trackLimit: req.body.trackLimit,
					tags: req.body.tags,
					votingGroupId: votingGroupRes.data.totalGroupCount,
				}
				// TODO: Do not save any of these records just yet... wait until after we create the Semaphore group successfully, so we don't end up with bad data across multiple collections
				const project: IProjectDoc = await Project.create(payload)
				console.log({ project })
				/*
					Add new project to creator's user details
				*/
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
