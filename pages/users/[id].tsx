import { Box, Button, Container, Divider, Grid, Typography } from '@mui/material'
import type { GetServerSideProps, NextPage } from 'next'
import Head from 'next/head'
import PropTypes from 'prop-types'
import { useEffect, useState } from 'react'
import AppFooter from '../../components/AppFooter'
import AppHeader from '../../components/AppHeader'
import ImageOptimized from '../../components/ImageOptimized'
import NFTCard from '../../components/NFTCard'
import Notification from '../../components/Notification'
import ProjectCard from '../../components/ProjectCard'
import SampleCard from '../../components/SampleCard'
import { useWeb3 } from '../../components/Web3Provider'
import type { IProjectDoc } from '../../models/project.model'
import type { IUserFull } from '../../models/user.model'
import formatAddress from '../../utils/formatAddress'
import formatDate from '../../utils/formatDate'
import { get } from '../../utils/http'

const styles = {
	error: {
		textAlign: 'center',
		marginY: 4,
	},
	editProfileWrap: {
		my: 2,
	},
	avatar: {
		border: '3px solid #a0b3a0',
		borderRadius: '50%',
		height: 200,
		width: 200,
		m: 0,
		overflow: 'hidden',
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
	sectionMeta: {
		fontStyle: 'italic',
		fontWeight: 300,
		textTransform: 'uppercase',
		color: '#777',
		mb: 2,
	},
	sectionCount: {
		fontWeight: 300,
		color: '#777',
		ml: 1,
		fontSize: '1.5rem',
	},
	noItemsMsg: {
		textAlign: 'center',
		marginY: 4,
	},
}

const propTypes = {
	data: PropTypes.shape({
		_doc: PropTypes.shape({
			address: PropTypes.string.isRequired,
			createdAt: PropTypes.string.isRequired,
		}).isRequired,
		nfts: PropTypes.arrayOf(PropTypes.shape({}).isRequired),
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
		if (currentUser?.address === data?._doc.address) {
			setIsCurrentUserDetails(true)
		} else {
			setIsCurrentUserDetails(false)
		}
	}, [data]) /* eslint-disable-line react-hooks/exhaustive-deps */

	useEffect(() => {
		// Update details when switching accounts and when
		if (currentUser?.address === data?._doc.address) {
			setIsCurrentUserDetails(true)
		} else {
			setIsCurrentUserDetails(false)
		}
	}, [currentUser]) /* eslint-disable-line react-hooks/exhaustive-deps */

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
				<meta
					name="description"
					content="PolyEcho is a schelling game where the objective is to publicly co-create songs worthy of purchase by NFT collectors."
				/>
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
													Display Name:
												</Typography>
												{formatAddress(details._doc.displayName)}
											</Typography>
											<Typography sx={styles.metadata}>
												<Typography component="span" sx={styles.metadataKey}>
													Joined On:
												</Typography>
												{formatDate(details._doc.createdAt)}
											</Typography>
											{isCurrentUserDetails && (
												<Box sx={styles.editProfileWrap}>
													<Button variant="outlined" color="secondary" onClick={() => console.log('edit details')}>
														Edit Profile
													</Button>
												</Box>
											)}
										</Box>
									</Box>
								</Grid>
								<Grid item xs={12} md={4}>
									<Box className="avatar-wrap">
										<Box sx={styles.avatar}>
											<ImageOptimized src={details._doc.avatarUrl} alt="User Avatar" width={200} height={200} />
										</Box>
									</Box>
								</Grid>
							</Grid>
							<Divider light sx={styles.divider} />
							<Typography variant="h4" gutterBottom>
								Minted NFTs
								<Typography component="span" sx={styles.sectionCount}>
									({details.nfts.length})
								</Typography>
							</Typography>
							<Typography sx={styles.sectionMeta}>NFTs this user has minted</Typography>
							<Grid container spacing={4}>
								{details.nfts.length > 0 ? (
									details.nfts.map((mintedNFT: any, idx: number) => (
										<Grid item sm={6} md={4} key={`${mintedNFT.cid}-${idx}`}>
											<NFTCard details={mintedNFT} />
										</Grid>
									))
								) : (
									<Grid item xs={12}>
										<Typography sx={styles.noItemsMsg}>No NFTs to show, mint one!</Typography>
									</Grid>
								)}
							</Grid>
							<Divider light sx={styles.divider} />
							<Typography variant="h4" gutterBottom>
								Projects
								<Typography component="span" sx={styles.sectionCount}>
									({details.projects.length})
								</Typography>
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
								<Typography component="span" sx={styles.sectionCount}>
									({details.samples.length})
								</Typography>
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
