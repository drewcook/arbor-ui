import type { NextApiRequest, NextApiResponse } from 'next'
import { IUser, User } from '../../../models/user.model'
import dbConnect from '../../../utils/db'

export type CreateUserPayload = {
	_id: string
}

async function handler(req: NextApiRequest, res: NextApiResponse) {
	const { method } = req
	await dbConnect()

	switch (method) {
		case 'GET':
			try {
				/* find all the data in our database */
				const users: IUser[] = await User.find({})
				res.status(200).json({ success: true, data: users })
			} catch (e) {
				res.status(400).json({ success: false, error: e })
			}
			break
		case 'POST':
			try {
				const payload: CreateUserPayload = {
					_id: req.body.address.toLowerCase(),
				}
				console.log({ payload })
				/* create a new model in the database */
				// TODO: this is failing
				const user: IUser = await User.create(payload)
				console.log({ user })
				res.status(201).json({ success: true, data: user })
			} catch (e) {
				console.log({ e })
				res.status(400).json({ success: false, error: e })
			}
			break
		default:
			res.status(400).json({ success: false, error: `HTTP method '${method}' not supported` })
			break
	}
}

export default handler
