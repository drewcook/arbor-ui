import AudioFileIcon from '@mui/icons-material/AudioFile'
import { Box, Button, Card, CardActions, CardContent, Typography } from '@mui/material'
import Link from 'next/link'
import type { ISampleDoc } from '../models/sample.model'
import formatAddress from '../utils/formatAddress'
import formatSampleName from '../utils/formatSampleName'

const styles = {
	card: {
		minWidth: '200px',
	},
	cardMedia: {
		backgroundColor: '#23F09A',
		py: 3,
		px: 1.5,
	},
	cardMediaIcon: {
		color: '#000',
		fontSize: '3rem',
	},
	title: {},
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

type SampleCardProps = {
	details: ISampleDoc
}

const SampleCard = (props: SampleCardProps): JSX.Element => {
	const { details } = props

	return (
		<Card sx={styles.card} elevation={2}>
			<Box sx={styles.cardMedia}>
				<AudioFileIcon sx={styles.cardMediaIcon} />
			</Box>
			<CardContent>
				<Typography variant="h5" gutterBottom sx={styles.title}>
					{formatSampleName(details.filename)}
				</Typography>
				<Typography variant="body2" sx={styles.detailItem}>
					Creator: <Link href={`/users/${details.createdBy}`}>{formatAddress(details.createdBy)}</Link>
				</Typography>
				<Typography variant="body2" sx={styles.detailItem}>
					File Type: {details.filetype}
				</Typography>
				<Typography variant="body2" sx={styles.detailItem}>
					File Size: {(details.filesize / 1000 / 1000).toFixed(2)} MB
				</Typography>
			</CardContent>
			<CardActions sx={styles.actions}>
				<Link href={`/samples/${details._id}`} passHref>
					<Button color="primary">View Details</Button>
				</Link>
			</CardActions>
		</Card>
	)
}

export default SampleCard
