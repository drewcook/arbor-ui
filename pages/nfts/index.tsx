import { Box, Container, Grid, Typography } from '@mui/material'
import type { GetServerSideProps, NextPage } from 'next'
import Head from 'next/head'
import PropTypes from 'prop-types'
import NFTCard from '../../components/NFTCard'
import type { INftDoc } from '../../models/nft.model'
import { indexStyles as styles } from '../../styles/Stems.styles'
import { get } from '../../utils/http'

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
			<Container maxWidth="xl" className="content-container">
				{data ? (
					<>
						<Typography variant="h4" component="h1" sx={styles.title}>
							Polyecho Audio NFTs
						</Typography>
						<Container maxWidth="sm">
							<Typography variant="h5" sx={styles.subtitle}>
								Explore the marketplace for unique music and audio NFTs, buy, sell, and trade with others, all right
								here on Polyecho.
							</Typography>
						</Container>
						{data.length > 0 ? (
							<Grid container spacing={4}>
								{data.map(nft => (
									<Grid item sm={6} md={4} key={nft?._id}>
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
					<Typography sx={styles.noProjects}>Something went wrong. Try refreshing.</Typography>
				)}
			</Container>
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
