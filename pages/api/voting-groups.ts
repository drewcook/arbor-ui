import { withSentry } from '@sentry/nextjs'
import type { NextApiRequest, NextApiResponse } from 'next'

import dbConnect from '../../lib/mongoClient'
import type { IVotingGroupDoc } from '../../models/votingGroup.model'
import { VotingGroup } from '../../models/votingGroup.model'

async function handler(req: NextApiRequest, res: NextApiResponse) {
	const { method } = req
	await dbConnect()

	switch (method) {
		case 'GET':
			try {
				// We get only the first records, since this collection is designed to have only one.
				// This first record is seen as the source of truth for the platform, and holds a counter.
				const votingGroups: IVotingGroupDoc[] = await VotingGroup.find({})
				if (votingGroups.length === 0) {
					res.status(200).json({ success: true, data: [] })
				} else {
					res.status(200).json({ success: true, data: votingGroups[0] })
				}
			} catch (e) {
				res.status(400).json({ success: false, error: e })
			}
			break

		case 'POST':
			try {
				// This is designed to only create one record and nothing more.
				const votingGroups: IVotingGroupDoc[] = await VotingGroup.find({})
				if (votingGroups.length > 0) {
					throw new Error('There can only be one voting group record in the collection')
				}
				// Create the new record with zero total groups
				const votingGroup: IVotingGroupDoc = await VotingGroup.create({ totalGroupCount: 0 })
				res.status(201).json({ success: true, data: votingGroup })
			} catch (e: any) {
				res.status(400).json({ success: false, error: e.message })
			}
			break

		case 'PUT':
			try {
				const votingGroups: IVotingGroupDoc[] = await VotingGroup.find({})
				if (votingGroups.length === 0) {
					throw new Error('The singular voting group does not exist yet')
				}

				// Increment the group count for the singular record
				const updated = await VotingGroup.findOneAndUpdate(
					{
						id: votingGroups[0]._id,
					},
					{
						$inc: { totalGroupCount: 1 },
					},
					{
						new: true,
						runValidators: true,
					},
				)

				// Catch error
				if (!updated) {
					throw new Error('Failed to increment the totalGroupCount for the VotingGroup')
				}
				res.status(200).json({ success: true, data: updated })
			} catch (e: any) {
				res.status(400).json({ success: false, error: e.message })
			}
			break

		default:
			res.status(400).json({ success: false, error: `HTTP method '${method}' not supported` })
			break
	}
}

// Use Sentry as a logging tool when running production environments
export default process.env.NODE_ENV === 'production' ? withSentry(handler) : handler
