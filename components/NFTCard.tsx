import LibraryMusicIcon from '@mui/icons-material/LibraryMusic'
import QueueMusicIcon from '@mui/icons-material/QueueMusic'
import { Box, Button, Card, CardActions, CardContent, IconButton, Typography } from '@mui/material'
import Link from 'next/link'

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
				<Typography variant="h5" gutterBottom>
					{details.projectName ?? 'Project Name'}
					<IconButton sx={styles.projectIconLink} color="secondary">
						<Link href={`/projects/${details.projectId}`} passHref>
							<QueueMusicIcon />
						</Link>
					</IconButton>
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
				<Link href={`https://${details.cid}.ipfs.dweb.link/`} passHref>
					<Button color="primary">View on IPFS</Button>
				</Link>
			</CardActions>
		</Card>
	)
}

export default NFTCard
