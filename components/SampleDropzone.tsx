import { Box, Typography } from '@mui/material'
import React, { useMemo } from 'react'
import { useDropzone } from 'react-dropzone'

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
	transition: 'border .24s ease-in-out',
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

const SampleDropzone = (): JSX.Element => {
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
		accept: 'audio/vnd.wav,audio/mpeg,audio/x-aiff',
		onDrop: async ([file]) => {
			console.log('adding file', file)
			try {
				// Add file to IPFS
				// const addedFile = await ipfs.add(fileDetails, options)
				// Add file to smart contract
				// const hash = addedFile.cid.toString()
				// const filename = file.name
				// const filetype = file.name.substr(file.name.lastIndexOf('.') + 1)
				// const timestamp = Math.round(+new Date() / 1000)
				// await contract.methods
				// 	.add(hash, filename, filetype, timestamp)
				// 	.send({ from: userAccount, gas: 300000 })
				// // Get files after upload
				// getFiles(contract, userAccount)
				// alert('File(s) successfully uploaded to IPFS.')
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
