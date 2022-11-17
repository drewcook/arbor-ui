import type { NextApiRequest, NextApiResponse } from 'next'

import redis from '@/utils/redis'

async function handler(req: NextApiRequest, res: NextApiResponse) {
	const { cid, blob, payload } = JSON.parse(req.body)

	switch (payload) {
		case 'GET':
			try {
				console.clear()
				let cache = (await redis.get(cid)) ?? undefined
				cache = cache ? cache : undefined

				if (cache) {
					console.log('\n\n found in cache\n\n')
					res.status(200).json(cache)
				} else {
					res.status(500).end()
				}
			} catch (error) {
				res.status(500).end()
			}

			break

		case 'POST':
			console.log('\n\n saving blob for cid:\n\n', cid)
			redis.set(cid, blob, 'EX', 120)
			res.status(200).end()
			break

		default:
			break
	}
}

export default handler
