import AppsIcon from '@mui/icons-material/Apps'
import FormatListBulletedIcon from '@mui/icons-material/FormatListBulleted'
import { Box, Button, ButtonGroup, Container, Grid, Typography } from '@mui/material'
import type { GetServerSideProps, NextPage } from 'next'
import Head from 'next/head'
import PropTypes from 'prop-types'
import { useState } from 'react'

import StemCard from '../../components/StemCard'
import StemList from '../../components/StemList'
import { get } from '../../lib/http'
import { StemDoc } from '../../models'
import { indexStyles as styles } from '../../styles/Stems.styles'

const propTypes = {
	data: PropTypes.arrayOf(
		PropTypes.shape({
			_id: PropTypes.string.isRequired,
		}),
	),
}

type StemsPageProps = PropTypes.InferProps<typeof propTypes>

const StemsPage: NextPage<StemsPageProps> = props => {
	const { data } = props
	const [listView, showListView] = useState(false)

	return (
		<>
			<Head>
				<title>Arbor | Explore The StemPool</title>
			</Head>
			<Container maxWidth="xl" className="content-container">
				{data ? (
					<>
						<Typography variant="h4" component="h1" sx={styles.title}>
							Plunge Into The StemPool
						</Typography>
						<Container maxWidth="sm">
							<Typography variant="h5" sx={styles.subtitle}>
								Explore the stem pool for unique music stems from the artist community, upload your own, or grab a few
								and start a new project with them.
							</Typography>
						</Container>
						{data.length > 0 ? (
							<>
								<Box sx={styles.icons}>
									<ButtonGroup
										color="inherit"
										variant="outlined"
										aria-label="outlined button group"
										disableElevation
										disableRipple
										disableFocusRipple
									>
										<Button
											sx={styles.stemListBtn}
											variant={listView ? 'outlined' : 'contained'}
											onClick={() => showListView(!listView)}
										>
											<AppsIcon />
										</Button>
										<Button
											sx={styles.stemListBtn}
											variant={listView ? 'contained' : 'outlined'}
											onClick={() => showListView(!listView)}
										>
											<FormatListBulletedIcon />
										</Button>
									</ButtonGroup>
								</Box>
								<Box>
									{listView ? (
										<StemList details={data} />
									) : (
										<Grid container spacing={4}>
											{data.map((stem: any) => (
												<Grid item sm={6} md={4} key={stem._id}>
													<StemCard details={stem} />
												</Grid>
											))}
										</Grid>
									)}
								</Box>
							</>
						) : (
							<Box sx={styles.noProjects}>
								<Typography sx={styles.noProjectsMsg}>No stems to show. Upload one to a project!</Typography>
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

StemsPage.propTypes = propTypes

export const getServerSideProps: GetServerSideProps = async () => {
	// Get all Stems
	const res = await get(`/stems`)
	const data: StemDoc[] | null = res.success ? res.data : null
	return {
		props: {
			data,
		},
	}
}

export default StemsPage
