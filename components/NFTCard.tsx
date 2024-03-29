import QueueMusicIcon from '@mui/icons-material/QueueMusic'
import { Box, Button, Card, CardActions, CardContent, CardMedia, Chip, IconButton, Typography } from '@mui/material'
import Link from 'next/link'

import { NETWORK_CURRENCY } from '../constants/networks'
import OneIcon from '../public/harmony_icon.svg'
import formatAddress from '../utils/formatAddress'
import formatDate from '../utils/formatDate'
import ImageOptimized from './ImageOptimized'
import styles from './NFTCard.styles'

type NFTCardProps = {
	details: any // cid and token
}

const NFTCard = (props: NFTCardProps): JSX.Element => {
	const { details } = props

	return (
		<>
			<Card sx={styles.card} elevation={2}>
				{details.isListed && <Chip label="Listed For Sale" size="medium" sx={styles.buyableChip} />}
				<CardMedia
					component="img"
					image="/arbor_logo_tree.svg"
					alt="Arbor Token Image"
					title="Arbor Token Image"
					sx={styles.img}
				/>
				<CardContent>
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
								<ImageOptimized src={OneIcon} width={20} height={20} alt={NETWORK_CURRENCY} />
								<Typography variant="h5" component="div" sx={{ ml: 0.75 }}>
									{details.listPrice}{' '}
									<Typography sx={styles.eth} component="span">
										{NETWORK_CURRENCY}
									</Typography>
								</Typography>
							</Box>
						</Box>
					) : (
						<Box /> // To force justify-between
					)}
					<Link href={`/nfts/${details._id}`} passHref>
						<Button color="primary">View Details</Button>
					</Link>
				</CardActions>
			</Card>
		</>
	)
}

export default NFTCard
