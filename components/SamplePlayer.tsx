import { useCallback, useEffect, useMemo, useRef, useState } from 'react'
import { Howl } from 'howler'
import { Button, ButtonGroup, Divider, Grid, IconButton, Paper, Typography } from '@mui/material'
import { PauseCircleRounded, PlayArrowRounded } from '@mui/icons-material'
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
	pauseBtn: {
		backgroundColor: '#00d3a3',
	},
}

type SamplePlayerProps = {
	details: ISample,
}

const SamplePlayer = (props: SamplePlayerProps): JSX.Element => {
	const { details } = props
  const [wavesurfer, setWavesurfer] = useState<WaveSurfer>()
	const [sound, setSound] = useState<Howl>()

	useEffect(() => {
    // Initialize Howler.js player
		const howl = new Howl({
      src: [details.audioUrl],
		})
		setSound(howl)

    const initWavesurfer = async () => {
        /* @ts-ignore */
        const WaveSurfer = await import('wavesurfer.js')
        /* @ts-ignore */
        const CursorPlugin = await import('wavesurfer.js/dist/plugin/wavesurfer.cursor.min.js')
        /* @ts-ignore */
        const TimelinePlugin = await import('wavesurfer.js/dist/plugin/wavesurfer.timeline.min.js')
        let instance = WaveSurfer.default.create({
            container: '#waveform',
            waveColor: '#D9DCFF',
            progressColor: '#4353FF',
            cursorColor: '#4353FF',
            barWidth: 3,
            barRadius: 3,
            cursorWidth: 1,
            height: 200,
            barGap: 3,
            plugins: [
              CursorPlugin.default.create({
                  showTime: true,
                  opacity: 1,
                  customShowTimeStyle: {
                      'background-color': '#000',
                      color: '#fff',
                      padding: '2px',
                      'font-size': '10px'
                  }
              }),
              TimelinePlugin.default.create({
                container: '#timeline'
              })
            ]
        });
        instance.load(details.audioUrl)
        setWavesurfer(instance)

    }
    initWavesurfer()
    return () => wavesurfer?.destroy()
	}, []) /* eslint-disable-line react-hooks/exhaustive-deps */

  const handlePlay = () => {
    if (sound) sound.play()
  }

	const handlePause = () => {
		if (sound) sound.pause()
	}

  const handlePlayPause = () => {
    wavesurfer?.playPause()
  }

	return (
		<Paper sx={styles.sample} elevation={2}>
			<Grid container spacing={2}>
				<Grid item xs={2} sx={styles.actionsLeft}>
					{sound && sound.state() === 'loaded' ? (
						<IconButton size="large" onClick={handlePause} sx={styles.pauseBtn}>
							<PauseCircleRounded />
						</IconButton>
					) : (
						<IconButton size="large" onClick={handlePlay} sx={styles.playBtn}>
							<PlayArrowRounded />
						</IconButton>
					)}
				</Grid>
				<Grid item xs={10}>
          <div id="waveform" />
          <div id="timeline" />

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

export default SamplePlayer
