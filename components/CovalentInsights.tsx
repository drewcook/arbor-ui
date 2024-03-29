import { ArrowForwardIos } from '@mui/icons-material'
import { Box, Button, Grid, Paper, Typography } from '@mui/material'
import Link from 'next/link'
import PropTypes from 'prop-types'
import web3 from 'web3'

import { NFT_CONTRACT_ADDRESS } from '../constants/contracts'
import { NETWORK_CURRENCY, NETWORK_EXPLORER } from '../constants/networks'
import formatAddress from '../utils/formatAddress'
import formatDate from '../utils/formatDate'
import prettyPrintJson from '../utils/prettyPrintJson'
import styles from './CovalentInsights.styles'

const propTypes = {
	balData: PropTypes.shape({
		address: PropTypes.string.isRequired,
		updated_at: PropTypes.string.isRequired,
		next_update_at: PropTypes.string.isRequired,
		quote_currency: PropTypes.string.isRequired,
		chain_id: PropTypes.number.isRequired,
		items: PropTypes.array.isRequired,
	}),
	tokensData: PropTypes.shape({
		items: PropTypes.array.isRequired,
		updated_at: PropTypes.string.isRequired,
	}),
	txData: PropTypes.shape({
		items: PropTypes.array.isRequired,
		updated_at: PropTypes.string.isRequired,
	}),
	metaData: PropTypes.shape({
		items: PropTypes.array.isRequired,
		updated_at: PropTypes.string.isRequired,
	}),
}

type CovalentInsightsProps = PropTypes.InferProps<typeof propTypes>

const CovalentInsights = (props: CovalentInsightsProps): JSX.Element => {
	const { balData, tokensData, txData, metaData } = props

	return (
		<>
			{balData && (
				<Paper elevation={2} sx={styles.covalentWrap}>
					<Typography variant="h4" sx={styles.cardTitle}>
						NFT Collection Stats
					</Typography>
					<Typography gutterBottom variant="body1">
						<Link href={`${NETWORK_EXPLORER}/address/${balData.address}`} passHref>
							<Button color="secondary" size="small" variant="contained" sx={styles.covalentBtn}>
								View Contract Address
							</Button>
						</Link>
					</Typography>
					<Typography variant="overline" sx={styles.covalentMeta}>
						<strong>Last Updated:</strong> {formatDate(balData.updated_at)}
					</Typography>
					<Typography variant="overline" sx={styles.covalentMeta}>
						<strong>Token Name:</strong> ArborAudio
					</Typography>
					<Typography variant="overline" sx={styles.covalentMeta}>
						<strong>Ticker Symbol:</strong> (ARBOR)
					</Typography>
				</Paper>
			)}
			{tokensData && (
				<Paper elevation={2} sx={styles.covalentWrap}>
					<Typography variant="h4" sx={styles.cardTitle}>
						Arbor Token Stats
					</Typography>
					<Typography variant="overline" sx={styles.covalentMeta}>
						<strong>Last Updated:</strong> {formatDate(tokensData.updated_at)}
					</Typography>
					<Typography variant="overline" sx={styles.covalentMeta}>
						<strong>Total Tokens Minted:</strong>{' '}
						<Typography component="span" sx={styles.numMinted}>
							{tokensData.items.length}
						</Typography>
					</Typography>
					{tokensData.items.map((token, idx) => (
						<Box sx={styles.tokenRow} key={idx}>
							<Typography variant="h6">Token #{token.token_id}</Typography>
							<Link href={`${NETWORK_EXPLORER}/token/${NFT_CONTRACT_ADDRESS}?a=${token.token_id}#inventory`} passHref>
								<Button variant="contained" size="small" color="secondary" endIcon={<ArrowForwardIos />}>
									View NFT
								</Button>
							</Link>
						</Box>
					))}
				</Paper>
			)}
			{metaData && (
				<Paper elevation={2} sx={styles.covalentWrap}>
					<Typography variant="h4" sx={styles.cardTitle}>
						Token Metadata
					</Typography>
					<Typography>Contract Name: {metaData.items[0].contract_name}</Typography>
					<Typography>Ticker Symbol: {metaData.items[0].contract_ticker_symbol}</Typography>
					<pre>
						<code
							className="code-block"
							dangerouslySetInnerHTML={{
								__html: prettyPrintJson(metaData.items[0].nft_data[0]),
							}}
						/>
					</pre>
				</Paper>
			)}
			{txData && (
				<Paper elevation={2} sx={styles.covalentWrap}>
					<Typography variant="h4" sx={styles.cardTitle}>
						Token Transaction Stats
					</Typography>
					<Typography variant="overline" sx={styles.covalentMeta}>
						Last Updated: {formatDate(txData.updated_at)}
					</Typography>
					<Typography variant="overline" sx={styles.covalentMeta}>
						Total Transactions: {txData.items[0].nft_transactions.length}
					</Typography>
					{txData.items.length > 0 && <Typography variant="h5">Transaction History</Typography>}
					{txData.items[0].nft_transactions.map((tx, idx) => {
						const hash = tx.tx_hash
						const to = tx.to_address
						const from = tx.from_address
						const value = tx.value
						const amount = web3.utils.fromWei(value, 'ether')
						const txNumber = txData.items[0].nft_transactions.length - idx
						return (
							<Box sx={styles.txRow} key={idx}>
								<Typography variant="h6">Transaction #{txNumber}</Typography>
								<Grid container spacing={1}>
									<Grid item xs={12} sm={6}>
										<Typography>
											Price: {amount} {NETWORK_CURRENCY}
										</Typography>
										<Typography>
											Hash: <Link href={`${NETWORK_EXPLORER}/tx/${hash}`}>{formatAddress(hash)}</Link>
										</Typography>
									</Grid>
									<Grid item xs={12} sm={6}>
										<Typography>
											From: <Link href={`/users/${from}`}>{formatAddress(from)}</Link>
										</Typography>
										<Typography>
											To: <Link href={`/users/${to}`}>{formatAddress(to)}</Link>
										</Typography>
									</Grid>
								</Grid>
							</Box>
						)
					})}
				</Paper>
			)}
			<Typography variant="overline" sx={{ ...styles.covalentMeta, textAlign: 'center' }}>
				Powered by <Link href="https://www.covalenthq.com/">Covalent</Link>
			</Typography>
		</>
	)
}

CovalentInsights.propTypes = propTypes

export default CovalentInsights
