import { withSentry } from '@sentry/nextjs'
import type { NextApiRequest, NextApiResponse } from 'next'

import logger from '../../../lib/logger'
import connectMongo from '../../../lib/mongoClient'
import { getAllEntitiesOfType } from '../../../lib/redisClient'
import { User, UserDoc } from '../../../models'

type Avatar = {
	base64: string
	imageFormat: string
}

export type CreateUserPayload = {
	address: string
	displayName: string
	avatar: Avatar
	projectIds: string[]
	stemIds: string[]
	nftIds: string[]
}

async function handler(req: NextApiRequest, res: NextApiResponse) {
	const { method } = req
	await connectMongo()

	switch (method) {
		case 'GET':
			try {
				const users = await getAllEntitiesOfType('user')
				return res.status(200).json({ success: true, data: users })
			} catch (error) {
				logger.red(error)
				return res.status(400).json({ success: false, error })
			}
		case 'POST':
			try {
				const accountAddress = req.body.address.toLowerCase()
				// Genearate a Robohash.org avatar - https://robohash.org
				const baseURL = 'https://robohash.org/'
				let avatarUrl = baseURL
				avatarUrl += accountAddress // Use unique hash based off address
				avatarUrl += '?set=set1' // Use Robots type
				avatarUrl += '&bgset=bg1' // Add random background
				avatarUrl += '&size=300x300' // Make 300x300 size
				const payload: CreateUserPayload = {
					address: accountAddress,
					displayName: accountAddress,
					avatar: { base64: avatarUrl, imageFormat: 'image/webp' },
					projectIds: [],
					stemIds: [],
					nftIds: [],
				}

				/* create a new model in the database */
				const user: UserDoc = await User.create(payload)

				res.status(201).json({ success: true, data: user })
			} catch (e) {
				logger.red(e)
				res.status(400).json({ success: false, error: e })
			}
			break
		default:
			res.status(400).json({ success: false, error: `HTTP method '${method}' not supported` })
			break
	}
}

// Use Sentry as a logging tool when running production environments
export default process.env.NODE_ENV === 'production' ? withSentry(handler) : handler
