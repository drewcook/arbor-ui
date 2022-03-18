import { Button, Dialog, DialogActions, DialogContent, DialogContentText, DialogTitle } from '@mui/material'
import PropTypes from 'prop-types'
import SampleDropzone from './SampleDropzone'

const propTypes = {
	open: PropTypes.bool.isRequired,
	onClose: PropTypes.func.isRequired,
	projectDetails: PropTypes.shape({}).isRequired,
	onUploadSuccess: PropTypes.func.isRequired,
}

type SampleUploadDialogProps = PropTypes.InferProps<typeof propTypes>

const SampleUploadDialog = (props: SampleUploadDialogProps): JSX.Element => {
	const { open, onClose, projectDetails, onUploadSuccess } = props

	const handleUpload = () => {
		console.log('uploading')
	}

	return (
		<Dialog onClose={onClose} open={open}>
			<DialogTitle>Upload A Sample</DialogTitle>
			<DialogContent>
				<DialogContentText>Upload a sample of your own to this PolyEcho project!</DialogContentText>
				<SampleDropzone project={projectDetails} onSuccess={onUploadSuccess} />
			</DialogContent>
			<DialogActions>
				<Button variant="outlined" color="secondary" onClick={handleUpload}>
					Upload!
				</Button>
			</DialogActions>
		</Dialog>
	)
}

SampleUploadDialog.propTypes = propTypes

export default SampleUploadDialog
