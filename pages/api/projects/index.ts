import type { NextApiRequest, NextApiResponse } from 'next'
import { IProject, IProjectDoc, Project } from '../../../models/project.model'
import dbConnect from '../../../utils/db'
import getWeb3 from '../../../utils/getWeb3'
import { update } from '../../../utils/http'

export type CreateProjectPayload = {
	createdBy: string
	collaborators: string[]
	name: string
	description: string
	bpm: number
	trackLimit: number
	tags: string[]
}

async function handler(req: NextApiRequest, res: NextApiResponse) {
	const { method } = req
	await dbConnect()

	switch (method) {
		case 'GET':
			try {
				/* find all the data in our database */
				const projects: IProject[] = await Project.find({})
				res.status(200).json({ success: true, data: projects })
			} catch (e) {
				res.status(400).json({ success: false, error: e })
			}
			break
		case 'POST':
			try {
				// Get contract address, create instance
				// TODO: Use ethers to get contract with address
				const web3Instance = await getWeb3()
				console.log(web3Instance)
				// const networkId = await web3Instance.eth.net.getId()
				// const deployedNetwork = StemQueueContract.networks[networkId]
				// const contract = new web3Instance.eth.Contract(
				// 	StemQueueContract.abi,
				// 	deployedNetwork && deployedNetwork.address,
				// )
				// console.log(contract.methods)

				// Create DB entry
				const payload: CreateProjectPayload = {
					createdBy: req.body.createdBy,
					collaborators: req.body.collaborators,
					name: req.body.name,
					description: req.body.description,
					bpm: req.body.bpm,
					trackLimit: req.body.trackLimit,
					tags: req.body.tags,
				}
				const project: IProjectDoc = await Project.create(payload)

				// Add new project to creator's user details
				const userUpdated = await update(`/users/${req.body.createdBy}`, { newProject: project._id })
				if (!userUpdated) {
					return res.status(400).json({ success: false, error: "Failed to update user's projects" })
				}

				// TODO: Create new Semaphore group for given project
				// const response = await contract.methods
				// 	.createProjectGroup(project._id, 20, BigInt(0), req.body.createdBy)
				// 	.send({ from: req.body.createdBy })
				// console.log(response)

				res.status(201).json({ success: true, data: project })
			} catch (e) {
				res.status(400).json({ success: false, error: e })
			}
			break
		default:
			res.status(400).json({ success: false, error: `HTTP method '${method}' not supported` })
			break
	}
}

export default handler
