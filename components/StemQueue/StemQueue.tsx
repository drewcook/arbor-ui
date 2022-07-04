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
	onRegisterSuccess: (project: IProjectDoc) => void
	onVoteSuccess: (project: IProjectDoc, stemName: string) => void
	onApprovedSuccess: (project: IProjectDoc, stemName: string) => void
	onFailure: (msg: string) => void
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
		onRegisterSuccess,
		onVoteSuccess,
		onApprovedSuccess,
		onFailure,
	} = props
	const [registerLoading, setRegisterLoading] = useState<boolean>(false)
	const [voteLoading, setVoteLoading] = useState<boolean>(false)
	const [approveLoading, setApproveLoading] = useState<boolean>(false)
	const [stems, setStems] = useState<Map<number, any>>(new Map())
	const { contracts, currentUser, updateCurrentUser } = useWeb3()
	const [ident, setIdent] = useState<any>(null)

	/*
		Stem Player callbacks
	*/
	const onWavesInit = (idx: number, ws: any) => {
		const tmp = new Map(details.queue.entries())
		tmp.set(idx, ws)
		setStems(tmp)
	}

	// Play the wavesurfer file
	const handlePlay = (id: number) => {
		const stem = stems.get(id)
		if (stem) stem.play()
	}

	// Stop playing the track
	const handleStop = (id: number) => {
		const stem = stems.get(id)
		if (stem) stem.stop()
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
				Create a user identity based off signing a message with the current signer
			*/
			const ethereumProvider = (await detectEthereumProvider()) as any
			const provider = new providers.Web3Provider(ethereumProvider)
			const signer = provider.getSigner()
			const message = await signer.signMessage(
				"Sign this message to register for this Polyecho project's anonymous voting group. You are signing to create your anonymous identity with Semaphore.",
			)
			const identity = new ZkIdentity(Strategy.MESSAGE, message)
			const commitment: string = await identity.genIdentityCommitment().toString()
			const trapdoor = identity.getTrapdoor()
			const nullifier = identity.getNullifier()
			const voterIdentity = {
				commitment,
				nullifier,
				trapdoor,
			}
			console.log({ voterIdentity })
			setIdent(voterIdentity)

			/*
				Add the user's identity commitment to the on-chain group
			*/
			const contractRes = await contracts.stemQueue.addMemberToProjectGroup(details.votingGroupId, commitment, {
				from: currentUser.address,
				gasLimit: 650000,
			})
			if (!contractRes) {
				console.error("Failed to register the user for the project's voting group")
			}

			/*
				Update the user record
				- Add in the new identity for the user if there isn't one already
				- Add in the group ID for user's registered groups if it doesn't exist already
				- NOTE: This will help to show the appropriate UI elements/state
				TODO: Probably should allow multiple identities so a user can vote on multiple projects without error
			*/
			const userRes = await update(`/users/${currentUser?.address}`, {
				...currentUser,
				voterIdentityCommitment: !currentUser.voterIdentityCommitment
					? commitment
					: currentUser.voterIdentityCommitment,
				registeredGroupIds: currentUser.registeredGroupIds.includes(details.votingGroupId)
					? currentUser.registeredGroupIds
					: [...currentUser.registeredGroupIds, details.votingGroupId],
			})
			if (!userRes.success) console.error('Failed to add the group ID to the user record')
			// Update current user details
			updateCurrentUser(userRes.data)

			/*
				Add the user identity to the list of project's registered identities
				- This is so we can generate an off-chain group to submit an off-chain proof of
				- NOTE: There's not an easy way to translate the on-chain groups[groupId] as an off-chain Group object
			*/
			const projectRes = await update(`/projects/${details._id}`, {
				...details,
				voterIdentityCommitments: [...details.voterIdentityCommitments, commitment],
			})
			if (!projectRes.success) {
				console.error('Failed to add the identity to the project record')
			}

			// Invoke the callback
			onRegisterSuccess(projectRes.data)
		} catch (e: any) {
			onFailure('Uh oh! Failed register for the voting group')
			console.error(e.message)
		}
		setRegisterLoading(false)
	}

	const handleVote = async (stem: IStemDoc) => {
		try {
			// Preliminary requirement to be connected
			if (!currentUser || !ident) return
			setVoteLoading(true)

			// Signal will be the MongoDB ObjectId for the stem record being voted on
			const stemId: string = stem._id.toString()

			/*
				Generate an off-chain proof to submit to the backend contracts for signalling and verification
					1. Re-instantiate a new ZKIdentity using the user's identity commitment from the previously signed message via EOA wallet
					2. Get all identity commitments of the semaphore group so that we can calculate the Merkle root
					3. Generate the Merkle proof given the above two pieces of data
					4. Create the full proof
					5. Call the smart contract to verify the proof that this user is part of the group
			*/

			// Re-create the identity
			// const voterIdentity = new ZkIdentity(Strategy.MESSAGE, currentUser?.voterIdentityCommitment)
			// console.log(ident, voterIdentity, ident === voterIdentity)
			// console.log({ voterIdentity })

			// Get the other group members' identities
			const identityCommitments: bigint[] = []
			for (const commitment of details.voterIdentityCommitments) {
				identityCommitments.push(BigInt(commitment))
			}
			console.log({ identityCommitments })

			// Generate the Merkle proof
			const merkleProof = generateMerkleProof(20, BigInt(0), identityCommitments, ident.commitment)
			console.log({ merkleProof })

			// Generate the witness
			const witness = Semaphore.genWitness(ident.trapdoor, ident.nullifier, merkleProof, merkleProof.root, stemId)
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
				{ from: currentUser.address, gasLimit: 650000 },
			)
			console.log({ voteRes })

			// Get the receipt
			// const receipt = await voteRes.wait()
			// console.log({ receipt })

			// Update the project record vote count for the queued stem
			const projectRes = await update(`/projects/${details._id}`, {
				...details,
				queue: details.queue.map(q => {
					return q.stem._id === stem._id
						? {
								stem: q.stem,
								votes: q.votes + 1,
						  }
						: q
				}),
			})
			console.log({ projectRes })
			if (!projectRes.success) throw new Error('Failed to increment stem vote count')

			// Invoke the callback
			onVoteSuccess(projectRes.data, stem.name)
		} catch (e: any) {
			onFailure('Uh oh! Failed to cast the vote')
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
	const handleApprove = async (stem: IStemDoc) => {
		try {
			// User must be a collaborator
			if (!userIsCollaborator) return

			// Stem must be in the queue
			if (details.queue.filter(q => q.stem._id === stem._id).length === 0) {
				console.error("The stem must be in the project's stem queue")
				return
			}

			// Stem must have at least one vote
			if (details.queue.filter(q => q.stem._id === stem._id)[0].votes === 0) {
				console.error('The stem must have at least one vote')
				return
			}

			setApproveLoading(true)

			/*
				Remove the queued stem from the list, add it to project stems
				Add the user who uploaded it to the list of project collaborators
				NOTE: We don't update the user's projects since they didn't create it
				NOTE: In the future, we could have a list of projects a user has collaborated on tied to their record
			*/
			const projectRes = await update(`/projects/${details._id}`, {
				...details,
				queue: details.queue.filter(q => q.stem._id !== stem._id),
				stems: [...details.stems, stem],
				collaborators: [...details.collaborators, stem.createdBy],
			})
			console.log({ projectRes })
			if (!projectRes.success) throw new Error('Failed to update the project record')

			// Invoke the callback
			onApprovedSuccess(projectRes.data, stem.name)
		} catch (e: any) {
			onFailure('Uh oh! Failed to approve the stem onto the project')
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
							isQueued
							idx={idx + 1}
							details={stem.stem}
							onWavesInit={onWavesInit}
							onPlay={handlePlay}
							onStop={handleStop}
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
								disabled={approveLoading || stem.votes === 0}
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
