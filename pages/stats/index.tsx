import { Container, Divider, Typography } from '@mui/material'
import type { GetServerSideProps, NextPage } from 'next'
import Head from 'next/head'
import Link from 'next/link'
import PropTypes from 'prop-types'

import CovalentInsights from '../../components/CovalentInsights'
import { NFT_CONTRACT_ADDRESS } from '../../constants/contracts'
import { NETWORK_EXPLORER, NETWORK_ID, NETWORK_NAME } from '../../constants/networks'
import styles from '../../styles/Stats.styles'

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
				<title>Arbor | NFT Details</title>
			</Head>
			<Container maxWidth="xl" className="content-container">
				<Typography variant="h4" component="h1" sx={styles.title}>
					Arbor Audio NFT On-Chain Stats
				</Typography>
				<Container maxWidth="md">
					<Typography variant="h5" sx={styles.subtitle}>
						Check out the statistics for our ERC721 Token that handles all the interaction with the NFTs created on our
						platform.
					</Typography>
					<Typography variant="overline" sx={styles.text}>
						All statistics are powered by <Link href="https://www.covalenthq.com/">Covalent</Link> and are tracked
						against the <Link href={NETWORK_EXPLORER}>{NETWORK_NAME}</Link>
					</Typography>
				</Container>
				<Divider sx={styles.divider} />
				{/* @ts-ignore */}
				<CovalentInsights balData={balData} tokensData={tokensData} />
			</Container>
		</>
	)
}

NFTStatsPage.propTypes = propTypes

// Get data via Covalent API per network for token collection address
export const getServerSideProps: GetServerSideProps = async () => {
	// Ignore fetching this data for local builds
	if (process.env.NODE_ENV === 'development') return { props: { data: { balData: null, tokensData: null } } }

	// Get's token balance
	const balanceUrl = `https://api.covalenthq.com/v1/${NETWORK_ID}/address/${NFT_CONTRACT_ADDRESS}/balances_v2/?&key=${process.env.COVALENT_API_KEY}`
	const balRes = await fetch(balanceUrl)
	console.log({ balRes })
	const balJson = balRes.ok ? await balRes.json() : null
	const balData = balJson?.data

	// Gets all Tokens in collection
	const tokensUrl = `https://api.covalenthq.com/v1/${NETWORK_ID}/tokens/${NFT_CONTRACT_ADDRESS}/nft_token_ids/?&key=${process.env.COVALENT_API_KEY}`
	const tokensRes = await fetch(tokensUrl)
	console.log({ tokensRes })
	const tokensJson = tokensRes.ok ? await tokensRes.json() : null
	const tokensData = tokensJson?.data

	// TODO: Get metadata and tx history for each of the tokens in the collection and aggregate together for display
	// Warning: This could get slow with lots of tokens
	// const tokensMetadata = await tokensData.items.map(async (t: any) => {
	// 	const metaUrl = `https://api.covalenthq.com/v1/${NETWORK_HEX}/tokens/${NFT_CONTRACT_ADDRESS}/nft_metadata/${t.token_id}/?quote-currency=USD&format=JSON&key=${process.env.COVALENT_API_KEY}`
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
