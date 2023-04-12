import { withSentry } from '@sentry/nextjs'
import type { NextApiRequest, NextApiResponse } from 'next'

import logger from '../../../lib/logger'
import connectMongo from '../../../lib/mongoClient'
import { getEntityById } from '../../../lib/redisClient'
import { User, UserDoc } from '../../../models'

async function handler(req: NextApiRequest, res: NextApiResponse) {
	const {
		query: { id },
		body,
		method,
	} = req

	// Connect to MongoDB
	await connectMongo()

	switch (method) {
		case 'GET':
			try {
				// Get the cached entity or fetch it from MongoDB
				const user: UserDoc | null = await getEntityById('user', id)

				// Return 200
				return res.status(200).json({ success: true, data: user })
			} catch (error) {
				logger.red(error)
				return res.status(400).json({ success: false, error })
			}

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
				logger.red(e)
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
				logger.red(e)
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
