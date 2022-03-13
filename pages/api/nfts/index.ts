import type { NextApiRequest, NextApiResponse } from 'next'
import { INft, INftDoc, Nft } from '../../../models/nft.model'
import dbConnect from '../../../utils/db'

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
				const { token, metadataUrl, name, projectId, collaborators, samples } = body
				const payload: INft = {
					token,
					metadataUrl,
					name,
					projectId,
					collaborators,
					samples,
				}

				/* create a new model in the database */
				const nftCreated: INftDoc = await Nft.create(payload)
				console.log({ nftCreated })

				// TODO: Add the new NFT reference to list of User NFTs field
				// const userUpdated = await update(`/users/${token.from}`, {
				// 	newNFT: {
				// 		token: tokenURI,
				// 		name: details.name,
				// 		metadataUrl: nftsRes.url,
				// 		projectId,
				// 		collaborators: details.collaborators,
				// 		samples: details.samples.map((s: any) => ({
				// 			sampleId: s._id,
				// 			metadataUrl: s.metadataUrl,
				// 			audioUrl: s.audioUrl,
				// 			audioHref: s.audioHref,
				// 		})),
				// 	},
				// })

				res.status(201).json({ success: true, data: nftCreated })
			} catch (e: any) {
				res.status(400).json({ success: false, error: e.message })
			}
			break
		default:
			res.status(400).json({ success: false, error: `HTTP method '${method}' not supported` })
			break
	}
}

export default handler
