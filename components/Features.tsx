import { ArrowDownward, ArrowUpward, Lightbulb, Sell } from '@mui/icons-material'
import { Box, Container, Grid, Typography } from '@mui/material'
import React from 'react'

import styles from './Features.styles'

const Features = (): JSX.Element => {
	return (
		<Box sx={styles.features} component="section">
			<Container maxWidth="xl">
				<Typography variant="h2" sx={styles.sectionHeading}>
					How It Works
				</Typography>
				<Typography sx={styles.howItWorksText}>
					Songs are created publicly via stems and sold as NFTs. Proceeds are split equally among artists.
				</Typography>
				<Grid container spacing={3}>
					<Grid item xs={12} sm={6} md={3}>
						<Typography variant="h6">Someone Starts a Project</Typography>
						<Box sx={styles.featureBox}>
							<Box sx={styles.featureBlock} />
							<Box sx={styles.featureBlock} />
							<Box sx={styles.featureBlock} />
							<Box sx={styles.featureBlock} />
							<Lightbulb />
							<Box sx={styles.featureBlock} className="bigBlock" />
						</Box>
					</Grid>
					<Grid item xs={12} sm={6} md={3}>
						<Typography variant="h6">Artists Add Stems</Typography>
						<Box sx={styles.featureBox}>
							<Box sx={styles.featureBlock} data-color="red">
								Bob&apos;s Drums
							</Box>
							<Box sx={styles.featureBlock} data-color="purple">
								Alice&apos;s Bass
							</Box>
							<Box sx={styles.featureBlock} data-color="blue">
								Charlie&apos;s Melody
							</Box>
							<Box sx={styles.featureBlock} data-color="yellow">
								Dave&apos;s Chords
							</Box>
							<ArrowDownward />
							<Box sx={styles.featureBlock} className="bigBlock" />
						</Box>
					</Grid>
					<Grid item xs={12} sm={6} md={3}>
						<Typography variant="h6">Collectors Mint &amp; Buy Songs</Typography>
						<Box sx={styles.featureBox}>
							<Box sx={styles.featureBlock} data-color="red">
								Bob&apos;s Drums
							</Box>
							<Box sx={styles.featureBlock} data-color="purple">
								Alice&apos;s Bass
							</Box>
							<Box sx={styles.featureBlock} data-color="blue">
								Charlie&apos;s Melody
							</Box>
							<Box sx={styles.featureBlock} data-color="yellow">
								Dave&apos;s Chords
							</Box>
							<Sell />
							<Box sx={styles.featureBlock} className="bigBlock" data-color="multi">
								SOLD FOR 1 ETH
							</Box>
						</Box>
					</Grid>
					<Grid item xs={12} sm={6} md={3}>
						<Typography variant="h6">Artists Get Paid</Typography>
						<Box sx={styles.featureBox}>
							<Box sx={styles.featureBlock} data-color="red">
								Bob&apos;s Drums
							</Box>
							<Box sx={styles.featureBlock} data-color="purple">
								Alice&apos;s Bass
							</Box>
							<Box sx={styles.featureBlock} data-color="blue">
								Charlie&apos;s Melody
							</Box>
							<Box sx={styles.featureBlock} data-color="yellow">
								Dave&apos;s Chords
							</Box>
							<ArrowUpward />
							<Box sx={styles.featureBlock} className="bigBlock" data-color="multi">
								.25 ETH FOR EACH ARTIST
							</Box>
						</Box>
					</Grid>
				</Grid>
			</Container>
		</Box>
	)
}

export default Features
