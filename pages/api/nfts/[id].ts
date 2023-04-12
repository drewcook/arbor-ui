import { withSentry } from '@sentry/nextjs'
import type { NextApiRequest, NextApiResponse } from 'next'

import { update } from '../../../lib/http'
import logger from '../../../lib/logger'
import connectMongo from '../../../lib/mongoClient'
import { getEntityById, updateEntityById } from '../../../lib/redisClient'
import { NftDoc } from '../../../models'

/**
 * Updates the ownership of an NFT by adding the NFT to the buyer's list of NFTs and removing it from the seller's list of NFTs.
 *
 * @param {string} buyer - The ID of the buyer who will receive the NFT.
 * @param {string} seller - The ID of the seller who is giving up the NFT.
 * @param {string} nftId - The ID of the NFT to transfer ownership of.
 * @returns {Promise<boolean>} - A Promise that resolves to true if the ownership transfer was successful, and false otherwise.
 */
const updateNftOwnership = async (buyer: string, seller: string, nftId: string): Promise<boolean> => {
	try {
		// Add the NFT reference to list of buyer's NFT IDs
		await update(`/users/${buyer}`, { addNFT: nftId })

		// Remove the NFT reference from list of seller's NFT IDs
		await update(`/users/${seller}`, { removeNFT: nftId })

		return true
	} catch (error) {
		logger.red(error)
		return false
	}
}

async function handler(req: NextApiRequest, res: NextApiResponse) {
	const {
		query: { id },
		method,
		body,
	} = req

	// Connect to MongoDB
	await connectMongo()

	switch (method) {
		case 'GET':
			try {
				// Get the cached entity or fetch it from MongoDB
				const nft: NftDoc | null = await getEntityById('nft', id)

				// Return 200
				return res.status(200).json({ success: true, data: nft })
			} catch (error) {
				logger.red(error)
				return res.status(400).json({ success: false, error })
			}

		case 'PUT':
			try {
				// Update NFT in MongoDB and Redis cache
				const updates = { isListed: body.isListed, listPrice: body.listPrice, owner: body.owner }
				const nft: NftDoc | null = await updateEntityById('nft', id, updates)

				// If changing ownership, update user entities
				if (body.buyer && body.seller) {
					const ownershipUpdated = await updateNftOwnership(body.buyer, body.seller, String(id))
					if (!ownershipUpdated) {
						return res.status(400).json({ success: false, error: 'Failed to update NFT ownership' })
					}
				}

				// Return 200
				return res.status(200).json({ success: true, data: nft })
			} catch (error) {
				logger.red(error)
				return res.status(400).json({ success: false, error })
			}

		default:
			return res.status(400).json({ success: false, error: `HTTP method '${method}' is not supported` })
	}
}

// Use Sentry as a logging tool when running production environments
export default process.env.NODE_ENV === 'production' ? withSentry(handler) : handler
