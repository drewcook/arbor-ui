import { Box, Container, Divider, Grid, Typography } from '@mui/material'
import type { GetServerSideProps, NextPage } from 'next'
import Head from 'next/head'
import Link from 'next/link'
import PropTypes from 'prop-types'
import { useEffect, useState } from 'react'
import AppFooter from '../../components/AppFooter'
import AppHeader from '../../components/AppHeader'
import Notification from '../../components/Notification'
import { useWeb3 } from '../../components/Web3Provider'
import type { IUser } from '../../models/user.model'
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
	divider: {
		my: 3,
		borderColor: '#ccc',
	},
	stemMetadata: {
		mb: 4,
	},
	noSamplesMsg: {
		textAlign: 'center',
		marginY: 4,
	},
}

const propTypes = {
	data: PropTypes.shape({
		_id: PropTypes.string.isRequired,
		projectIds: PropTypes.arrayOf(PropTypes.string.isRequired).isRequired,
		sampleIds: PropTypes.arrayOf(PropTypes.string.isRequired).isRequired,
	}),
}

type UserDetailsPageProps = PropTypes.InferProps<typeof propTypes>

const UserDetailsPage: NextPage<UserDetailsPageProps> = props => {
	const { data } = props
	const [details, setDetails] = useState<IUser | null>(null)
	const [isCurrentUserDetails, setIsCurrentUserDetails] = useState<boolean>(false)
	const [successOpen, setSuccessOpen] = useState<boolean>(false)
	const [successMsg, setSuccessMsg] = useState<string>('')
	const [errorOpen, setErrorOpen] = useState<boolean>(false)
	const [errorMsg, setErrorMsg] = useState<string>('')
	const { currentUser } = useWeb3()

	useEffect(() => {
		// Update the details when changing the route directly
		if (data) setDetails(data)
		if (currentUser?._id === data?._id) {
			setIsCurrentUserDetails(true)
		} else {
			setIsCurrentUserDetails(false)
		}
	}, [data])

	useEffect(() => {
		// Update details when switching accounts and when
		if (currentUser?._id === data?._id) {
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
										{isCurrentUserDetails && <Typography>My Profile</Typography>}
										<Typography variant="h4" component="h2" sx={styles.title}>
											{details._id}
										</Typography>
									</Box>
								</Grid>
								<Grid item xs={12} md={4}>
									Avatar goes here
								</Grid>
							</Grid>
							<Divider light sx={styles.divider} />
							<Typography variant="h4" gutterBottom>
								Projects
							</Typography>
							{details.projectIds.length > 0 ? (
								details.projectIds.map((projectId: string, idx: number) => (
									<Typography key={idx} gutterBottom>
										Project: <Link href={`/projects/${projectId}`}>{projectId}</Link>
									</Typography>
								))
							) : (
								<Typography sx={styles.noSamplesMsg}>No samples to show, upload one!</Typography>
							)}
							<Divider light sx={styles.divider} />
							<Typography variant="h4" gutterBottom>
								Samples
							</Typography>
							{details.sampleIds.length > 0 ? (
								details.sampleIds.map((sampleId: string, idx: number) => (
									<Typography key={idx} gutterBottom>
										Sample: {sampleId}
									</Typography>
								))
							) : (
								<Typography sx={styles.noSamplesMsg}>No samples to show, upload one!</Typography>
							)}
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
	const res = await get(`/users/${userId}`)
	const data: IUser | null = res.success ? res.data : null
	return {
		props: {
			data,
		},
	}
}

export default UserDetailsPage
