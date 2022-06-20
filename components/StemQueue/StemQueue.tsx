import { AddCircleOutline, Check } from '@mui/icons-material'
import { Button, CircularProgress, Divider, Typography } from '@mui/material'
import dynamic from 'next/dynamic'
import { Fragment, useEffect, useState } from 'react'
import StemQueueContract from '../../contracts/StemQueue.json'
import type { IProjectDoc } from '../../models/project.model'
import { IStemDoc } from '../../models/stem.model'
import { update } from '../../utils/http'
import logger from '../../utils/logger'
import stemQueueVoteCalldata from '../../zkproof/stemQueueVote'
import StemUploadDialog from '../StemUploadDialog'
import { useWeb3 } from '../Web3Provider'
import styles from './StemQueue.styles'

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
	const [contract, setContract] = useState<any>(null)
	const [loading, setLoading] = useState<boolean>(false)
	const [stems, setStems] = useState<Map<number, any>>(new Map())
	const { currentUser, web3 } = useWeb3()

	/*
		Stem Player callbacks
	*/
	const onWavesInit = (idx: number, ws: any) => {
		const tmp = new Map(details.queue.entries())
		tmp.set(idx, ws)
		setStems(tmp)
	}

	// Set StemQueue smart contract based off network ABI
	const initializeContract = async () => {
		if (!web3) return
		const networkId = await web3.eth.net.getId()
		const deployedNetwork = StemQueueContract.networks[networkId]
		const merkleTreeContract = new web3.eth.Contract(StemQueueContract.abi, deployedNetwork && deployedNetwork.address)
		setContract(merkleTreeContract)
	}

	const calculateProof = async () => {
		setLoading(true)
		const voter = currentUser?.address || '0x0'
		const stemId = '0001' // details.queuedStemIds
		const contributors = details.collaborators
		const queuedStemIds = []
		const calldata = await stemQueueVoteCalldata(voter, stemId, contributors, queuedStemIds)

		if (!calldata) {
			setLoading(false)
			return 'Invalid inputs to generate witness.'
		}

		console.log('calldata', calldata)

		try {
			// Call verify the proof
			const result = await contract.verifySudoku(calldata.a, calldata.b, calldata.c, calldata.Input)
			console.log('result', result)
			setLoading(false)
			alert('Successfully verified')
		} catch (error) {
			setLoading(false)
			console.log(error)
			alert('Not verified to perform this action')
		}
	}

	const handleTestCircuit = async (): Promise<any> => {
		logger.green('Calculating the proof...')
		try {
			await initializeContract()
			const result = await calculateProof()
			console.log({ result })
			return result
		} catch (e: any) {
			console.log('uhh')
			return null
		}
	}

	const handleAccept = async (stem: IStemDoc) => {
		console.log('accept', stem._id)
		try {
			// Test circuit
			const circuitRes = await handleTestCircuit()
			if (circuitRes) {
				// If 'yes' votes are now majority of collaborators, add stem and collaborator to project
				const updateRes = await update(`/projects/${details._id}`, { newStem: stem })
				console.log({ updateRes })
			} else {
				// Not a valid vote..
			}
		} catch (e: any) {
			console.log('uhh')
		}
	}

	const handleReject = (stem: IStemDoc) => {
		console.log('reject', stem._id)
	}

	useEffect(() => {
		initializeContract()
	})

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
				onClick={handleTestCircuit}
				sx={styles.addStemBtn}
				startIcon={<Check sx={{ fontSize: '32px' }} />}
				disabled={loading}
			>
				{loading ? <CircularProgress /> : 'Test Circuit'}
			</Button>
			<Divider />
			{details.queue.length === 0 ? (
				<Typography>The stem queue is currently empty for this project</Typography>
			) : (
				details.queue.map((stem, idx) => (
					<Fragment key={idx}>
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
						<Button variant="contained" size="small" onClick={() => handleAccept(stem.stem)}>
							Accept
						</Button>
						<Button variant="contained" size="small" onClick={() => handleReject(stem.stem)}>
							Reject
						</Button>
					</Fragment>
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
