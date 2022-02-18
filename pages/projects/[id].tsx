import { useState } from 'react'
import type { GetServerSideProps, NextPage } from 'next'
import Head from 'next/head'
import Footer from '../../components/Footer'
import AppHeader from '../../components/AppHeader'
import { get } from '../../utils/http'
import {
	Avatar,
	Box,
	Button,
	Container,
	Divider,
	Grid,
	Icon,
	IconButton,
	Paper,
	Typography,
} from '@mui/material'
import { IProjectDoc } from '../../models/project.model'
import { ArrowBack, ArrowForward } from '@mui/icons-material'
import formatAddress from '../../utils/formatAddress'

const styles = {
	error: {
		textAlign: 'center',
		marginY: 4,
	},
	title: {},
	desc: {
		textTransform: 'uppercase',
		mb: 4,
	},
	sidebar: {
		p: 3,
	},
	divider: {
		my: 3,
	},
	stats: {
		display: 'flex',
		justifyContent: 'space-between',
		alignItems: 'center',
	},
	stat: {
		textTransform: 'uppercase',
		fontSize: '1.25rem',
	},
	statSmall: {
		fontSize: '.75rem',
		color: '#ccc',
	},
	pioneer: {},
	collaborators: {},
	account: {
		display: 'flex',
		justifyContent: 'flex-start',
		alignItems: 'center',
		py: 2,
	},
	avatar: {
		marginRight: 0.5,
		height: 24,
		width: 24,
	},
	address: {
		color: '#fff',
	},
	cut: {
		py: 3,
	},
}

type ProjectPageProps = {
	data: IProjectDoc | null,
}

const ProjectPage: NextPage<ProjectPageProps> = props => {
	const { data } = props
	const [sidebarOpen, setSidebarOpen] = useState(true)
	const pioneerAddress = '3209r2nkxnd39023092nkl3209'

	const toggleSidebar = () => {
		setSidebarOpen(!sidebarOpen)
	}

	const handleCut = () => {
		console.log('cutting new sample')
	}

	return (
		<>
			<Head>
				<title>ETHDenver Hack Web App | Create A New Project</title>
				<meta name="description" content="A hackathon music app" />
				<link rel="icon" href="/favicon.ico" />
			</Head>

			<AppHeader />

			<main id="app-main">
				<Container maxWidth="xl">
					{data ? (
						<>
							<Grid container spacing={4}>
								<Grid item md={9}>
									<Typography gutterBottom variant="h3" component="h2" sx={styles.title}>
										{data.name}
									</Typography>
									<Typography sx={styles.desc}>{data.description}</Typography>
									<Divider light sx={styles.divider} />
								</Grid>
								<Grid item md={3}>
									<Paper sx={styles.sidebar}>
										<IconButton onClick={toggleSidebar}>
											{sidebarOpen ? <ArrowForward /> : <ArrowBack />}
										</IconButton>
										<Typography gutterBottom variant="h5">
											Stats
										</Typography>
										<Box sx={styles.stats}>
											<Typography sx={styles.stat}>
												6 <Typography sx={styles.statSmall}>Plays</Typography>
											</Typography>
											<Typography sx={styles.stat}>
												2 <Typography sx={styles.statSmall}>Samples</Typography>
											</Typography>
											<Typography sx={styles.stat}>
												1 <Typography sx={styles.statSmall}>Cuts</Typography>
											</Typography>
										</Box>
										<Divider light sx={styles.divider} />
										<Typography gutterBottom variant="h5">
											Pioneer
										</Typography>
										<Box sx={styles.pioneer}>
											<Box sx={styles.account}>
												<Icon
													sx={styles.avatar}
													aria-label="Current user menu"
													aria-controls="user-menu"
													aria-haspopup="true"
													color="inherit"
												>
													<Avatar
														alt="Avatar"
														src="https://www.gravatar.com/avatar/94d093eda664addd6e450d7e9881bcad?s=24&d=identicon&r=PG"
													/>
												</Icon>
												<Typography sx={styles.address} variant="body2">
													{formatAddress(pioneerAddress)}
												</Typography>
											</Box>
										</Box>
										<Divider light sx={styles.divider} />
										<Box sx={styles.collaborators}>
											<Typography gutterBottom variant="h5">
												Collaborators
											</Typography>
											{[0, 1, 2, 3, 4].map((item, idx) => (
												<Box key={idx} sx={styles.account}>
													<Icon
														sx={styles.avatar}
														aria-label="Current user menu"
														aria-controls="user-menu"
														aria-haspopup="true"
														color="inherit"
													>
														<Avatar
															alt="Avatar"
															src="https://www.gravatar.com/avatar/94d093eda664addd6e450d7e9881bcad?s=24&d=identicon&r=PG"
														/>
													</Icon>
													<Typography sx={styles.address} variant="body2">
														{formatAddress(pioneerAddress)}
													</Typography>
												</Box>
											))}
										</Box>
										<Box sx={styles.cut}>
											<Button
												variant="contained"
												color="secondary"
												size="large"
												onClick={handleCut}
												fullWidth
											>
												Cut It!
											</Button>
										</Box>
									</Paper>
								</Grid>
							</Grid>
						</>
					) : (
						<Typography sx={styles.error} color="error">
							Sorry, no details were found for this project.
						</Typography>
					)}
				</Container>
			</main>

			<Footer />
		</>
	)
}

export const getServerSideProps: GetServerSideProps = async context => {
	const projectId = context.query.id
	const res = await get(`/projects/${projectId}`)
	let data: IProjectDoc | null = res.success ? res.data : null
	return {
		props: {
			data,
		},
	}
}

export default ProjectPage
