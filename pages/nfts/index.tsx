import { Box, Container, Grid, Typography } from '@mui/material'
import type { GetServerSideProps, NextPage } from 'next'
import Head from 'next/head'
import PropTypes from 'prop-types'
import NFTCard from '../../components/NFTCard'
import type { INftDoc } from '../../models/nft.model'
import { get } from '../../utils/http'

const styles = {
	title: {
		textTransform: 'uppercase',
		fontStyle: 'italic',
		fontWeight: 800,
		display: 'flex',
		justifyContent: 'center',
		alignItems: 'center',
		mb: 2,
	},
	subtitle: {
		fontStyle: 'italic',
		fontWeight: 300,
		textAlign: 'center',
		mb: 7,
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
		<>
			<Head>
				<title>Polyecho | Explore Music and Audio NFTs</title>
			</Head>
			{data ? (
				<>
					<Typography variant="h4" component="h1" sx={styles.title}>
						Polyecho Audio NFTs
					</Typography>
					<Container maxWidth="sm">
						<Typography variant="h5" sx={styles.subtitle}>
							Explore the marketplace for unique music and audio NFTs, buy, sell, and trade with others, all right here
							on Polyecho.
						</Typography>
					</Container>
					{data.length > 0 ? (
						<Grid container spacing={4}>
							{data.map(nft => (
								<Grid item xs={12} sm={6} md={4} key={nft?._id}>
									<NFTCard details={nft} />
								</Grid>
							))}
						</Grid>
					) : (
						<Box sx={styles.noProjects}>
							<Typography sx={styles.noProjectsMsg}>No NFTs to show.</Typography>
						</Box>
					)}
				</>
			) : (
				<Typography sx={styles.noProjects}>Something went wrong</Typography>
			)}
		</>
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
