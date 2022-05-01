import type { GetServerSideProps, NextPage } from 'next'
import { Container, Divider, Typography } from '@mui/material'
import CovalentInsights from '../../components/CovalentInsights'
import PropTypes from 'prop-types'
import Head from 'next/head'
import Link from 'next/link'

const styles = {
	title: {
		textTransform: 'uppercase',
		fontStyle: 'italic',
		fontWeight: 800,
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
	text: {
		display: 'block',
		textAlign: 'center',
		m: 0,
		lineHeight: '1.3rem',
		fontSize: '.95rem',
	},
	divider: {
		my: 3,
		borderColor: '#ccc',
	},
}

const propTypes = {
	data: PropTypes.shape({
		balData: PropTypes.shape({}).isRequired,
		tokensData: PropTypes.shape({}).isRequired,
	}).isRequired,
}

type NFTStatsPageProps = PropTypes.InferProps<typeof propTypes>

const NFTStatsPage: NextPage<NFTStatsPageProps> = props => {
	const {
		data: { balData, tokensData },
	} = props

	return (
		<>
			<Head>
				<title>Polyecho | NFT Details</title>
			</Head>
			<Typography variant="h4" component="h1" sx={styles.title}>
				Polyecho Audio NFT On-Chain Stats
			</Typography>
			<Container maxWidth="md">
				<Typography variant="h5" sx={styles.subtitle}>
					Check out the statistics for our ERC721 Token that handles all the interaction with the NFTs created on our
					platform.
				</Typography>
				<Typography variant="overline" sx={styles.text}>
					All statistics are powered by <Link href="https://www.covalenthq.com/">Covalent</Link> and are tracked against
					the <Link href="https://mumbai.polygonscan.com/">Polygon Mumbai testnet.</Link>
				</Typography>
			</Container>
			<Divider sx={styles.divider} />
			{/* @ts-ignore */}
			<CovalentInsights balData={balData} tokensData={tokensData} />
		</>
	)
}

NFTStatsPage.propTypes = propTypes

export const getServerSideProps: GetServerSideProps = async () => {
	// Get data via Covalent API per network for token collection address
	// TODO: Get current network id and do lookup in hashmap

	// Rinkeby
	// const contractAddress = '0xe9b33abb18c5ebe1edc1f15e68df651f1766e05e'
	// const chainId = 4

	// Kovan
	// const contractAddress = '0xaeca10e3d2db048db77d8c3f86a9b013b0741ba2'
	// const chainId = 42

	// Polygon Testnet - https://mumbai.polygonscan.com/address/0xBd0136694e9382127602abFa5AA0679752eaD313
	const contractAddress = '0xBd0136694e9382127602abFa5AA0679752eaD313'
	const chainId = 80001

	// Get's token balance
	const balRes = await fetch(
		`https://api.covalenthq.com/v1/${chainId}/address/${contractAddress}/balances_v2/?&key=${process.env.COVALENT_API_KEY}`,
	)
	const balJson = balRes.ok ? await balRes.json() : null
	const balData = balJson?.data

	// Gets all Tokens in collection
	const tokensUrl = `https://api.covalenthq.com/v1/${chainId}/tokens/${contractAddress}/nft_token_ids/?&key=${process.env.COVALENT_API_KEY}`
	const tokensRes = await fetch(tokensUrl)
	const tokensJson = tokensRes.ok ? await tokensRes.json() : null
	const tokensData = tokensJson?.data

	// TODO: Get metadata and tx history for each of the tokens in the collection and aggregate together for display
	// Warning: This could get slow with lots of tokens
	// const tokensMetadata = await tokensData.items.map(async (t: any) => {
	// 	const metaUrl = `https://api.covalenthq.com/v1/${chainId}/tokens/${contractAddress}/nft_metadata/${t.token_id}/?quote-currency=USD&format=JSON&key=${process.env.COVALENT_API_KEY}`
	// 	const metaRes = await fetch(metaUrl)
	// 	const metaJson = metaRes.ok ? await metaRes.json() : null
	// 	const data = await metaJson?.data
	// 	return data
	// })
	// console.log(tokensMetadata)

	return {
		props: {
			data: {
				balData,
				tokensData,
			},
		},
	}
}

export default NFTStatsPage
