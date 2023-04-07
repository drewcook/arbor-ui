import { createClient } from 'redis'

const redisClient = createClient({
	password: process.env.REDIS_AUTH,
	socket: {
		host: process.env.REDIS_HOST,
		port: 18864,
	},
})

redisClient.on('error', err => console.error('Redis Client Error', err))

export default redisClient
