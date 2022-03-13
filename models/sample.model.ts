import mongoose, { Document } from 'mongoose'

export interface ISample {
	metadataUrl: string
	audioUrl: string
	audioHref: string
	filename: string
	filetype: string
	filesize: number
	createdBy: string
}

export interface ISampleDoc extends Document, ISample {}

export const sampleSchema = new mongoose.Schema(
	{
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
		filename: {
			type: String,
			required: true,
			trim: true,
			maxlength: 200,
		},
		filetype: {
			type: String,
			required: true,
			trim: true,
			maxlength: 10,
		},
		filesize: {
			type: Number,
			required: true,
		},
		createdBy: {
			type: String,
			required: true,
		},
		// TODO: Add tags field to help describe the sample
	},
	{ timestamps: true },
)

export const Sample = mongoose.models.sample || mongoose.model<ISampleDoc>('sample', sampleSchema)
