import { Box, Button, Divider, Grid, Typography } from '@mui/material'
import type { GetServerSideProps, NextPage } from 'next'
import Head from 'next/head'
import PropTypes from 'prop-types'
import { useEffect, useState } from 'react'
import ImageOptimized from '../../components/ImageOptimized'
import ListNftDialog from '../../components/ListNftDialog'
import NFTCard from '../../components/NFTCard'
import ProjectCard from '../../components/ProjectCard'
import StemCard from '../../components/StemCard'
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
	nftActionBtn: {
		m: 1,
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
			address: PropTypes.string.isRequired,
			createdAt: PropTypes.string.isRequired,
		}).isRequired,
		nfts: PropTypes.arrayOf(PropTypes.shape({}).isRequired),
		projects: PropTypes.arrayOf(PropTypes.shape({}).isRequired),
		stems: PropTypes.arrayOf(PropTypes.shape({}).isRequired),
	}),
}

type UserDetailsPageProps = PropTypes.InferProps<typeof propTypes>

const UserDetailsPage: NextPage<UserDetailsPageProps> = props => {
	const { data } = props
	const [details, setDetails] = useState<any | null>(null)
	const [isCurrentUserDetails, setIsCurrentUserDetails] = useState<boolean>(false)
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

	// Refetch user details after successfully listing a card
	const handleListSuccess = async () => {
		try {
			const res = await get(`/users/${data?._doc.address}`, { params: { fullDetails: true } })
			const newDetails: IUserFull | null = res.success ? res.data : null
			setDetails(newDetails)
		} catch (e: any) {
			console.error(e.message)
		}
	}

	return (
		<>
			<Head>
				<title>Polyecho | User Details</title>
			</Head>
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
						My NFT Collection
						<Typography component="span" sx={styles.sectionCount}>
							({details.nfts.length})
						</Typography>
					</Typography>
					<Typography sx={styles.sectionMeta}>NFTs this user has minted or collected</Typography>
					<Grid container spacing={4}>
						{details.nfts.length > 0 ? (
							details.nfts.map((nft: any, idx: number) => (
								<Grid item sm={6} md={4} key={`${nft.cid}-${idx}`}>
									<NFTCard details={nft} />
									{nft.owner === currentUser?.address &&
										(nft.isListed ? (
											<Box sx={{ my: 2 }}>
												<ListNftDialog unlist={true} nft={nft} onListSuccess={handleListSuccess} />
											</Box>
										) : (
											<Box sx={{ my: 2 }}>
												<ListNftDialog nft={nft} onListSuccess={handleListSuccess} />
											</Box>
										))}
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
						Stems
						<Typography component="span" sx={styles.sectionCount}>
							({details.stems.length})
						</Typography>
					</Typography>
					<Typography sx={styles.sectionMeta}>Stems this user has uploaded</Typography>
					<Grid container spacing={4}>
						{details.stems.length > 0 ? (
							details.stems.map((stem: any) => (
								<Grid item sm={6} md={4} key={stem._id}>
									<StemCard details={stem} />
								</Grid>
							))
						) : (
							<Grid item xs={12}>
								<Typography sx={styles.noItemsMsg}>No stems to show, upload one!</Typography>
							</Grid>
						)}
					</Grid>
				</>
			) : (
				<Typography sx={styles.error} color="error">
					Sorry, no details were found for this user.
				</Typography>
			)}
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
