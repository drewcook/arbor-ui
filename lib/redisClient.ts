import { createClient } from 'redis'

import { EntityType, getModelFromEntityType, MongoEntity } from '../models'
import logger from './logger'

// Generate Redis keys that map to our data models in mongo and can be stored and queried as hashes
// Collections = hashes
// Documents = id fields within the hash
// Each id field will store the entire JSON structure of the document
export const allProjectsKey = 'projects:all'
export const allStemsKey = 'stems:all'
export const allNftsKey = 'nfts:all'

// Default expiration for all keys stored in the cache is: 1hr
export const DEFAULT_EXPIRY = 3600

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
		multi.expire(`${hashKey}:${fieldKey}`, expiry)
	})
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
 * @param {EntityType} entityType - The type of entity to retrieve.
 * @returns {Promise<Array<MongoEntity>>} - An array of entities.
 * @throws {Error} - Throws an error if the Redis or MongoDB queries fail.
 */
export const getAllEntitiesOfType = async (entityType: EntityType): Promise<MongoEntity[]> => {
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

export const getEntityById = async (entityType: EntityType, entityId: string | string[] | undefined) => {
	const redisKey = `${entityType}:all`
	const entityKey = String(entityId)
	let entity = null

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
			entity = await Model.findById(entityId)
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

export const updateEntityById = async (
	entityType: EntityType,
	entityId: string | string[] | undefined,
	body: Record<string, unknown>,
): Promise<any> => {
	const redisKey = `${entityType}:all`
	const entityKey = String(entityId)

	try {
		// Update entity in MongoDB
		const Model = getModelFromEntityType(entityType)
		const entity = await Model.findByIdAndUpdate(entityId, { $set: body }, { new: true, runValidators: true })

		// Catch error
		if (!entity) {
			throw new Error(`Failed to update the ${Model.modelName} in MongoDB`)
		}

		// Update entity Redis cache
		await connectRedis()
		await updateRedisHashField(redisKey, entityKey, entity)

		return entity.toObject()
	} catch (error) {
		logger.red(error)
		throw error
	} finally {
		// Close Redis connection
		await disconnectRedis()
	}
}

export default redisClient
