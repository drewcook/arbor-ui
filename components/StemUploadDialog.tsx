import { Close } from '@mui/icons-material'
import {
	Box,
	Button,
	CircularProgress,
	Dialog,
	DialogContent,
	DialogContentText,
	DialogTitle,
	FormControl,
	Grid,
	IconButton,
	InputLabel,
	ListItemIcon,
	ListItemText,
	MenuItem,
	Select,
	TextField,
	Toolbar,
	Typography,
} from '@mui/material'
import PropTypes from 'prop-types'
import { useState } from 'react'
import logoBinary from '../lib/logoBinary'
import { post, update } from '../utils/http'
import Notification from './Notification'
import type { IFileToUpload } from './StemDropzone'
import StemDropzone from './StemDropzone'
import { useWeb3 } from './Web3Provider'

const stemTypes = [
	{
		key: 'drums',
		displayName: 'Drums',
		styles: 'swatchDrums',
	},
	{
		key: 'bass',
		displayName: 'Bass',
		styles: 'swatchBass',
	},
	{
		key: 'chords',
		displayName: 'Chords',
		styles: 'swatchChords',
	},
	{
		key: 'melody',
		displayName: 'Melody',
		styles: 'swatchMelody',
	},
	{
		key: 'vocals',
		displayName: 'Vocals',
		styles: 'swatchVocals',
	},
	{
		key: 'combo',
		displayName: 'Combo',
		styles: 'swatchCombo',
	},
	{
		key: 'other',
		displayName: 'Other',
		styles: 'swatchOther',
	},
]

const styles = {
	title: {
		flex: 1,
		p: 0,
	},
	text: {
		textAlign: 'left',
		mb: 3,
	},
	fileMeta: {
		display: 'block',
		lineHeight: 1.3,
		mb: 0.5,
		'&:last-of-type': {
			mb: 2,
		},
	},
	selectInput: {
		display: 'flex',
		alignItems: 'center',
		justifyContent: 'flex-start',
	},
	listItem: {
		py: 1.25,
	},
	swatch: {
		width: '1.5rem',
		height: '1.5rem',
		borderRadius: '4px',
		mr: 3,
		border: '1px solid #aaa',
	},
	submitBtn: {
		fontWeight: 800,
		fontStyle: 'italic',
		textTransform: 'uppercase',
	},
	loadingIcon: {
		my: 0.4,
	},
	swatchDrums: {
		backgroundColor: '#FFA1A1',
	},
	swatchBass: {
		backgroundColor: '#D6A1FF',
	},
	swatchChords: {
		backgroundColor: '#FDFFA1',
	},
	swatchMelody: {
		backgroundColor: '#A1EEFF',
	},
	swatchVocals: {
		backgroundColor: '#A1FFBB',
	},
	swatchCombo: {
		backgroundColor: '#FFA1F0',
	},
	swatchOther: {
		backgroundColor: '#FFC467',
	},
}

const propTypes = {
	open: PropTypes.bool.isRequired,
	onClose: PropTypes.func.isRequired,
	onSuccess: PropTypes.func.isRequired,
	projectDetails: PropTypes.shape({
		_id: PropTypes.string.isRequired,
		collaborators: PropTypes.array.isRequired,
	}),
}

type StemUploadDialogProps = PropTypes.InferProps<typeof propTypes>

const StemUploadDialog = (props: StemUploadDialogProps): JSX.Element => {
	const { open, onClose, projectDetails, onSuccess } = props
	const [loading, setLoading] = useState(false)
	// Notifications
	const [errorOpen, setErrorOpen] = useState<boolean>(false)
	const [errorMsg, setErrorMsg] = useState<string>('')
	const [uploadingOpen, setUploadingOpen] = useState<boolean>(false)
	const [uploadingMsg, setUploadingMsg] = useState<string>('')
	// Form Data
	const [stemName, setStemName] = useState('')
	const [stemType, setStemType] = useState('')
	const [file, setFile] = useState<any>(null)
	// Other
	const { NFTStore, currentUser, connected, handleConnectWallet } = useWeb3()
	const disableUpload = file === null || stemName === '' || stemType === '' || loading

	const handleClose = () => {
		setStemName('')
		setStemType('')
		setFile('')
		setLoading(false)
		onClose()
	}

	const handleDrop = async (fileToUpload: IFileToUpload) => {
		try {
			// Required a connected account
			if (!connected || !currentUser) {
				handleClose()
				await handleConnectWallet()
			} else {
				setFile(fileToUpload)
			}
		} catch (err) {
			console.error(err)
		}
	}

	const handleUpload = async () => {
		if (!file || !currentUser || !projectDetails) return

		try {
			setLoading(true)

			if (!uploadingOpen) setUploadingOpen(true)
			setUploadingMsg('Uploading stem to NFT.storage...')

			// Upload to NFT.storage
			const nftsRes = await NFTStore.store({
				name: file.name,
				description: 'An audio file uploaded through the PolyEcho platform',
				image: new Blob([Buffer.from(logoBinary, 'base64')], { type: 'image/*' }),
				properties: {
					name: stemName,
					type: stemType,
					audio: new Blob([file], { type: file.type }),
					createdBy: currentUser.address,
					createdOn: new Date().toISOString(),
				},
			})
			if (!nftsRes) throw new Error('Failed to upload to NFT.storage')

			// console.groupCollapsed('NFT.storage response')
			// console.info('res', nftsRes)
			// console.info('data', nftsRes.data)
			// console.info('embed', nftsRes.embed())
			// console.groupEnd()

			if (!uploadingOpen) setUploadingOpen(true)
			setUploadingMsg('Updating project details...')

			// Create the new stem (and adds to user's stems)
			let res = await post('/stems', {
				name: stemName,
				type: stemType,
				metadataUrl: nftsRes.url,
				audioUrl: nftsRes.data.properties.audio.href,
				audioHref: nftsRes.embed().properties.audio.href,
				filename: file.name,
				filetype: file.type,
				filesize: file.size,
				createdBy: currentUser.address, // Use address rather than MongoDB ID
			})
			if (!res.success) throw new Error(res.error)
			const stemCreated = res.data

			// Add the current user as a collaborator if they aren't one already
			const collaborators = projectDetails.collaborators
			if (!projectDetails.collaborators.some((c: string) => c === currentUser.address))
				collaborators.push(currentUser.address)

			// Add the new stem to the project and new collaborators list
			res = await update(`/projects/${projectDetails._id}`, { newStem: stemCreated, collaborators })

			// Catch error or invoke success callback with new project data
			if (!res.success) throw new Error(res.error)
			else {
				// Notify success
				onNotificationClose()
				setLoading(false)
				onSuccess(res.data)
			}

			// TODO: if added as a new collaborator, add this projectID to user's list of projects
		} catch (e: any) {
			console.error(e)
			// Notify error
			setUploadingOpen(false)
			setUploadingMsg('')
			setErrorOpen(true)
			setErrorMsg('Uh oh, something failed. Please check console for details.')
			setLoading(false)
		}
	}

	const onNotificationClose = () => {
		setUploadingOpen(false)
		setUploadingMsg('')
		setErrorOpen(false)
		setErrorMsg('')
	}

	return (
		<>
			<Dialog onClose={handleClose} open={open} maxWidth="md">
				<Toolbar>
					{/* @ts-ignore */}
					<DialogTitle sx={styles.title} variant="h4">
						Upload A Stem
					</DialogTitle>
					<IconButton edge="start" color="inherit" onClick={handleClose} aria-label="close" disabled={loading}>
						<Close />
					</IconButton>
				</Toolbar>
				<DialogContent>
					<DialogContentText sx={styles.text}>
						When you upload a stem to a PolyEcho project, you become a collaborator, where you&apos;ll split a 10% cut
						for each sale with other collaborators.
					</DialogContentText>
					<Grid container spacing={2}>
						<Grid item xs={12} sm={6}>
							<div className={loading ? 'dropzone-loading' : ''}>
								<StemDropzone onDrop={handleDrop} hasFile={file} />
							</div>
						</Grid>
						<Grid item xs={12} sm={6}>
							{file && (
								<Box>
									<Typography variant="overline" gutterBottom sx={styles.fileMeta}>
										File Name: {file.name}
									</Typography>
									<Typography variant="overline" gutterBottom sx={styles.fileMeta}>
										File Size: {(file.size / 1000 / 1000).toFixed(2)} MB
									</Typography>
									<Typography variant="overline" gutterBottom sx={styles.fileMeta}>
										File Type: {file.type}
									</Typography>
								</Box>
							)}
							<TextField
								variant="outlined"
								fullWidth
								label="Stem Name"
								placeholder="Guitar Lead or Spacey Synth"
								onChange={e => setStemName(e.target.value)}
								value={stemName}
								sx={{ mb: 1 }}
							/>
							<FormControl fullWidth sx={{ mb: 1 }}>
								<InputLabel id="upload-stem-type-label">Stem Type</InputLabel>
								<Select
									labelId="upload-stem-type-label"
									id="upload-stem-type-input"
									value={stemType}
									label="Stem Type"
									onChange={e => setStemType(e.target.value)}
									placeholder="Hello"
								>
									{stemTypes.map(type => (
										<MenuItem key={type.key} value={type.key} sx={styles.listItem}>
											<ListItemIcon>
												{/* @ts-ignore */}
												<Box sx={{ ...styles.swatch, ...styles[type.styles] }} />
											</ListItemIcon>
											<ListItemText primary={type.displayName} />
										</MenuItem>
									))}
								</Select>
							</FormControl>
							<Button
								fullWidth
								size="large"
								variant="contained"
								onClick={handleUpload}
								sx={styles.submitBtn}
								disabled={disableUpload}
							>
								{loading ? <CircularProgress size={20} sx={styles.loadingIcon} /> : 'Upload'}
							</Button>
						</Grid>
					</Grid>
				</DialogContent>
			</Dialog>
			{uploadingOpen && (
				<Notification
					open={uploadingOpen}
					msg={uploadingMsg}
					type="info"
					onClose={onNotificationClose}
					duration={10000}
				/>
			)}
			{errorOpen && <Notification open={errorOpen} msg={errorMsg} type="error" onClose={onNotificationClose} />}
		</>
	)
}

StemUploadDialog.propTypes = propTypes

export default StemUploadDialog
