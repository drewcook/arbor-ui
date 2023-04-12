import mongoose from 'mongoose'

import { NftDoc, StemDoc } from '.'
import { stemSchema } from './stem.model'

type Token = {
	id: number
	tokenURI: string
	data: any
}

export interface INft {
	createdBy: string
	owner: string
	isListed: boolean
	listPrice: number // In wei
	token: Token
	metadataUrl: string
	audioHref: string
	name: string
	projectId: string
	collaborators: string[]
	stems: StemDoc[]
}

const nftSchema = new mongoose.Schema<NftDoc>(
	{
		token: {
			type: Object,
			required: true,
		},
		metadataUrl: {
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

export const Nft = mongoose.models.nft || mongoose.model<NftDoc>('nft', nftSchema)
