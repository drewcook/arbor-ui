import { withSentry } from '@sentry/nextjs'
import type { NextApiRequest, NextApiResponse } from 'next'

import { update } from '../../../lib/http'
import logger from '../../../lib/logger'
import connectMongo from '../../../lib/mongoClient'
import redisClient, { allNftsKey, connectRedis, DEFAULT_EXPIRY, disconnectRedis } from '../../../lib/redisClient'
import { INft, INftDoc, Nft } from '../../../models/nft.model'

type CreateNftPayload = INft

async function handler(req: NextApiRequest, res: NextApiResponse) {
	const { method, body } = req
	await connectMongo()

	switch (method) {
		case 'GET':
			try {
				let nfts: INftDoc[]
				// Connect to Redis
				await connectRedis()
				// Check if Redis has the desired data
				const redisData = await redisClient.hGetAll(allNftsKey)
				if (Object.keys(redisData).length) {
					// Redis data exists, parse and return it
					logger.magenta('Redis hit')
					nfts = Object.values(redisData).map((nftString: string) => JSON.parse(nftString))
				} else {
					// Redis data does not exist, fetch from MongoDB and cache it in Redis
					logger.magenta('Redis miss')
					nfts = await Nft.find({})
					const multi = redisClient.multi()
					nfts.forEach(nft => {
						const nftKey = String(nft.id)
						multi.hSet(allNftsKey, nftKey, JSON.stringify(nft))
						multi.expire(nftKey, DEFAULT_EXPIRY)
					})
					await multi.exec()
				}
				// Return 200
				return res.status(200).json({ success: true, data: nfts })
			} catch (e) {
				logger.red(e)
				// Return 400
				res.status(400).json({ success: false, error: e })
			} finally {
				// Close Redis connection
				await disconnectRedis()
			}
			break
		case 'POST':
			try {
				// Create the new NFT record in MongoDB
				const payload: CreateNftPayload = {
					createdBy: body.createdBy,
					owner: body.owner,
					isListed: body.isListed,
					listPrice: body.listPrice,
					token: body.token,
					metadataUrl: body.metadataUrl,
					audioHref: body.audioHref,
					name: body.name,
					projectId: body.projectId,
					collaborators: body.collaborators,
					stems: body.stems,
				}
				const nftCreated: INftDoc = await Nft.create(payload)
				if (!nftCreated) throw new Error('Failed to create the NFT')
				// Write NFT to Redis hash
				await connectRedis()
				const nftKey = String(nftCreated.id)
				if (await redisClient.exists(allNftsKey)) {
					// Redis key exists, add new Nft to hash and set expiry
					logger.magenta('Redis hit')
					await redisClient.hSet(allNftsKey, nftKey, JSON.stringify(nftCreated))
					await redisClient.expire(nftKey, DEFAULT_EXPIRY)
				} else {
					// Redis key does not exist (expired), create hash and add new Nft with expiry
					logger.magenta('Redis miss')
					const multi = redisClient.multi()
					multi.hSet(allNftsKey, nftKey, JSON.stringify(nftCreated))
					multi.expire(nftKey, DEFAULT_EXPIRY)
					await multi.exec()
				}
				// Add the new NFT reference to list of User NFTs field
				const userUpdated = await update(`/users/${body.createdBy}`, { addNFT: nftCreated._id })
				if (!userUpdated.success) return res.status(400).json({ success: false, error: "Failed to update user's NFTs" })

				// TODO: Add the new NFT reference to list of the Project's NFTs that have been minted for given projectId
				// Note - this doesn't exist yet, but a project record could have a 'mintedNfts' of ObjectId[]

				// Return 201 with new project data
				return res.status(201).json({ success: true, data: nftCreated })
			} catch (e) {
				logger.red(e)
				// Return 400
				res.status(400).json({ success: false, error: e })
			} finally {
				// Close Redis connection
				await disconnectRedis()
			}
			break
		default:
			res.status(400).json({ success: false, error: `HTTP method '${method}' not supported` })
			break
	}
}

// Use Sentry as a logging tool when running production environments
export default process.env.NODE_ENV === 'production' ? withSentry(handler) : handler
