import { AddCircleOutline } from '@mui/icons-material'
import { Button, Typography } from '@mui/material'
import type { IProjectDoc } from '../../models/project.model'
import StemUploadDialog from '../StemUploadDialog'
import styles from './StemQueue.styles'

type StemQueueProps = {
	details: IProjectDoc
	uploadStemOpen: boolean
	handleUploadStemOpen: () => void
	handleUploadStemClose: () => void
	onStemUploadSuccess: (project: IProjectDoc) => void
}

const StemQueue = (props: StemQueueProps): JSX.Element => {
	const { details, handleUploadStemOpen, handleUploadStemClose, uploadStemOpen, onStemUploadSuccess } = props

	return (
		<div>
			<Typography variant="h4">Stem Queue</Typography>
			<Button
				variant="outlined"
				size="large"
				onClick={handleUploadStemOpen}
				/* @ts-ignore */
				sx={styles.addStemBtn}
				startIcon={<AddCircleOutline sx={{ fontSize: '32px' }} />}
			>
				Add Stem
			</Button>
			<StemUploadDialog
				open={uploadStemOpen}
				onClose={handleUploadStemClose}
				onSuccess={onStemUploadSuccess}
				/* @ts-ignore */
				projectDetails={details}
			/>
		</div>
	)
}

export default StemQueue
