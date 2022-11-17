import { config } from 'dotenv'
import Redis from 'ioredis'
config()

const REDIS_URL = process.env.REDIS_URL
if (!REDIS_URL) throw new Error('REDIS_URL not defined inside .env.local')

const redis = new Redis()

export default redis
