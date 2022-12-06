import type { NextApiRequest, NextApiResponse } from 'next'

import { IProject, Project } from '../../../../models/project.model'
import dbConnect from '../../../../utils/db'

async function handler(req: NextApiRequest, res: NextApiResponse) {
	const {
		query: { id },
		method,
	} = req

	await dbConnect()

	switch (method) {
		case 'GET' /* Get a model by its ID */:
			try {
				const projects: IProject[] | null = await Project.find({ collaborators: id })
				if (!projects) {
					return res.status(400).json({ success: false })
				}
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
