import type { NextPage } from 'next'
import Head from 'next/head'
import Footer from '../components/Footer'
import Header from '../components/Header'
import { Box, Container, Typography } from '@mui/material'

const styles = {
	centered: {
		textAlign: 'center',
	},
}

const Home: NextPage = () => {
	return (
		<>
			<Head>
				<title>ETHDenver Hack Web App | Welcome</title>
				<meta name="description" content="A hackathon music app" />
				<link rel="icon" href="/favicon.ico" />
			</Head>

			<Header />

			<main>
				<Container maxWidth="lg">
					<Box sx={styles.centered}>
						<Typography variant="h3" component="h1">
							Welcome!
						</Typography>
						<Typography variant="h5" component="p">
							Collaborate with others and mint music NFTs, together!
						</Typography>
						<Typography variant="h5" component="p">
							Split the proceeds when the NFT sales, have ownership forever.
						</Typography>
					</Box>
				</Container>
			</main>

			<Footer />
		</>
	)
}

export default Home
