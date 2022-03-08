import mongoose from 'mongoose'
import type { IProjectDoc } from './project.model'

export interface IUser {
	_id: string
	displayName: string
	avatarUrl: string
	projectIds: string[]
	sampleIds: string[]
	mintedNFTs: any[]
	createdAt: string
	updatedAt: string
}

export interface IUserFull extends IUser {
	projects: IProjectDoc[]
	samples: any[]
}

// export interface IUserDoc extends Document, IUser {}

const userSchema = new mongoose.Schema<IUser>(
	{
		// Custom override of default _id - map to wallet/connected account address
		_id: {
			type: String,
			required: true,
			unique: true,
			// validate it is an ethereum-like address
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
		projectIds: {
			type: [String],
			required: false,
			unique: true,
			default: [],
		},
		sampleIds: {
			type: [String],
			required: false,
			unique: true,
			default: [],
		},
		mintedNFTs: {
			type: [Object], // TODO: create NFT schema
			required: false,
			unique: true,
			default: [],
		},
	},
	{ timestamps: true },
)

export const User = mongoose.models.user || mongoose.model<IUser>('user', userSchema)
