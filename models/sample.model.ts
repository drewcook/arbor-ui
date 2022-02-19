import mongoose, { Document } from 'mongoose'

export interface ISample {
  audioUrl: string
	filename: string
  filetype: string
  filesize: number
  createdBy: string
}

export interface ISampleDoc extends Document, ISample {}

export const sampleSchema = new mongoose.Schema(
	{
    audioUrl: {
      type: String,
      required: true
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
	},
	{ timestamps: true },
)

// Require that projects have unique names
sampleSchema.index({ name: 1 }, { unique: true })

export const Sample = mongoose.models.sample || mongoose.model<ISampleDoc>('sample', sampleSchema)
