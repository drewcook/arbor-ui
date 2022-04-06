import { ArrowDownward, ArrowUpward, Lightbulb, MusicNote, Sell } from '@mui/icons-material'
import { Box, Button, Container, Grid, List, ListItem, ListItemIcon, Typography } from '@mui/material'
import type { NextPage } from 'next'
import Head from 'next/head'
import Link from 'next/link'
import AppFooter from '../components/AppFooter'
import AppHeader from '../components/AppHeader'

const styles = {
	banner: {
		py: '100px',
		backgroundColor: '#111',
		color: '#fff',
	},
	heading: {
		mb: 5,
		fontSize: '5rem',
		fontWeight: 500,
	},
	subHeading: {
		mb: 1,
		span: {
			fontSize: 'inherit',
		},
	},
	features: {
		py: 10,
		textAlign: 'center',
	},
	featureBox: {
		m: 2,
		border: '3px solid #000',
		backgroundColor: '#fafafa',
	},
	featureBlock: {
		minHeight: '2.5rem',
		border: '2px solid #000',
		backgroundColor: '#fff',
		m: 2,
		display: 'flex',
		alignItems: 'center',
		justifyContent: 'center',
		fontWeight: 700,
		'&.bigBlock': {
			minHeight: '5rem',
			fontSize: '1.2rem',
		},
		'&[data-color="red"]': {
			backgroundColor: '#FFA1A1',
		},
		'&[data-color="purple"]': {
			backgroundColor: '#D6A1FF',
		},
		'&[data-color="blue"]': {
			backgroundColor: '#A1EEFF',
		},
		'&[data-color="yellow"]': {
			backgroundColor: '#FDFFA1',
		},
		'&[data-color="multi"]': {
			background: 'linear-gradient(94.22deg, #FFA1A1 9.36%, #A1AAFF 33.65%, #A1EEFF 65.94%, #FDFFA1 89.96%);',
		},
	},
	about: {
		py: 10,
		backgroundColor: '#fafafa',
	},
	blurbBold: {
		fontWeight: 600,
		fontSize: '1.3rem',
		mb: 0.5,
	},
	blurb: {
		mb: 5,
		fontSize: '1.3rem',
	},
	btn: {
		fontWeight: 800,
		fontStyle: 'italic',
		fontSize: '2rem',
		letterSpacing: '.5px',
		color: '#fff',
		mt: 5,
	},
}

const Home: NextPage = () => {
	return (
		<>
			<Head>
				<title>PolyEcho | Welcome</title>
				<meta
					name="description"
					content="PolyEcho is a schelling game where the objective is to publicly co-create songs worthy of purchase by NFT collectors."
				/>
				<link rel="icon" href="/favicon.ico" />
			</Head>

			<AppHeader />

			<main id="app-main" className="homepage">
				<Box sx={styles.banner} component="section" className="homepage-banner">
					<Container maxWidth="xl">
						<Grid container spacing={3}>
							<Grid item xs={12} sm={8} lg={6}>
								<Typography variant="h2" sx={styles.heading}>
									Create Together,
									<br />
									Earn Together.
								</Typography>
								<List>
									<ListItem>
										<ListItemIcon sx={{ color: '#fff' }}>
											<MusicNote />
										</ListItemIcon>
										<Typography variant="h5" component="p" sx={styles.subHeading}>
											Co-create songs with anyone
										</Typography>
									</ListItem>
									<ListItem>
										<ListItemIcon sx={{ color: '#fff' }}>
											<MusicNote />
										</ListItemIcon>
										<Typography variant="h5" component="p" sx={styles.subHeading}>
											Use the DAW you already love
										</Typography>
									</ListItem>
									<ListItem>
										<ListItemIcon sx={{ color: '#fff' }}>
											<MusicNote />
										</ListItemIcon>
										<Typography variant="h5" component="p" sx={styles.subHeading}>
											Collectors buy songs as NFTs
										</Typography>
									</ListItem>
									<ListItem>
										<ListItemIcon sx={{ color: '#fff' }}>
											<MusicNote />
										</ListItemIcon>
										<Typography variant="h5" component="p" sx={styles.subHeading}>
											The artists earn{' '}
											<Typography component="span" sx={{ textDecoration: 'underline' }}>
												all
											</Typography>{' '}
											proceeds.
										</Typography>
									</ListItem>
								</List>
							</Grid>
						</Grid>
					</Container>
				</Box>
				<Box sx={styles.features} component="section">
					<Container maxWidth="xl">
						<Typography variant="h2" sx={{ fontSize: '5rem', mb: 2 }}>
							How It Works
						</Typography>
						<Typography sx={{ fontSize: '2rem', mb: 7 }}>
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
				<Box sx={styles.about} component="section">
					<Container maxWidth="xl">
						<Typography variant="h2" gutterBottom>
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
										All projects are for sale as NFTs, and if you contributed a stem, you get paid (including royalties
										from secondary sales).
									</Typography>
								</Box>
							</Grid>
							<Grid item xs={12} sm={6}>
								<Box sx={{ mb: 4 }}>
									<Typography sx={styles.blurbBold}>
										Hard drive full of &quot;WIP&quot; tracks collecting dust?
									</Typography>
									<Typography sx={styles.blurb}>
										Dig through &apos;em. One of your gently used stems could be worth something on PolyEcho.
									</Typography>
								</Box>
								<Box sx={{ mb: 4 }}>
									<Typography sx={styles.blurbBold}>Looking to expand your creative horizons?</Typography>
									<Typography sx={styles.blurb}>
										Every project comes with unique constraints, so every project serves as a fascinating creative
										exercise.
									</Typography>
								</Box>
								<Box sx={{ mb: 4 }}>
									<Typography sx={styles.blurbBold}>Crunched for time?</Typography>
									<Typography sx={styles.blurb}>
										All contributions are welcome, even if it&apos;s just one stem.
									</Typography>
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
			</main>

			<AppFooter />
		</>
	)
}

export default Home
