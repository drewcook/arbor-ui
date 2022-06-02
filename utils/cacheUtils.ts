/**
 * Caching
 * Redis layer on every incoming request and outgoing response
 * Expiry: 24hr
 */
import { RedisClientType } from '@redis/client'
import RedisClient from '@redis/client/dist/lib/client'
import redis from 'redis'

class CacheUtils {
	private port: number = process.env.REDIS_PORT || 6379
	public cache: RedisClientType = redis.createClient()

	constructor() {
		this.cache.on('error', err => console.log('Redis Client Error', err))
		await this.cache.connect()
	}

	// Make request to Github for data
	public async function getRepos(req, res, next) {
		try {
			console.log('Fetching data...')
			const { username } = req.params
			const resp = await fetch(`https://api.github.com/users/${username}`)
			const data = await resp.json()
			// Store data in redis cache
			const repos = data.public_repos
			await this.cache.setEx(username, 3600, repos) // 1hr
			// Send response
			res.json({ data: { username, repos } })
		} catch (err) {
			console.error(err)
			res.status(500)
		}
	}

	// Cache middleware
	public function middleware(req, res, next) {
		const { username } = req.params
		// Get username from cache, return it if exists
		// this.cache.get(username, (err, data) => {
		// 	if (err) throw err

		// 	if (data !== null) {
		// 		res.send(setResponse(username, data))
		// 	} else {
		// 		next()
		// 	}
		// })
	}
}

const cache = new CacheUtils()

export default cache


// // Route
// app.get('/repos/:username', cache, getRepos)

// // Open port
// app.listen(5000, () => {
// 	console.log(`App listening on port ${PORT}`)
// })
