import type { NextPage } from 'next'
import Head from 'next/head'
import Link from 'next/link'
import AppHeader from '../components/AppHeader'
import AppFooter from '../components/AppFooter'
import { Box, Button, Container, Typography } from '@mui/material'

const styles = {
	centered: {
		textAlign: 'center',
		pt: 5,
	},
	heading: {
		mb: 5,
	},
	p: {
		fontWeight: 300,
		py: 2,
	},
	btn: {
		mt: 5,
		color: '#fff',
		boxShadow: '5px 5px #23F09A',
	},
}

const Home: NextPage = () => {
	return (
		<>
			<Head>
				<title>PolyEcho | Welcome</title>
				<meta name="description" content="A hackathon music app" />
				<link rel="icon" href="/favicon.ico" />
			</Head>

			<AppHeader />

			<main id="app-main">
				<Container maxWidth="md">
					<Box sx={styles.centered}>
						<Typography variant="h2" component="h1" sx={styles.heading}>
							Make music for fun, and profit.
						</Typography>
						<Typography variant="h5" component="p" sx={styles.p}>
							<strong>POLYECHO</strong> is a schelling game where the objective is to publicly co-create songs worthy of
							purchase by NFT collectors.
						</Typography>
						<Typography variant="h5" component="p" sx={styles.p}>
							Collectors can explore, curate, and own a wild world of memetic music.
						</Typography>
						<Typography variant="h5" component="p" sx={styles.p}>
							Proceeds are distributed to the artists, including future royalties.
						</Typography>
						<Link href="/projects" passHref>
							<Button size="large" variant="contained" color="secondary" sx={styles.btn}>
								Get Started!
							</Button>
						</Link>
					</Box>
				</Container>
			</main>

			<AppFooter />
		</>
	)
}

export default Home
