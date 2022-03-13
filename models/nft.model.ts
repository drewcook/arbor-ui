import mongoose from 'mongoose'
import type { ISampleDoc } from './sample.model'
import { sampleSchema } from './sample.model'

// TODO: create token model
type Token = any

export interface INft {
	createdBy: string
	token: Token
	metadataUrl: string
	name: string
	projectId: string
	collaborators: string[]
	samples: ISampleDoc[]
}

export interface INftDoc extends Document, INft {}

const nftSchema = new mongoose.Schema<INftDoc>(
	{
		token: {
			type: Object,
			required: true,
		},
		metadataUrl: {
			type: String,
			required: true,
		},
		name: {
			type: String,
			required: true,
		},
		projectId: {
			type: String,
			required: true,
		},
		collaborators: {
			type: [String],
			required: true,
		},
		samples: {
			type: [sampleSchema],
			required: true,
		},
		createdBy: {
			type: String,
			required: true,
		},
	},
	{ timestamps: true },
)

export const Nft = mongoose.models.nft || mongoose.model<INftDoc>('nft', nftSchema)
