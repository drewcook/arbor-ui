import { Close, ZoomIn, ZoomOut } from '@mui/icons-material'
import Box from '@mui/material/Box'
import Button from '@mui/material/Button'
import Dialog from '@mui/material/Dialog'
import DialogActions from '@mui/material/DialogActions'
import DialogContent from '@mui/material/DialogContent'
import DialogTitle from '@mui/material/DialogTitle'
import Grid from '@mui/material/Grid'
import IconButton from '@mui/material/IconButton'
import Slider from '@mui/material/Slider'
import SvgIcon from '@mui/material/SvgIcon'
import Toolbar from '@mui/material/Toolbar'
import { useCallback, useState } from 'react'
import Cropper from 'react-easy-crop'
import { Area, Point } from 'react-easy-crop/types'

import { update } from '../lib/http'
import logger from '../lib/logger'
import styles from './EditAvatarDialog.styles'
import Notification from './Notification'
import { useWeb3 } from './Web3Provider'

type EditAvatarDialogProps = {
	// PropTypes.InferProps<typeof propTypes>
	open: boolean
	onClose: () => void
	onSuccess: () => void
	image: string
}

const EditAvatarDialog = (props: EditAvatarDialogProps): JSX.Element => {
	const { open, onClose, image, onSuccess } = props
	const [loading, setLoading] = useState(false)
	// Notifications
	const [errorOpen, setErrorOpen] = useState<boolean>(false)
	const [errorMsg, setErrorMsg] = useState<string>('')
	const [uploadingOpen, setUploadingOpen] = useState<boolean>(false)
	const [uploadingMsg, setUploadingMsg] = useState<string>('')
	// Form Data
	const [file, setFile] = useState<any>(image)
	const [blob, setBlob] = useState<any>(null)

	const handleClose = () => {
		setLoading(false)
		onClose()
	}

	const [crop, setCrop] = useState<Point>({ x: 0, y: 0 })
	const [zoom, setZoom] = useState(1)
	const getCroppedImg = useCallback(async (imageSrc, crop) => {
		const image = await createImage(imageSrc)
		const canvas = document.createElement('canvas')
		const ctx = canvas.getContext('2d')
		canvas.width = 300
		canvas.height = 300

		// if (image instanceof ){
		ctx?.drawImage(image, crop.x, crop.y, crop.width, crop.height, 0, 0, canvas.width, canvas.height)
		// }

		return new Promise(resolve => {
			canvas.toBlob(blob => {
				resolve(blob)
			}, 'image/jpeg')
		})
	}, [])
	const onCropComplete = useCallback(
		(_: Area, croppedAreaPixels: Area) => {
			getCroppedImg(file, croppedAreaPixels).then(croppedImage => setBlob(croppedImage))
		},
		[file, getCroppedImg],
	)

	const createImage = (url: string): HTMLImageElement => {
		const image = new Image()
		new Promise((resolve, reject) => {
			image.addEventListener('load', () => resolve(image))
			image.addEventListener('error', error => reject(error))
			image.setAttribute('crossOrigin', 'anonymous')
			image.src = url
		})
		return image
	}

	const { currentUser } = useWeb3()

	const handleUpload = async () => {
		if (!file || !currentUser || !blob) return

		try {
			setLoading(true)

			if (!uploadingOpen) setUploadingOpen(true)
			setUploadingMsg('Saving Avatar...')
			const reader = new FileReader()
			reader.readAsDataURL(blob)
			reader.onloadend = async function () {
				const base64 = reader.result
				// Update user avatar in database
				const res = await update(`/users/${currentUser.address}`, { base64, imageFormat: blob.type })
				if (!res.success) throw new Error(res.error)

				// Notify success
				setLoading(false)
				handleClose()
				onNotificationClose()
				onSuccess()
			}
		} catch (e: any) {
			logger.red(e)
			// Notify error
			setUploadingOpen(false)
			setUploadingMsg('')
			setErrorOpen(true)
			setErrorMsg('Uh oh, something failed. Please check console for details.')
			setLoading(false)
		}
	}

	const handleChange = e => {
		setFile(URL.createObjectURL(e.target.files[0]))
	}

	const onNotificationClose = () => {
		setUploadingOpen(false)
		setUploadingMsg('')
		setErrorOpen(false)
		setErrorMsg('')
	}

	return (
		<>
			<Dialog onClose={handleClose} open={open} maxWidth="xl" PaperProps={{ sx: styles.dialog }}>
				<Toolbar>
					{/* @ts-ignore */}
					<DialogTitle sx={styles.title} variant="h4">
						Update Your Avatar
					</DialogTitle>
					<IconButton edge="end" color="inherit" onClick={handleClose} aria-label="close" disabled={loading}>
						<Close />
					</IconButton>
				</Toolbar>
				<DialogContent>
					<Grid container spacing={2}>
						<Grid item xs={12} sm={6}>
							<Box sx={styles.cropContainer}>
								<Cropper
									image={file}
									crop={crop}
									cropShape="round"
									zoom={zoom}
									aspect={4 / 4}
									onCropChange={setCrop}
									onCropComplete={onCropComplete}
									onZoomChange={setZoom}
								/>
							</Box>
							<Box sx={styles.controls}>
								<SvgIcon>
									<ZoomOut />
								</SvgIcon>
								<Slider
									sx={{ mx: 1 }}
									value={zoom}
									min={1}
									max={3}
									step={0.1}
									size="small"
									aria-labelledby="Zoom"
									onChange={(e, zoom) => setZoom(Number(zoom))}
								/>
								<SvgIcon>
									<ZoomIn />
								</SvgIcon>
							</Box>
							<Button
								size="small"
								variant="outlined"
								onClick={() => document.getElementById('file-input')?.click()}
								sx={styles.changeImgBtn}
							>
								Change Image
							</Button>
							<input type="file" id="file-input" hidden name="file" onChange={handleChange} />
						</Grid>
					</Grid>
				</DialogContent>
				<DialogActions sx={{ pr: 3 }}>
					<Button onClick={handleClose}>Cancel</Button>
					<Button variant="contained" onClick={handleUpload}>
						Update
					</Button>
				</DialogActions>
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

export default EditAvatarDialog
