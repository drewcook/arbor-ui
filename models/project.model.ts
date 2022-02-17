import mongoose,{ Document } from 'mongoose'

export interface IProject {
    name: string
    description: string
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
		description: String,
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
