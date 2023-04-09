import { withSentry } from '@sentry/nextjs'
import type { NextApiRequest, NextApiResponse } from 'next'

import { update } from '../../../lib/http'
import connectMongo from '../../../lib/mongoClient'
import { INftDoc, Nft } from '../../../models/nft.model'

async function handler(req: NextApiRequest, res: NextApiResponse) {
	const {
		query: { id },
		method,
		body,
	} = req

	await connectMongo()

	switch (method) {
		case 'GET':
			try {
				const nft: INftDoc | null = await Nft.findById(id)
				if (!nft) return res.status(404).json({ success: false })
				res.status(200).json({ success: true, data: nft })
			} catch (error) {
				res.status(400).json({ success: false, error: 'Failed to get the NFT' })
			}
			break

		case 'PUT':
			try {
				const nft: INftDoc | null = await Nft.findByIdAndUpdate(
					id,
					{
						$set: {
							isListed: body.isListed,
							listPrice: body.listPrice,
							owner: body.owner,
						},
					},
					{
						new: true,
						runValidators: true,
					},
				)

				// Catch error
				if (!nft) {
					return res.status(400).json({ success: false, error: 'failed to update the NFT' })
				}

				// If changing ownership...
				if (body.buyer && body.seller) {
					// Add the NFT reference to list of buyer's NFT IDs
					let userUpdated = await update(`/users/${body.buyer}`, { addNFT: id })
					if (!userUpdated) return res.status(400).json({ success: false, error: "Failed to add to user's NFTs" })

					// Remove the NFT reference from list of seller's NFT IDs
					userUpdated = await update(`/users/${body.seller}`, { removeNFT: id })
					if (!userUpdated) return res.status(400).json({ success: false, error: "Failed to remove from user's NFTs" })
				}

				res.status(200).json({ success: true, data: nft })
			} catch (error) {
				res.status(400).json({ success: false, error: '' })
			}
			break

		default:
			res.status(400).json({ success: false, error: `HTTP method '${method}' is not supported` })
			break
	}
}

// Use Sentry as a logging tool when running production environments
export default process.env.NODE_ENV === 'production' ? withSentry(handler) : handler
