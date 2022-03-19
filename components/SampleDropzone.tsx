import { Check, CloudUpload } from '@mui/icons-material'
import { Box, Typography } from '@mui/material'
import { useMemo } from 'react'
import { useDropzone } from 'react-dropzone'

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
		fontSize: '1.25rem',
		fontWeight: 600,
		mb: 2,
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
	borderWidth: 1,
	borderRadius: 4,
	borderColor: '#ccc',
	borderStyle: 'solid',
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

export type IFileToUpload = {
	path?: string
	name: string
	size: number
	type: string
}

type SampleDropzoneProps = {
	hasFile: boolean
	onDrop: (file: IFileToUpload) => void
}

const SampleDropzone = (props: SampleDropzoneProps): JSX.Element => {
	const { hasFile, onDrop } = props
	const { getRootProps, getInputProps, isFocused, isDragActive, isDragAccept, isDragReject, fileRejections } =
		useDropzone({
			maxFiles: 1,
			// Support only .wav files for the time being
			accept: 'audio/wav',
			// Support only one file uploaded at a time
			onDrop: ([file]) => onDrop(file),
		})

	// Styles
	const dropzoneStyles = useMemo(
		() => ({
			...baseStyle,
			...(isFocused ? focusedStyle : {}),
			...(isDragAccept ? acceptStyle : {}),
			...(isDragReject ? rejectStyle : {}),
			padding: '55px 20px',
			// height: '251px',
		}),
		[isFocused, isDragAccept, isDragReject],
	)

	return (
		<>
			{/* @ts-ignore */}
			<div {...getRootProps({ style: dropzoneStyles })}>
				{hasFile ? <Check sx={styles.uploadIcon} /> : <CloudUpload sx={styles.uploadIcon} />}
				<input {...getInputProps()} />
				<Typography sx={styles.uploadText}>
					{hasFile
						? 'Stem selected, almost there...'
						: isDragActive
						? 'Drop the audio file here ...'
						: 'Click or drag stem to upload'}
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
			</div>
		</>
	)
}

export default SampleDropzone
