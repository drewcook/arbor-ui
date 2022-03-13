import { CloudUpload } from '@mui/icons-material'
import { Box, CircularProgress, Typography } from '@mui/material'
import { Blob } from 'nft.storage'
import { useMemo, useState } from 'react'
import { useDropzone } from 'react-dropzone'
import logoBinary from '../lib/logoBinary'
import type { IProjectDoc } from '../models/project.model'
import { post, update } from '../utils/http'
import { useWeb3 } from './Web3Provider'

const styles = {
	spinner: {
		color: '#555',
		my: 4,
	},
	uploadTitle: {
		textAlign: 'center',
	},
	uploadIcon: {
		fontSize: '4rem',
		mb: 2,
	},
	uploadText: {
		textAlign: 'center',
		fontSize: '14px',
		mb: 3,
	},
	uploadMeta: {
		textAlign: 'center',
		fontStyle: 'italic',
		fontSize: '10px',
		mx: 'auto',
	},
	errorMsg: {
		textAlign: 'center',
		mt: 2,
	},
}

const baseStyle = {
	flex: 1,
	display: 'flex',
	flexDirection: 'column',
	alignItems: 'center',
	padding: '20px',
	color: '#555',
	borderWidth: 4,
	borderRadius: 10,
	borderColor: '#0500ff',
	borderStyle: 'dashed',
	backgroundColor: '#f0f0f0',
	outline: 'none',
	transition: 'border 300ms ease-in-out',
	cursor: 'pointer',
}

const focusedStyle = {
	borderColor: '#2196f3',
}

const acceptStyle = {
	borderColor: '#00e676',
}

const rejectStyle = {
	borderColor: '#ff1744',
}

type SampleDropzoneProps = {
	project: IProjectDoc | any
	onSuccess: (project: IProjectDoc) => void
}

const SampleDropzone = (props: SampleDropzoneProps): JSX.Element => {
	const { project, onSuccess } = props
	const [loading, setLoading] = useState(false)
	const { NFTStore, currentUser, connected, handleConnectWallet } = useWeb3()
	const { getRootProps, getInputProps, isFocused, isDragActive, isDragAccept, isDragReject, fileRejections } =
		useDropzone({
			maxFiles: 1,
			// TODO: support multiple - audio/mpeg,audio/aiff,audio/webm' - blocked until flattening service supports multiple
			accept: 'audio/wav',
			// Support only one file uploaded at a time
			onDrop: async ([file]) => {
				try {
					if (!connected || !currentUser) {
						await handleConnectWallet()
					} else {
						setLoading(true)

						// Upload to NFT.storage
						const nftsRes = await NFTStore.store({
							name: file.name,
							description: 'An audio file uploaded through the PolyEcho platform',
							image: new Blob([Buffer.from(logoBinary, 'base64')], { type: 'image/*' }),
							properties: {
								createdOn: new Date().toISOString(),
								createdBy: currentUser.address,
								audio: new Blob([file], { type: file.type }),
							},
						})
						if (!nftsRes) throw new Error('Failed to upload to NFT.storage')

						// console.groupCollapsed('NFT.storage response')
						// console.info('res', nftsRes)
						// console.info('data', nftsRes.data)
						// console.info('embed', nftsRes.embed())
						// console.groupEnd()

						// Create the new sample (and adds to user's samples)
						let res = await post('/samples', {
							metadataUrl: nftsRes.url,
							audioUrl: nftsRes.data.properties.audio.href,
							filename: file.name,
							filetype: file.type,
							filesize: file.size,
							createdBy: currentUser.address, // Use address rather than MongoDB ID
						})
						if (!res.success) throw new Error(res.error)
						const sampleCreated = res.data

						// Add the current user as a collaborator if they aren't one already
						const collaborators = project.collaborators
						if (!project.collaborators.some((c: string) => c === currentUser.address))
							collaborators.push(currentUser.address)

						// Add the new sample to the project and new collaborators list
						res = await update(`/projects/${project._id}`, { newSample: sampleCreated, collaborators })
						if (!res.success) throw new Error(res.error)

						// TODO: if added as a new collaborator, add this projectID to user's list of projects

						// Success callback with new project data
						if (res.success) onSuccess(res.data)
					}
					setLoading(false)
				} catch (err) {
					console.error(err)
					setLoading(false)
				}
			},
		})

	// Styles
	const dropzoneStyles = useMemo(
		() => ({
			...baseStyle,
			...(isFocused ? focusedStyle : {}),
			...(isDragAccept ? acceptStyle : {}),
			...(isDragReject ? rejectStyle : {}),
			padding: '50px 20px',
		}),
		[isFocused, isDragAccept, isDragReject],
	)

	const loadingClassName = loading ? 'dropzone-loading' : ''

	return (
		<>
			{/* @ts-ignore */}
			<div {...getRootProps({ style: dropzoneStyles })} className={loadingClassName}>
				<CloudUpload sx={styles.uploadIcon} />
				{loading ? (
					<>
						<CircularProgress size={30} sx={styles.spinner} />
						<Typography variant="body2">Uploading to IPFS...</Typography>
					</>
				) : (
					<>
						<Typography variant="h5" sx={styles.uploadTitle}>
							Collaborate on an NFT!
						</Typography>
						<input {...getInputProps()} />
						<Typography sx={styles.uploadText}>
							{isDragActive
								? 'Drop the audio file here ...'
								: 'Add your own sample and contribute to this project. Drag and drop or click to select a file.'}
						</Typography>
						<Typography variant="body2" sx={styles.uploadMeta}>
							(Only .wav files are support at the moment)
						</Typography>
						{fileRejections.length > 0 && (
							<aside>
								<Box sx={styles.errorMsg}>
									<Typography color="error">File rejected, must be supported filetype</Typography>
								</Box>
							</aside>
						)}
					</>
				)}
			</div>
		</>
	)
}
export default SampleDropzone
