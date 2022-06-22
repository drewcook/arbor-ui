import { AddCircleOutline } from '@mui/icons-material'
import { Box, Button, CircularProgress, Divider, Typography } from '@mui/material'
import dynamic from 'next/dynamic'
import { useState } from 'react'
import StemQueueContract from '../../contracts/StemQueue.json'
import type { IProjectDoc } from '../../models/project.model'
import { IStemDoc } from '../../models/stem.model'
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
	const { currentUser, connected, handleConnectWallet, web3 } = useWeb3()

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
		console.log(merkleTreeContract)
		setContract(merkleTreeContract)
	}

	const calculateProof = async (stemId: string) => {
		setLoading(true)
		const voter = currentUser?.address || '0x0'
		const contributors = details.collaborators
		const queuedStemIds: string[] = details.queue.map(q => q.stem._id)
		const calldata = await stemQueueVoteCalldata(voter, stemId, contributors, queuedStemIds)
		console.log('calldata', calldata)

		if (!calldata) {
			setLoading(false)
			return 'Invalid inputs to generate witness.'
		}

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

	const handleVote = async (stem: IStemDoc) => {
		console.log('accept', stem._id)
		try {
			// Preliminary requirements
			if (!currentUser || !connected) return handleConnectWallet()
			if (!contract) await initializeContract()

			// Call circuit
			logger.green('Calculating the proof...')
			const circuitRes = await calculateProof(stem._id)
			console.log({ circuitRes })

			// if (circuitRes) {
			// 	// If 'yes' votes are now majority of collaborators, add stem and collaborator to project
			// 	const updateRes = await update(`/projects/${details._id}`, { newStem: stem })
			// 	console.log({ updateRes })
			// } else {
			// 	// Not a valid vote..
			// }
		} catch (e: any) {
			console.log('uhh')
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
			{/* <Button
				variant="outlined"
				size="large"
				onClick={() => handleTestCircuit()}
				sx={styles.addStemBtn}
				startIcon={<Check sx={{ fontSize: '32px' }} />}
				disabled={loading}
			>
				{loading ? <CircularProgress /> : 'Test Circuit'}
			</Button> */}
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
							{loading ? <CircularProgress /> : 'Cast Vote'}
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
