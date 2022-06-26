import type { NextApiRequest, NextApiResponse } from 'next'
import { stemQueueContract } from '../../../constants/contracts'
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
				// Create DB entry
				const payload: CreateProjectPayload = {
					createdBy: req.body.createdBy,
					collaborators: req.body.collaborators,
					name: req.body.name,
					description: req.body.description,
					bpm: req.body.bpm,
					trackLimit: req.body.trackLimit,
					tags: req.body.tags,
				}
				// TODO: Do not save any of these records just yet... wait until after we create the Semaphore group successfully, so we don't end up with bad data across multiple collections
				const project: IProjectDoc = await Project.create(payload)

				// Add new project to creator's user details
				const userUpdated = await update(`/users/${req.body.createdBy}`, { newProject: project._id })
				if (!userUpdated) {
					return res.status(400).json({ success: false, error: "Failed to update user's projects" })
				}

				/*
					Increment the global voting group counter, and use this as the ID for the new Semaphore group
					- Call PUT /api/voting-groups to increment the value
					- Get the returned data, inspect the new totalGroupCount value
					- Use this as the new groupId for the on-chain group
				*/
				const votingGroupRes = await update('/voting-groups')
				if (!votingGroupRes || !votingGroupRes.success) {
					return res.status(400).json({ success: false, error: 'Failed to increment voting group count' })
				}

				/*
					Create new Semaphore group for given project
					- Create new group with project creator as group admin
					- Do not add in the project creator as a voting member (yet)
					- Future users will register to vote, which will add them in as group members
				*/
				// Get contract address, create instance
				const groupId = BigInt(votingGroupRes.data.totalGroupCount)
				const contractRes = await stemQueueContract.createProjectGroup(groupId, 20, BigInt(0), req.body.createdBy)
				if (!contractRes) {
					return res
						.status(400)
						.json({ success: false, error: 'Failed to create on-chain Semaphore group for given project' })
				}
				// console.info(contractRes)

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
