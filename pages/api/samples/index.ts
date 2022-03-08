import type { NextApiRequest, NextApiResponse } from 'next'
import type { ISampleDoc } from '../../../models/sample.model'
import { Sample } from '../../../models/sample.model'
import dbConnect from '../../../utils/db'
import { update } from '../../../utils/http'

async function handler(req: NextApiRequest, res: NextApiResponse) {
	const { body, method } = req
	await dbConnect()

	switch (method) {
		case 'GET':
			try {
				/* find all the data in our database */
				const samples: ISampleDoc[] = await Sample.find({})
				res.status(200).json({ success: true, data: samples })
			} catch (e) {
				res.status(400).json({ success: false, error: e })
			}
			break
		case 'POST':
			try {
				/* create a new model in the database */
				const sample: ISampleDoc = await Sample.create(body)

				// Add new project to creator's user details
				const userUpdated = await update(`/users/${body.createdBy}`, { newSample: sample._id })
				if (!userUpdated) {
					return res.status(400).json({ success: false, error: "Failed to update user's samples" })
				}

				res.status(201).json({ success: true, data: sample })
			} catch (e) {
				res.status(400).json({ success: false, error: e })
			}
			break
		default:
			res.status(400).json({ success: false, error: `HTTP method '${method}' not supported` })
			break
	}
}

export default handler
