import { withSentry } from '@sentry/nextjs'
import type { NextApiRequest, NextApiResponse } from 'next'

import dbConnect from '../../../lib/dbConnect'
import type { IUser } from '../../../models/user.model'
import { User } from '../../../models/user.model'

async function handler(req: NextApiRequest, res: NextApiResponse) {
	const {
		query: { id },
		body,
		method,
	} = req

	await dbConnect()

	switch (method) {
		case 'GET':
			try {
				// We will always be getting users by their address, not their MongoDB _id.
				const user: IUser | null = await User.findOne({ address: id })

				if (!user) {
					return res.status(404).json({ success: false })
				}

				res.status(200).json({ success: true, data: user })
			} catch (error) {
				console.error(error)
				res.status(400).json({ success: false })
			}
			break

		case 'PUT':
			try {
				let user
				if (body.newProject) {
					// Update the Projects list
					user = await User.findOneAndUpdate(
						{ address: id },
						{
							$addToSet: {
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
				} else if (body.newStem) {
					// Update the stems list for the user, add to it if doesn't exist
					user = await User.findOneAndUpdate(
						{ address: id },
						{
							$addToSet: {
								stemIds: body.newStem,
							},
						},
						{
							new: true,
							runValidators: true,
						},
					)
					// Returns
					if (!user) {
						return res.status(400).json({ success: false, error: 'failed to add stem to user' })
					}
					res.status(200).json({ success: true, data: user })
				} else if (body.addNFT) {
					// Update the NFTs list
					user = await User.findOneAndUpdate(
						{ address: id },
						{
							$addToSet: {
								nftIds: body.addNFT,
							},
						},
						{
							new: true,
							runValidators: true,
						},
					)
					// Returns
					if (!user) {
						return res.status(400).json({ success: false, error: 'failed to add NFT to user' })
					}
					res.status(200).json({ success: true, data: user })
				} else if (body.base64) {
					// Update the db
					user = await User.findOneAndUpdate(
						{ address: id },
						{
							$set: {
								avatar: {
									base64: body.base64,
									imageFormat: body.imageFormat,
								},
							},
						},
						{
							new: true,
							runValidators: true,
						},
					)
					// Returns
					if (!user) {
						return res.status(400).json({ success: false, error: 'failed to add NFT to user' })
					}
					res.status(200).json({ success: true, data: user })
				} else if (body.removeNFT) {
					// Update the NFTs list
					user = await User.findOneAndUpdate(
						{ address: id },
						{
							$pull: {
								nftIds: body.removeNFT,
							},
						},
						{
							new: true,
							runValidators: true,
						},
					)
					// Returns
					if (!user) {
						return res.status(400).json({ success: false, error: 'failed to add NFT to user' })
					}
					res.status(200).json({ success: true, data: user })
				} else {
					user = await User.findOneAndUpdate({ address: id }, body, {
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

		case 'DELETE':
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

// Use Sentry as a logging tool when running production environments
export default process.env.NODE_ENV === 'production' ? withSentry(handler) : handler
