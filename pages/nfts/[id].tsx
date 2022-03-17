import { Box, Button, Chip, CircularProgress, Container, Divider, Grid, Paper, Typography } from '@mui/material'
import type { GetServerSideProps, NextPage } from 'next'
import Head from 'next/head'
import Link from 'next/link'
import { useRouter } from 'next/router'
import PropTypes from 'prop-types'
import { useState } from 'react'
import AppFooter from '../../components/AppFooter'
import AppHeader from '../../components/AppHeader'
import ImageOptimized from '../../components/ImageOptimized'
import ListNftDialog from '../../components/ListNftDialog'
import Notification from '../../components/Notification'
import SampleCard from '../../components/SampleCard'
import { useWeb3 } from '../../components/Web3Provider'
import EthereumIcon from '../../public/ethereum_icon.png'
import formatAddress from '../../utils/formatAddress'
import formatDate from '../../utils/formatDate'
import { get, update } from '../../utils/http'

const styles = {
	title: {
		textTransform: 'uppercase',
		fontStyle: 'italic',
		fontWeight: 900,
		display: 'flex',
		alignItems: 'center',
	},
	buyableChip: {
		ml: 1,
		textTransform: 'uppercase',
		fontWeight: 900,
		fontSize: '1rem',
		backgroundColor: '#ff5200',
		color: '#fff',
	},
	metadata: {
		my: 2,
	},
	metadataKey: {
		mr: 1,
		display: 'inline-block',
		color: '#a8a8a8',
	},
	buyNowListing: {
		mt: 3,
		display: 'flex',
		alignItems: 'center',
	},
	buyNowBtn: {
		width: '9rem',
		boxShadow: '5px 5px #23F09A',
	},
	price: {
		display: 'flex',
		alignItems: 'center',
		pl: 3,
	},
	eth: {
		color: '#aaa',
		fontSize: '1rem',
	},
	btn: {
		mb: 2,
		display: 'block',
		textAlign: 'center',
	},
	covalentWrap: {
		p: 2,
		mb: 2,
		background: '#fafafa',
		border: '1px solid #ccc',
		textAlign: 'center',
	},
	covalentBtn: {
		my: 2,
	},
	covalentMeta: {
		display: 'block',
		mb: 0.5,
	},
	divider: {
		my: 3,
		borderColor: '#ccc',
	},
	sectionMeta: {
		fontStyle: 'italic',
		fontWeight: 300,
		textTransform: 'uppercase',
		color: '#777',
		mb: 2,
	},
	sectionCount: {
		fontWeight: 300,
		color: '#777',
		ml: 1,
		fontSize: '1.5rem',
	},
	collaborator: {
		my: 3,
		display: 'flex',
	},
	collaboratorMeta: {
		color: '#a8a8a8',
		mr: 2,
	},
	noItemsMsg: {
		textAlign: 'center',
		marginY: 4,
	},
	error: {
		textAlign: 'center',
		marginY: 4,
	},
}

const propTypes = {
	covalentData: PropTypes.shape({
		items: PropTypes.arrayOf(
			PropTypes.shape({
				contract_address: PropTypes.string.isRequired,
				nft_transactions: PropTypes.arrayOf(PropTypes.shape({})).isRequired,
				type: PropTypes.string.isRequired,
			}),
		).isRequired,
		updated_at: PropTypes.string.isRequired,
	}).isRequired,
	data: PropTypes.shape({
		_id: PropTypes.string.isRequired,
		token: PropTypes.shape({
			id: PropTypes.number.isRequired,
			tokenURI: PropTypes.string.isRequired,
			data: PropTypes.shape({
				blockNumber: PropTypes.number.isRequired,
				transactionHash: PropTypes.string.isRequired,
			}),
		}).isRequired,
		createdAt: PropTypes.string.isRequired,
		createdBy: PropTypes.string.isRequired,
		owner: PropTypes.string.isRequired,
		isListed: PropTypes.bool.isRequired,
		listPrice: PropTypes.number.isRequired,
		metadataUrl: PropTypes.string.isRequired,
		audioHref: PropTypes.string.isRequired,
		name: PropTypes.string.isRequired,
		projectId: PropTypes.string.isRequired,
		collaborators: PropTypes.arrayOf(PropTypes.string.isRequired).isRequired,
		samples: PropTypes.arrayOf(
			PropTypes.shape({
				_id: PropTypes.string.isRequired,
				metadataUrl: PropTypes.string.isRequired,
				audioUrl: PropTypes.string.isRequired,
				audioHref: PropTypes.string.isRequired,
			}).isRequired,
		).isRequired,
	}).isRequired,
}

type NftDetailsPageProps = PropTypes.InferProps<typeof propTypes>

const NftDetailsPage: NextPage<NftDetailsPageProps> = props => {
	const { covalentData, data } = props
	const [details, setDetails] = useState(data)
	const [loading, setLoading] = useState<boolean>(false)
	const [successOpen, setSuccessOpen] = useState<boolean>(false)
	const [successMsg, setSuccessMsg] = useState<string>('')
	const [errorOpen, setErrorOpen] = useState<boolean>(false)
	const [errorMsg, setErrorMsg] = useState<string>('')
	const contractData = covalentData ? covalentData.items[0] : null
	const { connected, handleConnectWallet, currentUser, contract, web3 } = useWeb3()
	const router = useRouter()

	const handleBuyNft = async () => {
		setLoading(true)
		try {
			if (currentUser) {
				// Call smart contract to make transfer
				const amount = web3.utils.toWei(details.listPrice.toString(), 'ether')
				const scRes: any = await contract.methods
					.buy(details.token.id)
					.send({ from: currentUser.address, value: amount, gas: 650000 })

				console.log({ scRes })

				if (!scRes) throw new Error('Failed to transfer the NFT on-chain')

				// Make PUT request to change ownership
				const res = await update(`/nfts/${details._id}`, {
					isListed: false,
					listPrice: 0,
					owner: currentUser.address,
					buyer: currentUser.address,
					seller: details.owner,
				})
				if (!res.success) throw new Error('Failed to update the NFT ownership details', res.error)

				// Notify success
				if (!successOpen) setSuccessOpen(true)
				setLoading(false)
				setSuccessMsg('Success! You have bought this NFT, redirecting...')

				// Redirect to user's profile page
				router.push(`/users/${currentUser.address}`)
			}
		} catch (e: any) {
			// Log and notify error
			console.error(e.message)
			setErrorOpen(true)
			setErrorMsg('Uh oh, failed to buy the NFT')
			setLoading(false)
		}
	}

	const onNotificationClose = () => {
		setSuccessOpen(false)
		setSuccessMsg('')
		setErrorOpen(false)
		setErrorMsg('')
	}

	// Refetch user details after successfully listing a card
	const handleListSuccess = async () => {
		try {
			const res = await get(`/nfts/${details._id}`)
			const data: any | null = res.success ? res.data : null
			setDetails(data)
		} catch (e: any) {
			console.error(e.message)
		}
	}

	return (
		<>
			<Head>
				<title>PolyEcho | NFT Details</title>
				<meta
					name="description"
					content="PolyEcho is a schelling game where the objective is to publicly co-create songs worthy of purchase by NFT collectors."
				/>
				<link rel="icon" href="/favicon.ico" />
			</Head>

			<AppHeader />

			<main id="app-main">
				<Container maxWidth="xl">
					{data ? (
						<>
							<Grid container spacing={4}>
								<Grid item xs={12} md={5}>
									<Box>
										<Typography variant="h4" component="h2" sx={styles.title}>
											NFT Details
											{details.isListed && (
												<Chip label="Listed For Sale!" size="medium" color="primary" sx={styles.buyableChip} />
											)}
										</Typography>
										{details.isListed && currentUser?.address !== details.owner && (
											<Box sx={styles.buyNowListing}>
												<Button
													size="large"
													onClick={connected ? handleBuyNft : handleConnectWallet}
													variant="contained"
													color="secondary"
													sx={styles.buyNowBtn}
													disabled={loading}
												>
													{loading ? <CircularProgress size={18} sx={{ my: 0.5 }} /> : 'Buy Now'}
												</Button>
												<Box sx={styles.price}>
													<ImageOptimized src={EthereumIcon} width={50} height={50} alt="Ethereum" />
													<Typography variant="h4" component="div">
														{details.listPrice}{' '}
														<Typography sx={styles.eth} component="span">
															ETH
														</Typography>
													</Typography>
												</Box>
											</Box>
										)}
										{currentUser?.address === details.owner &&
											(details.isListed ? (
												<Box sx={styles.buyNowListing}>
													<ListNftDialog unlist={true} nft={data} onListSuccess={handleListSuccess} />
													<Box sx={styles.price}>
														<ImageOptimized src={EthereumIcon} width={50} height={50} alt="Ethereum" />
														<Typography variant="h4" component="div">
															{details.listPrice}{' '}
															<Typography sx={styles.eth} component="span">
																ETH
															</Typography>
														</Typography>
													</Box>
												</Box>
											) : (
												<Box sx={{ my: 2 }}>
													<ListNftDialog nft={data} onListSuccess={handleListSuccess} />
												</Box>
											))}
										<Typography sx={styles.metadata}>
											<Typography component="span" sx={styles.metadataKey}>
												ID:
											</Typography>
											<Link href={`https://rinkeby.etherscan.io/token/${details.token.id}`}>
												{details.token.id.toString()}
											</Link>
										</Typography>
										<Typography sx={styles.metadata}>
											<Typography component="span" sx={styles.metadataKey}>
												Name:
											</Typography>
											<Link href={`/users/${details.createdBy}`}>{details.name}</Link>
										</Typography>
										<Typography sx={styles.metadata}>
											<Typography component="span" sx={styles.metadataKey}>
												Owner:
											</Typography>
											{formatAddress(details.owner)}
										</Typography>
										<Typography sx={styles.metadata}>
											<Typography component="span" sx={styles.metadataKey}>
												Minted By:
											</Typography>
											{formatAddress(details.createdBy)}
										</Typography>
										<Typography sx={styles.metadata}>
											<Typography component="span" sx={styles.metadataKey}>
												Minted On:
											</Typography>
											{formatDate(details.createdAt)}
										</Typography>
										<Typography sx={styles.metadata}>
											<Typography component="span" sx={styles.metadataKey}>
												Project ID:
											</Typography>
											<Link href={`/projects/${details.projectId}`}>{details.projectId}</Link>
										</Typography>
										<Typography variant="body2" sx={styles.metadata}>
											<Typography component="span" sx={styles.metadataKey}>
												Block #:{' '}
											</Typography>
											<Link href={`https://rinkeby.etherscan.io/block/${details.token.data.blockNumber}`}>
												View on Etherscan
											</Link>
										</Typography>
										<Typography variant="body2" sx={styles.metadata}>
											<Typography component="span" sx={styles.metadataKey}>
												Tx Hash:{' '}
											</Typography>
											<Link href={`https://rinkeby.etherscan.io/tx/${details.token.data.transactionHash}`}>
												View on Etherscan
											</Link>
										</Typography>
									</Box>
									<Link href={details.metadataUrl} passHref>
										<Button color="secondary" variant="outlined" fullWidth size="large" sx={styles.btn}>
											View NFT Metadata on IPFS
										</Button>
									</Link>
									<Link href="ipfs://[cid]/blob" passHref>
										<Button color="secondary" variant="outlined" fullWidth size="large" sx={styles.btn}>
											Listen to the Music NFT
										</Button>
									</Link>
								</Grid>
								<Grid item xs={12} md={7}>
									{contractData && (
										<Paper elevation={2} sx={styles.covalentWrap}>
											<Typography variant="h5" gutterBottom>
												ERC-721 Smart Contract Details
											</Typography>
											<Typography gutterBottom variant="body1">
												<Link href={`https://kovan.etherscan.io/address/${contractData.contract_address}`} passHref>
													<Button color="secondary" size="small" variant="outlined" sx={styles.covalentBtn}>
														View Kovan Contract
													</Button>
												</Link>
											</Typography>
											<Typography variant="overline" sx={styles.covalentMeta}>
												<strong>Contract Type:</strong> {contractData.type.toUpperCase()}
											</Typography>
											<Typography variant="overline" sx={styles.covalentMeta}>
												<strong>Total Transactions:</strong> {contractData.nft_transactions.length}
											</Typography>
											<Typography variant="overline" sx={styles.covalentMeta}>
												Last Updated: {formatDate(covalentData.updated_at)}
											</Typography>
											<Typography variant="overline" sx={styles.covalentMeta}>
												Powered by <Link href="https://www.covalenthq.com/">Covalent</Link>
											</Typography>
										</Paper>
									)}
								</Grid>
							</Grid>
							<Divider light sx={styles.divider} />
							<Typography variant="h4" gutterBottom>
								Collaborators
								<Typography component="span" sx={styles.sectionCount}>
									({details.collaborators.length})
								</Typography>
							</Typography>
							{details.collaborators.length > 0 ? (
								details.collaborators.map((collaborator: string, idx: number) => (
									<Box sx={styles.collaborator} key={collaborator}>
										<Typography sx={styles.collaboratorMeta}>#{idx + 1}:</Typography>
										<Typography>
											<Link href={`/users/${collaborator}`}>{formatAddress(collaborator)}</Link>
										</Typography>
									</Box>
								))
							) : (
								<Typography sx={styles.noItemsMsg}>This NFT contains no collaborators.</Typography>
							)}
							<Divider light sx={styles.divider} />
							<Typography variant="h4" gutterBottom>
								Samples
								<Typography component="span" sx={styles.sectionCount}>
									({details.samples.length})
								</Typography>
							</Typography>
							<Typography sx={styles.sectionMeta}>This NFT contains the following samples.</Typography>
							<Grid container spacing={4}>
								{details.samples.length > 0 ? (
									details.samples.map((sample: any) => (
										<Grid item sm={6} md={4} key={sample._id}>
											<SampleCard details={sample} />
										</Grid>
									))
								) : (
									<Grid item xs={12}>
										<Typography sx={styles.noItemsMsg}>This NFT contains no samples.</Typography>
									</Grid>
								)}
							</Grid>
						</>
					) : (
						<Typography sx={styles.error} color="error">
							Sorry, no details were found for this NFT.
						</Typography>
					)}
				</Container>
			</main>

			<AppFooter />

			{successOpen && <Notification open={successOpen} msg={successMsg} type="success" onClose={onNotificationClose} />}
			{errorOpen && <Notification open={errorOpen} msg={errorMsg} type="error" onClose={onNotificationClose} />}
		</>
	)
}

export const getServerSideProps: GetServerSideProps = async context => {
	// Get NFT details based off ID
	let nftId = context.query.id
	if (typeof nftId === 'object') nftId = nftId[0].toLowerCase()
	else nftId = nftId?.toLowerCase()

	// Get NFT data from database
	const res = await get(`/nfts/${nftId}`)
	const data: any | null = res.success ? res.data : null

	// Get data via Covalent API
	// const contractAddress = '0xe9b33abb18c5ebe1edc1f15e68df651f1766e05e' // ERC-721 PolyEchoSample contract (Rinkeby)
	const contractAddress = '0x02c4018D3A1966813a56bEbe1D89A7B8ec34b01E' // ERC-721 PolyEcho (ECHO) contract (Kovan)
	const chainId = 42 // Kovan
	const tokenId = 0 // Get latest from smart contract using web3.js
	// const tokenIdsUrl = `https://api.covalenthq.com/v1/${chainId}/tokens/${contractAddress}/nft_token_ids/?&key=${process.env.COVALENT_API_KEY}`
	// const metadataUrl = `https://api.covalenthq.com/v1/${chainId}/tokens/${contractAddress}/nft_metadata/${tokenId}/?quote-currency=USD&format=JSON&key=${process.env.COVALENT_API_KEY}`
	const transactionsUrl = `https://api.covalenthq.com/v1/${chainId}/tokens/${contractAddress}/nft_transactions/${tokenId}/?quote-currency=USD&format=JSON&key=${process.env.COVALENT_API_KEY}`
	const covalentRes = await fetch(transactionsUrl)
	const covalentData = covalentRes.ok ? await covalentRes.json() : null

	return {
		props: {
			covalentData: covalentData ? covalentData.data : null,
			data,
		},
	}
}

NftDetailsPage.propTypes = propTypes

export default NftDetailsPage
