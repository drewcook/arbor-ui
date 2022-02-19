import mongoose,{ Document } from 'mongoose'
import type { ISample } from './sample.model'
import { sampleSchema } from './sample.model'

export interface IProject {
  createdBy: string
  name: string
  description: string
  tags: string[]
  samples: ISample[]
}

export interface IProjectDoc extends Document, IProject {}

const projectSchema = new mongoose.Schema(
	{
		name: {
			type: String,
			required: true,
			trim: true,
      minLength: 3,
			maxlength: 50,
		},
		description: {
      type: String,
      required: true,
      trim: true,
      minLength: 1,
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
    samples: {
      type: [sampleSchema],
      required: false,
      default: []
    }
	},
	{ timestamps: true },
)

// Require that projects have unique names
projectSchema.index({ name: 1 }, { unique: true })

export const Project = mongoose.models.Project || mongoose.model<IProjectDoc>('project', projectSchema)
