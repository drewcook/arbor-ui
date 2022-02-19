import type { NextApiRequest, NextApiResponse } from 'next'
import { IProject, Project } from '../../../models/project.model'
import { ISample } from '../../../models/sample.model'
import dbConnect from '../../../utils/db'

type CreateProjectPayload = {
	createdBy: string,
	name: string,
	description: string,
	tags: string[],
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
				const payload: CreateProjectPayload = {
					createdBy: req.body.createdBy,
					name: req.body.name,
					description: req.body.description,
					tags: req.body.tags,
				}
				/* create a new model in the database */
				const project: IProject = await Project.create(payload)
				res.status(201).json({ success: true, data: project })
			} catch (e) {
				res.status(400).json({ success: false, error: e })
			}
			break
		default:
			res.status(400).json({ success: false, error: `HTTP method '${method}' not supported` })
			break
	}
}
export default handler
