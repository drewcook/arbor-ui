import { Box, Button, Chip, CircularProgress, Container, Divider, Grid, Typography } from '@mui/material'
import type { GetServerSideProps, NextPage } from 'next'
import Head from 'next/head'
import Link from 'next/link'
import { useRouter } from 'next/router'
import PropTypes from 'prop-types'
import { useState } from 'react'
import AppFooter from '../../components/AppFooter'
import AppHeader from '../../components/AppHeader'
import CovalentInsights from '../../components/CovalentInsights'
import ImageOptimized from '../../components/ImageOptimized'
import ListNftDialog from '../../components/ListNftDialog'
import Notification from '../../components/Notification'
import StemCard from '../../components/StemCard'
import { useWeb3 } from '../../components/Web3Provider'
import PolygonIcon from '../../public/polygon_logo_black.png'
import formatAddress from '../../utils/formatAddress'
import formatDate from '../../utils/formatDate'
import { get, update } from '../../utils/http'

const styles = {
	title: {
		textTransform: 'uppercase',
		fontStyle: 'italic',
		fontWeight: 800,
		display: 'flex',
		alignItems: 'center',
	},
	buyableChip: {
		ml: 1,
		textTransform: 'uppercase',
		fontWeight: 800,
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
		fontWeight: 800,
		fontStyle: 'italic',
		fontSize: '1rem',
		letterSpacing: '.5px',
		color: '#111',
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
	covalentData: PropTypes.shape({}).isRequired,
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
		stems: PropTypes.arrayOf(
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
	const [details, setDetails] = useState<any>(data)
	const [loading, setLoading] = useState<boolean>(false)
	const [successOpen, setSuccessOpen] = useState<boolean>(false)
	const [successMsg, setSuccessMsg] = useState<string>('')
	const [errorOpen, setErrorOpen] = useState<boolean>(false)
	const [errorMsg, setErrorMsg] = useState<string>('')
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
				if (!scRes) throw new Error('Failed to transfer the NFT on-chain')

				// Make PUT request to change ownership
				const res = await update(`/nfts/${details._id}`, {
					isListed: false,
					listPrice: 0,
					owner: currentUser.address,
					buyer: currentUser.address,
					seller: details.owner,
				})
				if (!res.success) throw new Error(`Failed to update the NFT ownership details - ${res.error}`)

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
					{details ? (
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
													<ImageOptimized src={PolygonIcon} width={50} height={50} alt="Polygon" />
													<Typography variant="h4" component="div" sx={{ ml: 1 }}>
														{details.listPrice}{' '}
														<Typography sx={styles.eth} component="span">
															MATIC
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
														<ImageOptimized src={PolygonIcon} width={50} height={50} alt="Polygon" />
														<Typography variant="h4" component="div">
															{details.listPrice}{' '}
															<Typography sx={styles.eth} component="span">
																MATIC
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
												Collection:{' '}
											</Typography>
											<Link href="https://mumbai.polygonscan.com/token/0xbd0136694e9382127602abfa5aa0679752ead313">
												View On Explorer
											</Link>
										</Typography>
										<Typography sx={styles.metadata}>
											<Typography component="span" sx={styles.metadataKey}>
												ID:
											</Typography>
											<Link
												href={`https://mumbai.polygonscan.com/token/0xBd0136694e9382127602abFa5AA0679752eaD313?a=${details.token.id}#inventory`}
											>
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
											<Link href={`https://mumbai.polygonscan.com/block/${details.token.data.blockNumber}`}>
												View on Explorer
											</Link>
										</Typography>
										<Typography variant="body2" sx={styles.metadata}>
											<Typography component="span" sx={styles.metadataKey}>
												Tx Hash:{' '}
											</Typography>
											<Link href={`https://mumbai.polygonscan.com/tx/${details.token.data.transactionHash}`}>
												View on Explorer
											</Link>
										</Typography>
									</Box>
								</Grid>
								<Grid item xs={12} md={7}>
									{covalentData && <CovalentInsights data={covalentData} />}
									<Link href={details.metadataUrl} passHref>
										<Button variant="outlined" fullWidth size="large" sx={styles.btn}>
											View NFT Metadata on IPFS
										</Button>
									</Link>
									<Link href="ipfs://[cid]/blob" passHref>
										<Button variant="outlined" fullWidth size="large" sx={styles.btn}>
											Listen to the Music NFT
										</Button>
									</Link>
								</Grid>
							</Grid>
							<Divider light sx={styles.divider} />
							<Typography variant="h4" gutterBottom>
								Collaborators
								<Typography component="span" sx={styles.sectionCount}>
									({details.collaborators.length})
								</Typography>
							</Typography>
							<Typography sx={styles.sectionMeta}>This NFT was created by the following contributors</Typography>
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
								<Typography sx={styles.noItemsMsg}>This NFT contains no collaborators</Typography>
							)}
							<Divider light sx={styles.divider} />
							<Typography variant="h4" gutterBottom>
								Stems
								<Typography component="span" sx={styles.sectionCount}>
									({details.stems.length})
								</Typography>
							</Typography>
							<Typography sx={styles.sectionMeta}>This NFT contains the following stems</Typography>
							<Grid container spacing={4}>
								{details.stems.length > 0 ? (
									details.stems.map((stem: any) => (
										<Grid item sm={6} md={4} key={stem._id}>
											<StemCard details={stem} />
										</Grid>
									))
								) : (
									<Grid item xs={12}>
										<Typography sx={styles.noItemsMsg}>This NFT contains no stems</Typography>
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
	const balData = balRes.ok ? await balRes.json() : null

	// Gets all Tokens in collection
	const tokensUrl = `https://api.covalenthq.com/v1/${chainId}/tokens/${contractAddress}/nft_token_ids/?&key=${process.env.COVALENT_API_KEY}`
	const tokensRes = await fetch(tokensUrl)
	const tokensData = tokensRes.ok ? await tokensRes.json() : null

	// We'll need the token ID for this given NFT details, so only grab token-specific data if we have it
	let txData = null
	let metaData = null
	if (data && data.token.id !== null) {
		// Txs
		const txUrl = `https://api.covalenthq.com/v1/${chainId}/tokens/${contractAddress}/nft_transactions/${data.token.id}/?quote-currency=USD&format=JSON&key=${process.env.COVALENT_API_KEY}`
		const txRes = await fetch(txUrl)
		txData = txRes.ok ? await txRes.json() : null

		// Metadata
		const metaUrl = `https://api.covalenthq.com/v1/${chainId}/tokens/${contractAddress}/nft_metadata/${data.token.id}/?quote-currency=USD&format=JSON&key=${process.env.COVALENT_API_KEY}`
		const metaRes = await fetch(metaUrl)
		metaData = metaRes.ok ? await metaRes.json() : null
	}

	return {
		props: {
			covalentData: {
				balData,
				tokensData,
				txData,
				metaData,
			},
			data,
		},
	}
}

NftDetailsPage.propTypes = propTypes

export default NftDetailsPage
