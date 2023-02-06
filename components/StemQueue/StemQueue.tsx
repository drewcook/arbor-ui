import { Button, ButtonGroup, CircularProgress } from '@mui/material'
import { Strategy, ZkIdentity } from '@zk-kit/identity'
import { utils } from 'ethers'
import { useEffect, useState } from 'react'

import type { IProjectDoc } from '../../models/project.model'
import { IStemDoc } from '../../models/stem.model'
import { update } from '../../utils/http'
import { useWeb3 } from '../Web3Provider'
import styles from './StemQueue.styles'

const generateMerkleProof = require('@zk-kit/protocols').generateMerkleProof
const Semaphore = require('@zk-kit/protocols').Semaphore

type StemQueueProps = {
	details: IProjectDoc
	userIsCollaborator: boolean
	userIsRegisteredVoter: boolean
	stem: IQueuedStem
	idx: number
	onVoteSuccess: (project: IProjectDoc, stemName: string) => void
	onApprovedSuccess: (project: IProjectDoc, stemName: string) => void
	onFailure: (msg: string) => void
}
export interface IQueuedStem {
	stem: IStemDoc
	votes: number
}

const StemQueue = (props: StemQueueProps): JSX.Element => {
	const { details, userIsCollaborator, userIsRegisteredVoter, onVoteSuccess, onApprovedSuccess, onFailure, stem, idx } =
		props
	const [loadingState, setLoadingState] = useState<{ loading?: boolean }>({})
	const [approveLoading, setApproveLoading] = useState<boolean>(false)
	const { contracts, currentUser } = useWeb3()

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

	const handleVote = async (stem: IStemDoc, idx: number) => {
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

			console.error(e)
		}

		setVoteIsLoading(idx, false)
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
			<ButtonGroup sx={{ mt: 1, ml: 0.5 }} orientation="vertical">
				<Button
					variant="contained"
					size="small"
					sx={styles.btn}
					onClick={() => handleVote(stem.stem, idx)}
					disabled={loadingState.loading || !userIsRegisteredVoter || !currentUser}
				>
					{voteIsLoading(idx) ? (
						<>
							<CircularProgress size={20} sx={styles.loadingIcon} color="inherit" /> {'  Vote Pending'}
						</>
					) : (
						'Vote'
					)}
				</Button>
				{userIsCollaborator && (
					<Button
						variant="contained"
						size="small"
						sx={styles.btn}
						onClick={() => handleApprove(stem.stem)}
						disabled={approveLoading || stem.votes === 0}
					>
						{approveLoading ? <CircularProgress size={20} sx={styles.loadingIcon} color="inherit" /> : 'Approve'}
					</Button>
				)}
			</ButtonGroup>
		</div>
	)
}

export default StemQueue
