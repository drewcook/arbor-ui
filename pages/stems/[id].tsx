import { /*Loop,*/ PauseRounded, PlayArrowRounded } from '@mui/icons-material'
import { Box, Divider, Fab, Grid, Typography } from '@mui/material'
import { useState } from 'react'
import type { GetServerSideProps, NextPage } from 'next'
// Because our stem player uses Web APIs for audio, we must ignore it for SSR to avoid errors
import dynamic from 'next/dynamic'
import Head from 'next/head'
import Link from 'next/link'
import PropTypes from 'prop-types'
import { IStemDoc } from '../../models/stem.model'
import AudioVisual from '../../components/AudioVisual'
import formatDate from '../../utils/formatDate'
import formatStemName from '../../utils/formatStemName'
import { get } from '../../utils/http'

const StemPlayer = dynamic(() => import('../../components/StemPlayer'), { ssr: false })

const styles = {
	error: {
		textAlign: 'center',
		marginY: 4,
	},
	headingWrap: {
		position: 'relative',
		display: 'flex',
		alignItems: 'center',
		justifyContent: 'flex-end',
	},
	playWrap: {
		mr: 2,
		height: '100%',
		width: '96px',
		'&::before': {
			content: '""',
			display: 'block',
			backgroundColor: '#000',
			width: '3px',
			height: '100%',
			position: 'absolute',
			bottom: '0',
			left: '43px',
		},
	},
	playBtn: {
		position: 'absolute',
		borderRadius: '10px',
		top: 0,
		width: '90px',
		height: '90px',
		backgroundColor: '#000',
		color: '#fff',
		boxShadow: 'none',
		'&:hover, &.Mui-disabled': {
			backgroundColor: '#444',
			color: '#fff',
		},
		'&.Mui-disabled': {
			cursor: 'not-allowed',
			pointerEvents: 'none',
		},
	},
	playIcon: {
		fontSize: '4rem',
	},
	metaWrap: {
		marginLeft: '2rem',
	},
	avWrap: {
		display: 'flex',
		alignItems: 'flex-end',
		justifyContent: 'flex-end',
		pb: 2,
		height: '100%',
	},
	loopBtn: {
		position: 'absolute',
		borderRadius: '6px',
		top: 110,
		left: 26,
		width: '36px',
		height: '36px',
		backgroundColor: '#000',
		color: '#fff',
		boxShadow: 'none',
		'&:hover, &.Mui-disabled': {
			backgroundColor: '#444',
			color: '#fff',
		},
		'&.Mui-disabled': {
			cursor: 'not-allowed',
			pointerEvents: 'none',
		},
		'&.looping': {
			backgroundColor: '#4CE79D',
			color: '#000',
		},
	},
	loopIcon: {
		fontSize: '1.25rem',
	},
	title: {
		textTransform: 'uppercase',
		fontStyle: 'italic',
		fontWeight: 800,
		mb: 2,
		display: 'flex',
		alignItems: 'center',
	},
	eyebrow: {
		fontStyle: 'italic',
		fontWeight: 300,
		textTransform: 'uppercase',
		color: '#777',
	},
	desc: {
		color: '#777',
		fontSize: '18px',
		mb: 2,
		fontWeight: 300,
	},
	metadataWrap: {
		mb: 3,
	},
	metadata: {
		display: 'inline-block',
		mr: 5,
	},
	metadataKey: {
		mr: 1,
		display: 'inline-block',
		color: '#a8a8a8',
	},
	divider: {
		borderColor: '#000',
		borderWidth: '10px',
		borderTopLeftRadius: '10px',
		borderTopRightRadius: '10px',
	},
}

const propTypes = {
	data: PropTypes.shape({
		createdAt: PropTypes.string.isRequired,
		filename: PropTypes.string.isRequired,
		filetype: PropTypes.string.isRequired,
		metadataUrl: PropTypes.string.isRequired,
		audioHref: PropTypes.string.isRequired,
		audioUrl: PropTypes.string.isRequired,
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

	const handleStop = () => {
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
				<title>Polyecho | Stem Details</title>
			</Head>
			<Grid container spacing={4}>
				<Grid item xs={12} sm={8}>
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
						<Box sx={styles.metaWrap}>
							<Typography variant="body1" component="h3" sx={styles.eyebrow}>
								Stem Details
							</Typography>
							<Typography variant="h4" component="h2" sx={styles.title}>
								{data ? formatStemName(data.filename) : 'Polyecho Stem'}
							</Typography>
							{data && (
								<>
									<Typography sx={styles.desc}>
										This is a Polyecho stem that has been uploaded through our platform and is stored using NFT.storage.
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
				</Grid>
				<Grid item xs={12} sm={4}>
					<Box sx={styles.avWrap}>
						<AudioVisual
							audio={{
								url: data?.audioUrl,
								href: data?.audioHref,
							}}
							size={150}
						/>
					</Box>
				</Grid>
			</Grid>
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
		</>
	)
}

StemDetailsPage.propTypes = propTypes

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
