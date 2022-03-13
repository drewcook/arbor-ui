import { Box, Container, Grid, Typography } from '@mui/material'
import type { GetServerSideProps, NextPage } from 'next'
import Head from 'next/head'
import PropTypes from 'prop-types'
import AppFooter from '../../components/AppFooter'
import AppHeader from '../../components/AppHeader'
import SampleCard from '../../components/SampleCard'
import type { ISampleDoc } from '../../models/sample.model'
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

type SamplesPageProps = PropTypes.InferProps<typeof propTypes>

const SamplesPage: NextPage<SamplesPageProps> = props => {
	const { data } = props

	return (
		<div>
			<Head>
				<title>PolyEcho | Explore The StemPool</title>
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
								Plunge Into The StemPool
							</Typography>
							<Typography variant="h5" sx={styles.subtitle}>
								Explore the marketplace for unique music stems and samples, upload your own, or grab a few and start a
								new project with them.
							</Typography>
							{data.length > 0 ? (
								<Grid container spacing={4}>
									{data.map((sample: any) => (
										<Grid item sm={6} md={4} key={sample._id}>
											<SampleCard details={sample} />
										</Grid>
									))}
								</Grid>
							) : (
								<Box sx={styles.noProjects}>
									<Typography sx={styles.noProjectsMsg}>No samples to show. Upload one!</Typography>
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

SamplesPage.propTypes = propTypes

export const getServerSideProps: GetServerSideProps = async () => {
	// Get all Samples
	const res = await get(`/samples`)
	const data: ISampleDoc[] | null = res.success ? res.data : null
	return {
		props: {
			data,
		},
	}
}

export default SamplesPage
