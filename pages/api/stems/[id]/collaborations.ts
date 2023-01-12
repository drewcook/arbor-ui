import { withSentry } from '@sentry/nextjs'
import type { NextApiRequest, NextApiResponse } from 'next'

import { IProjectDoc, Project } from '../../../../models/project.model'
import dbConnect from '../../../../utils/db'

async function handler(req: NextApiRequest, res: NextApiResponse) {
	const {
		method,
		query: { id },
	} = req
	await dbConnect()

	switch (method) {
		case 'GET':
			try {
				const projects: IProjectDoc[] = await Project.find({ 'stems._id': id }).populate('stems')
				res.status(200).json({ success: true, data: projects })
			} catch (error) {
				res.status(400).json({ success: false, error: error.message })
			}
			break
		default:
			res.status(400).json({ success: false, error: `HTTP method '${method}' not supported` })
			break
	}
}

// Use Sentry as a logging tool when running production environments
export default process.env.NODE_ENV === 'production' ? withSentry(handler) : handler
