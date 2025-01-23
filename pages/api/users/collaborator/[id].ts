import type { NextApiRequest, NextApiResponse } from 'next'

import connectMongo from '../../../../lib/mongoClient'
import { IProject, Project } from '../../../../models/project.model'

async function handler(req: NextApiRequest, res: NextApiResponse) {
	const {
		query: { id },
		method,
	} = req

	// Connect to MongoDB
	await connectMongo()

	switch (method) {
		case 'GET' /* Get a model by its ID */:
			try {
				let projects: IProject[] | null = await Project.find({ collaborators: id })
				if (!projects) {
					return res.status(404).json({ success: false })
				}
				// Filter out any projects where the user is also the creator on
				projects = projects.filter(p => p.createdBy !== id)
				res.status(200).json({ success: true, data: projects })
			} catch (error) {
				res.status(400).json({ success: false })
			}
			break

		default:
			res.status(400).json({ success: false, error: `HTTP method '${method}' is not supported` })
			break
	}
}

export default handler
