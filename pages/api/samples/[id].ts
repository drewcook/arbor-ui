import type { NextApiRequest, NextApiResponse } from 'next'
import { ISampleDoc, Sample } from '../../../models/sample.model'
import dbConnect from '../../../utils/db'

async function handler(req: NextApiRequest, res: NextApiResponse) {
	const {
		query: { id },
		body,
		method,
	} = req

	await dbConnect()

	switch (method) {
		case 'GET' /* Get a model by its ID */:
			try {
				const sample: ISampleDoc | null = await Sample.findById(id)
				if (!sample) {
					return res.status(400).json({ success: false })
				}
				res.status(200).json({ success: true, data: sample })
			} catch (error) {
				res.status(400).json({ success: false })
			}
			break

		case 'PUT' /* Edit a model by its ID */:
			try {
				// Update anything passed through,
				const sample: ISampleDoc | null = await Sample.findByIdAndUpdate(id, body, {
					new: true,
					runValidators: true,
				})

				// Catch error
				if (!sample) {
					return res.status(400).json({ success: false, error: 'failed to update sample' })
				}

				res.status(200).json({ success: true, data: sample })
			} catch (e) {
				res.status(400).json({ success: false, error: e })
			}
			break

		case 'DELETE' /* Delete a model by its ID */:
			try {
				const deletedSample = await Sample.deleteOne({ _id: id })
				if (!deletedSample) {
					return res.status(400).json({ success: false, error: 'failed to delete sample' })
				}

				// TODO: Delete from user's samples

				res.status(200).json({ success: true, data: deletedSample })
			} catch (e) {
				res.status(400).json({ success: false, error: e })
			}
			break

		default:
			res.status(400).json({ success: false, error: `HTTP method '${method}' is not supported` })
			break
	}
}

export default handler
