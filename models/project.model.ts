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
			type: mongoose.SchemaTypes.ObjectId,
			ref: 'user',
			required: true,
		},
	},
	{ timestamps: true },
)

projectSchema.index({ name: 1 }, { unique: true })

export const Project = mongoose.model<IProjectDoc>('project', projectSchema)
