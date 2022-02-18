import { PlayArrowRounded } from '@mui/icons-material'
import { Grid, IconButton, Paper, Typography } from '@mui/material'

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

const Sample = (): JSX.Element => {
	const handlePlay = () => {
		console.log('playing..')
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
					<Typography>Sound clip goes here...</Typography>
				</Grid>
			</Grid>
		</Paper>
	)
}

export default Sample
