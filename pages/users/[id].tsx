import { Box, Button, Container, Divider, Grid, Typography } from '@mui/material'
import type { GetServerSideProps, NextPage } from 'next'
import Head from 'next/head'
import PropTypes from 'prop-types'
import { useEffect, useState } from 'react'
import AppFooter from '../../components/AppFooter'
import AppHeader from '../../components/AppHeader'
import Notification from '../../components/Notification'
import ProjectCard from '../../components/ProjectCard'
import SampleCard from '../../components/SampleCard'
import { useWeb3 } from '../../components/Web3Provider'
import type { IProjectDoc } from '../../models/project.model'
import type { IUserFull } from '../../models/user.model'
import formatDate from '../../utils/formatDate'
import { get } from '../../utils/http'

const styles = {
	error: {
		textAlign: 'center',
		marginY: 4,
	},
	title: {
		textTransform: 'uppercase',
		fontStyle: 'italic',
		fontWeight: 900,
		mb: 2,
		display: 'flex',
		alignItems: 'center',
	},
	desc: {
		color: '#777',
		fontSize: '18px',
		mb: 2,
		fontWeight: 300,
	},
	metadataWrap: {
		mb: 3,
	},
	metadata: {
		display: 'inline-block',
		mr: 5,
	},
	metadataKey: {
		mr: 1,
		display: 'inline-block',
		color: '#a8a8a8',
	},
	divider: {
		my: 3,
		borderColor: '#ccc',
	},
	stemHistoryMeta: {
		fontStyle: 'italic',
		fontWeight: 300,
		textTransform: 'uppercase',
		color: '#777',
	},
	sectionMeta: {
		fontStyle: 'italic',
		fontWeight: 300,
		textTransform: 'uppercase',
		color: '#777',
		mb: 2,
	},
	stemMetadata: {
		mb: 4,
	},
	noItemsMsg: {
		textAlign: 'center',
		marginY: 4,
	},
}

const propTypes = {
	data: PropTypes.shape({
		_doc: PropTypes.shape({
			_id: PropTypes.string.isRequired,
			createdAt: PropTypes.string.isRequired,
		}).isRequired,
		projects: PropTypes.arrayOf(PropTypes.shape({}).isRequired),
		samples: PropTypes.arrayOf(PropTypes.shape({}).isRequired),
	}),
}

type UserDetailsPageProps = PropTypes.InferProps<typeof propTypes>

const UserDetailsPage: NextPage<UserDetailsPageProps> = props => {
	const { data } = props
	const [details, setDetails] = useState<any | null>(null)
	const [isCurrentUserDetails, setIsCurrentUserDetails] = useState<boolean>(false)
	const [successOpen, setSuccessOpen] = useState<boolean>(false)
	const [successMsg, setSuccessMsg] = useState<string>('')
	const [errorOpen, setErrorOpen] = useState<boolean>(false)
	const [errorMsg, setErrorMsg] = useState<string>('')
	const { currentUser } = useWeb3()

	useEffect(() => {
		// Update the details when changing the route directly
		if (data) setDetails(data)
		if (currentUser?._id === data?._doc._id) {
			setIsCurrentUserDetails(true)
		} else {
			setIsCurrentUserDetails(false)
		}
	}, [data])

	useEffect(() => {
		// Update details when switching accounts and when
		if (currentUser?._id === data?._doc._id) {
			setIsCurrentUserDetails(true)
		} else {
			setIsCurrentUserDetails(false)
		}
	}, [currentUser])

	const onNotificationClose = () => {
		setSuccessOpen(false)
		setSuccessMsg('')
		setErrorOpen(false)
		setErrorMsg('')
	}

	return (
		<>
			<Head>
				<title>PolyEcho | User Details</title>
				<meta name="description" content="A hackathon music app" />
				<link rel="icon" href="/favicon.ico" />
			</Head>

			<AppHeader />

			<main id="app-main">
				<Container maxWidth="xl">
					{details ? (
						<>
							<Grid container spacing={4}>
								<Grid item xs={12} md={8}>
									<Box>
										<Typography variant="h5" gutterBottom>
											User Details
										</Typography>
										<Box sx={styles.metadataWrap}>
											<Typography sx={styles.metadata}>
												<Typography component="span" sx={styles.metadataKey}>
													User ID:
												</Typography>
												{details._doc._id}
											</Typography>
											<Typography sx={styles.metadata}>
												<Typography component="span" sx={styles.metadataKey}>
													Joined On:
												</Typography>
												{formatDate(details._doc.createdAt)}
											</Typography>
										</Box>
									</Box>
								</Grid>
								<Grid item xs={12} md={4}>
									{isCurrentUserDetails && (
										<Button variant="outlined" color="secondary" onClick={() => console.log('edit details')}>
											Edit Profile
										</Button>
									)}
									<Typography>TODO: Avatar goes here</Typography>
								</Grid>
							</Grid>
							<Divider light sx={styles.divider} />
							<Typography variant="h4" gutterBottom>
								Projects
							</Typography>
							<Typography sx={styles.sectionMeta}>Projects this user has created</Typography>
							<Typography sx={styles.sectionMeta}>
								<strong>TODO:</strong> Show projects that a user has collaborated on as well
							</Typography>
							<Grid container spacing={4}>
								{details.projects.length > 0 ? (
									details.projects.map((project: IProjectDoc) => (
										<Grid item sm={6} md={4} key={project._id}>
											<ProjectCard details={project} />
										</Grid>
									))
								) : (
									<Grid item xs={12}>
										<Typography sx={styles.noItemsMsg}>No projects to show, upload one!</Typography>
									</Grid>
								)}
							</Grid>
							<Divider light sx={styles.divider} />
							<Typography variant="h4" gutterBottom>
								Samples
							</Typography>
							<Typography sx={styles.sectionMeta}>Samples this user has uploaded</Typography>
							<Grid container spacing={4}>
								{details.samples.length > 0 ? (
									details.samples.map((sample: any) => (
										<Grid item sm={6} md={4} key={sample._id}>
											<SampleCard details={sample} />
										</Grid>
									))
								) : (
									<Grid item xs={12}>
										<Typography sx={styles.noItemsMsg}>No samples to show, upload one!</Typography>
									</Grid>
								)}
							</Grid>
						</>
					) : (
						<Typography sx={styles.error} color="error">
							Sorry, no details were found for this user.
						</Typography>
					)}
				</Container>
			</main>

			<AppFooter />

			{successOpen && <Notification type="success" open={successOpen} msg={successMsg} onClose={onNotificationClose} />}
			{errorOpen && <Notification type="error" open={errorOpen} msg={errorMsg} onClose={onNotificationClose} />}
		</>
	)
}

UserDetailsPage.propTypes = propTypes

export const getServerSideProps: GetServerSideProps = async context => {
	let userId = context.query.id
	if (typeof userId === 'object') userId = userId[0].toLowerCase()
	else userId = userId?.toLowerCase()
	// Get full details
	const res = await get(`/users/${userId}`, { params: { fullDetails: true } })
	const data: IUserFull | null = res.success ? res.data : null
	return {
		props: {
			data,
		},
	}
}

export default UserDetailsPage
