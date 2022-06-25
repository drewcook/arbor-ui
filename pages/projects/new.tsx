import { Button, CircularProgress, Container, TextField, Typography } from '@mui/material'
import type { NextPage } from 'next'
import Head from 'next/head'
import { useRouter } from 'next/router'
import { useState } from 'react'
import Notification from '../../components/Notification'
import TagsInput from '../../components/TagsInput'
import { useWeb3 } from '../../components/Web3Provider'
import { newProjectStyles as styles } from '../../styles/Projects.styles'
import { post } from '../../utils/http'
import type { CreateProjectPayload } from '../api/projects'

const Group = require('@semaphore-protocol/group').Group
const Identity = require('@semaphore-protocol/identity').Identity

const NewProjectPage: NextPage = () => {
	const [name, setName] = useState<string>('')
	const [description, setDescription] = useState<string>('')
	const [bpm, setBpm] = useState<number>(120)
	const [trackLimit, setTrackLimit] = useState<number>(10)
	const [tags, setTags] = useState<string[]>([])
	const [loading, setLoading] = useState<boolean>(false)
	const [successOpen, setSuccessOpen] = useState<boolean>(false)
	const [successMsg, setSuccessMsg] = useState<string>('')
	const [errorOpen, setErrorOpen] = useState<boolean>(false)
	const [errorMsg, setErrorMsg] = useState<string>('')
	const router = useRouter()
	const { currentUser, web3 } = useWeb3()

	// Form Field Handlers
	const handleSetBpm = (e: any) => {
		// Minimum is zero, prevent negatives
		let val = parseInt(e.target.value)
		if (val < 0) val = 0
		// Maximum is 1000
		if (val > 1000) val = 1000
		setBpm(val)
	}
	const handleSetTrackLimit = (e: any) => {
		// Minimum is zero, prevent negatives
		let val = parseInt(e.target.value)
		if (val < 0) val = 0
		// Maximum is 1000
		if (val > 1000) val = 1000
		setTrackLimit(val)
	}
	const handleAddTag = (tag: string) => setTags([...tags, tag])
	const handleRemoveTag = (tag: string) => setTags(tags.filter(t => t !== tag))

	const handleSubmit = async () => {
		try {
			if (!currentUser) {
				setErrorOpen(true)
				setErrorMsg('Please connect your Web3 wallet')
				return
			}

			if (!description || !name || !bpm || !trackLimit) {
				setErrorOpen(true)
				setErrorMsg('Please enter in the required fields')
				return
			}
			setLoading(true)
			// Create new Semaphore group for the project
			// Default parameters: treeDepth = 20, zeroValue = BigInt(0).
			const group = new Group()

			// Create an identity commitment for the project creator
			const signature = await web3?.eth.personal.sign(
				'Sign this message to create your anonymous identity with Semaphore. This will allow you to vote and approve stems onto your project.',
				currentUser.address,
				'testPassword',
			)
			const identity = new Identity(signature)
			const identityCommitment = identity.generateCommitment()

			// Add identity commitment to the new group
			group.addMember(identityCommitment)

			// Submit to backend
			const payload: CreateProjectPayload = {
				createdBy: currentUser.address, // Use address rather than MongoDB ID
				collaborators: [currentUser.address], // start as only collaborator
				name,
				description,
				bpm,
				trackLimit,
				tags,
				group,
			}
			const res = await post('/projects', payload)
			if (res.success) {
				setSuccessMsg('Successfully created project, redirecting...')
				resetForm()
				// Redirect to project page
				router.push(`/projects/${res.data._id}`)
			} else {
				setErrorOpen(true)
				setErrorMsg('An error occurred creating the project')
			}
			setLoading(false)
		} catch (e: any) {
			setLoading(false)
			console.error('Project creation failed', e.message)
		}
	}

	const resetForm = () => {
		setName('')
		setDescription('')
		setBpm(120)
		setTrackLimit(10)
		setTags([])
	}

	const onNotificationClose = () => {
		setSuccessOpen(false)
		setSuccessMsg('')
		setErrorOpen(false)
		setErrorMsg('')
	}

	return (
		<>
			<Head>
				<title>Polyecho | Create A New Project</title>
			</Head>
			<Container maxWidth="md">
				<Typography variant="h4" component="h1" sx={styles.title}>
					Create A New Project
				</Typography>
				<Typography variant="h5" sx={styles.subtitle}>
					Start a new project of your own so you can start uploading music stems and creating music.
				</Typography>
				<Typography sx={styles.text}>
					You can decide to be specific on what your project&apos;s direction and constraints are, if any, or choose to
					be completely open without guardrails. It&apos;s all your choice.
				</Typography>
				<Typography sx={styles.text}>Just start by filling out the details below.</Typography>
				<TextField
					label="Project Name"
					variant="filled"
					margin="normal"
					value={name}
					onChange={e => setName(e.target.value)}
					placeholder="Give it a catchy name!"
					fullWidth
					required
				/>
				<TextField
					label="Project Description"
					variant="filled"
					margin="normal"
					value={description}
					onChange={e => setDescription(e.target.value)}
					placeholder="Describe what your vision for this project is so that collaborators have a guiding star."
					fullWidth
					required
				/>
				<TextField
					label="Project BPM"
					variant="filled"
					margin="normal"
					type="number"
					value={bpm}
					onChange={handleSetBpm}
					placeholder="What BPM is this project targetting?"
					fullWidth
					required
				/>
				<TextField
					label="Track Limit"
					variant="filled"
					margin="normal"
					type="number"
					value={trackLimit}
					onChange={handleSetTrackLimit}
					placeholder="Set a maximum limit of tracks that can be uploaded to this project."
					fullWidth
					required
				/>
				<TagsInput tags={tags} onAdd={tag => handleAddTag(tag)} onDelete={(tag: string) => handleRemoveTag(tag)} />
				<Button
					variant="contained"
					color="secondary"
					size="large"
					onClick={handleSubmit}
					fullWidth
					sx={styles.submitBtn}
					disabled={loading}
				>
					{loading ? <CircularProgress /> : 'Create Project'}
				</Button>
			</Container>
			{successOpen && <Notification open={successOpen} msg={successMsg} type="success" onClose={onNotificationClose} />}
			{errorOpen && <Notification open={errorOpen} msg={errorMsg} type="error" onClose={onNotificationClose} />}
		</>
	)
}

export default NewProjectPage
