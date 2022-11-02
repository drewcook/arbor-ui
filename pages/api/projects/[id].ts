import type { NextApiRequest, NextApiResponse } from 'next'

import { IProjectDoc, Project } from '../../../models/project.model'
import dbConnect from '../../../utils/db'

async function handler(req: NextApiRequest, res: NextApiResponse) {
	const {
		query: { id },
		body,
		method,
	} = req

	await dbConnect()

	switch (method) {
		case 'GET' /* Get a model by its ID */:
			try {
				const project: IProjectDoc | null = await Project.findById(id)
				if (!project) {
					return res.status(400).json({ success: false })
				}
				res.status(200).json({ success: true, data: project })
			} catch (error) {
				res.status(400).json({ success: false })
			}
			break

		case 'PUT' /* Edit a model by its ID */:
			try {
				// Update stems
				let project: IProjectDoc | null
				if (body.approvedStem) {
					project = await Project.findByIdAndUpdate(
						id,
						{
							$set: {
								// Update the collaborators
								collaborators: body.collaborators,
							},
							$push: {
								// Add the stem to the queue with 0 votes
								queue: body.approvedStem,
							},
						},
						{
							new: true,
							runValidators: true,
						},
					)
				} else if (body.queuedStem) {
					project = await Project.findByIdAndUpdate(
						id,
						{
							$push: {
								// Add the stem to the queue with 0 votes
								queue: {
									stem: body.queuedStem,
									votes: 0,
								},
							},
						},
						{
							new: true,
							runValidators: true,
						},
					)

					// Catch error
					if (!project) {
						return res.status(400).json({ success: false, error: 'failed to add stems or collaborators to project' })
					}

					res.status(200).json({ success: true, data: project })
				} else {
					// Update anything else,
					project = await Project.findByIdAndUpdate(id, body, {
						new: true,
						runValidators: true,
					})

					// Catch error
					if (!project) {
						return res.status(400).json({ success: false, error: 'failed to update project' })
					}

					res.status(200).json({ success: true, data: project })
				}
			} catch (e) {
				res.status(400).json({ success: false, error: e })
			}
			break

		case 'DELETE' /* Delete a model by its ID */:
			try {
				const deletedProject = await Project.deleteOne({ _id: id })
				if (!deletedProject) {
					return res.status(400).json({ success: false, error: 'failed to delete project' })
				}

				// TODO: Delete from user's projects

				res.status(200).json({ success: true, data: deletedProject })
			} catch (e) {
				res.status(400).json({ success: false, error: e })
			}
			break

		default:
			res.status(400).json({ success: false, error: `HTTP method '${method}' is not supported` })
			break
	}
}

export default handler
