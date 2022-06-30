// import createProof from '@interep/proof'
import detectEthereumProvider from '@metamask/detect-provider'
import { AddCircleOutline, Check, HowToReg } from '@mui/icons-material'
import { Box, Button, CircularProgress, Typography } from '@mui/material'
import { Strategy, ZkIdentity } from '@zk-kit/identity'
import { ethers, utils } from 'ethers'
import dynamic from 'next/dynamic'
import { useState } from 'react'
import { stemQueueContract } from '../../constants/contracts'
import type { IProjectDoc } from '../../models/project.model'
import { IStemDoc } from '../../models/stem.model'
import { update } from '../../utils/http'
import StemUploadDialog from '../StemUploadDialog'
import { useWeb3 } from '../Web3Provider'
import styles from './StemQueue.styles'

const StemPlayer = dynamic(() => import('../StemPlayer'), { ssr: false })

const generateMerkleProof = require('@zk-kit/protocols').generateMerkleProof
const Semaphore = require('@zk-kit/protocols').Semaphore

type StemQueueProps = {
	details: IProjectDoc
	uploadStemOpen: boolean
	handleUploadStemOpen: () => void
	handleUploadStemClose: () => void
	onStemUploadSuccess: (project: IProjectDoc) => void
}

const StemQueue = (props: StemQueueProps): JSX.Element => {
	const { details, handleUploadStemOpen, handleUploadStemClose, uploadStemOpen, onStemUploadSuccess } = props

	// const [projectDetails, setProjectDetails] = useState<IProjectDoc>(details)
	const [loading, setLoading] = useState<boolean>(false)
	const [stems, setStems] = useState<Map<number, any>>(new Map())

	const { currentUser } = useWeb3()
	const userIsRegistered: boolean =
		details.voterIdentityCommitments.filter(commitment => commitment === currentUser?.voterIdentityCommitment).length >
		0
	const userIsCollaborator: boolean = currentUser ? details.collaborators.includes(currentUser.address) : false

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
			// Preliminary requirement to be connected
			if (!currentUser) return
			setLoading(true)

			/*
				Create a user identity based off signing a message
				- @zk-kit/identity
			*/
			const ethereumProvider = (await detectEthereumProvider()) as any
			const provider = new ethers.providers.Web3Provider(ethereumProvider)
			const signer = provider.getSigner()
			const message = await signer.signMessage(
				"Sign this message to register for this Polyecho project's anonymous voting group. You are signing to create your anonymous identity with Semaphore.",
			)
			const identity = new ZkIdentity(Strategy.MESSAGE, message)
			const commitment: string = await identity.genIdentityCommitment().toString()

			/*
				Add the user's identity commitment to the on-chain group
			*/
			const contractRes = await stemQueueContract.addMemberToProjectGroup(details.votingGroupId, commitment)
			if (!contractRes) {
				console.error("Failed to register the user for the project's voting group")
			}

			/*
				Add the user identity to the list of project's registered identities
				- This is so we can generate an off-chain group to submit an off-chain proof of
				- NOTE: There's not an easy way to translate the on-chain groups[groupId] as an off-chain Group object
			*/
			const projectRes = await update(`/projects/${details._id}`, {
				...details,
				voterIdentityCommitments: [...details.voterIdentityCommitments, commitment],
			})
			if (!projectRes) {
				console.error('Failed to add the identity to the project record')
			}

			/*
				Update the user record
				- Add in the new identity for the user
				- Add in the group ID for user's registered groups
				- NOTE: This will help to show the appropriate UI elements/state
			*/
			// TODO: Only store maybe the commitment
			const userRes = await update(`/users/${currentUser?.address}`, {
				...currentUser,
				voterIdentityCommitment: commitment,
				registeredGroupIds: [...currentUser.registeredGroupIds, details.votingGroupId],
			})
			if (!userRes) {
				console.error('Failed to add the group ID to the user record')
			}
		} catch (e: any) {
			console.error(e.message)
		}
		setLoading(false)
	}

	const handleVote = async (stem: IStemDoc) => {
		try {
			// Preliminary requirement to be connected
			if (!currentUser) return
			setLoading(true)

			// Signal will be the MongoDB ObjectId for the stem record being voted on
			const stemId: string = stem._id.toString()

			/*
				Generate an off-chain proof to submit to the backend contracts for signalling and verification
					Using @semaphore-protocol/proof
					1. Re-instantiate a new ZKIdentity using the user's identity commitment from the previously signed message via EOA wallet
					2. Get all identity commitments of the semaphore group so that we can calculate the Merkle root
					3. Generate the Merkle proof given the above two pieces of data
					4. Create the full proof
					5. Call the smart contract to verify the proof that this user is part of the group
			*/

			// Re-create the identity
			const voterIdentity = new ZkIdentity(Strategy.MESSAGE, currentUser?.voterIdentityCommitment)
			console.log({ voterIdentity })

			// Get the other group members' identities
			const identityCommitments: bigint[] = []
			for (const commitment of details.voterIdentityCommitments) {
				console.log(commitment, BigInt(commitment))
				identityCommitments.push(BigInt(commitment))
			}
			console.log({ identityCommitments })

			// Generate the Merkle proof
			const merkleProof = generateMerkleProof(20, BigInt(0), identityCommitments, currentUser?.voterIdentityCommitment)
			console.log({ merkleProof })

			// Generate the witness
			const witness = Semaphore.genWitness(
				voterIdentity.getTrapdoor(),
				voterIdentity.getNullifier(),
				merkleProof,
				merkleProof.root,
				stemId,
			)
			console.log({ witness })

			// Generate the proofs
			const { proof, publicSignals } = await Semaphore.genProof(
				witness,
				'/zkproof/semaphore.wasm',
				'/zkproof/semaphore.zkey',
			)
			const solidityProof = Semaphore.packToSolidityProof(proof)
			console.log({ proof, publicSignals, solidityProof })

			// Submit the vote signal and proof to the smart contract
			const voteRes = await stemQueueContract.vote(
				utils.formatBytes32String(stemId),
				publicSignals.nullifierHash,
				solidityProof,
			)
			console.log({ voteRes })

			// Get the receipt
			const receipt = await voteRes.wait()
			console.log({ receipt })
		} catch (e: any) {
			console.error(e)
		}
		setLoading(false)
	}

	return (
		<div>
			<Typography variant="h4">Stem Queue</Typography>
			<Button
				variant="outlined"
				size="large"
				onClick={handleUploadStemOpen}
				sx={styles.actionBtn}
				startIcon={<AddCircleOutline sx={{ fontSize: '32px' }} />}
			>
				Add Stem
			</Button>
			<Button
				variant="outlined"
				size="large"
				onClick={handleRegister}
				sx={styles.actionBtn}
				startIcon={userIsRegistered ? <Check sx={{ fontSize: '32px' }} /> : <HowToReg sx={{ fontSize: '32px' }} />}
				disabled={loading || userIsRegistered || !currentUser}
			>
				{loading ? (
					<CircularProgress size={20} sx={styles.loadingIcon} />
				) : userIsRegistered ? (
					'Currently Registered'
				) : (
					'Register to Vote'
				)}
			</Button>
			{details.queue.length === 0 ? (
				<Typography sx={styles.noStemsMsg}>The stem queue is currently empty for this project</Typography>
			) : (
				details.queue.map((stem, idx) => (
					<Box key={idx} sx={styles.stemWrapper}>
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
						<Button
							variant="contained"
							size="small"
							onClick={() => handleVote(stem.stem)}
							disabled={loading || !userIsRegistered || !currentUser}
						>
							{loading ? <CircularProgress size={20} sx={styles.loadingIcon} color="inherit" /> : 'Cast Vote'}
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
