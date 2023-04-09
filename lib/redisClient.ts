import { createClient } from 'redis'

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

// Helper functions
export const connectRedis = async () => {
	if (!redisClient.isReady && !redisClient.isOpen)
		await redisClient.connect().then(() => logger.magenta('Redis connection opened'))
}

export const disconnectRedis = async () => {
	await redisClient.quit().then(() => logger.magenta('Redis connection closed'))
}

// Global error handler
redisClient.on('error', err => logger.red(`Redis Client Error - ${err}`))

export default redisClient
