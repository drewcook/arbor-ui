import type { NextApiRequest, NextApiResponse } from 'next'
import { IUser, User } from '../../../models/user.model'
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
				const user: IUser | null = await User.findById(id)
				if (!user) {
					return res.status(404).json({ success: false })
				}
				res.status(200).json({ success: true, data: user })
			} catch (error) {
				res.status(400).json({ success: false })
			}
			break

		case 'PUT' /* Edit a model by its ID */:
			try {
				let user
				// TODO: catch for new sample
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
