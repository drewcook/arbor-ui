import mongoose,{ Document } from 'mongoose'

export interface IProject {
    name: string
    description: string
    tags: string[]
    createdBy: string
}

export interface IProjectDoc extends Document, IProject {}

const projectSchema = new mongoose.Schema(
	{
		name: {
			type: String,
			required: true,
			trim: true,
			maxlength: 50,
		},
		description: {
      type: String,
      required: true,
      trim: true,
      maxLength: 300,
    },
    tags: {
      type: [String],
      required: false,
      default: []
    },
		createdBy: {
			type: String,
			required: true,
		},
	},
	{ timestamps: true },
)

// Require that projects have unique names
projectSchema.index({ name: 1 }, { unique: true })

export const Project = mongoose.models.Project || mongoose.model<IProjectDoc>('project', projectSchema)
