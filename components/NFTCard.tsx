import LibraryMusicIcon from '@mui/icons-material/LibraryMusic'
import QueueMusicIcon from '@mui/icons-material/QueueMusic'
import { Box, Button, Card, CardActions, CardContent, Chip, IconButton, Typography } from '@mui/material'
import Link from 'next/link'
import EthereumIcon from '../public/ethereum_vector.png'
import formatAddress from '../utils/formatAddress'
import formatDate from '../utils/formatDate'
import ImageOptimized from './ImageOptimized'

const styles = {
	buyableChip: {
		textTransform: 'uppercase',
		fontWeight: 900,
		fontSize: '1rem',
		position: 'absolute',
		top: '1.5rem',
		right: '-1rem',
		// backgroundColor: '#91ff00',
		// backgroundColor: '#d1ff00',
		backgroundColor: '#ff5200',
		py: 2.5,
		color: '#fff',
	},
	card: {
		position: 'relative',
		minWidth: '200px',
		overflow: 'visible',
	},
	cardMedia: {
		backgroundColor: '#111',
		borderBottom: '10px solid #4CE79D',
		py: 1,
		px: 1.5,
	},
	cardMediaIcon: {
		color: '#fff',
		fontSize: '2rem',
	},
	projectIconLink: {
		ml: 1,
	},
	createdAt: {
		fontWeight: 300,
		fontStyle: 'italic',
		my: 1,
	},
	detailItem: {
		textTransform: 'uppercase',
		color: '#a8a8a8',
		fontWeight: 700,
		mb: 1,
	},
	actions: {
		alignItems: 'flex-end',
		justifyContent: 'space-between',
	},
	buyNowBtn: {
		ml: 1,
	},
	buyNowPrice: {
		mt: 3,
		display: 'flex',
		alignItems: 'center',
	},
	price: {
		display: 'flex',
		alignItems: 'center',
	},
	eth: {
		color: '#aaa',
		fontSize: '1rem',
	},
}

type NFTCardProps = {
	details: any // cid and token
}

const NFTCard = (props: NFTCardProps): JSX.Element => {
	const { details } = props
	// const { connected, handleConnectWallet, currentUser } = useWeb3()

	// const handleBuyNft = () => {
	// 	console.log('buy this nft', details._id)
	// }

	return (
		<>
			<Card sx={styles.card} elevation={2}>
				{details.isListed && <Chip label="Listed For Sale!" size="medium" sx={styles.buyableChip} />}
				<Box sx={styles.cardMedia}>
					<LibraryMusicIcon sx={styles.cardMediaIcon} />
				</Box>
				<CardContent>
					<Box className="nft-card-media">
						<ImageOptimized
							src="https://bafkreia7jo3bjr2mirr5h2okf5cjsgg6zkz7znhdboyikchoe6btqyy32u.ipfs.dweb.link/"
							alt="PolyEcho NFT"
							width={400}
							height={400}
						/>
					</Box>
					<Typography variant="h5" gutterBottom>
						{details.name ?? 'Project Name'}
						<IconButton sx={styles.projectIconLink} color="secondary">
							<Link href={`/projects/${details.projectId}`} passHref>
								<QueueMusicIcon />
							</Link>
						</IconButton>
					</Typography>
					<Typography sx={styles.createdAt}>Created {formatDate(details.createdAt)}</Typography>
					<Typography variant="body2" sx={styles.detailItem}>
						Owner: {formatAddress(details.owner)}
					</Typography>
					<Typography variant="body2" sx={styles.detailItem}>
						Collaborators: {details.collaborators.length}
					</Typography>
					<Typography variant="body2" sx={styles.detailItem}>
						Samples: {details.samples.length}
					</Typography>
					<Typography variant="body2" sx={styles.detailItem}>
						Block #:{' '}
						<Link href={`https://rinkeby.etherscan.io/block/${details.token.data.blockNumber}`}>View on Etherscan</Link>
					</Typography>
					<Typography variant="body2" sx={styles.detailItem}>
						Tx Hash:{' '}
						<Link href={`https://rinkeby.etherscan.io/tx/${details.token.data.transactionHash}`}>
							View on Etherscan
						</Link>
					</Typography>
				</CardContent>
				<CardActions sx={styles.actions}>
					{details.isListed ? (
						<Box sx={styles.buyNowPrice}>
							<Box sx={styles.price}>
								<ImageOptimized src={EthereumIcon} width={30} height={30} alt="Ethereum" />
								<Typography variant="h5" component="div">
									{details.listPrice}{' '}
									<Typography sx={styles.eth} component="span">
										ETH
									</Typography>
								</Typography>
							</Box>
						</Box>
					) : (
						<Box /> // To force justify-between
					)}
					<Link href={`/nfts/${details._id}`} passHref>
						<Button color="secondary">View Details</Button>
					</Link>
					{/* {details.isListed && currentUser?.address !== details.owner && (
						<Button
							variant="contained"
							color="primary"
							onClick={connected ? handleBuyNft : handleConnectWallet}
							sx={styles.buyNowBtn}
						>
							Buy Now
						</Button>
					)} */}
				</CardActions>
			</Card>
		</>
	)
}

export default NFTCard
