import mongoose from 'mongoose'

import { StemDoc } from '.'

export type StemType = 'drums' | 'percussion' | 'bass' | 'chords' | 'melody' | 'vocals' | 'combo' | 'other'
export type StemFileType = 'audio/wav'

export interface IStem {
	name: string
	type: StemType
	metadataUrl: string
	audioUrl: string
	audioHref: string
	filename: string
	filetype: StemFileType
	filesize: number
	createdBy: string
}

export const stemSchema = new mongoose.Schema<StemDoc>(
	{
		name: {
			type: String,
			required: true,
		},
		type: {
			type: String,
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
		// TODO: Add tags field to help describe the stem
	},
	{ timestamps: true },
)

export const Stem = mongoose.models.stem || mongoose.model<StemDoc>('stem', stemSchema)
