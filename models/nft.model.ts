import mongoose from 'mongoose'

// Some interplay with ISample
export interface INftSample {
	sampleId: string // ObjectId
	metadataUrl: string
	audioUrl: string
	audioHref: string
}

// TODO: create token model
type Token = any

export interface INft {
	token: Token
	metadataUrl: string
	name: string
	projectId: string
	collaborators: string[]
	samples: INftSample[]
}

export interface INftDoc extends Document, INft {}

const nftSchema = new mongoose.Schema<INft>(
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
			type: [Object], // set schema?
			required: true,
		},
	},
	{ timestamps: true },
)

export const Nft = mongoose.models.nft || mongoose.model<INftDoc>('nft', nftSchema)
