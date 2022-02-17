import type { NextApiRequest, NextApiResponse } from 'next'
import { IProject, IProjectDoc, Project } from '../../../models/project.model'

export type CreateProjectPayload = {
	id: string,
	name: string,
}

export default async function handler(req: NextApiRequest, res: NextApiResponse) {
	let newProject: IProject

	try {
		newProject = await Project.create({
			...req.body,
			createdBy: 'myWalletAddress' /*req.user._id*/,
		})
		if (newProject) return res.status(404).send({ data: 'Not found' })
	} catch (e) {
		console.error(e)
		return res.status(500).send({ error: e })
	}

	return res.status(201).json({ data: newProject })
}
