import { SkipPrevious, Square } from '@mui/icons-material'
import { Box, Button, ButtonGroup, Grid, Typography } from '@mui/material'
import Link from 'next/link'
import { useEffect, useState } from 'react'
import WaveSurfer from 'wavesurfer.js'
import type { IStemDoc } from '../models/stem.model'
import formatAddress from '../utils/formatAddress'
import formatStemName from '../utils/formatStemName'

const styles = {
	stem: {
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
		fontWeight: 800,
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
		fontWeight: 600,
		display: 'inline-block',
		verticalAlign: 'middle',
	},
	forkBtn: {
		backgroundColor: '#fff',
		textTransform: 'uppercase',
		fontWeight: 800,
		'&:hover': {
			backgroundColor: '#f5f5f5',
		},
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

// We have to pass back up callbacks because we use global controls outside of this player's track
type StemPlayerProps = {
	idx: number
	details: IStemDoc | any
	onWavesInit: (idx: number, ws: any) => any
	onFinish?: (idx: number, ws: any) => any
	isStemDetails?: boolean
	onSolo?: (idx: number) => any
	onSkipPrev?: () => any
	onStop?: () => any
	onNewFile: (newFile: Blob) => void
}

const StemPlayer = (props: StemPlayerProps): JSX.Element => {
	const { idx, details, onWavesInit, onFinish, isStemDetails, onSolo, onSkipPrev, onStop, onNewFile } = props
	const [wavesurfer, setWavesurfer] = useState<WaveSurfer>()
	const [isMuted, setIsMuted] = useState<boolean>(false)
	const [isSoloed, setIsSoloed] = useState<boolean>(false)
	const [blob, setBlob] = useState<Blob>()
	const [loadingBlob, setLoadingBlob] = useState<boolean>(false)

	useEffect(() => {
		if (blob) {
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
			})
			// Load audio from an XHR request
			ws.loadBlob(blob)
			console.log('Blob loaded..')
			// Skip back to zero when finished playing
			ws.on('finish', () => {
				ws.seekTo(0)
				if (onFinish) onFinish(idx, ws)
			})

			setWavesurfer(ws)
			// Callback to the parent
			onWavesInit(idx, ws)
			return () => ws.destroy()
		} else {
			if (!loadingBlob) {
				setLoadingBlob(true)
				fetch(details.audioHref).then(resp => {
					resp.blob().then(b => {
						setBlob(b)
						onNewFile(b)
					})
				})
				setLoadingBlob(false)
			}
		}
	}, []) /* eslint-disable-line react-hooks/exhaustive-deps */

	const toggleMute = () => {
		setIsMuted(!isMuted)
		wavesurfer?.setMute(!wavesurfer?.getMute())
	}

	const toggleSolo = () => {
		setIsSoloed(!isSoloed)
		if (onSolo) onSolo(idx)
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
		<Box sx={styles.stem}>
			<Box sx={{ ...styles.header, backgroundColor: stemTypesToColor[details.type] || '#dadada' }}>
				<Grid container spacing={2} sx={{ alignItems: 'center' }}>
					<Grid item xs={10}>
						<Typography sx={styles.title} variant="h4">
							{formatStemName(details.name || details.filename)}
						</Typography>
						<Typography sx={styles.addedBy}>
							Added X hours ago by{' '}
							<Typography sx={styles.addressLink} component="span">
								<Link href={`/users/${details.createdBy}`}>{formatAddress(details.createdBy)}</Link>
							</Typography>
						</Typography>
					</Grid>
					<Grid item xs={2} sx={{ textAlign: 'right' }}>
						{/* @ts-ignore */}
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
							{isStemDetails ? (
								<>
									<Button size="small" onClick={onSkipPrev} title="Skip to beginning">
										<SkipPrevious />
									</Button>
									<Button size="small" onClick={onStop} title="Stop stem">
										<Square fontSize="small" />
									</Button>
								</>
							) : (
								<>
									<Button
										variant={isMuted ? 'contained' : 'outlined'}
										size="small"
										onClick={toggleMute}
										title="Mute stem"
									>
										M
									</Button>
									<Button
										variant={isSoloed ? 'contained' : 'outlined'}
										size="small"
										onClick={toggleSolo}
										title="Solo stem"
									>
										S
									</Button>
								</>
							)}
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

StemPlayer.defaultProps = {
	isStemDetails: false,
}

export default StemPlayer
