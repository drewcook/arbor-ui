import { Box, Typography } from '@mui/material'
import React, { useMemo } from 'react'
import { useDropzone } from 'react-dropzone'
import { useWeb3 } from './Web3Provider'
import { update } from '../utils/http'
import { ISample } from '../models/sample.model'

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
	onSuccess: () => void,
}

const SampleDropzone = (props: SampleDropzoneProps): JSX.Element => {
	const { projectId, projectSamples, onSuccess } = props
	const { ipfs, accounts } = useWeb3()
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
		onDrop: async ([file]) => {
			console.log('adding file', file)
			try {
				// Add file to IPFS
				// Wrap in directory of filename
				if (ipfs) {
					const fileDetails = {
						// path: file.name,
						content: file,
					}
					const options = {
						wrapWithDirectory: false,
						progress: prog => console.info(`Polling: ${prog}`),
					}
					const addedFile = await ipfs.add(fileDetails, options)
					alert('File(s) successfully uploaded to IPFS.')

					// Add sample data to overall project
					const hash = addedFile.cid.toString()
					const filename = file.name
					const filetype = file.name.substr(file.name.lastIndexOf('.') + 1)
					const filesize = addedFile.size
					// const timestamp = Math.round(+new Date() / 1000)
					const sample = {
						hash,
						filename,
						filetype,
						filesize,
						createdBy: accounts[0],
					}

					// TODO: Write / update project
					// get project samples, append to list, write new list to db
					const samples = [...projectSamples, sample]
					const res = await update(`/projects/${projectId}`, { samples })

					if (res.success) {
						console.log('All good!', { projectId, addedFile, sample })
						onSuccess()
					}

					// await contract.methods
					// 	.add(hash, filename, filetype, timestamp)
					// 	.send({ from: userAccount, gas: 300000 })
					// // Get files after upload
					// getFiles(contract, userAccount)
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
