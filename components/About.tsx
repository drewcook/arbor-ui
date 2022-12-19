import { Box, Button, Container, Grid, Typography } from '@mui/material'
import Link from 'next/link'
import React from 'react'

import styles from './About.styles'

const About = (): JSX.Element => {
	return (
		<Box sx={styles.about} component="section">
			<Container maxWidth="xl">
				<Typography variant="h2" sx={styles.sectionHeading}>
					Why Create Here?
				</Typography>
				<Grid container spacing={3}>
					<Grid item xs={12} sm={6}>
						<Box sx={{ mb: 4 }}>
							<Typography sx={styles.blurbBold}>Like having fun?</Typography>
							<Typography sx={styles.blurb}>
								Join our collaborative experiment with new internet friends from all over the world.
							</Typography>
						</Box>
						<Box sx={{ mb: 4 }}>
							<Typography sx={styles.blurbBold}>Like open source?</Typography>
							<Typography sx={styles.blurb}>
								All stems and songs are dedicated to the public domain under the CC0 license. All files are hosted
								directly on IPFS.
							</Typography>
						</Box>
						<Box sx={{ mb: 4 }}>
							<Typography sx={styles.blurbBold}>Like earning money?</Typography>
							<Typography sx={styles.blurb}>
								All projects are for sale as NFTs, and if you contributed a stem, you get paid (including royalties from
								secondary sales).
							</Typography>
						</Box>
					</Grid>
					<Grid item xs={12} sm={6}>
						<Box sx={{ mb: 4 }}>
							<Typography sx={styles.blurbBold}>Hard drive full of &quot;WIP&quot; tracks collecting dust?</Typography>
							<Typography sx={styles.blurb}>
								Dig through &apos;em. One of your gently used stems could be worth something on Arbor.
							</Typography>
						</Box>
						<Box sx={{ mb: 4 }}>
							<Typography sx={styles.blurbBold}>Looking to expand your creative horizons?</Typography>
							<Typography sx={styles.blurb}>
								Every project comes with unique constraints, so every project serves as a fascinating creative exercise.
							</Typography>
						</Box>
						<Box sx={{ mb: 4 }}>
							<Typography sx={styles.blurbBold}>Crunched for time?</Typography>
							<Typography sx={styles.blurb}>All contributions are welcome, even if it&apos;s just one stem.</Typography>
						</Box>
					</Grid>
				</Grid>
				<Box sx={{ textAlign: 'center', color: '#fff' }}>
					<Link href="/projects" passHref>
						<Button size="large" variant="contained" color="primary" sx={styles.btn}>
							Explore Projects
						</Button>
					</Link>
				</Box>
			</Container>
		</Box>
	)
}

export default About
