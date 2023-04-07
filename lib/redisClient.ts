import { createClient } from 'redis'

import logger from './logger'

export const DEFAULT_EXPIRY = 3600 // 1hr

const redisClient = createClient({
	username: process.env.REDIS_USER,
	password: process.env.REDIS_AUTH,
	socket: {
		host: process.env.REDIS_HOST,
		port: 18864,
	},
})

export const connectRedis = async () => {
	if (!redisClient.isReady && !redisClient.isOpen)
		await redisClient.connect().then(() => logger.magenta('Redis connection opened'))
}

export const disconnectRedis = async () => {
	await redisClient.quit().then(() => logger.magenta('Redis connection closed'))
}

redisClient.on('error', err => logger.red(`Redis Client Error - ${err}`))

export default redisClient
