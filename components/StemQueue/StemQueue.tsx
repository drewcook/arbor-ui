import { AddCircleOutline, Check } from '@mui/icons-material'
import { Box, Button, CircularProgress, Divider, Typography } from '@mui/material'
import dynamic from 'next/dynamic'
import { useState } from 'react'
import type { IProjectDoc } from '../../models/project.model'
import { IStemDoc } from '../../models/stem.model'
import StemUploadDialog from '../StemUploadDialog'
import { useWeb3 } from '../Web3Provider'
import styles from './StemQueue.styles'

const Group = require('@semaphore-protocol/group').Group
const Identity = require('@semaphore-protocol/identity').Identity
const generateProof = require('@semaphore-protocol/proof').generateProof
const packToSolidityProof = require('@semaphore-protocol/proof').packToSolidityProof

const StemPlayer = dynamic(() => import('../StemPlayer'), { ssr: false })

type StemQueueProps = {
	details: IProjectDoc
	uploadStemOpen: boolean
	handleUploadStemOpen: () => void
	handleUploadStemClose: () => void
	onStemUploadSuccess: (project: IProjectDoc) => void
}

const StemQueue = (props: StemQueueProps): JSX.Element => {
	const { details, handleUploadStemOpen, handleUploadStemClose, uploadStemOpen, onStemUploadSuccess } = props
	const [loading, setLoading] = useState<boolean>(false)
	const [stems, setStems] = useState<Map<number, any>>(new Map())
	const { currentUser, connected, handleConnectWallet, stemQueueContract } = useWeb3()
	const web3Provider = useWeb3().web3

	/*
		Stem Player callbacks
	*/
	const onWavesInit = (idx: number, ws: any) => {
		const tmp = new Map(details.queue.entries())
		tmp.set(idx, ws)
		setStems(tmp)
	}

	/*
		Stem Voting
	*/
	const handleRegister = async () => {
		try {
			const identity = new Identity(currentUser?.identity)
			const commitment = identity.generateCommitment()
			console.log(identity, commitment)
			// TODO: Add the user's identity commitment to the on-chain group
			// const res = await stemQueueContract.methods.addMember().send({ from: currentUser?.address })
		} catch (e: any) {
			console.error(e.message)
		}
	}

	// const calculateProof = async (stemId: string) => {
	// 	setLoading(true)
	// 	const voter = currentUser?.address || '0x0'
	// 	const contributors = details.collaborators
	// 	const queuedStemIds: string[] = details.queue.map(q => q.stem._id)
	// 	const calldata = await stemQueueVoteCalldata(voter, stemId, contributors, queuedStemIds)
	// 	console.log('calldata', calldata)

	// 	if (!calldata) {
	// 		setLoading(false)
	// 		return 'Invalid inputs to generate witness.'
	// 	}

	// 	try {
	// 		// Call verify the proof
	// 		const result = await contract.verifySudoku(calldata.a, calldata.b, calldata.c, calldata.Input)
	// 		console.log('result', result)
	// 		setLoading(false)
	// 		alert('Successfully verified')
	// 	} catch (error) {
	// 		setLoading(false)
	// 		console.log(error)
	// 		alert('Not verified to perform this action')
	// 	}
	// }

	// TODO:
	const handleVote = async (stem: IStemDoc) => {
		console.log('accept', stem._id)
		try {
			// // Preliminary requirement to be connected
			// if (!currentUser || !connected) return handleConnectWallet()
			// setLoading(true)
			// // Preliminary requirement to be connected
			// if (!currentUser || !connected) return handleConnectWallet()
			// // Get signature and create identity from it deterministically
			// // const signature = await web3Provider?.eth.personal.sign(
			// // 	'Sign this message to create your anonymous identity with Semaphore.',
			// // 	currentUser.address,
			// // 	'mock-password',
			// // )
			// // if (signature) {
			// const identity = new Identity(currentUser?.identity)
			// const newIdentityCommitment = identity.generateCommitment()
			// // const backup = identity.toString()
			// // Get existing commitments from other contributors
			// const existingCommitments = details.collaborators.map(c => c.identity)
			// // Create a new group instance exact of project's group
			// console.log({ dg: details.group, group })
			// // Add the new identity commitment to project voter's group
			// group.addMembers([...existingCommitments, newIdentityCommitment])
			// // This group should be rewritten to backend database
			// const { proof, publicSignals } = await generateProof(identity, group, group.root, stem._id, {
			// 	wasmFilePath: '/zkproof/semaphore.wasm',
			// 	zkeyFilePath: '/zkproof/semaphore.zkey',
			// })
			// const solidityProof = packToSolidityProof(proof)
			// const stemId = utils.formatBytes32String(stem._id)
			// console.log(stemId)
			// const res = await stemQueueContract.methods
			// 	.vote(stemId, publicSignals.nullifierHash, solidityProof)
			// 	.send({ from: currentUser?.address })
			// console.log({ res })
			// }
			// Call circuit
			// logger.green('Calculating the proof...')
			// const circuitRes = await calculateProof(stem._id)
			// console.log({ circuitRes })
			// if (circuitRes) {
			// 	// If 'yes' votes are now majority of collaborators, add stem and collaborator to project
			// 	const updateRes = await update(`/projects/${details._id}`, { newStem: stem })
			// 	console.log({ updateRes })
			// } else {
			// 	// Not a valid vote..
			// }
		} catch (e: any) {
			setLoading(false)
			console.error(e.message)
		}
	}

	return (
		<div>
			<Typography variant="h4">Stem Queue</Typography>
			<Button
				variant="outlined"
				size="large"
				onClick={handleUploadStemOpen}
				sx={styles.addStemBtn}
				startIcon={<AddCircleOutline sx={{ fontSize: '32px' }} />}
			>
				Add Stem
			</Button>
			<Button
				variant="outlined"
				size="large"
				onClick={handleRegister}
				sx={styles.addStemBtn}
				startIcon={<Check sx={{ fontSize: '32px' }} />}
				disabled={loading}
			>
				{loading ? <CircularProgress /> : 'Register to Vote'}
			</Button>
			<Divider />
			{details.queue.length === 0 ? (
				<Typography>The stem queue is currently empty for this project</Typography>
			) : (
				details.queue.map((stem, idx) => (
					<Box key={idx} sx={{ mb: 3 }}>
						<StemPlayer
							idx={idx + 1}
							details={stem.stem}
							onWavesInit={onWavesInit}
							// onFinish={() => setIsPlayingAll(false)}
							// onSolo={handleSoloStem}
							// onNewFile={onNewFile}
						/>
						<Typography>
							<strong>Votes:</strong> {stem.votes}
						</Typography>
						<Button variant="contained" size="small" onClick={() => handleVote(stem.stem)}>
							{loading ? <CircularProgress color="inherit" /> : 'Cast Vote'}
						</Button>
					</Box>
				))
			)}
			<StemUploadDialog
				open={uploadStemOpen}
				onClose={handleUploadStemClose}
				onSuccess={onStemUploadSuccess}
				projectDetails={details}
			/>
		</div>
	)
}

export default StemQueue
