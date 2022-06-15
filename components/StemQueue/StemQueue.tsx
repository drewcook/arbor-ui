import { AddCircleOutline, Check } from '@mui/icons-material'
import { Button, CircularProgress, Typography } from '@mui/material'
import { useEffect, useState } from 'react'
import StemQueueContract from '../../contracts/StemQueue.json'
import type { IProjectDoc } from '../../models/project.model'
import logger from '../../utils/logger'
import stemQueueVoteCalldata from '../../zkproof/stemQueueVote'
import StemUploadDialog from '../StemUploadDialog'
import { useWeb3 } from '../Web3Provider'
import styles from './StemQueue.styles'

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
	const { currentUser, web3 } = useWeb3()

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

	const handleTestCircuit = async () => {
		logger.green('Calculating the proof...')
		await initializeContract()
		await calculateProof()
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
