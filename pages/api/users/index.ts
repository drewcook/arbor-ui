import type { NextApiRequest, NextApiResponse } from 'next'

import logger from '../../../lib/logger'
import connectMongo from '../../../lib/mongoClient'
import { createEntity, getAllEntitiesOfType } from '../../../lib/redisClient'
import { UserDoc } from '../../../models'

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

	// Connect to MongoDB
	await connectMongo()

	switch (method) {
		case 'GET':
			try {
				const users: UserDoc[] = await getAllEntitiesOfType('user')
				return res.status(200).json({ success: true, data: users })
			} catch (error) {
				logger.red(error)
				return res.status(400).json({ success: false, error })
			}

		case 'POST':
			try {
				const accountAddress: string = req.body.address.toLowerCase()
				// Genearate a Robohash.org avatar - https://robohash.org
				const baseURL = 'https://robohash.org/'
				let avatarUrl = baseURL
				avatarUrl += accountAddress // Use unique hash based off address
				avatarUrl += '?set=set1' // Use Robots type
				avatarUrl += '&bgset=bg1' // Add random background
				avatarUrl += '&size=300x300' // Make 300x300 size

				// Create a new User entity
				const payload: CreateUserPayload = {
					address: accountAddress,
					displayName: accountAddress,
					avatar: { base64: avatarUrl, imageFormat: 'image/webp' },
					projectIds: [],
					stemIds: [],
					nftIds: [],
				}
				const user: UserDoc = await createEntity('user', payload)
				// Return a 201 with the User data
				return res.status(201).json({ success: true, data: user })
			} catch (error) {
				logger.red(error)
				return res.status(400).json({ success: false, error })
			}

		default:
			res.status(400).json({ success: false, error: `HTTP method '${method}' not supported` })
			break
	}
}

export default handler
