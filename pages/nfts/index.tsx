import { Box, Button, Container, Grid, Typography } from '@mui/material'
import type { GetServerSideProps, NextPage } from 'next'
import Head from 'next/head'
import Link from 'next/link'
import PropTypes from 'prop-types'
import AppFooter from '../../components/AppFooter'
import AppHeader from '../../components/AppHeader'
import NFTCard from '../../components/NFTCard'
import type { INftDoc } from '../../models/nft.model'
import { get } from '../../utils/http'

const styles = {
	title: {
		textTransform: 'uppercase',
		fontStyle: 'italic',
		fontWeight: 900,
		display: 'flex',
		justifyContent: 'center',
		alignItems: 'center',
		mb: 2,
	},
	subtitle: {
		fontStyle: 'italic',
		fontWeight: 300,
		textAlign: 'center',
		mb: 4,
	},
	noProjects: {
		textAlign: 'center',
	},
	noProjectsMsg: {
		fontSize: '1.5rem',
		color: '#555',
		mb: 3,
	},
}

const propTypes = {
	data: PropTypes.arrayOf(
		PropTypes.shape({
			_id: PropTypes.string.isRequired,
		}),
	),
}

type NftsPageProps = PropTypes.InferProps<typeof propTypes>

const NftsPage: NextPage<NftsPageProps> = props => {
	const { data } = props

	return (
		<div>
			<Head>
				<title>PolyEcho | Explore Music and Audio NFTs</title>
				<meta
					name="description"
					content="PolyEcho is a schelling game where the objective is to publicly co-create songs worthy of purchase by NFT collectors."
				/>
				<link rel="icon" href="/favicon.ico" />
			</Head>

			<AppHeader />

			<main id="app-main">
				<Container maxWidth="lg">
					{data ? (
						<>
							<Typography variant="h4" component="h1" sx={styles.title}>
								PolyEcho Audio NFTs
							</Typography>
							<Typography variant="h5" sx={styles.subtitle}>
								Explore the marketplace for unique music and audio NFTs, buy, sell, and trade with others, all right
								here on PolyEcho.
							</Typography>
							{data.length > 0 ? (
								<Grid container spacing={4}>
									{data.map(nft => (
										<Grid item sm={6} md={4} key={nft?._id}>
											<NFTCard details={nft} isMarketplace={true} />
										</Grid>
									))}
								</Grid>
							) : (
								<Box sx={styles.noProjects}>
									<Typography sx={styles.noProjectsMsg}>No NFTs to show.</Typography>
									<Link href="/projects/new" passHref>
										<Button variant="contained" color="secondary">
											Create Project
										</Button>
									</Link>
								</Box>
							)}
						</>
					) : (
						<Typography sx={styles.noProjects}>Something went wrong</Typography>
					)}
				</Container>
			</main>

			<AppFooter />
		</div>
	)
}

NftsPage.propTypes = propTypes

export const getServerSideProps: GetServerSideProps = async () => {
	// Get all NFTs
	const res = await get(`/nfts`)
	const data: INftDoc[] | null = res.success ? res.data : null
	return {
		props: {
			data,
		},
	}
}

export default NftsPage
