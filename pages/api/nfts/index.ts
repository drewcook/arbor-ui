import { withSentry } from '@sentry/nextjs'
import type { NextApiRequest, NextApiResponse } from 'next'

import { update } from '../../../lib/http'
import logger from '../../../lib/logger'
import connectMongo from '../../../lib/mongoClient'
import { createEntity, getAllEntitiesOfType } from '../../../lib/redisClient'
import { Nft, NftDoc } from '../../../models'

async function handler(req: NextApiRequest, res: NextApiResponse) {
	const { method, body } = req

	// Connect to MongoDB
	await connectMongo()

	switch (method) {
		case 'GET':
			try {
				const nfts: NftDoc[] = await getAllEntitiesOfType('nft')
				return res.status(200).json({ success: true, data: nfts })
			} catch (error) {
				logger.red(error)
				return res.status(400).json({ success: false, error })
			}

		case 'POST':
			try {
				// Create the new NFT record in MongoDB
				const payload = {
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
				const nftCreated: NftDoc = await createEntity('nft', payload)

				// Add the new NFT reference to list of User NFTs field
				const userUpdated = await update(`/users/${body.createdBy}`, { addNFT: nftCreated._id })
				if (!userUpdated) {
					logger.red('Failed to update user')
					await Nft.findByIdAndDelete(nftCreated.id) // Delete the NFT record if user update fails
					return res.status(400).json({ success: false, error: "Failed to update user's NFTs" })
				}

				// TODO: Add the new NFT reference to list of the Project's NFTs that have been minted for given projectId
				// Note - this doesn't exist yet, but a project record could have a 'mintedNfts' of ObjectId[]

				// Return 201 with new project data
				return res.status(201).json({ success: true, data: nftCreated })
			} catch (error) {
				logger.red(error)
				return res.status(400).json({ success: false, error })
			}
		default:
			res.status(400).json({ success: false, error: `HTTP method '${method}' not supported` })
			break
	}
}

// Use Sentry as a logging tool when running production environments
export default process.env.NODE_ENV === 'production' ? withSentry(handler) : handler
