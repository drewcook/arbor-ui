import type { NextApiRequest, NextApiResponse } from 'next'
import { IProject, Project } from '../../../models/project.model'
import dbConnect from '../../../lib/mongodb'

type CreateProjectPayload = {
	name: string,
	description: string,
	createdBy: string,
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
			} catch (error) {
				res.status(400).json({ success: false })
			}
			break
		case 'POST':
			try {
				const payload: CreateProjectPayload = {
					name: req.body.name,
					description: req.body.description,
					createdBy: 'myWalletAddress',
				}
				/* create a new model in the database */
				const project: IProject = await Project.create(payload)
				res.status(201).json({ success: true, data: project })
			} catch (error) {
				res.status(400).json({ success: false })
			}
			break
		default:
			res.status(400).json({ success: false })
			break
	}
}
export default handler
