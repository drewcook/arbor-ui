import AudioFileIcon from '@mui/icons-material/AudioFile'
import { Box, Button, Card, CardActions, CardContent, Typography } from '@mui/material'
import Link from 'next/link'
import PropTypes from 'prop-types'

import formatAddress from '../utils/formatAddress'
import formatStemName from '../utils/formatStemName'
import { stemTypesToColor } from './ArborThemeProvider'
import styles from './StemCard.styles'

const propTypes = {
	details: PropTypes.shape({
		_id: PropTypes.string.isRequired,
		type: PropTypes.string.isRequired,
		name: PropTypes.string.isRequired,
		createdBy: PropTypes.string.isRequired,
		filename: PropTypes.string.isRequired,
		filetype: PropTypes.string.isRequired,
		filesize: PropTypes.number.isRequired,
		metadataUrl: PropTypes.string.isRequired,
	}).isRequired,
}

type StemCardProps = PropTypes.InferProps<typeof propTypes>

const StemCard = (props: StemCardProps): JSX.Element => {
	const { details } = props

	return (
		<Card sx={styles.card} elevation={2}>
			<Box sx={{ ...styles.cardMedia, backgroundColor: stemTypesToColor[details.type] || '#dadada' }}>
				<AudioFileIcon sx={styles.cardMediaIcon} />
			</Box>
			<CardContent>
				<Typography variant="h5" gutterBottom>
					{formatStemName(details.name)}
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
