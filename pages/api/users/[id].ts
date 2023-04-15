import { withSentry } from '@sentry/nextjs'
import type { NextApiRequest, NextApiResponse } from 'next'

import logger from '../../../lib/logger'
import connectMongo from '../../../lib/mongoClient'
import { deleteEntityById, getEntityById, updateEntityById, UpdateEntityOptions } from '../../../lib/redisClient'
import { UserDoc } from '../../../models'

async function handler(req: NextApiRequest, res: NextApiResponse) {
	const {
		query: { id },
		body,
		method,
	} = req

	// Normalize the ID, which should be an address
	const address = String(id).toLowerCase()

	// Connect to MongoDB
	await connectMongo()

	switch (method) {
		case 'GET':
			try {
				// Get the cached entity or fetch it from MongoDB
				const user: UserDoc | null = await getEntityById('user', address)

				// Return 200
				return res.status(200).json({ success: true, data: user })
			} catch (error) {
				logger.red(error)
				return res.status(400).json({ success: false, error })
			}

		case 'PUT':
			try {
				// Update User in MongoDB and Redis cache
				const { newProject, newStem, addNFT, base64, imageFormat, removeNFT, ...bodyToUpdate } = body
				let options: UpdateEntityOptions = {}
				if (newProject) {
					options = {
						addToSet: {
							projectIds: newProject,
						},
					}
				} else if (newStem) {
					options = {
						addToSet: {
							stemIds: newStem,
						},
					}
				} else if (addNFT) {
					options = {
						addToSet: {
							nftIds: addNFT,
						},
					}
				} else if (base64) {
					options = {
						set: {
							avatar: {
								base64,
								imageFormat,
							},
						},
					}
				} else if (removeNFT) {
					options = {
						pull: {
							nftIds: removeNFT,
						},
					}
				} else {
					options = {
						set: bodyToUpdate,
					}
				}
				const user: UserDoc = await updateEntityById('user', address, options)

				// Return 200
				res.status(200).json({ success: true, data: user })
			} catch (error) {
				logger.red(error)
				res.status(400).json({ success: false, error })
			}

		case 'DELETE':
			try {
				// Delete User from MongoDB and Redis
				const deletedUser: UserDoc = await deleteEntityById('user', address)

				// Return 200
				return res.status(200).json({ success: true, data: deletedUser })
			} catch (error) {
				logger.red(error)
				return res.status(400).json({ success: false, error })
			}

		default:
			res.status(400).json({ success: false, error: `HTTP method '${method}' is not supported` })
			break
	}
}

// Use Sentry as a logging tool when running production environments
export default process.env.NODE_ENV === 'production' ? withSentry(handler) : handler
