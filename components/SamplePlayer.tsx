import { PauseRounded, PlayArrowRounded } from '@mui/icons-material'
import { Box, Fab, Grid, Typography } from '@mui/material'
import Link from 'next/link'
import { useEffect, useState } from 'react'
import WaveSurfer from 'wavesurfer.js'
// @ts-ignore
import TimelinePlugin from 'wavesurfer.js/dist/plugin/wavesurfer.timeline.min.js'
import type { ISampleDoc } from '../models/sample.model'
import formatAddress from '../utils/formatAddress'

const styles = {
	sample: {
		py: 4,
		px: 2,
		minHeight: '120px',
		mb: 3,
	},
	metadata: {
		display: 'flex',
		alignItems: 'center',
		justifyContent: 'flex-start',
	},
	metadataPlayBtn: {
		color: '#fff',
		minWidth: '50px',
		mr: 2,
	},
	metadataSmall: {
		color: '#a8a8a8',
		fontStyle: 'italic',
		fontWeight: 900,
		textTransform: 'uppercase',
	},
	metadataTitle: {
		textTransform: 'uppercase',
		fontStyle: 'italic',
		fontWeight: 900,
		wordBreak: 'break-all',
	},
}

type SamplePlayerProps = {
	idx: number
	details: ISampleDoc | any
	showEyebrow: boolean
}

const SamplePlayer = (props: SamplePlayerProps): JSX.Element => {
	const { idx, details, showEyebrow } = props
	const [wavesurfer, setWavesurfer] = useState<WaveSurfer>()
	const [isPlaying, setIsPlaying] = useState<boolean>(false)

	useEffect(() => {
		const ws = WaveSurfer.create({
			container: `#waveform-${details._id}-${idx}`,
			waveColor: '#D9DCFF',
			progressColor: '#4353FF',
			cursorColor: '#4353FF',
			barWidth: 3,
			barRadius: 3,
			cursorWidth: 1,
			height: 200,
			barGap: 3,
			plugins: [
				TimelinePlugin.create({
					container: `#timeline-${details._id}-${idx}`,
				}),
			],
		})
		ws.load(details.audioUrl)
		setWavesurfer(ws)
		return () => ws.destroy()
	}, []) /* eslint-disable-line react-hooks/exhaustive-deps */

	const handlePlayPause = () => {
		setIsPlaying(!isPlaying)
		wavesurfer?.playPause()
	}

	return (
		<Box sx={styles.sample}>
			<Grid container spacing={2}>
				<Grid item xs={12} md={5}>
					<Box sx={styles.metadata}>
						<Fab
							size="medium"
							onClick={handlePlayPause}
							sx={styles.metadataPlayBtn}
							color="primary"
							className="samplePlayPauseBtn"
						>
							{isPlaying ? <PauseRounded /> : <PlayArrowRounded />}
						</Fab>
						<Box>
							{showEyebrow && (
								<Typography sx={styles.metadataSmall}>
									<a href={`/samples/${details._id}`}>Stem {idx}</a>
								</Typography>
							)}
							<Typography sx={styles.metadataTitle} variant="h4">
								{details.filename}
							</Typography>
							<Typography sx={styles.metadataSmall}>
								Added by <Link href={`/users/${details.createdBy}`}>{formatAddress(details.createdBy)}</Link>
							</Typography>
						</Box>
					</Box>
				</Grid>
				<Grid item xs={12} md={7}>
					<div id={`waveform-${details._id}-${idx}`} />
					<div id={`timeline-${details._id}-${idx}`} />
				</Grid>
			</Grid>
		</Box>
	)
}

export default SamplePlayer
