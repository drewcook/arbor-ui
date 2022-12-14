/* eslint-disable prettier/prettier */
import EditIcon from '@mui/icons-material/Edit'
import { Box, Container, Divider, Grid, IconButton, Typography } from '@mui/material'
import type { GetServerSideProps, NextPage } from 'next'
import Head from 'next/head'
import PropTypes from 'prop-types'
import { useEffect, useState } from 'react'

import { FALLBACK_AVATAR_URL } from '../../components/ConnectedAccount'
import AvatarUploadDialog from '../../components/EditAvatarDialog'
import ImageOptimized from '../../components/ImageOptimized'
import ListNftDialog from '../../components/ListNftDialog'
import NFTCard from '../../components/NFTCard'
import ProjectCard from '../../components/ProjectCard'
import StemCard from '../../components/StemCard'
import { useWeb3 } from '../../components/Web3Provider'
import type { IProjectDoc } from '../../models/project.model'
import type { IUserFull } from '../../models/user.model'
import styles from '../../styles/UserProfile.styles'
import formatAddress from '../../utils/formatAddress'
import formatDate from '../../utils/formatDate'
import { get } from '../../utils/http'

const propTypes = {
	data: PropTypes.shape({
		_id: PropTypes.string.isRequired,
		address: PropTypes.string.isRequired,
		createdAt: PropTypes.string.isRequired,
		nfts: PropTypes.arrayOf(PropTypes.shape({}).isRequired),
		projects: PropTypes.arrayOf(PropTypes.shape({}).isRequired),
		stems: PropTypes.arrayOf(PropTypes.shape({}).isRequired),
	}),
	projects: PropTypes.arrayOf(
		PropTypes.shape({
			_id: PropTypes.string.isRequired,
			name: PropTypes.string.isRequired,
			description: PropTypes.string.isRequired,
			trackLimit: PropTypes.number.isRequired,
			nfts: PropTypes.arrayOf(PropTypes.shape({}).isRequired),
			tags: PropTypes.arrayOf(PropTypes.shape({}).isRequired),
			collaborators: PropTypes.arrayOf(PropTypes.shape({}).isRequired),
			projects: PropTypes.arrayOf(PropTypes.shape({}).isRequired),
			stems: PropTypes.arrayOf(PropTypes.shape({}).isRequired),
		}),
	),
}

type UserDetailsPageProps = PropTypes.InferProps<typeof propTypes>

// eslint-disable-next-line
const getFullUserDetails = async (userAddress: any): Promise<IUserFull | null> => {
	try {
		let address: string
		if (typeof userAddress === 'object') address = userAddress[0].toLowerCase()
		else address = userAddress?.toLowerCase()

		// Get user record
		const res = await get(`/users/${address}`)
		const userData: IUserFull | null = res.success ? res.data : null

		if (!userData) return userData

		// Then get full details
		const fullUser: IUserFull = {
			...userData,
			projects: [],
			projectCollaborations: [],
			stems: [],
			nfts: [],
		}

		// Get user's NFT details
		for (const nftId of userData.nftIds) {
			const nftRes = await get(`/nfts/${nftId}`)
			if (nftRes.success) fullUser.nfts.push(nftRes.data)
			else console.error(`Failed to find user NFT of ID - ${nftId}`)
		}

		// Get user's projects' creations
		for (const projectId of userData.projectIds) {
			const projectRes = await get(`/projects/${projectId}`)
			if (projectRes.success) fullUser.projects.push(projectRes.data)
			else console.error(`Failed to find user project of ID - ${projectId}`)
		}

		// Get user's project collaborations
		// TODO: move this into getFullUserDetails()
		const userCollaborationsRes = await get(`/users/collaborator/${userAddress}`)
		if (userCollaborationsRes.success) fullUser.projectCollaborations = userCollaborationsRes.data
		else console.warn('Failed to find user project collaborations')
		console.log({ userProjectCollaborations: userCollaborationsRes.data })

		// Get user's stems' details
		for (const stemId of userData.stemIds) {
			const stemRes = await get(`/stems/${stemId}`)
			if (stemRes.success) fullUser.stems.push(stemRes.data)
			else console.error(`Failed to find user stem of ID - ${stemId}`)
		}

		return fullUser
	} catch (e: any) {
		console.error(e.message)
		return null
	}
}

// TODO: Show projects that a user has also collaborated on, not just ones they've created
const UserDetailsPage: NextPage<UserDetailsPageProps> = props => {
	const { data, projects } = props
	const [uploadAvatarOpen, setUploadAvatarOpen] = useState<boolean>(false)
	const [details, setDetails] = useState<any>(null)
	const [isCurrentUserDetails, setIsCurrentUserDetails] = useState<boolean>(false)
	const { currentUser } = useWeb3()

	////////////////////////////////////////////////////////////////////////
	// Avatar Uploads
	////////////////////////////////////////////////////////////////////////
	const handleUploadAvatarOpen = (): void => {
		setUploadAvatarOpen(true)
	}

	const handleUploadAvatarClose = (): void => {
		setUploadAvatarOpen(false)
	}

	const onAvatarUploadSuccess = (): void => {
		getFullUserDetails(data?.address)
		handleUploadAvatarClose()
	}

	useEffect(() => {
		// Update the details when changing the route directly
		if (data) setDetails(data)
		if (currentUser?.address === data?.address) {
			setIsCurrentUserDetails(true)
		} else {
			setIsCurrentUserDetails(false)
		}
	}, [data]) /* eslint-disable-line react-hooks/exhaustive-deps */

	useEffect(() => {
		// Update details when switching accounts and when
		if (currentUser?.address === data?.address) {
			setIsCurrentUserDetails(true)
		} else {
			setIsCurrentUserDetails(false)
		}
	}, [currentUser]) /* eslint-disable-line react-hooks/exhaustive-deps */

	return (
		<>
			<Head>
				<title>Arbor | User Details</title>
			</Head>
			<Container maxWidth="xl" className="content-container">
				{details && projects ? (
					<>
						<Grid container spacing={4}>
							<Grid item xs={12} md={8}>
								<Box>
									<Typography variant="h4" gutterBottom>
										{isCurrentUserDetails ? 'My Profile' : 'User Details'}
									</Typography>
									<Box sx={styles.metadataWrap}>
										<Typography sx={styles.metadata}>
											<Typography component="span" sx={styles.metadataKey}>
												Display Name:
											</Typography>
											{formatAddress(details.displayName)}
										</Typography>
										<Typography sx={styles.metadata}>
											<Typography component="span" sx={styles.metadataKey}>
												Joined On:
											</Typography>
											{formatDate(details.createdAt)}
										</Typography>
									</Box>
								</Box>
							</Grid>
							<Grid item xs={12} md={4}>
								<Box sx={styles.avatarWrap}>
									<Box sx={styles.avatarImg}>
										<ImageOptimized
											src={details.avatar?.base64 ?? FALLBACK_AVATAR_URL}
											alt="User Avatar"
											width={200}
											height={200}
										/>
									</Box>
									{isCurrentUserDetails && (
										<>
											<IconButton
												sx={styles.updateAvatar}
												color="default"
												size="small"
												onClick={handleUploadAvatarOpen}
											>
												<EditIcon />
											</IconButton>
											<AvatarUploadDialog
												open={uploadAvatarOpen}
												onClose={handleUploadAvatarClose}
												onSuccess={onAvatarUploadSuccess}
												image={details.avatar?.base64 ?? FALLBACK_AVATAR_URL}
											/>
										</>
									)}
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
													<ListNftDialog
														unlist={true}
														nft={nft}
														onListSuccess={() => getFullUserDetails(data?.address)}
													/>
												</Box>
											) : (
												<Box sx={{ my: 2 }}>
													<ListNftDialog nft={nft} onListSuccess={() => getFullUserDetails(data?.address)} />
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
							Creations
							<Typography component="span" sx={styles.sectionCount}>
								({details.projects.length})
							</Typography>
						</Typography>
						<Typography sx={styles.sectionMeta}>Projects this user has created</Typography>
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
							Collaborations
							<Typography component="span" sx={styles.sectionCount}>
								({projects.length})
							</Typography>
						</Typography>
						<Typography sx={styles.sectionMeta}>Projects this user has collaborated on.</Typography>
						<Grid container spacing={4}>
							{projects.length > 0 ? (
								projects.map(project => (
									<Grid item sm={6} md={4} key={project?._id}>
										<ProjectCard details={project} />
									</Grid>
								))
							) : (
								<Grid item xs={12}>
									<Typography sx={styles.noItemsMsg}>No projects to show, collaborate on one!</Typography>
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
			</Container>
		</>
	)
}

UserDetailsPage.propTypes = propTypes

export const getServerSideProps: GetServerSideProps = async context => {
	// Get user object
	const userId = context.query.id
	const userData = await getFullUserDetails(userId)

	return {
		props: {
			data: userData,
		},
	}
}

export default UserDetailsPage
