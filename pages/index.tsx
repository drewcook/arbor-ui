import { Box, Button, Container, Divider, List, ListItem, ListItemText, Typography } from '@mui/material'
import type { NextPage } from 'next'
import Head from 'next/head'
import Link from 'next/link'
import { useEffect } from 'react'
import AppFooter from '../components/AppFooter'
import AppHeader from '../components/AppHeader'
import { useWeb3 } from '../components/Web3Provider'

const styles = {
	divider: {
		my: 3,
		borderColor: '#ccc',
	},
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
	const { contract, currentUser } = useWeb3()

	useEffect(() => {
		getCollectionDetails()
	}, [])

	const getCollectionDetails = async () => {
		try {
			console.log(contract)
			const totalSupply = await contract.methods.totalSupply().call({ from: currentUser?.address })
			console.log({ totalSupply })
		} catch (e: any) {
			console.error(e.message)
		}
	}
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
					<Divider light sx={styles.divider} />
					<Typography variant="h2">NFTs</Typography>
					<List>
						<ListItem>
							<ListItemText>Total Supply: {}</ListItemText>
						</ListItem>
					</List>
				</Container>
			</main>

			<AppFooter />
		</>
	)
}

export default Home
