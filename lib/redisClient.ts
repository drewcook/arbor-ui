import { createClient } from 'redis'

import { EntityType, getModelFromEntityType, MongoEntity } from '../models'
import logger from './logger'

// Default expiration for all keys stored in the cache is: 24hr
export const DEFAULT_EXPIRY = 86400

// Client instance
const redisClient = createClient({
	username: process.env.REDIS_USER,
	password: process.env.REDIS_AUTH,
	socket: {
		host: process.env.REDIS_HOST,
		port: 18864,
	},
})

// Global error handler
redisClient.on('error', err => logger.red(`Redis Client Error - ${err}`))

// Helper functions
export const connectRedis = async () => {
	if (!redisClient.isReady && !redisClient.isOpen)
		await redisClient.connect().then(() => logger.magenta('Redis connection opened'))
}

export const disconnectRedis = async () => {
	await redisClient.quit().then(() => logger.magenta('Redis connection closed'))
}

/**
 * Update a hash in Redis with a new value, overwriting the previous contents of the hash.
 *
 * @param hashKey - The key for the hash to update.
 * @param objectValue - The array of Mongo Entities to store in the hash.
 * @param expiry - The expiry time for the hash in seconds.
 */
export const updateRedisHash = async (
	hashKey: string,
	objectValue: MongoEntity[],
	expiry: number = DEFAULT_EXPIRY,
): Promise<void> => {
	const multi = redisClient.multi()
	if (multi.exists(hashKey)) multi.del(hashKey)
	// Loop over each entity and write it as a new field using the entity ID as the key
	objectValue.forEach(entity => {
		const fieldKey = entity.id.toString()
		multi.hSet(hashKey, fieldKey, JSON.stringify(entity))
	})
	multi.expire(hashKey, expiry)
	await multi.exec()
}

/**
 * Update a specific field within a hash in Redis.
 *
 * @param hashKey - The key for the hash to update.
 * @param fieldKey - The key for the field to update.
 * @param fieldValue - The new value for the field.
 * @param expiry - The expiry time for the hash in seconds.
 */
export const updateRedisHashField = async (
	hashKey: string,
	fieldKey: string,
	fieldValue: any,
	expiry: number = DEFAULT_EXPIRY,
): Promise<void> => {
	const multi = redisClient.multi()
	multi.hSet(hashKey, fieldKey, JSON.stringify(fieldValue))
	multi.expire(hashKey, expiry)
	await multi.exec()
}

/**
 * Retrieves all entities of a given type from Redis or MongoDB. If the entities are found
 * in Redis, they are returned immediately. Otherwise, the function fetches all entities
 * from MongoDB, writes them to Redis, and returns them.
 *
 * @async
 * @param {EntityType} entityType - The type of entity to retrieve.
 * @returns {Promise<Array<MongoEntity>>} - An array of entities.
 * @throws {Error} - Throws an error if the Redis or MongoDB queries fail.
 */
export const getAllEntitiesOfType = async (entityType: EntityType): Promise<any[]> => {
	const redisKey = `${entityType}:all`
	let entities: MongoEntity[] = []

	try {
		// Connect to Redis
		await connectRedis()
		// Check if Redis has the desired data
		const redisData = await redisClient.hGetAll(redisKey)
		if ((await redisClient.exists(redisKey)) && Object.keys(redisData).length !== 0) {
			// Redis data exists, parse and return it
			logger.magenta('Redis hit')
			entities = Object.values(redisData).map((entity: string) => JSON.parse(entity))
		} else {
			// Redis data does not exist, fetch from MongoDB
			logger.magenta('Redis miss')
			const Model = getModelFromEntityType(entityType)
			entities = await Model.find({})
			// Write to Redis
			await updateRedisHash(redisKey, entities)
		}
		return entities
	} catch (error) {
		logger.red(error)
		throw error
	} finally {
		// Close Redis connection
		await disconnectRedis()
	}
}

/**
 * Retrieves an entity from Redis cache or MongoDB by its ID.
 * @async
 * @function getEntityById
 * @param {EntityType} entityType - The type of entity to retrieve (e.g. "nft", "user").
 * @param {string|string[]|undefined} entityId - The ID or IDs of the entity to retrieve.
 * @throws {Error} If the entity is not found in MongoDB or Redis.
 * @returns {Promise<any>} The retrieved entity object
 */
export const getEntityById = async (entityType: EntityType, entityId: string | string[] | undefined): Promise<any> => {
	const redisKey = `${entityType}:all`
	const entityKey = String(entityId)
	let entity: MongoEntity | null = null

	try {
		// Connect to Redis
		await connectRedis()
		// Check if Redis has the desired data
		const redisData = await redisClient.hGet(redisKey, entityKey)
		if (redisData) {
			// Redis data exists, parse and return it
			logger.magenta('Redis hit')
			entity = JSON.parse(redisData)
		} else {
			// Redis data does not exist, fetch from MongoDB
			logger.magenta('Redis miss')
			const Model = getModelFromEntityType(entityType)
			// Handle getting Users by their address
			if (entityType === 'user') {
				entity = await Model.findOne({ address: entityId })
			} else {
				entity = await Model.findById(entityId)
			}
			// Return 404 if entity doesn't exist
			if (!entity) {
				throw new Error(`${entityType} with ID '${entityId}' not found`)
			} else {
				// Write to Redis
				await updateRedisHashField(redisKey, entityKey, entity)
			}
		}
		return entity
	} catch (error) {
		logger.red(error)
		throw error
	} finally {
		// Close Redis connection
		await disconnectRedis()
	}
}

/**
 * Create a new entity and write to both MongoDB and Redis.
 * @async
 * @param {EntityType} entityType - The type of entity to create.
 * @param {Object} entityData - The data for the new entity.
 * @returns {Promise<MongoEntity>} The created entity object.
 * @throws {Error} If the entity could not be created.
 */
export const createEntity = async (entityType, entityData): Promise<any> => {
	const redisKey = `${entityType}:all`
	let createdEntity: MongoEntity | null = null

	try {
		// Create entity in MongoDB
		const Model = getModelFromEntityType(entityType)
		createdEntity = await Model.create(entityData)

		// Catch error
		if (!createdEntity) {
			throw new Error(`Failed to create the new ${Model.modelName} record in MongoDB`)
		}

		// Write to Redis
		await connectRedis()
		const entityKey = String(createdEntity._id)
		await updateRedisHashField(redisKey, entityKey, createdEntity)
		return createdEntity.toObject()
	} catch (error) {
		// If there was an error creating the entity in MongoDB, delete it from Redis (if it was added)
		if (createdEntity) {
			await deleteEntityById(entityType, createdEntity._id)
		}
		logger.red(error)
		throw error
	} finally {
		// Close Redis connection
		await disconnectRedis()
	}
}

/**
 * Updates a single entity in MongoDB and Redis cache, writing to MongoDB first and then updating the Redis field
 *
 * @async
 * @function updateEntityById
 * @param {string} entityType - The type of the entity to update (e.g. "nft", "user").
 * @param {string|string[]|undefined} entityId - The ID or IDs of the entity to update.
 * @param {UpdateEntityOptions} [options={}] - The update options to apply (e.g. `$set`, `$addToSet`).
 * @returns {Promise<Object>} The updated entity object.
 * @throws {Error} If the entity fails to update in MongoDB.
 * @throws {Error} If the Redis cache fails to update.
 */
export interface UpdateEntityOptions {
	set?: Record<string, unknown>
	addToSet?: Record<string, unknown>
	pull?: Record<string, unknown>
	push?: Record<string, unknown>
}
export const updateEntityById = async (
	entityType: EntityType,
	entityId: string | string[] | undefined,
	options: UpdateEntityOptions = {},
): Promise<any> => {
	const { set, addToSet, pull, push } = options
	const redisKey = `${entityType}:all`
	const entityKey = String(entityId)

	try {
		// Update entity in MongoDB
		const updateQuery = {}
		if (set) {
			updateQuery['$set'] = set
		}
		if (addToSet) {
			updateQuery['$addToSet'] = addToSet
		}
		if (pull) {
			updateQuery['$pull'] = pull
		}
		if (push) {
			updateQuery['$push'] = push
		}
		const Model = getModelFromEntityType(entityType)
		let updatedEntity: MongoEntity | null
		// Handle getting Users by their address
		if (entityType === 'user') {
			updatedEntity = await Model.findOneAndUpdate({ address: entityId }, updateQuery, {
				new: true,
				runValidators: true,
			})
		} else {
			updatedEntity = await Model.findByIdAndUpdate(entityId, updateQuery, {
				new: true,
				runValidators: true,
			})
		}

		// Catch error
		if (!updatedEntity) {
			throw new Error(`Failed to update the ${Model.modelName} in MongoDB`)
		}

		// Update entity Redis cache
		await connectRedis()
		await updateRedisHashField(redisKey, entityKey, updatedEntity)

		return updatedEntity.toObject()
	} catch (error) {
		logger.red(error)
		throw error
	} finally {
		// Close Redis connection
		await disconnectRedis()
	}
}

/**
 * Deletes an entity from both Redis and MongoDB.
 * @async
 * @param {string} entityType - The type of entity to delete (e.g. "nft", "user").
 * @param {string | string[] | undefined} entityId - The ID or IDs of the entity to delete.
 * @returns {Promise<any>} The deleted entity.
 * @throws {Error} If the entity does not exist in MongoDB or if there was an error deleting the entity.
 */
export const deleteEntityById = async (
	entityType: EntityType,
	entityId: string | string[] | undefined,
): Promise<any> => {
	const redisKey = `${entityType}:all`
	const entityKey = String(entityId)
	let deletedEntity: MongoEntity | null = null

	try {
		// Connect to Redis
		await connectRedis()
		// Check if Redis has the desired data
		const redisData = await redisClient.hGet(redisKey, entityKey)
		if (redisData) {
			// Redis data exists, delete it
			logger.magenta('Redis hit')
			await redisClient.hDel(redisKey, entityKey)
		}
		// Delete the entity from MongoDB
		const Model = getModelFromEntityType(entityType)
		deletedEntity = await Model.findByIdAndDelete(entityId)
		// Catch error
		if (!deletedEntity) {
			throw new Error(`Failed to delete the ${Model.modelName} with ID '${entityId}' in MongoDB`)
		}
		return deletedEntity
	} catch (error) {
		logger.red(error)
		throw error
	} finally {
		// Close Redis connection
		await disconnectRedis()
	}
}

export default redisClient
