import type { NextApiRequest, NextApiResponse } from 'next'
import { IProject, Project } from '../../../models/project.model'

export default async function handler(
	req: NextApiRequest,
	res: NextApiResponse<IProject | string | null>,
) {
	const { id } = req.query
	const projectId = typeof id === 'string' ? id : id[0]

	let project: IProject | string | null

	try {
		project = await Project.findById(projectId)
		console.log({ project })
		if (!project) return res.status(404).send(`Project of id '${projectId}' not found`)
		return res.status(200).json(project)
	} catch (e) {
		console.error(e)
		return res.status(500).send('failed to find the project')
	}
}
