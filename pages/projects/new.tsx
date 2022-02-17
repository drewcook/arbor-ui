import type { NextPage } from 'next'
import Head from 'next/head'
import Footer from '../../components/Footer'
import Notification from '../../components/Notification'
import Header from '../../components/Header'
import { Button, Container, TextField, Typography } from '@mui/material'
import { useState } from 'react'
import { post } from '../../utils/http'
import { useRouter } from 'next/router'
import { ResetTvOutlined } from '@mui/icons-material'

const styles = {
	centered: {
		textAlign: 'center',
	},
	submitBtn: {
		marginTop: 2,
	},
	formCaption: {
		marginY: 3,
		textAlign: 'center',
		fontStyle: 'italic',
		color: '#555',
	},
}

type NewProjectResponseData = {
	id: string,
	status: string,
}

const NewProjectPage: NextPage = () => {
	const [name, setName] = useState('')
	const [description, setDescription] = useState('')
	const [successOpen, setSuccessOpen] = useState(false)
	const [successMsg, setSuccessMsg] = useState('')
	const router = useRouter()

	const handleSubmit = async () => {
		try {
			const res: NewProjectResponseData = await post('/project/create', { name, description })
			console.log('added return data', { res })
			setSuccessOpen(true)
			setSuccessMsg('Successfully created fundraiser')
			resetForm()
			// Redirect to project page if success
			// if (status === 'ongoing') router.push(`/projects/${id}`)
		} catch (e) {
			console.error(e)
		}
	}

	const resetForm = () => {
		setName('')
		setDescription('')
	}

	const onNotificationClose = () => {
		setSuccessOpen(false)
		setSuccessMsg('')
	}

	return (
		<>
			<Head>
				<title>ETHDenver Hack Web App | Create A New Project</title>
				<meta name="description" content="A hackathon music app" />
				<link rel="icon" href="/favicon.ico" />
			</Head>

			<Header />

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
		</>
	)
}

export default NewProjectPage
