import { Box, Button, Divider, Grid, Paper, Typography } from '@mui/material'
import Link from 'next/link'
import PropTypes from 'prop-types'
import formatAddress from '../utils/formatAddress'
import formatDate from '../utils/formatDate'
import prettyPrintJson from '../utils/prettyPrintJson'
import web3 from 'web3'

const styles = {
	covalentWrap: {
		p: 2,
		mb: 2,
		background: '#fafafa',
		border: '1px solid #ccc',
	},
	covalentBtn: {
		my: 2,
	},
	noDataMsg: {
		my: 3,
		textAlign: 'center',
	},
	divider: {
		my: 3,
		borderColor: '#ccc',
	},
	txRow: {
		textAlign: 'left',
		p: 2,
	},
	covalentMeta: {
		display: 'block',
		mb: 0.5,
	},
}

const propTypes = {
	data: PropTypes.shape({
		balData: PropTypes.shape({
			data: PropTypes.shape({
				address: PropTypes.string.isRequired,
				updated_at: PropTypes.string.isRequired,
				next_update_at: PropTypes.string.isRequired,
				quote_currency: PropTypes.string.isRequired,
				chain_id: PropTypes.number.isRequired,
				items: PropTypes.array.isRequired,
			}).isRequired,
		}),
		tokensData: PropTypes.shape({
			data: PropTypes.shape({
				items: PropTypes.array.isRequired,
				updated_at: PropTypes.string.isRequired,
			}).isRequired,
		}),
		txData: PropTypes.shape({
			data: PropTypes.shape({
				items: PropTypes.array.isRequired,
				updated_at: PropTypes.string.isRequired,
			}).isRequired,
		}),
		metaData: PropTypes.shape({
			data: PropTypes.shape({
				items: PropTypes.array.isRequired,
				updated_at: PropTypes.string.isRequired,
			}).isRequired,
		}),
	}).isRequired,
}

type CovalentInsightsProps = PropTypes.InferProps<typeof propTypes>

const CovalentInsights = (props: CovalentInsightsProps): JSX.Element => {
	const { data } = props

	return (
		<Paper elevation={2} sx={styles.covalentWrap}>
			<Typography variant="h4" gutterBottom>
				NFT Collection Stats
			</Typography>
			{data.balData ? (
				<>
					<Typography gutterBottom variant="body1">
						<Link href={`https://mumbai.polygonscan.com/address/${data.balData.data.address}`} passHref>
							<Button color="secondary" size="small" variant="outlined" sx={styles.covalentBtn}>
								View Contract Address
							</Button>
						</Link>
					</Typography>
					<Typography variant="overline" sx={styles.covalentMeta}>
						Last Updated: {formatDate(data.balData.data.updated_at)}
					</Typography>
				</>
			) : (
				<Typography sx={styles.noDataMsg}>
					No data to show. Make sure you are connected on the Polygon Mumbai testnet.
				</Typography>
			)}
			{data.metaData && (
				<>
					<Typography>Contract Name: {data.metaData.data.items[0].contract_name}</Typography>
					<Typography>Ticker Symbol: {data.metaData.data.items[0].contract_ticker_symbol}</Typography>
				</>
			)}
			<Divider sx={styles.divider} />
			<Typography variant="h4" gutterBottom>
				PolyEchoNFT Token Stats
			</Typography>
			{data.tokensData ? (
				<>
					<Typography variant="overline" sx={styles.covalentMeta}>
						Last Updated: {formatDate(data.tokensData.data.updated_at)}
					</Typography>
					<Typography variant="overline" sx={styles.covalentMeta}>
						Total Tokens Minted: {data.tokensData.data.items.length}
					</Typography>
				</>
			) : (
				<Typography sx={styles.noDataMsg}>
					No data to show. Make sure you are connected on the Polygon Mumbai testnet.
				</Typography>
			)}
			{data.metaData && (
				<>
					<Typography variant="h5" gutterBottom>
						Token Metadata
					</Typography>
					<pre>
						<code
							className="code-block"
							dangerouslySetInnerHTML={{
								__html: prettyPrintJson(data.metaData.data.items[0].nft_data[0]),
							}}
						/>
					</pre>
				</>
			)}
			<Typography variant="h5" gutterBottom>
				Token Transaction Stats
			</Typography>
			{data.txData ? (
				<>
					<Typography variant="overline" sx={styles.covalentMeta}>
						Last Updated: {formatDate(data.txData.data.updated_at)}
					</Typography>
					<Typography variant="overline" sx={styles.covalentMeta}>
						Total Transactions: {data.txData.data.items.length}
					</Typography>
					{data.txData.data.items.length > 0 && <Typography variant="h5">Transaction History</Typography>}
					{data.txData.data.items.map((tx, idx) => {
						const hash = tx.nft_transactions[0].tx_hash
						const to = tx.nft_transactions[0].to_address
						const from = tx.nft_transactions[0].from_address
						const value = tx.nft_transactions[0].value
						const amount = web3.utils.fromWei(value, 'ether')
						return (
							<Box sx={styles.txRow} key={idx}>
								<Typography variant="h6">Transaction {idx + 1}</Typography>
								<Grid container spacing={1}>
									<Grid item xs={12} sm={6}>
										<Typography>Price: {amount} MATIC</Typography>
										<Typography>Hash: {formatAddress(hash)}</Typography>
									</Grid>
									<Grid item xs={12} sm={6}>
										<Typography>From: {formatAddress(from)}</Typography>
										<Typography>To: {formatAddress(to)}</Typography>
									</Grid>
								</Grid>
							</Box>
						)
					})}
				</>
			) : (
				<Typography sx={styles.noDataMsg}>
					No data to show. Make sure you are connected on the Polygon Mumbai testnet.
				</Typography>
			)}
			<Divider sx={styles.divider} />
			<Typography variant="overline" sx={{ ...styles.covalentMeta, textAlign: 'center' }}>
				Powered by <Link href="https://www.covalenthq.com/">Covalent</Link>
			</Typography>
		</Paper>
	)
}

CovalentInsights.propTypes = propTypes

export default CovalentInsights
