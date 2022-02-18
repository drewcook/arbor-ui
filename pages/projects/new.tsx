import type { NextPage } from 'next'
import Head from 'next/head'
import Footer from '../../components/Footer'
import Notification from '../../components/Notification'
import AppHeader from '../../components/AppHeader'
import { Button, Container, TextField, Typography } from '@mui/material'
import { useState } from 'react'
import { post } from '../../utils/http'
import { useRouter } from 'next/router'

const styles = {
	centered: {
		textAlign: 'center',
	},
	submitBtn: {
		marginTop: 2,
	},
}

const NewProjectPage: NextPage = () => {
	const [name, setName] = useState('')
	const [description, setDescription] = useState('')
	const [successOpen, setSuccessOpen] = useState(false)
	const [successMsg, setSuccessMsg] = useState('')
	const [errorOpen, setErrorOpen] = useState(false)
	const [errorMsg, setErrorMsg] = useState('')
	const router = useRouter()

	const handleSubmit = async () => {
		try {
			const res = await post('/projects', { name, description })
			if (res.success) {
				setSuccessOpen(true)
				setSuccessMsg('Successfully created project')
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
				<title>ETHDenver Hack Web App | Create A New Project</title>
				<meta name="description" content="A hackathon music app" />
				<link rel="icon" href="/favicon.ico" />
			</Head>

			<AppHeader />

			<main>
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
					<Button
						variant="contained"
						color="primary"
						size="large"
						onClick={handleSubmit}
						fullWidth
						sx={styles.submitBtn}
					>
						Create Project
					</Button>
				</Container>
			</main>

			<Footer />
			{successOpen && (
				<Notification
					open={successOpen}
					msg={successMsg}
					type="success"
					onClose={onNotificationClose}
				/>
			)}
			{errorOpen && (
				<Notification open={errorOpen} msg={errorMsg} type="error" onClose={onNotificationClose} />
			)}
		</>
	)
}

export default NewProjectPage
