import { Document } from 'mongoose'

import { INft, Nft } from './nft.model'
import { IProject, Project } from './project.model'
import { IStem, Stem } from './stem.model'
import { IUser, User } from './user.model'

// Types to be used in API and Client
type MongoEntityDoc<T> = Document & T
export type NftDoc = MongoEntityDoc<INft>
export type ProjectDoc = MongoEntityDoc<IProject>
export type StemDoc = MongoEntityDoc<IStem>
export type UserDoc = MongoEntityDoc<IUser>
export type MongoEntity = NftDoc | ProjectDoc | StemDoc | UserDoc
export type EntityType = 'nft' | 'project' | 'stem' | 'user'

export const getModelFromEntityType = (entityType: EntityType) => {
	switch (entityType) {
		case 'nft':
			return Nft
		case 'project':
			return Project
		case 'stem':
			return Stem
		case 'user':
			return User
		default:
			throw new Error(`Invalid entity type: ${entityType}`)
	}
}

export { Nft } from './nft.model'
export { Project } from './project.model'
export { Stem } from './stem.model'
export { User } from './user.model'
