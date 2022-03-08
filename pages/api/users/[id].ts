import type { NextApiRequest, NextApiResponse } from 'next'
import type { IProjectDoc } from '../../../models/project.model'
import { Project } from '../../../models/project.model'
import type { ISampleDoc } from '../../../models/sample.model'
import { Sample } from '../../../models/sample.model'
import type { IUser, IUserFull } from '../../../models/user.model'
import { User } from '../../../models/user.model'
import dbConnect from '../../../utils/db'

async function handler(req: NextApiRequest, res: NextApiResponse) {
	const {
		query: { id, fullDetails },
		body,
		method,
	} = req

	await dbConnect()

	switch (method) {
		case 'GET' /* Get a model by its ID */:
			try {
				const user: IUser | null = await User.findById(id)
				if (!user) {
					return res.status(404).json({ success: false })
				}

				// Check to get full details or not
				if (fullDetails) {
					const fullUser: IUserFull = {
						...user._doc,
						projects: [],
						samples: [],
					}

					// Get user's projects' details
					for (const projectId of user.projectIds) {
						const project: IProjectDoc | null = await Project.findById(projectId)
						if (project) fullUser.projects.push(project)
						else console.error(`Failed to find user project of ID - ${projectId}`)
					}

					// Get user's samples' details
					for (const sampleId of user.sampleIds) {
						const sample: ISampleDoc | null = await Sample.findById(sampleId)
						if (sample) fullUser.samples.push(sample)
						else console.error(`Failed to find user sample of ID - ${sampleId}`)
					}

					res.status(200).json({ success: true, data: fullUser })
				} else {
					res.status(200).json({ success: true, data: user })
				}
			} catch (error) {
				res.status(400).json({ success: false })
			}
			break

		case 'PUT' /* Edit a model by its ID */:
			try {
				let user
				if (body.newProject) {
					user = await User.findByIdAndUpdate(
						id,
						{
							$push: {
								projectIds: body.newProject,
							},
						},
						{
							new: true,
							runValidators: true,
						},
					)
					// Returns
					if (!user) {
						return res.status(400).json({ success: false, error: 'failed to add project to user' })
					}
					res.status(200).json({ success: true, data: user })
				} else if (body.newSample) {
					user = await User.findByIdAndUpdate(
						id,
						{
							$push: {
								sampleIds: body.newSample,
							},
						},
						{
							new: true,
							runValidators: true,
						},
					)
					// Returns
					if (!user) {
						return res.status(400).json({ success: false, error: 'failed to add sample to user' })
					}
					res.status(200).json({ success: true, data: user })
				} else {
					user = await User.findByIdAndUpdate(id, body, {
						new: true,
						runValidators: true,
					})
					// Returns
					if (!user) {
						return res.status(400).json({ success: false, error: 'failed to update user' })
					}
					res.status(200).json({ success: true, data: user })
				}
			} catch (e) {
				res.status(400).json({ success: false, error: e })
			}
			break

		case 'DELETE' /* Delete a model by its ID */:
			try {
				const deletedUser = await User.deleteOne({ _id: id })
				if (!deletedUser) {
					return res.status(400).json({ success: false, error: 'failed to delete user' })
				}
				res.status(200).json({ success: true, data: deletedUser })
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
