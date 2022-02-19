import { Howl } from 'howler'
import { Grid, IconButton, Paper, Typography } from '@mui/material'
import { PlayArrowRounded } from '@mui/icons-material'
import type { ISample } from '../models/sample.model'

const styles = {
	sample: {
		py: 4,
		px: 2,
		minHeight: '120px',
		mb: 3,
	},
	actionsLeft: {
		display: 'flex',
		flexDirection: 'column',
		alignItems: 'center',
		justifyContent: 'space-between',
	},
	playBtn: {
		backgroundColor: '#00d3a3',
	},
}

type SampleProps = {
	details: ISample,
}

const Sample = (props: SampleProps): JSX.Element => {
	const { details } = props

	var sound = new Howl({
		src: [details.audioUrl],
	})

	console.log(sound)

	const handlePlay = () => {
		sound.play()
	}

	return (
		<Paper sx={styles.sample} elevation={2}>
			<Grid container spacing={2}>
				<Grid item xs={2} sx={styles.actionsLeft}>
					<IconButton size="large" onClick={handlePlay} sx={styles.playBtn}>
						<PlayArrowRounded />
					</IconButton>
				</Grid>
				<Grid item xs={10}>
					<Typography>IPFS URL: {details.audioUrl}</Typography>
					<Typography>File Name: {details.filename}</Typography>
					<Typography>File Type: {details.filetype}</Typography>
					<Typography>File Size: {details.filesize}</Typography>
					<Typography>Created By: {details.createdBy}</Typography>
				</Grid>
			</Grid>
		</Paper>
	)
}

export default Sample
