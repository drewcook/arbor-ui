import LibraryMusicIcon from '@mui/icons-material/LibraryMusic'
import QueueMusicIcon from '@mui/icons-material/QueueMusic'
import { Box, Button, Card, CardActions, CardContent, IconButton, Typography } from '@mui/material'
import Link from 'next/link'
import ImageOptimized from './ImageOptimized'

const styles = {
	card: {
		minWidth: '200px',
	},
	cardMedia: {
		backgroundColor: '#23bcda',
		py: 3,
		px: 1.5,
	},
	cardMediaIcon: {
		color: '#fff',
		fontSize: '3rem',
	},
	projectIconLink: {
		ml: 1,
	},
	detailItem: {
		textTransform: 'uppercase',
		color: '#a8a8a8',
		fontWeight: 700,
		mb: 1,
	},
	actions: {
		justifyContent: 'flex-end',
	},
}

type NFTCardProps = {
	details: any // cid and token
}

const NFTCard = (props: NFTCardProps): JSX.Element => {
	const { details } = props

	return (
		<Card sx={styles.card} elevation={2}>
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
				<Typography variant="body2" sx={styles.detailItem}>
					Collaborators: {details.collaborators.length}
				</Typography>
				<Typography variant="body2" sx={styles.detailItem}>
					Samples: {details.samples.length}
				</Typography>
				<Typography variant="body2" sx={styles.detailItem}>
					Block #:{' '}
					<Link href={`https://rinkeby.etherscan.io/block/${details.token.blockNumber}`}>View on Etherscan</Link>
				</Typography>
				<Typography variant="body2" sx={styles.detailItem}>
					Tx Hash:{' '}
					<Link href={`https://rinkeby.etherscan.io/tx/${details.token.transactionHash}`}>View on Etherscan</Link>
				</Typography>
				<Typography variant="body2" sx={styles.detailItem}></Typography>
			</CardContent>
			<CardActions sx={styles.actions}>
				<Link href={details.metadataUrl} passHref>
					<Button color="primary">View on IPFS</Button>
				</Link>
			</CardActions>
		</Card>
	)
}

export default NFTCard
