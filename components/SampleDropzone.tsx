import { File } from 'nft.storage'
import { Box, Typography } from '@mui/material'
import React, { useMemo } from 'react'
import { useDropzone } from 'react-dropzone'
import { useWeb3 } from './Web3Provider'
import { update } from '../utils/http'
import { ISample } from '../models/sample.model'
import { IProjectDoc } from '../models/project.model'

const styles = {
	uploadTitle: {
		textAlign: 'center',
		mb: 2,
	},
	uploadLead: {
		textAlign: 'center',
		maxWidth: '80%',
		mx: 'auto',
		mb: 5,
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
	borderWidth: 2,
	borderRadius: 2,
	borderColor: '#aaa',
	borderStyle: 'dashed',
	backgroundColor: '#183d74',
	color: '#eee',
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
	projectId: string,
	projectSamples: ISample[],
	onSuccess: (project: IProjectDoc) => void,
}

const SampleDropzone = (props: SampleDropzoneProps): JSX.Element => {
	const { projectId, projectSamples, onSuccess } = props
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
					console.log('IPFS URL for the metadata:', metadata.url)
					console.log('metadata.json contents:', metadata.data)
					console.log('metadata.json contents with IPFS gateway URLs:', metadata.embed())

					if (metadata) {
						alert('File uploaded to NFT.storage')
						// Add sample data to overall project
						const sample = {
							audioUrl: metadata.embed().properties.audio.href,
							filename: file.name,
							filetype: file.type,
							filesize: file.size,
							createdBy: accounts[0],
						}
						// Compile new sample to a
						const samples = [...projectSamples, sample]
						const res = await update(`/projects/${projectId}`, { samples })
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
			<Typography variant="h5" sx={styles.uploadTitle}>
				Collaborate on an NFT!
			</Typography>
			<Typography gutterBottom sx={styles.uploadLead}>
				Add your own sample and contribute to this project. Your audio file will be layered on top
				of the existing project samples to create one of a kind song that can be minted into a new
				NFT.
			</Typography>
			{/* @ts-ignore */}
			<div {...getRootProps({ style: dropzoneStyles })}>
				<input {...getInputProps()} />
				{isDragActive
					? 'Drop the audio file here ...'
					: "Drag 'n' drop a sample audio file here, or click to select files"}
				<small>
					<em>(Only .wav, .mp3, and .aiff files will be accepted)</em>
				</small>
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
