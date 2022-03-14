import { Box, Button, Container, Divider, Grid, Typography } from '@mui/material'
import type { GetServerSideProps, NextPage } from 'next'
import Head from 'next/head'
import Link from 'next/link'
import PropTypes from 'prop-types'
import AppFooter from '../../components/AppFooter'
import AppHeader from '../../components/AppHeader'
import SampleCard from '../../components/SampleCard'
import formatAddress from '../../utils/formatAddress'
import formatDate from '../../utils/formatDate'
import { get } from '../../utils/http'

const styles = {
	title: {
		textTransform: 'uppercase',
		fontStyle: 'italic',
		fontWeight: 900,
		display: 'flex',
		alignItems: 'center',
	},
	metadata: {
		my: 2,
	},
	metadataKey: {
		mr: 1,
		display: 'inline-block',
		color: '#a8a8a8',
	},
	btn: {
		m: 1,
		display: 'block',
		textAlign: 'center',
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
	collaborator: {
		my: 3,
		display: 'flex',
	},
	collaboratorMeta: {
		color: '#a8a8a8',
		mr: 2,
	},
	noItemsMsg: {
		textAlign: 'center',
		marginY: 4,
	},
	error: {
		textAlign: 'center',
		marginY: 4,
	},
}

const propTypes = {
	data: PropTypes.shape({
		token: PropTypes.shape({
			blockNumber: PropTypes.number.isRequired,
			transactionHash: PropTypes.string.isRequired,
		}).isRequired,
		createdAt: PropTypes.string.isRequired,
		createdBy: PropTypes.string.isRequired,
		metadataUrl: PropTypes.string.isRequired,
		audioHref: PropTypes.string.isRequired,
		name: PropTypes.string.isRequired,
		projectId: PropTypes.string.isRequired,
		collaborators: PropTypes.arrayOf(PropTypes.string.isRequired).isRequired,
		samples: PropTypes.arrayOf(
			PropTypes.shape({
				_id: PropTypes.string.isRequired,
				metadataUrl: PropTypes.string.isRequired,
				audioUrl: PropTypes.string.isRequired,
				audioHref: PropTypes.string.isRequired,
			}).isRequired,
		).isRequired,
	}).isRequired,
}

type NftDetailsPageProps = PropTypes.InferProps<typeof propTypes>

const NftDetailsPage: NextPage<NftDetailsPageProps> = props => {
	const { data } = props

	return (
		<>
			<Head>
				<title>PolyEcho | NFT Details</title>
				<meta
					name="description"
					content="PolyEcho is a schelling game where the objective is to publicly co-create songs worthy of purchase by NFT collectors."
				/>
				<link rel="icon" href="/favicon.ico" />
			</Head>

			<AppHeader />

			<main id="app-main">
				<Container maxWidth="xl">
					{data ? (
						<>
							<Grid container spacing={4}>
								<Grid item xs={12} md={8}>
									<Box>
										<Typography variant="h4" component="h2" sx={styles.title}>
											NFT Details
										</Typography>
										<Typography sx={styles.metadata}>
											<Typography component="span" sx={styles.metadataKey}>
												Name:
											</Typography>
											<Link href={`/users/${data.createdBy}`}>{data.name}</Link>
										</Typography>
										<Typography sx={styles.metadata}>
											<Typography component="span" sx={styles.metadataKey}>
												Minted By:
											</Typography>
											{formatAddress(data.createdBy)}
										</Typography>
										<Typography sx={styles.metadata}>
											<Typography component="span" sx={styles.metadataKey}>
												Minted On:
											</Typography>
											{formatDate(data.createdAt)}
										</Typography>
										<Typography sx={styles.metadata}>
											<Typography component="span" sx={styles.metadataKey}>
												Project ID:
											</Typography>
											<Link href={`/projects/${data.projectId}`}>{data.projectId}</Link>
										</Typography>
										<Typography variant="body2" sx={styles.metadata}>
											<Typography component="span" sx={styles.metadataKey}>
												Block #:{' '}
											</Typography>
											<Link href={`https://rinkeby.etherscan.io/block/${data.token.blockNumber}`}>
												View on Etherscan
											</Link>
										</Typography>
										<Typography variant="body2" sx={styles.metadata}>
											<Typography component="span" sx={styles.metadataKey}>
												Tx Hash:{' '}
											</Typography>
											<Link href={`https://rinkeby.etherscan.io/tx/${data.token.transactionHash}`}>
												View on Etherscan
											</Link>
										</Typography>
									</Box>
								</Grid>
								<Grid item xs={12} md={4}>
									<Link href={data.metadataUrl} passHref>
										<Button color="secondary" variant="outlined" fullWidth size="large" sx={styles.btn}>
											View on IPFS
										</Button>
									</Link>
									<Link href={data.audioHref} passHref>
										<Button color="secondary" variant="outlined" fullWidth size="large" sx={styles.btn}>
											Listen on IPFS
										</Button>
									</Link>
								</Grid>
							</Grid>
							<Divider light sx={styles.divider} />
							<Typography variant="h4" gutterBottom>
								Collaborators
								<Typography component="span" sx={styles.sectionCount}>
									({data.collaborators.length})
								</Typography>
							</Typography>
							{data.collaborators.length > 0 ? (
								data.collaborators.map((collaborator: string, idx: number) => (
									<Box sx={styles.collaborator} key={collaborator}>
										<Typography sx={styles.collaboratorMeta}>#{idx + 1}:</Typography>
										<Typography>
											<Link href={`/users/${collaborator}`}>{formatAddress(collaborator)}</Link>
										</Typography>
									</Box>
								))
							) : (
								<Typography sx={styles.noItemsMsg}>This NFT contains no collaborators.</Typography>
							)}
							<Divider light sx={styles.divider} />
							<Typography variant="h4" gutterBottom>
								Samples
								<Typography component="span" sx={styles.sectionCount}>
									({data.samples.length})
								</Typography>
							</Typography>
							<Typography sx={styles.sectionMeta}>This NFT contains the following samples.</Typography>
							<Grid container spacing={4}>
								{data.samples.length > 0 ? (
									data.samples.map((sample: any) => (
										<Grid item sm={6} md={4} key={sample._id}>
											<SampleCard details={sample} />
										</Grid>
									))
								) : (
									<Grid item xs={12}>
										<Typography sx={styles.noItemsMsg}>This NFT contains no samples.</Typography>
									</Grid>
								)}
							</Grid>
						</>
					) : (
						<Typography sx={styles.error} color="error">
							Sorry, no details were found for this NFT.
						</Typography>
					)}
				</Container>
			</main>

			<AppFooter />
		</>
	)
}

NftDetailsPage.propTypes = propTypes

export const getServerSideProps: GetServerSideProps = async context => {
	// Get NFT details based off ID
	let nftId = context.query.id
	if (typeof nftId === 'object') nftId = nftId[0].toLowerCase()
	else nftId = nftId?.toLowerCase()
	const res = await get(`/nfts/${nftId}`)
	const data: any | null = res.success ? res.data : null
	return {
		props: {
			data,
		},
	}
}

export default NftDetailsPage
