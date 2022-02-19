import { useEffect, useState } from 'react'
import { Howl } from 'howler'
import { Box, Fab, Grid, Typography } from '@mui/material'
import { PauseRounded, PlayArrowRounded } from '@mui/icons-material'
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
    justifyContent: 'flex-start'
  },
  metadataPlayBtn: {
    color: "#fff",
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
  idx: number,
	details: ISampleDoc,
}

const SamplePlayer = (props: SamplePlayerProps): JSX.Element => {
	const { idx, details } = props
  const [wavesurfer, setWavesurfer] = useState<WaveSurfer>()
	const [sound, setSound] = useState<Howl>()
  const [isPlaying, setIsPlaying] = useState<boolean>(false)

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
                container: `#timeline-${details._id}-${idx}`
              })
            ]
        });
        instance.load(details.audioUrl)
        setWavesurfer(instance)
    }
    initWavesurfer()
    return () => wavesurfer?.destroy()
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
            <Fab size="medium" onClick={handlePlayPause} sx={styles.metadataPlayBtn} color="primary">
              {isPlaying ? <PauseRounded /> : <PlayArrowRounded />}
            </Fab>
            <Box>
              <Typography sx={styles.metadataSmall}>Stem {idx}</Typography>
              <Typography sx={styles.metadataTitle} variant="h4">{details.filename}</Typography>
              <Typography sx={styles.metadataSmall}>Added by {formatAddress(details.createdBy)}</Typography>
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
