import mongoose, { Document } from 'mongoose'

// The number of voting groups we have across Polyecho
// This is designed to mainly have one voting group that continually gets updated.
// There could be adverse side effects if there are multiple records in the DB...
export interface IVotingGroup {
	totalGroupCount: number
}

export interface IVotingGroupDoc extends Document, IVotingGroup {}

export const votingGroupSchema = new mongoose.Schema<IVotingGroupDoc>(
	{
		totalGroupCount: {
			type: Number,
			required: true,
			default: 0,
			min: 0,
		},
	},
	{ timestamps: true },
)

export const VotingGroup =
	mongoose.models['voting-group'] || mongoose.model<IVotingGroupDoc>('voting-group', votingGroupSchema)
