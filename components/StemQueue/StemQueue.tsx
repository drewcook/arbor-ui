import detectEthereumProvider from '@metamask/detect-provider'
import { AddCircleOutline, Check, HowToReg } from '@mui/icons-material'
import { Box, Button, CircularProgress, Typography } from '@mui/material'
import { ethers, utils } from 'ethers'
import dynamic from 'next/dynamic'
import { useState } from 'react'
import type { IProjectDoc } from '../../models/project.model'
import { IStemDoc } from '../../models/stem.model'
import { update } from '../../utils/http'
import StemUploadDialog from '../StemUploadDialog'
import { useWeb3 } from '../Web3Provider'
import styles from './StemQueue.styles'

const createIdentity = require('@interep/identity')
const createProof = require('@interep/proof')
// const Group = require('@semaphore-protocol/group').Group
// const Identity = require('@semaphore-protocol/identity').Identity
// const generateProof = require('@semaphore-protocol/proof').generateProof
// const packToSolidityProof = require('@semaphore-protocol/proof').packToSolidityProof

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

	// const [projectDetails, setProjectDetails] = useState<IProjectDoc>(details)
	const [loading, setLoading] = useState<boolean>(false)
	const [stems, setStems] = useState<Map<number, any>>(new Map())

	const { currentUser } = useWeb3()
	const userIsRegistered: boolean = currentUser?.registeredGroupIds.includes(details.votingGroupId) ?? false
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
				- @interep/identity
			*/
			const ethereumProvider = (await detectEthereumProvider()) as any
			const provider = new ethers.providers.Web3Provider(ethereumProvider)
			const signer = provider.getSigner()
			const identity = await createIdentity(message => signer.signMessage(message), 'Polyecho')
			console.log({ identity })

			/* TODO: Delete this
				We're currently able to register multiple times to a group with the same user.
				- Is this supposed to be allowed?
				- The commitment does not seem to be different, since we re-use the existing identity
				- Consider storing nullifier and trapdoor values to the user record and reuse them maybe?
			*/
			// const identity = new Identity(currentUser?.identity)
			// const commitment = identity.generateCommitment()

			// Add the user's identity commitment to the on-chain group
			// const contractRes = await stemQueueContract.addMemberToProjectGroup(details.votingGroupId, commitment)
			// if (!contractRes) {
			// 	console.error("Failed to register the user for the project's voting group")
			// }

			/*
				Add the identity to the list of project's registered identities
				- This is so we can generate an off-chain group to submit an off-chain proof of
				- NOTE: There's not an easy way to translate the on-chain groups[groupId] as an off-chain Group object
			*/
			const projectRes = await update(`/projects/${details._id}`, {
				...details,
				registeredVoterIdentities: [...details.registeredVoterIdentities, identity],
			})
			if (!projectRes) {
				console.error('Failed to add the identity to the project record')
			}
			console.log({ projectRes })

			/*
				Update the user record
				- Add in the new identity for the user
				- Add in the group Id
				- NOTE: This will help to show the appropriate UI elements/state
			*/
			const userRes = await update(`/users/${currentUser?.address}`, {
				...currentUser,
				identity: identity.toString(),
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
		console.log('accept', stem._id)
		try {
			// Preliminary requirement to be connected
			if (!currentUser) return
			setLoading(true)
			/* THIS IS AN ATTEMPTED WORKAROUND TO MIMIC THE ONCHAIN GROUP WITH AN OFFCHAIN ONE TO CREATE AN OFFCHAIN PROOF
				Prep for submitting the on-chain vote
				- Create a new Identity object for the current user's identity
				- Add a new Group object and add registered members registered members of the project to it
				- Get the on-chain group and root
				- Create the signal for the stem ID
				- Generate the proof
				- Invoke the on-chain vote method with the proof and signal
			*/
			// const voterIdentity = new Identity(currentUser?.identity)
			// const group = new Group()
			// group.addMember(voterIdentity.generateCommitment())
			// for (const identity of details.registeredVoterIdentities) {
			// 	const registeredIdentity = new Identity(identity)
			// 	group.addMember(registeredIdentity.generateCommitment())
			// }
			// const externalNullifier = group.root
			// Create a unique signal based off of the stemId + modulus of a large prime
			const signal = utils.formatBytes32String(stem._id.toString())
			/*
				Generate an off-chain proof to submit to submit to the backend contracts for signalling and verification
			*/
			// const { proof, publicSignals } = await generateProof(
			// 	voterIdentity,
			// 	group,
			// 	externalNullifier,
			// 	stem._id.toString(),
			// 	{
			// 		wasmFilePath: '/zkproof/semaphore.wasm',
			// 		zkeyFilePath: '/zkproof/semaphore.zkey',
			// 	},
			// )
			// const solidityProof = packToSolidityProof(proof)
			// console.log({ proof, publicSignals, solidityProof })

			/*
				Create the off-chain proof
				- @interep/proof
			*/
			const identity = currentUser.identity
			const groupId = { provider: 'polyecho', name: 'polyecho' }
			const externalNullifier = 1
			const zkFiles = {
				wasmFilePath: '/zkproof/semaphore.wasm',
				zkeyFilePath: '/zkproof/semaphore.zkey',
			}
			const response = await createProof(identity, groupId, externalNullifier, signal, zkFiles)
			console.log({ response })

			/*
				Submit the vote signal and proof to the smart contract
			*/
			// const voteRes = await stemQueueContract.vote(signal, publicSignals.nullifierHash, solidityProof)
			// console.log({ voteRes })
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
