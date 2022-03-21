import AudioFileIcon from '@mui/icons-material/AudioFile'
import { Box, Button, Card, CardActions, CardContent, Typography } from '@mui/material'
import Link from 'next/link'
import PropTypes from 'prop-types'
import formatAddress from '../utils/formatAddress'
import formatStemName from '../utils/formatStemName'

const styles = {
	card: {
		minWidth: '200px',
	},
	cardMedia: {
		borderTopLeftRadius: '4px',
		borderTopRightRadius: '4px',
		borderBottom: '3px solid #000',
		py: 1,
		px: 1.5,
	},
	cardMediaIcon: {
		color: '#000',
		fontSize: '2rem',
	},
	detailItem: {
		textTransform: 'uppercase',
		color: '#a8a8a8',
		fontWeight: 600,
		mb: 1,
	},
	actions: {
		justifyContent: 'flex-end',
	},
}

const propTypes = {
	details: PropTypes.shape({
		_id: PropTypes.string.isRequired,
		type: PropTypes.string.isRequired,
		createdBy: PropTypes.string.isRequired,
		filename: PropTypes.string.isRequired,
		filetype: PropTypes.string.isRequired,
		filesize: PropTypes.number.isRequired,
		metadataUrl: PropTypes.string.isRequired,
	}).isRequired,
}

type StemCardProps = PropTypes.InferProps<typeof propTypes>

const stemTypesToColor: Record<string, string> = {
	drums: '#FFA1A1',
	bass: '#D6A1FF',
	chords: '#FDFFA1',
	melody: '#A1EEFF',
	vocals: '#A1FFBB',
	combo: '#FFA1F0',
	other: '##FFC467',
}

const StemCard = (props: StemCardProps): JSX.Element => {
	const { details } = props

	return (
		<Card sx={styles.card} elevation={2}>
			<Box sx={{ ...styles.cardMedia, backgroundColor: stemTypesToColor[details.type] || '#dadada' }}>
				<AudioFileIcon sx={styles.cardMediaIcon} />
			</Box>
			<CardContent>
				<Typography variant="h5" gutterBottom>
					{formatStemName(details.filename)}
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
				<Link href={`/stems/${details._id}`} passHref>
					<Button color="primary">View Details</Button>
				</Link>
			</CardActions>
		</Card>
	)
}

StemCard.propTypes = propTypes

export default StemCard
