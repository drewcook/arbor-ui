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
	centered: {
		textAlign: 'center',
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
				<Container maxWidth="md" sx={styles.centered}>
					<Typography variant="h3" component="h1">
						Create A New Project
					</Typography>
					<Typography>Create a new project by filling out the details below.</Typography>
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
						placeholder="Set a maximum limit on how long samples should be."
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
