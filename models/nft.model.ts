import mongoose from 'mongoose'
import type { IStemDoc } from './stem.model'
import { stemSchema } from './stem.model'

// TODO: create token model
type Token = {
	id: number
	tokenURI: string
	data: any
}

export interface INft {
	createdBy: string
	owner: string
	isListed: boolean
	listPrice: number // In gwei
	token: Token
	metadataUrl: string
	audioUrl: string // The ipfs:/ link
	audioHref: string // The nft.storage link
	name: string
	projectId: string
	collaborators: string[]
	stems: IStemDoc[]
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
		audioUrl: {
			type: String,
			required: true,
		},
		audioHref: {
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
		stems: {
			type: [stemSchema],
			required: true,
		},
		createdBy: {
			type: String,
			required: true,
		},
		owner: {
			type: String,
			required: true,
		},
		isListed: {
			type: Boolean,
			required: true,
			default: false,
		},
		listPrice: {
			type: Number,
			required: true,
			default: 0,
		},
	},
	{ timestamps: true },
)

export const Nft = mongoose.models.nft || mongoose.model<INftDoc>('nft', nftSchema)
