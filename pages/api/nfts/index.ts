import { withSentry } from '@sentry/nextjs'
import type { NextApiRequest, NextApiResponse } from 'next'

import dbConnect from '../../../lib/connectMongo'
import { update } from '../../../lib/http'
import redisClient from '../../../lib/redisClient'
import { INft, INftDoc, Nft } from '../../../models/nft.model'

async function handler(req: NextApiRequest, res: NextApiResponse) {
	const { method, body } = req
	await dbConnect()

	switch (method) {
		case 'GET':
			try {
				/* find all the data in our database */
				const nfts: INftDoc[] = await Nft.find({})
				res.status(200).json({ success: true, data: nfts })
			} catch (e) {
				res.status(400).json({ success: false, error: e })
			}
			break
		case 'POST':
			try {
				// Construct payload
				const {
					createdBy,
					owner,
					isListed,
					listPrice,
					token,
					metadataUrl,
					audioHref,
					name,
					projectId,
					collaborators,
					stems,
				} = body
				const payload: INft = {
					createdBy,
					owner,
					isListed,
					listPrice,
					token,
					metadataUrl,
					audioHref,
					name,
					projectId,
					collaborators,
					stems,
				}

				/* create a new model in the database */
				const nftCreated: any = await Nft.create(payload)
				if (!nftCreated) throw new Error('Failed to create the NFT')

				// Add the new NFT reference to list of User NFTs field
				const userUpdated = await update(`/users/${createdBy}`, { addNFT: nftCreated._id })
				if (!userUpdated.success) return res.status(400).json({ success: false, error: "Failed to update user's NFTs" })

				// TODO: Add the new NFT reference to list of the Project's NFTs that have been minted for given projectId
				// Note - this doesn't exist yet, but a project record could have a 'mintedNfts' of ObjectId[]

				// Add audio href to redis for the NFT
				redisClient.set(String(nftCreated._id), audioHref)
				redisClient.quit()
				res.status(201).json({ success: true, data: nftCreated })
			} catch (e: any) {
				res.status(400).json({ success: false, error: e.message })
			}
			break
		default:
			res.status(400).json({ success: false, error: `HTTP method '${method}' not supported` })
			break
	}

	console.log('LAST BIT HIT HERE')
}

// Use Sentry as a logging tool when running production environments
export default process.env.NODE_ENV === 'production' ? withSentry(handler) : handler
