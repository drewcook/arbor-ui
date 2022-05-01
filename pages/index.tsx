import { ArrowDownward, ArrowUpward, Lightbulb, MusicNote, Sell } from '@mui/icons-material'
import { Box, Button, Container, Grid, List, ListItem, ListItemIcon, Typography } from '@mui/material'
import type { NextPage } from 'next'
import Head from 'next/head'
import Link from 'next/link'

const styles = {
	negateMainPadding: {
		m: '-5rem 0',
	},
	banner: {
		py: '100px',
		backgroundColor: '#111',
		color: '#fff',
		background: 'url("/banner_bg.png") center center no-repeat',
		backgroundSize: 'cover',
	},
	heading: {
		mb: 5,
		fontSize: '3rem',
		fontWeight: 500,
		'@media (min-width: 600px)': {
			fontSize: '5rem',
		},
	},
	subHeading: {
		mb: 1,
		span: {
			fontSize: 'inherit',
		},
	},
	sectionHeading: {
		mb: 5,
		fontSize: '3rem',
		'@media (min-width: 600px)': {
			fontSize: '4rem',
		},
	},
	howItWorksText: {
		fontSize: '1.5rem',
		mb: 7,
		'@media (min-width: 600px)': {
			fontSize: '1.75rem',
			mb: 10,
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
		fontSize: '1.2rem',
		letterSpacing: '.5px',
		color: '#fff',
		mt: 5,
		'@media (min-width: 600px)': {
			fontSize: '1.6rem',
		},
	},
}

const Home: NextPage = () => {
	return (
		<>
			<Head>
				<title>Polyecho | A Generative Music NFT Platform</title>
			</Head>
			<Box sx={styles.negateMainPadding}>
				<Box sx={styles.banner} component="section" className="homepage-banner">
					<Container maxWidth="xl">
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
					</Container>
				</Box>
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
			</Box>
		</>
	)
}

export default Home
