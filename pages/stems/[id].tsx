import { /*Loop,*/ PauseRounded, PlayArrowRounded } from '@mui/icons-material'
import { Box, Container, Divider, Fab, Typography } from '@mui/material'
import type { GetServerSideProps, NextPage } from 'next'
// Because our stem player uses Web APIs for audio, we must ignore it for SSR to avoid errors
import dynamic from 'next/dynamic'
import Head from 'next/head'
import Link from 'next/link'
import PropTypes from 'prop-types'
import { useState } from 'react'

import { get } from '../../lib/http'
import { IStemDoc } from '../../models/stem.model'
import { detailsStyles as styles } from '../../styles/Stems.styles'
import formatDate from '../../utils/formatDate'
import formatStemName from '../../utils/formatStemName'

const StemPlayer = dynamic(() => import('../../components/StemPlayer'), { ssr: false })

const propTypes = {
	data: PropTypes.shape({
		createdAt: PropTypes.string.isRequired,
		filename: PropTypes.string.isRequired,
		filetype: PropTypes.string.isRequired,
		metadataUrl: PropTypes.string.isRequired,
	}),
}

type StemDetailsPageProps = PropTypes.InferProps<typeof propTypes>

const StemDetailsPage: NextPage<StemDetailsPageProps> = props => {
	const { data } = props
	const [waves, setWaves] = useState<any>(null)
	const [isPlaying, setIsPlaying] = useState<boolean>(false)
	// const [isLooping, setIsLooping] = useState<boolean>(false)

	const onWavesInit = (idx: number, ws: any) => setWaves(ws)

	const handlePlayPauseStems = () => {
		// Play or pause the stem audio from wavesurfer
		if (waves) waves.playPause()
		// Toggle state
		setIsPlaying(!isPlaying)
	}

	// Called when
	// const handleLoopReplay = (idx: number, ws: any) => {
	// 	// TODO: This logic seems inverted, why??
	// 	if (!isLooping) {
	// 		ws.play(0)
	// 		setIsPlaying(true)
	// 	} else {
	// 		setIsPlaying(false)
	// 	}
	// }

	const handleSkipPrev = () => {
		// Bring the track back to beginning
		if (waves) waves.seekTo(0)
	}

	/* eslint-disable-next-line @typescript-eslint/no-unused-vars */
	const handleStop = (idx: number) => {
		// Stop playing the track
		if (waves) waves.stop()
		// Toggle state
		setIsPlaying(false)
	}

	// const handleDownload = () => {
	// 	console.log('download stem')
	// }

	return (
		<>
			<Head>
				<title>Arbor | Stem Details</title>
			</Head>
			<Container maxWidth="xl" className="content-container">
				<Box sx={styles.headingWrap}>
					<Box sx={styles.playWrap}>
						<Fab
							size="large"
							onClick={handlePlayPauseStems}
							/* @ts-ignore */
							sx={styles.playBtn}
							title={isPlaying ? 'Pause the stem' : 'Play the stem'}
						>
							{isPlaying ? <PauseRounded sx={styles.playIcon} /> : <PlayArrowRounded sx={styles.playIcon} />}
						</Fab>
						{/* <Fab
								size="large"
								onClick={() => setIsLooping(!isLooping)}
								// @ts-ignore
								sx={styles.loopBtn}
								className={isLooping ? 'looping' : ''}
								title={isLooping ? 'Unloop the playback' : 'Loop the playback'}
							>
								<Loop sx={styles.loopIcon} />
							</Fab> */}
					</Box>
					<Box>
						<Typography variant="body1" component="h3" sx={styles.eyebrow}>
							Stem Details
						</Typography>
						<Typography variant="h4" component="h2" sx={styles.title}>
							{data ? formatStemName(data.filename) : 'Arbor Stem'}
						</Typography>
						{data && (
							<>
								<Typography sx={styles.desc}>
									This is an Arbor stem that has been uploaded through our platform and is stored using NFT.storage.
								</Typography>
								<Box sx={styles.metadataWrap}>
									<Typography sx={styles.metadata}>
										<Typography component="span" sx={styles.metadataKey}>
											File Type:
										</Typography>
										{data.filetype}
									</Typography>
									<Typography sx={styles.metadata}>
										<Typography component="span" sx={styles.metadataKey}>
											Stored At:
										</Typography>
										<Link href={data.metadataUrl}>View on IPFS</Link>
									</Typography>
									<Typography sx={styles.metadata}>
										<Typography component="span" sx={styles.metadataKey}>
											Created On:
										</Typography>
										{formatDate(data.createdAt)}
									</Typography>
								</Box>
							</>
						)}
					</Box>
				</Box>
				<Divider light sx={styles.divider} />
				{data ? (
					<StemPlayer
						idx={1}
						details={data}
						onWavesInit={onWavesInit}
						// onFinish={handleLoopReplay}
						isStemDetails
						onSkipPrev={handleSkipPrev}
						onStop={handleStop}
					/>
				) : (
					<Typography sx={styles.error} color="error">
						Sorry, no details were found for this stem.
					</Typography>
				)}
			</Container>
		</>
	)
}

export const getServerSideProps: GetServerSideProps = async context => {
	const stemId = context.query.id
	const res = await get(`/stems/${stemId}`)
	const data: IStemDoc | null = res.success ? res.data : null
	return {
		props: {
			data,
		},
	}
}

export default StemDetailsPage
