import { File } from 'nft.storage'
import { Box, Typography } from '@mui/material'
import { CloudUpload } from '@mui/icons-material'
import React, { useMemo } from 'react'
import { useDropzone } from 'react-dropzone'
import { useWeb3 } from './Web3Provider'
import { update } from '../utils/http'
import type { IProjectDoc } from '../models/project.model'

const styles = {
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
	project: IProjectDoc,
	onSuccess: (project: IProjectDoc) => void,
}

const SampleDropzone = (props: SampleDropzoneProps): JSX.Element => {
	const { project, onSuccess } = props
	const { NFTStore, accounts } = useWeb3()
	const {
		getRootProps,
		getInputProps,
		isFocused,
		isDragActive,
		isDragAccept,
		isDragReject,
		fileRejections,
	} = useDropzone({
		maxFiles: 1,
		accept: 'audio/wav,audio/mpeg,audio/webm',
		// Support only one file uploaded at a time
		onDrop: async ([file]) => {
			try {
				// Add file to NFT.storage
				if (NFTStore) {
					const metadata = await NFTStore.store({
						name: file.name,
						description: 'An audio file uploaded via the PolyEcho drag-n-drop UI',
						image: new File([], file.name, { type: 'image/*' }),
						properties: {
							audio: new File([file], file.name, { type: file.type }),
						},
					})
					console.log('result from NFTStorage.store():', metadata)
					// console.log('IPFS URL for the metadata:', metadata.url)
					// console.log('metadata.json contents:', metadata.data)
					// console.log('metadata.json contents with IPFS gateway URLs:', metadata.embed())

					if (metadata) {
						// TODO: add loading state and success notification
						alert('File uploaded to NFT.storage')
						// Add sample data to overall project
						const sample = {
							audioUrl: metadata.embed().properties.audio.href,
							cid: metadata.ipnft,
							filename: file.name,
							filetype: file.type,
							filesize: file.size,
							createdBy: accounts[0],
						}
						// Compile new sample to a
						const samples = [...project.samples, sample]
						let collaborators = project.collaborators
						if (!project.collaborators.some(s => s === accounts[0])) collaborators.push(accounts[0])
						const res = await update(`/projects/${project._id}`, { samples, collaborators })
						// Success callback
						if (res.success) onSuccess(res.data)
					}
				}
			} catch (err) {
				console.error(err)
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

	return (
		<>
			{/* @ts-ignore */}
			<div {...getRootProps({ style: dropzoneStyles })}>
				<CloudUpload sx={styles.uploadIcon} />
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
					(Only .wav, .mp3, and .aiff files will be accepted)
				</Typography>
				{fileRejections.length > 0 && (
					<aside>
						<Box sx={styles.errorMsg}>
							<Typography color="error">File rejected, must be supported filetype</Typography>
						</Box>
					</aside>
				)}
			</div>
		</>
	)
}
export default SampleDropzone
