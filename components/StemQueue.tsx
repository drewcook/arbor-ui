import { AddCircleOutline, Check, HowToReg } from '@mui/icons-material'
import { Box, Button, CircularProgress, Typography } from '@mui/material'
import { Strategy, ZkIdentity } from '@zk-kit/identity'
import { utils } from 'ethers'
import dynamic from 'next/dynamic'
import { useEffect, useState } from 'react'

import { update } from '../lib/http'
import logger from '../lib/logger'
import type { ProjectDoc } from '../models'
import { StemDoc } from '../models'
import { IUserIdentity } from '../models/user.model'
import signMessage from '../utils/signMessage'
import styles from './StemQueue.styles'
import StemUploadDialog from './StemUploadDialog'
import { useWeb3 } from './Web3Provider'

const StemPlayer = dynamic(() => import('./StemPlayer'), { ssr: false })

const generateMerkleProof = require('@zk-kit/protocols').generateMerkleProof
const Semaphore = require('@zk-kit/protocols').Semaphore

const IDENTITY_MSG =
	"Sign this message to register for this Arbor project's anonymous voting group. You are signing to create your anonymous identity with Semaphore."

type StemQueueProps = {
	details: ProjectDoc
	userIsCollaborator: boolean
	userIsRegisteredVoter: boolean
	uploadStemOpen: boolean
	handleUploadStemOpen: () => void
	handleUploadStemClose: () => void
	onStemUploadSuccess: (project: ProjectDoc) => void
	onRegisterSuccess: (project: ProjectDoc) => void
	onVoteSuccess: (project: ProjectDoc, stemName: string) => void
	onApprovedSuccess: (project: ProjectDoc, stemName: string) => void
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
	const [loadingState, setLoadingState] = useState<{ loading?: boolean }>({})
	const [approveLoading, setApproveLoading] = useState<boolean>(false)
	const [stems, setStems] = useState<Map<number, any>>(new Map())
	const { contracts, currentUser, updateCurrentUser } = useWeb3()

	useEffect(() => {
		const obj = {}
		details.queue.map((_, idx) => (obj[idx] = false))
		setLoadingState(obj)
	}, [details])

	const voteIsLoading = (idx: number) => loadingState[idx] == true

	const setVoteIsLoading = (idx: number, trueOrFalse: boolean) => {
		setLoadingState({
			...loadingState,
			[idx]: trueOrFalse,
			loading: Object.keys(loadingState).some(k => !loadingState[k]),
		})
	}

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
			const message = await signMessage(IDENTITY_MSG)
			const identity: ZkIdentity = new ZkIdentity(Strategy.MESSAGE, message)
			const commitment: string = identity.genIdentityCommitment().toString()
			const trapdoor: string = identity.getTrapdoor().toString()
			const nullifier: string = identity.getNullifier().toString()
			const voterIdentity: IUserIdentity = {
				commitment,
				nullifier,
				trapdoor,
				votingGroupId: details.votingGroupId,
			}

			/*
				Add the user's identity commitment to the on-chain group
			*/
			const contractRes = await contracts.stemQueue.addMemberToProjectGroup(details.votingGroupId, commitment, {
				from: currentUser.address,
				gasLimit: 2000000,
			})
			if (!contractRes) console.error("Failed to register the user for the project's voting group")

			// Get the receipt
			const receipt = await contractRes.wait()
			console.log('register voter receipt', receipt)

			/*
				Update the user record
				- A couple preventative measures are in place...
				- Add in the new identity for the user if there isn't one already for the given project
				- Add in the group ID for user's registered groups if it doesn't exist already
				- NOTE: This will help to show the appropriate UI elements/state
			*/
			const userRes = await update(`/users/${currentUser.address}`, {
				...currentUser,
				// TODO: Use MongoDB $addToSet on the backend, maybe?
				voterIdentities: currentUser.voterIdentities.find(i => i.votingGroupId === details.votingGroupId)
					? currentUser.voterIdentities
					: [...currentUser.voterIdentities, voterIdentity],
				registeredGroupIds: currentUser.registeredGroupIds.includes(details.votingGroupId)
					? currentUser.registeredGroupIds
					: [...currentUser.registeredGroupIds, details.votingGroupId],
			})
			if (!userRes.success) console.error('Failed to add the identity or group ID to the user record')

			// Update current user details
			updateCurrentUser(userRes.data)

			/*
				Add the user identity to the list of project's registered identities
				- This is so we can generate an off-chain group to submit an off-chain proof of
				- NOTE: There's not an easy way to translate the on-chain groups[groupId] as an off-chain Group object
			*/
			const projectRes = await update(`/projects/${details._id}`, {
				...details,
				voterIdentities: [...details.voterIdentities, voterIdentity],
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

	const handleVote = async (stem: StemDoc, idx: number) => {
		try {
			// Preliminary requirement to be connected
			if (!currentUser) return

			setVoteIsLoading(idx, true)

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

			// Find the user's identity for the project/group
			// const message = await signMessage(IDENTITY_MSG)
			// const voterIdentity = new ZkIdentity(Strategy.MESSAGE, message)
			const voterIdentity = currentUser.voterIdentities.find(i => i.votingGroupId === details.votingGroupId)
			if (!voterIdentity) return

			// Get the other group members' identities
			const identityCommitments: string[] = []
			for (const identity of details.voterIdentities) {
				identityCommitments.push(identity.commitment)
			}

			// Generate the Merkle proof
			// External nullifier is derived from the stem ID
			const merkleProof = generateMerkleProof(20, BigInt(0), identityCommitments, voterIdentity.commitment)
			const stemZKIdentity: ZkIdentity = new ZkIdentity(Strategy.MESSAGE, stemId)
			const externalNullifier = stemZKIdentity.genIdentityCommitment()

			// Generate the witness
			const witness = Semaphore.genWitness(
				voterIdentity.trapdoor,
				voterIdentity.nullifier,
				merkleProof,
				externalNullifier,
				stemId,
			)

			// Generate the proofs
			const { proof, publicSignals } = await Semaphore.genProof(
				witness,
				'/zkproof/semaphore.wasm',
				'/zkproof/semaphore.zkey',
			)
			const solidityProof = Semaphore.packToSolidityProof(proof)

			// Submit the vote signal and proof to the smart contract
			const voteRes = await contracts.stemQueue.vote(
				utils.formatBytes32String(stemId),
				details.votingGroupId,
				publicSignals.externalNullifier,
				publicSignals.nullifierHash,
				solidityProof,
				{
					from: currentUser.address,
					gasLimit: 2000000,
				},
			)
			/*
			ByHarsh: This code executed before transaction complete.So always shows trasaction failed.
					So I Commented code. This is not required.
			if (!voteRes.success) throw new Error('Failed to cast an on-chain anonymous vote')
			console.log({ voteRes })
		*/
			// const offchainVerifyRes = await contracts.stemQueue.verifyProof(verificationKey, fullProof)
			// console.log({ offchainVerifyRes, voteRes })

			// Get the receipt
			const receipt = await voteRes.wait()
			console.log('vote receipt', receipt)

			// Get on chain vote count and stored in DB
			const voteCount = await contracts.stemQueue.stemVoteCounts(utils.formatBytes32String(stemId), {
				from: currentUser.address,
			})

			// // Update the project record vote count for the queued stem
			const projectRes = await update(`/projects/${details._id}`, {
				...details,
				queue: details.queue.map(q => {
					return q.stem._id === stem._id
						? {
								stem: q.stem,
								votes: voteCount.toString(),
						  }
						: q
				}),
			})
			if (!projectRes.success) throw new Error('Failed to increment stem vote count')

			// Invoke the callback
			onVoteSuccess(projectRes.data, stem.name)
		} catch (e: any) {
			const reason = JSON.parse(JSON.stringify(e))
			if (Object.prototype.hasOwnProperty.call(reason, 'error')) {
				if (
					reason.error.data.message === 'execution reverted: SemaphoreCore: you cannot use the same nullifier twice'
				) {
					onFailure('Uh oh! You can not cast vote twice on same stem.')
				}
			} else {
				onFailure('Uh oh! Failed to cast the vote.')
			}

			logger.red(e)
		}

		setVoteIsLoading(idx, false)
	}

	/**
	 * This allows a collaborator to approve a stem that has at least one vote onto the project
	 * The stem will move from the queue to the list of project stems
	 * The user who uploaded the stem will become a collaborator
	 * @param {StemDoc} stem - The stem to be added onto the project
	 */
	const handleApprove = async (stem: StemDoc) => {
		try {
			// User must be a collaborator
			if (!userIsCollaborator) return

			// Stem must be in the queue
			if (details.queue.filter(q => q.stem._id === stem._id).length === 0) {
				logger.red("The stem must be in the project's stem queue")
				return
			}

			// Stem must have at least one vote
			if (details.queue.filter(q => q.stem._id === stem._id)[0].votes === 0) {
				logger.red('The stem must have at least one vote')
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
			if (!projectRes.success) throw new Error('Failed to update the project record')

			// Invoke the callback
			onApprovedSuccess(projectRes.data, stem.name)
		} catch (e: any) {
			onFailure('Uh oh! Failed to approve the stem onto the project')
			logger.red(e)
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
							onClick={() => handleVote(stem.stem, idx)}
							disabled={loadingState.loading || !userIsRegisteredVoter || !currentUser}
							sx={{ mr: 1 }}
						>
							{voteIsLoading(idx) ? (
								<>
									<CircularProgress size={20} sx={styles.loadingIcon} color="inherit" />
									&nbsp;&nbsp;
									{'Vote Pending'}
								</>
							) : (
								'Cast Vote'
							)}
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
