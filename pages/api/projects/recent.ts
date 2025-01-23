import type { NextApiRequest, NextApiResponse } from 'next'

import connectMongo from '../../../lib/mongoClient'
import { Project, ProjectDoc } from '../../../models'

async function handler(req: NextApiRequest, res: NextApiResponse) {
	const { method } = req
	await connectMongo()

	switch (method) {
		case 'GET':
			try {
				/* find the 3 most recently updated projects in our database */
				const projects: ProjectDoc[] = await Project.find().sort({ updatedAt: 'desc' }).limit(3).exec()
				res.status(200).json({ success: true, data: projects })
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
