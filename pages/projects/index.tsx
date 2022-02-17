import type { NextPage } from 'next'
import Head from 'next/head'
import Footer from '../../components/Footer'
import Header from '../../components/Header'
import { Container, Typography } from '@mui/material'

const Home: NextPage = () => {
	return (
		<div>
			<Head>
				<title>ETHDenver Hack Web App | Explore Music Projects</title>
				<meta name="description" content="A hackathon music app" />
				<link rel="icon" href="/favicon.ico" />
			</Head>

			<Header />

			<main>
				<Container maxWidth="lg">
					<Typography variant="h1">Explore Music Projects</Typography>
					<Typography>
						Here we will loop through active projects we receive from our backend..
					</Typography>
				</Container>
			</main>

			<Footer />
		</div>
	)
}

export default Home
