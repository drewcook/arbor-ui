import { Box, Button, ButtonGroup, Grid, Typography } from '@mui/material'
import Link from 'next/link'
import { useEffect, useState } from 'react'
import WaveSurfer from 'wavesurfer.js'
import type { ISampleDoc } from '../models/sample.model'
import formatAddress from '../utils/formatAddress'
import formatSampleName from '../utils/formatSampleName'

const styles = {
	sample: {
		borderLeft: '3px solid #000',
		borderRight: '3px solid #000',
		borderBottom: '3px solid #111',
	},
	btnsWrap: {
		display: 'flex',
		alignItems: 'center',
		justifyContent: 'flex-start',
	},
	header: {
		py: 1,
		px: 2,
	},
	metadataPlayBtn: {
		color: '#fff',
		minWidth: '50px',
		mr: 2,
	},
	title: {
		mr: 4,
		fontSize: '1.5rem',
		display: 'inline-block',
		textTransform: 'uppercase',
		fontStyle: 'italic',
		fontWeight: 900,
		wordBreak: 'break-all',
	},
	addedBy: {
		display: 'inline-block',
		color: '#5a5a5a',
		fontStyle: 'italic',
		fontSize: '.75rem',
		verticalAlign: 'super',
	},
	addressLink: {
		color: '#000',
		fontSize: '.9rem',
		fontWeight: 700,
		display: 'inline-block',
		verticalAlign: 'middle',
	},
	forkBtn: {
		backgroundColor: '#fff',
		textTransform: 'uppercase',
		fontWeight: 900,
	},
	playback: {
		backgroundColor: '#f4f4f4',
		py: 3,
		px: 2,
	},
	btnGroup: {
		mt: 1,
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
	const [isMuted, setIsMuted] = useState<boolean>(false)

	useEffect(() => {
		const ws = WaveSurfer.create({
			container: `#waveform-${details._id}-${idx}`,
			waveColor: '#bbb',
			progressColor: '#444',
			cursorColor: '#656565',
			barWidth: 3,
			barRadius: 3,
			cursorWidth: 1,
			height: 80,
			barGap: 2,
			plugins: [
				// TimelinePlugin.create({
				// 	container: `#timeline-${details._id}-${idx}`,
				// }),
			],
		})
		ws.load(details.audioHref)
		setWavesurfer(ws)
		return () => ws.destroy()
	}, []) /* eslint-disable-line react-hooks/exhaustive-deps */

	const toggleMute = () => {
		setIsMuted(!isMuted)
		wavesurfer?.setMute(!wavesurfer?.getMute())
	}

	const handleSolo = () => {
		console.log('solo this track')
	}

	const stemTypesToColor: Record<string, string> = {
		drums: '#FFA1A1',
		bass: '#D6A1FF',
		chords: '#FDFFA1',
		melody: '#A1EEFF',
		vocals: '#A1FFBB',
		combo: '#FFA1F0',
		other: '##FFC467',
	}

	return (
		<Box sx={styles.sample}>
			<Box sx={{ ...styles.header, backgroundColor: stemTypesToColor[details.type] || '#dadada' }}>
				<Grid container spacing={2} sx={{ alignItems: 'center' }}>
					<Grid item xs={10}>
						{/* {showEyebrow && (
							<Typography sx={styles.metadataSmall}>
								<a href={`/samples/${details._id}`}>Stem {idx}</a>
							</Typography>
						)} */}
						<Typography sx={styles.title} variant="h4">
							{formatSampleName(details.name || details.filename)}
						</Typography>
						<Typography sx={styles.addedBy}>
							Added X hours ago by{' '}
							<Typography sx={styles.addressLink} component="span">
								<Link href={`/users/${details.createdBy}`}>{formatAddress(details.createdBy)}</Link>
							</Typography>
						</Typography>
					</Grid>
					<Grid item xs={2} sx={{ textAlign: 'right' }}>
						<Button variant="outlined" size="small" sx={styles.forkBtn}>
							Fork
						</Button>
					</Grid>
				</Grid>
			</Box>
			<Box sx={styles.playback}>
				<Grid container spacing={1}>
					<Grid item xs={1} sx={styles.btnsWrap}>
						<ButtonGroup sx={styles.btnGroup} orientation="vertical">
							<Button variant={isMuted ? 'contained' : 'outlined'} size="small" onClick={toggleMute}>
								M
							</Button>
							<Button variant="outlined" size="small" onClick={handleSolo}>
								S
							</Button>
						</ButtonGroup>
					</Grid>
					<Grid item xs={11}>
						<div id={`waveform-${details._id}-${idx}`} />
						<div id={`timeline-${details._id}-${idx}`} />
					</Grid>
				</Grid>
			</Box>
		</Box>
	)
}

export default SamplePlayer
