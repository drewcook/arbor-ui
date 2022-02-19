import mongoose,{ Document } from 'mongoose'
import type { ISampleDoc } from './sample.model'
import { sampleSchema } from './sample.model'

export interface IProject {
  createdBy: string
  collaborators: string[]
  name: string
  description: string
  bpm: number,
  timeboxMins: number,
  tags: string[]
  samples: ISampleDoc[]
}

export interface IProjectDoc extends Document, IProject {}

const projectSchema = new mongoose.Schema(
	{
    createdBy: {
			type: String,
			required: true,
		},
    collaborators: {
			type: [String],
			required: true,
		},
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
    bpm: {
      type: Number,
      required: true,
      min: 40,
      max: 300,
    },
    timeboxMins: {
      type: Number,
      required: true,
      min: 0,
      max: 30,
    },
    tags: {
      type: [String],
      required: false,
      default: []
    },
    samples: {
      type: [sampleSchema],
      required: false,
      default: []
    },
	},
	{ timestamps: true },
)

// Require that projects have unique names
projectSchema.index({ name: 1 }, { unique: true })

export const Project = mongoose.models.project || mongoose.model<IProjectDoc>('project', projectSchema)
