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
import { useState } from 'react'

import { post } from '../lib/http'
import logger from '../lib/logger'
import logoBinary from '../lib/logoBinary'
import type { ProjectDoc } from '../models'
import { StemType } from '../models/stem.model'
import { encodeBlobToBase64 } from '../utils/blobUtils'
import signMessage from '../utils/signMessage'
import Notification from './Notification'
import type { IFileToUpload } from './StemDropzone'
import StemDropzone from './StemDropzone'
import styles from './StemUploadDialog.styles'
import { useWeb3 } from './Web3Provider'

interface StemTypesDropdown {
	key: StemType
	displayName: string
	styles: string
}

const stemTypes: StemTypesDropdown[] = [
	{
		key: 'vocals',
		displayName: 'Vocals',
		styles: 'swatchVocals',
	},
	{
		key: 'drums',
		displayName: 'Drums',
		styles: 'swatchDrums',
	},
	{
		key: 'percussion',
		displayName: 'Percussion',
		styles: 'swatchPercussion',
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

type StemUploadDialogProps = {
	// PropTypes.InferProps<typeof propTypes>
	open: boolean
	onClose: () => void
	onSuccess: (project: ProjectDoc) => void
	projectDetails: ProjectDoc
}

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
	//Signing Message
	const SIGNING_MSG =
		'Sign this message to be able to upload this stem to Arbor. You are signing to verify that you are human.'

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
			logger.red(err)
		}
	}

	const handleUpload = async () => {
		if (!file || !currentUser || !projectDetails) return

		try {
			setLoading(true)

			// Check signature for user
			let stemUploadSignature: any = localStorage.getItem('stemUploadSignature')
			if (stemUploadSignature === null) stemUploadSignature = JSON.stringify({})
			stemUploadSignature = JSON.parse(stemUploadSignature)
			if (typeof stemUploadSignature[currentUser.address] === 'undefined') {
				const message = await signMessage(SIGNING_MSG)
				stemUploadSignature[currentUser.address] = message
				localStorage.setItem('stemUploadSignature', JSON.stringify(stemUploadSignature))
			}

			if (!uploadingOpen) setUploadingOpen(true)
			setUploadingMsg('Uploading stem to NFT.storage...')

			// Upload to NFT.storage
			// TODO: look into storing all stems within a single Arbor directory, or one for each user, and storing each stem within that directory -  https://github.com/nftstorage/nftup/blob/eed72d1bc6b1373d0656ac30b5a40bf251a7cefe/public/electron.js#L106
			const audioBlob = new Blob([file], { type: file.type })
			// TODO: do something with the base64 string or Blob and upload to S3 for quicker retrieval and redundancy from IPFS
			const audioBase64 = await encodeBlobToBase64(audioBlob)
			console.log({ file, audioBlob, audioBase64 })
			const nftsRes = await NFTStore.store({
				name: file.name,
				description: 'An audio file uploaded through the Arbor Protocol',
				image: new Blob([Buffer.from(logoBinary, 'base64')], { type: 'image/*' }),
				properties: {
					name: stemName,
					type: stemType,
					audio: audioBlob,
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
			const stemRes = await post('/stems', {
				name: stemName,
				type: stemType,
				metadataUrl: nftsRes.url,
				audioUrl: nftsRes.data.properties.audio.href,
				audioHref: nftsRes.embed().properties.audio.href,
				filename: file.name,
				filetype: file.type,
				filesize: file.size,
				createdBy: currentUser.address, // Use address rather than MongoDB ID
				projectId: projectDetails._id,
			})
			if (!stemRes.success) throw new Error(stemRes.error)

			// Notify success
			onNotificationClose()
			setLoading(false)
			onSuccess(stemRes.data.project)
			handleClose()
		} catch (err: any) {
			logger.red(err)
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
						When you upload a stem to an Arbor project, you become a collaborator, where you&apos;ll split a 10% cut for
						each sale with other collaborators.
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

export default StemUploadDialog
