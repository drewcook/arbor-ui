import QueueMusicIcon from '@mui/icons-material/QueueMusic'
import { Box, Button, Card, CardActions, CardContent, Chip, IconButton, Typography } from '@mui/material'
import Image from 'next/image'
import Link from 'next/link'
import PolygonIcon from '../public/polygon_logo_black.png'
import formatAddress from '../utils/formatAddress'
import formatDate from '../utils/formatDate'
import ImageOptimized from './ImageOptimized'

const styles = {
	buyableChip: {
		textTransform: 'uppercase',
		fontWeight: 800,
		fontSize: '1rem',
		position: 'absolute',
		top: '1.5rem',
		right: '-1rem',
		backgroundColor: '#ff5200',
		py: 2.5,
		color: '#fff',
		zIndex: 1,
	},
	card: {
		minWidth: '200px',
		position: 'relative',
		overflow: 'visible',
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
		fontWeight: 600,
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
				{details.isListed && <Chip label="Listed For Sale" size="medium" sx={styles.buyableChip} />}
				<CardContent>
					<Box className="nft-card-media">
						<Image
							src="https://bafkreia7jo3bjr2mirr5h2okf5cjsgg6zkz7znhdboyikchoe6btqyy32u.ipfs.dweb.link/"
							alt="PolyEcho NFT Image"
							width={400}
							height={400}
							title="PolyEcho NFT Image"
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
				</CardContent>
				<CardActions sx={styles.actions}>
					{details.isListed ? (
						<Box sx={styles.buyNowPrice}>
							<Box sx={styles.price}>
								<ImageOptimized src={PolygonIcon} width={28} height={28} alt="Polygon" />
								<Typography variant="h5" component="div" sx={{ ml: 0.75 }}>
									{details.listPrice}{' '}
									<Typography sx={styles.eth} component="span">
										MATIC
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
