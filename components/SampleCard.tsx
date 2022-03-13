import AudioFileIcon from '@mui/icons-material/AudioFile'
import { Box, Button, Card, CardActions, CardContent, Typography } from '@mui/material'
import Link from 'next/link'
import PropTypes from 'prop-types'
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
const propTypes = {
	details: PropTypes.shape({
		_id: PropTypes.string.isRequired,
		sampleId: PropTypes.string.isRequired,
		createdBy: PropTypes.string.isRequired,
		filename: PropTypes.string.isRequired,
		filetype: PropTypes.string.isRequired,
		filesize: PropTypes.number.isRequired,
		metadataUrl: PropTypes.string.isRequired,
	}).isRequired,
	nftPage: PropTypes.bool,
}

type SampleCardProps = PropTypes.InferProps<typeof propTypes>

const SampleCard = (props: SampleCardProps): JSX.Element => {
	const { details, nftPage } = props

	if (nftPage) {
		return (
			<Card sx={styles.card} elevation={2}>
				<Box sx={styles.cardMedia}>
					<AudioFileIcon sx={styles.cardMediaIcon} />
				</Box>
				<CardContent>
					<Typography variant="h5" gutterBottom sx={styles.title}>
						{formatSampleName('PolyEcho Sample')}
					</Typography>
					<Link href={details.metadataUrl} passHref>
						<Button color="primary">View on IPFS</Button>
					</Link>
					<Typography variant="body2" sx={styles.detailItem}>
						File Type: audio/wav
					</Typography>
				</CardContent>
				<CardActions sx={styles.actions}>
					<Link href={`/samples/${details.sampleId}`} passHref>
						<Button color="primary">View Details</Button>
					</Link>
				</CardActions>
			</Card>
		)
	} else {
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
}

SampleCard.propTypes = propTypes

SampleCard.defaultProps = {
	nftPage: false,
}

export default SampleCard
