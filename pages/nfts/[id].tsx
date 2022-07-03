import { Person } from '@mui/icons-material'
import { Avatar, Box, Button, Chip, CircularProgress, Container, Divider, Grid, Typography } from '@mui/material'
import type { GetServerSideProps, NextPage } from 'next'
import Head from 'next/head'
import Link from 'next/link'
import { useRouter } from 'next/router'
import PropTypes from 'prop-types'
import { useState } from 'react'
import web3 from 'web3'
import ImageOptimized from '../../components/ImageOptimized'
import ListNftDialog from '../../components/ListNftDialog'
import Notification from '../../components/Notification'
import StemCard from '../../components/StemCard'
import { useWeb3 } from '../../components/Web3Provider'
import { NETWORK_CURRENCY } from '../../constants/networks'
import OneIcon from '../../public/harmony_icon.svg'
import { detailsStyles as styles } from '../../styles/NFTs.styles'
import formatAddress from '../../utils/formatAddress'
import formatDate from '../../utils/formatDate'
import { get, update } from '../../utils/http'

const propTypes = {
	data: PropTypes.shape({
		_id: PropTypes.string.isRequired,
		token: PropTypes.shape({
			id: PropTypes.number.isRequired,
			data: PropTypes.shape({
				transactionHash: PropTypes.string.isRequired,
			}),
		}).isRequired,
		createdAt: PropTypes.string.isRequired,
		createdBy: PropTypes.string.isRequired,
		owner: PropTypes.string.isRequired,
		isListed: PropTypes.bool.isRequired,
		listPrice: PropTypes.number.isRequired,
		metadataUrl: PropTypes.string.isRequired,
		audioHref: PropTypes.string.isRequired,
		name: PropTypes.string.isRequired,
		projectId: PropTypes.string.isRequired,
		collaborators: PropTypes.arrayOf(PropTypes.string.isRequired).isRequired,
		stems: PropTypes.arrayOf(
			PropTypes.shape({
				_id: PropTypes.string.isRequired,
				metadataUrl: PropTypes.string.isRequired,
				audioUrl: PropTypes.string.isRequired,
				audioHref: PropTypes.string.isRequired,
			}).isRequired,
		).isRequired,
	}),
}

type NftDetailsPageProps = PropTypes.InferProps<typeof propTypes>

const NftDetailsPage: NextPage<NftDetailsPageProps> = props => {
	const { data } = props
	const [details, setDetails] = useState<any>(data)
	const [loading, setLoading] = useState<boolean>(false)
	const [successOpen, setSuccessOpen] = useState<boolean>(false)
	const [successMsg, setSuccessMsg] = useState<string>('')
	const [errorOpen, setErrorOpen] = useState<boolean>(false)
	const [errorMsg, setErrorMsg] = useState<string>('')
	const { connected, handleConnectWallet, currentUser, contracts } = useWeb3()
	const router = useRouter()

	const handleBuyNft = async () => {
		setLoading(true)
		try {
			if (currentUser) {
				// Call smart contract to make transfer
				const amount = web3.utils.toWei(details.listPrice.toString(), 'ether')
				const scRes: any = await contracts.nft.buy(details.token.id, {
					value: amount,
					from: currentUser.address,
					gasLimit: 650000,
				})
				if (!scRes) throw new Error('Failed to transfer the NFT on-chain')

				// Make PUT request to change ownership
				const res = await update(`/nfts/${details._id}`, {
					isListed: false,
					listPrice: 0,
					owner: currentUser.address,
					buyer: currentUser.address,
					seller: details.owner,
				})
				if (!res.success) throw new Error(`Failed to update the NFT ownership details - ${res.error}`)

				// Notify success
				if (!successOpen) setSuccessOpen(true)
				setLoading(false)
				setSuccessMsg('Success! You have bought this NFT, redirecting...')

				// Redirect to user's profile page
				router.push(`/users/${currentUser.address}`)
			}
		} catch (e: any) {
			// Log and notify error
			console.error(e.message)
			setErrorOpen(true)
			setErrorMsg('Uh oh, failed to buy the NFT')
			setLoading(false)
		}
	}

	const onNotificationClose = () => {
		setSuccessOpen(false)
		setSuccessMsg('')
		setErrorOpen(false)
		setErrorMsg('')
	}

	// Refetch user details after successfully listing a card
	const handleListSuccess = async () => {
		try {
			const res = await get(`/nfts/${details._id}`)
			const data: any | null = res.success ? res.data : null
			setDetails(data)
		} catch (e: any) {
			console.error(e.message)
		}
	}

	return (
		<>
			<Head>
				<title>Polyecho | NFT Details</title>
			</Head>
			<Container maxWidth="xl" className="content-container">
				{details ? (
					<>
						<Box sx={{ mb: 4 }}>
							<Typography variant="h4" component="h2" sx={styles.title}>
								NFT Details
								{details.isListed && (
									<Chip label="Listed For Sale!" size="medium" color="primary" sx={styles.buyableChip} />
								)}
							</Typography>
							{details.isListed && currentUser?.address !== details.owner && (
								<Box sx={styles.buyNowListing}>
									<Button
										size="large"
										onClick={connected ? handleBuyNft : handleConnectWallet}
										variant="contained"
										color="secondary"
										sx={styles.buyNowBtn}
										disabled={loading}
									>
										{loading ? <CircularProgress size={18} sx={{ my: 0.5 }} /> : 'Buy Now'}
									</Button>
									<Box sx={styles.price}>
										<ImageOptimized src={OneIcon} width={30} height={30} alt="ONE" />
										<Typography variant="h4" component="div" sx={{ ml: 1 }}>
											{details.listPrice}{' '}
											<Typography sx={styles.eth} component="span">
												{NETWORK_CURRENCY}
											</Typography>
										</Typography>
									</Box>
								</Box>
							)}
							{currentUser?.address === details.owner &&
								(details.isListed ? (
									<Box sx={styles.buyNowListing}>
										<ListNftDialog unlist={true} nft={details} onListSuccess={handleListSuccess} />
										<Box sx={styles.price}>
											<ImageOptimized src={OneIcon} width={30} height={30} alt="ONE" />
											<Typography variant="h4" component="div">
												{details.listPrice}{' '}
												<Typography sx={styles.eth} component="span">
													{NETWORK_CURRENCY}
												</Typography>
											</Typography>
										</Box>
									</Box>
								) : (
									<Box sx={{ my: 2 }}>
										<ListNftDialog nft={details} onListSuccess={handleListSuccess} />
									</Box>
								))}
						</Box>
						<Grid container spacing={4}>
							<Grid item xs={12} md={5}>
								<Typography sx={styles.metadata}>
									<Typography component="span" sx={styles.metadataKey}>
										Name:
									</Typography>
									<Link href={`/users/${details.createdBy}`}>{details.name}</Link>
								</Typography>
								<Typography sx={styles.metadata}>
									<Typography component="span" sx={styles.metadataKey}>
										Owner:
									</Typography>
									<Link href={`/users/${details.owner}`}>{formatAddress(details.owner)}</Link>
								</Typography>
								<Typography sx={styles.metadata}>
									<Typography component="span" sx={styles.metadataKey}>
										Minted By:
									</Typography>
									<Link href={`/users/${details.createdBy}`}>{formatAddress(details.createdBy)}</Link>
								</Typography>
								<Typography sx={styles.metadata}>
									<Typography component="span" sx={styles.metadataKey}>
										Minted On:
									</Typography>
									{formatDate(details.createdAt)}
								</Typography>
							</Grid>
							<Grid item xs={12} md={7}>
								<Typography sx={styles.metadata}>
									<Typography component="span" sx={styles.metadataKey}>
										ID:
									</Typography>
									<Link
										href={`https://mumbai.polygonscan.com/token/0xBd0136694e9382127602abFa5AA0679752eaD313?a=${details.token.id}`}
									>
										{details.token.id.toString()}
									</Link>
								</Typography>
								<Typography sx={styles.metadata}>
									<Typography component="span" sx={styles.metadataKey}>
										Collection:{' '}
									</Typography>
									<Link href="https://mumbai.polygonscan.com/token/0xbd0136694e9382127602abfa5aa0679752ead313">
										View On Explorer
									</Link>
								</Typography>
								<Typography sx={styles.metadata}>
									<Typography component="span" sx={styles.metadataKey}>
										Mint Tx Hash:{' '}
									</Typography>
									<Link href={`https://mumbai.polygonscan.com/tx/${details.token.data.transactionHash}`}>
										View On Explorer
									</Link>
								</Typography>
								<Typography sx={styles.metadata}>
									<Typography component="span" sx={styles.metadataKey}>
										Project ID:
									</Typography>
									<Link href={`/projects/${details.projectId}`}>{details.projectId}</Link>
								</Typography>
							</Grid>
						</Grid>
						<Divider light sx={styles.divider} />
						<Typography variant="h4" gutterBottom>
							Collaborators
							<Typography component="span" sx={styles.sectionCount}>
								({details.collaborators.length})
							</Typography>
						</Typography>
						<Typography sx={styles.sectionMeta}>
							This NFT was created by {details.collaborators.length || 0} contributor
							{details.collaborators.length === 1 ? '' : 's'} and composed of {details.stems.length || 0} stem
							{details.stems.length === 1 ? '' : 's'}
						</Typography>
						{details.collaborators.length > 0 ? (
							details.collaborators.map((collaborator: string) => (
								<Box sx={styles.collaborator} key={collaborator}>
									<Avatar>
										<Person />
									</Avatar>
									<Typography sx={styles.collaboratorAddress}>
										<Link href={`/users/${collaborator}`}>{formatAddress(collaborator)}</Link>
									</Typography>
								</Box>
							))
						) : (
							<Typography sx={styles.noItemsMsg}>This NFT contains no collaborators</Typography>
						)}
						<Typography variant="h4" gutterBottom>
							Stems
							<Typography component="span" sx={styles.sectionCount}>
								({details.stems.length})
							</Typography>
						</Typography>
						<Typography sx={styles.sectionMeta}>This NFT contains the following stems</Typography>
						<Grid container spacing={4}>
							{details.stems.length > 0 ? (
								details.stems.map((stem: any) => (
									<Grid item sm={6} md={4} key={stem._id}>
										<StemCard details={stem} />
									</Grid>
								))
							) : (
								<Grid item xs={12}>
									<Typography sx={styles.noItemsMsg}>This NFT contains no stems</Typography>
								</Grid>
							)}
						</Grid>
					</>
				) : (
					<Typography sx={styles.error} color="error">
						Sorry, no details were found for this NFT.
					</Typography>
				)}
				{successOpen && (
					<Notification open={successOpen} msg={successMsg} type="success" onClose={onNotificationClose} />
				)}
				{errorOpen && <Notification open={errorOpen} msg={errorMsg} type="error" onClose={onNotificationClose} />}
			</Container>
		</>
	)
}

NftDetailsPage.propTypes = propTypes

export const getServerSideProps: GetServerSideProps = async context => {
	// Get NFT details based off ID
	let nftId = context.query.id
	if (typeof nftId === 'object') nftId = nftId[0].toLowerCase()
	else nftId = nftId?.toLowerCase()

	// Get NFT data from database
	const res = await get(`/nfts/${nftId}`)
	const data: any | null = res.success ? res.data : null

	return {
		props: {
			data,
		},
	}
}

NftDetailsPage.propTypes = propTypes

export default NftDetailsPage
