import mongoose from 'mongoose'
import type { INftDoc } from './nft.model'
import type { IProjectDoc } from './project.model'
import type { ISampleDoc } from './sample.model'

export interface IUser {
	address: string
	displayName: string
	avatarUrl: string
	nftIds: string[]
	projectIds: string[]
	sampleIds: string[]
	createdAt: string
	updatedAt: string
}

export interface IUserFull extends IUser {
	nfts: INftDoc[]
	projects: IProjectDoc[]
	samples: ISampleDoc[]
}

export interface IUserDoc extends Document, IUser {}

const userSchema = new mongoose.Schema<IUserDoc>(
	{
		address: {
			type: String,
			required: true,
			// validate it is an ethereum-like address (Joi?)
			unique: true,
		},
		displayName: {
			type: String,
			required: false,
			trim: true,
			minLength: 3,
			maxlength: 50,
		},
		avatarUrl: {
			type: String,
			required: false,
			default: '',
		},
		nftIds: {
			type: [String],
			required: false,
			default: [],
		},
		projectIds: {
			type: [String],
			required: false,
			default: [],
		},
		sampleIds: {
			type: [String],
			required: false,
			default: [],
		},
	},
	{ timestamps: true },
)

export const User = mongoose.models.user || mongoose.model<IUserDoc>('user', userSchema)
