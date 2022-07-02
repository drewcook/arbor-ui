import detectEthereumProvider from '@metamask/detect-provider'
import { AddCircleOutline, Check, HowToReg } from '@mui/icons-material'
import { Box, Button, CircularProgress, Typography } from '@mui/material'
import { Strategy, ZkIdentity } from '@zk-kit/identity'
import { providers, utils } from 'ethers'
import dynamic from 'next/dynamic'
import { useState } from 'react'
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
	userIsCollaborator: boolean
	userIsRegisteredVoter: boolean
	uploadStemOpen: boolean
	handleUploadStemOpen: () => void
	handleUploadStemClose: () => void
	onStemUploadSuccess: (project: IProjectDoc) => void
	onVoteSuccess: (stemName: string) => void
	onApprovedSuccess: (stemName: string) => void
}

const StemQueue = (props: StemQueueProps): JSX.Element => {
	const {
		details,
		userIsCollaborator,
		userIsRegisteredVoter,
		handleUploadStemOpen,
		handleUploadStemClose,
		uploadStemOpen,
		onStemUploadSuccess,
		onVoteSuccess,
		onApprovedSuccess,
	} = props
	const [registerLoading, setRegisterLoading] = useState<boolean>(false)
	const [voteLoading, setVoteLoading] = useState<boolean>(false)
	const [approveLoading, setApproveLoading] = useState<boolean>(false)

	// TODO: implement playback with these queued stems
	const [stems, setStems] = useState<Map<number, any>>(new Map())

	const { contracts, currentUser } = useWeb3()

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
			setRegisterLoading(true)

			/*
				Create a user identity based off signing a message
				- @zk-kit/identity
			*/
			// TODO: Use signer from `contracts.ts' util file
			const ethereumProvider = (await detectEthereumProvider()) as any
			const provider = new providers.Web3Provider(ethereumProvider)
			const signer = provider.getSigner()
			const message = await signer.signMessage(
				"Sign this message to register for this Polyecho project's anonymous voting group. You are signing to create your anonymous identity with Semaphore.",
			)
			const identity = new ZkIdentity(Strategy.MESSAGE, message)
			const commitment: string = await identity.genIdentityCommitment().toString()

			/*
				Add the user's identity commitment to the on-chain group
			*/
			const contractRes = await contracts.stemQueue.addMemberToProjectGroup(details.votingGroupId, commitment, {
				from: currentUser.address,
			})
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
		setRegisterLoading(false)
	}

	const handleVote = async (stem: IStemDoc) => {
		try {
			// Preliminary requirement to be connected
			if (!currentUser) return
			setVoteLoading(true)

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
			const voteRes = await contracts.stemQueue.vote(
				utils.formatBytes32String(stemId),
				publicSignals.nullifierHash,
				solidityProof,
				{ from: currentUser.address },
			)
			console.log({ voteRes })

			// Get the receipt
			const receipt = await voteRes.wait()
			console.log({ receipt })

			// TODO: Update the project record vote count for the queued stem

			// Invoke the callback
			onVoteSuccess(stem.name)
		} catch (e: any) {
			console.error(e)
		}
		setVoteLoading(false)
	}

	/**
	 * This allows a collaborator to approve a stem that has at least one vote onto the project
	 * The stem will move from the queue to the list of project stems
	 * The user who uploaded the stem will become a collaborator
	 * @param {IStemDoc} stem - The stem to be added onto the project
	 */
	const handleApprove = async (stem: IStemDoc): void => {
		try {
			// User must be a collaborator
			if (!userIsCollaborator) return

			// Stem must be in the queue
			if (details.queue.filter(q => q.stem._id === stem._id).length === 0) {
				console.error("The stem must be in the project's stem queue")
				return
			}

			// TODO:
			// Stem must have at least one vote
			// if (details.queue.filter(q => q.stem._id === stem._id)[0].votes === 0) {
			// 	console.error('The stem must have at least one vote')
			// 	return
			// }

			setApproveLoading(true)

			/*
				Remove the queued stem from the list, add it to project stems
			*/
			const projectRes = await update(`/projects/${details._id}`, {
				...details,
				queue: details.queue.filter(q => q.stem._id !== stem._id),
				stems: [...details.stems, stem],
			})
			console.log({ projectRes })
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
			// const userRes = await update(`/users/${currentUser?.address}`, {
			// 	...currentUser,
			// 	voterIdentityCommitment: commitment,
			// 	registeredGroupIds: [...currentUser.registeredGroupIds, details.votingGroupId],
			// })
			// if (!userRes) {
			// 	console.error('Failed to add the group ID to the user record')
			// }

			// Invoke callback
			onApprovedSuccess(stem.name)
		} catch (e: any) {
			console.error(e)
		}
		setApproveLoading(false)
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
				startIcon={userIsRegisteredVoter ? <Check sx={{ fontSize: '32px' }} /> : <HowToReg sx={{ fontSize: '32px' }} />}
				disabled={registerLoading || userIsRegisteredVoter || !currentUser}
			>
				{registerLoading ? (
					<CircularProgress size={20} sx={styles.loadingIcon} />
				) : userIsRegisteredVoter ? (
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
							{/* TODO: read vote counts from on-chain contract */}
							<strong>Votes:</strong> {stem.votes}
						</Typography>
						<Button
							variant="contained"
							size="small"
							onClick={() => handleVote(stem.stem)}
							disabled={voteLoading || !userIsRegisteredVoter || !currentUser}
							sx={{ mr: 1 }}
						>
							{voteLoading ? <CircularProgress size={20} sx={styles.loadingIcon} color="inherit" /> : 'Cast Vote'}
						</Button>
						{userIsCollaborator && (
							<Button
								variant="outlined"
								size="small"
								onClick={() => handleApprove(stem.stem)}
								disabled={approveLoading}
								// TODO: disabled={approveLoading || stem.votes === 0}
							>
								{approveLoading ? <CircularProgress size={20} sx={styles.loadingIcon} color="inherit" /> : 'Approve'}
							</Button>
						)}
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
