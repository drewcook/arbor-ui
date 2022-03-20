import { Button, Container, TextField, Typography } from '@mui/material'
import type { NextPage } from 'next'
import Head from 'next/head'
import { useRouter } from 'next/router'
import { useState } from 'react'
import AppFooter from '../../components/AppFooter'
import AppHeader from '../../components/AppHeader'
import Notification from '../../components/Notification'
import TagsInput from '../../components/TagsInput'
import { useWeb3 } from '../../components/Web3Provider'
import { post } from '../../utils/http'
import type { CreateProjectPayload } from '../api/projects'

const styles = {
	title: {
		textTransform: 'uppercase',
		fontStyle: 'italic',
		fontWeight: 800,
		display: 'flex',
		justifyContent: 'center',
		alignItems: 'center',
		mb: 2,
	},
	subtitle: {
		fontStyle: 'italic',
		fontWeight: 300,
		textAlign: 'center',
		mb: 4,
	},
	text: {
		textAlign: 'center',
		mb: 2,
		fontWeight: 300,
		color: '#000',
		fontSize: '1.1rem',
	},
	submitBtn: {
		marginTop: 2,
		color: '#fff',
	},
}

const NewProjectPage: NextPage = () => {
	const [name, setName] = useState<string>('')
	const [description, setDescription] = useState<string>('')
	const [bpm, setBpm] = useState<number>(120)
	const [timeboxMins, setTimeboxMins] = useState<number>(2)
	const [tags, setTags] = useState<string[]>([])
	const [successOpen, setSuccessOpen] = useState<boolean>(false)
	const [successMsg, setSuccessMsg] = useState<string>('')
	const [errorOpen, setErrorOpen] = useState<boolean>(false)
	const [errorMsg, setErrorMsg] = useState<string>('')
	const router = useRouter()
	const { currentUser } = useWeb3()

	// Tags
	const handleAddTag = (tag: string) => setTags([...tags, tag])
	const handleRemoveTag = (tag: string) => setTags(tags.filter(t => t !== tag))

	const handleSubmit = async () => {
		try {
			if (!currentUser) {
				setErrorOpen(true)
				setErrorMsg('You must have a connected Web3 wallet to create a project')
				return
			}
			const payload: CreateProjectPayload = {
				createdBy: currentUser.address, // Use address rather than MongoDB ID
				collaborators: [currentUser.address], // start as only collaborator
				name,
				description,
				bpm,
				timeboxMins,
				tags,
			}
			const res = await post('/projects', payload)
			if (res.success) {
				setSuccessOpen(true)
				setSuccessMsg('Successfully created project, redirecting...')
				resetForm()
				// Redirect to project page
				router.push(`/projects/${res.data._id}`)
			} else {
				setErrorOpen(true)
				setErrorMsg('An error occurred creating the project')
			}
		} catch (e) {
			console.error('Project creation failed')
		}
	}

	const resetForm = () => {
		setName('')
		setDescription('')
		setBpm(120)
		setTimeboxMins(2)
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
				<title>PolyEcho | Create A New Project</title>
				<meta
					name="description"
					content="PolyEcho is a schelling game where the objective is to publicly co-create songs worthy of purchase by NFT collectors."
				/>
				<link rel="icon" href="/favicon.ico" />
			</Head>

			<AppHeader />

			<main id="app-main">
				<Container maxWidth="md">
					<Typography variant="h4" component="h1" sx={styles.title}>
						Create A New Project
					</Typography>
					<Typography variant="h5" sx={styles.subtitle}>
						Start a new project of your own so you can start uploading music stems and creating music.
					</Typography>
					<Typography sx={styles.text}>
						You can decide to be specific on what your project&apos;s direction and constraints are, if any, or choose
						to be completely open without guardrails. It&apos;s all your choice.
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
					/>
					<TextField
						label="Project Description"
						variant="filled"
						margin="normal"
						value={description}
						onChange={e => setDescription(e.target.value)}
						placeholder="Describe what your vision for this project is so that collaborators have a guiding star."
						fullWidth
					/>
					<TextField
						label="Project BPM"
						variant="filled"
						margin="normal"
						type="number"
						value={bpm}
						onChange={e => setBpm(parseInt(e.target.value))}
						placeholder="What BPM is this project targetting?"
						fullWidth
					/>
					<TextField
						label="Project Timebox (mins)"
						variant="filled"
						margin="normal"
						type="number"
						value={timeboxMins}
						onChange={e => setTimeboxMins(parseInt(e.target.value))}
						placeholder="Set a maximum limit on how long stems should be."
						fullWidth
					/>
					<TagsInput tags={tags} onAdd={tag => handleAddTag(tag)} onDelete={(tag: string) => handleRemoveTag(tag)} />
					<Button
						variant="contained"
						color="secondary"
						size="large"
						onClick={handleSubmit}
						fullWidth
						sx={styles.submitBtn}
					>
						Create Project
					</Button>
				</Container>
			</main>

			<AppFooter />
			{successOpen && <Notification open={successOpen} msg={successMsg} type="success" onClose={onNotificationClose} />}
			{errorOpen && <Notification open={errorOpen} msg={errorMsg} type="error" onClose={onNotificationClose} />}
		</>
	)
}

export default NewProjectPage
