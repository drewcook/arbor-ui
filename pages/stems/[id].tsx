import { /*Loop,*/ PauseRounded, PlayArrowRounded } from '@mui/icons-material'
import { Box, Container, Divider, Fab, Grid, Typography } from '@mui/material'
import type { GetServerSideProps, NextPage } from 'next'
// Because our stem player uses Web APIs for audio, we must ignore it for SSR to avoid errors
import dynamic from 'next/dynamic'
import Head from 'next/head'
import Link from 'next/link'
import PropTypes from 'prop-types'
import { useState } from 'react'

import ProjectCard from '../../components/ProjectCard'
import { IProjectDoc } from '../../models/project.model'
import { IStemDoc } from '../../models/stem.model'
import { detailsStyles as styles } from '../../styles/Stems.styles'
import userProfileStyles from '../../styles/UserProfile.styles'
import formatDate from '../../utils/formatDate'
import formatStemName from '../../utils/formatStemName'
import { get } from '../../utils/http'

const StemPlayer = dynamic(() => import('../../components/StemPlayer'), { ssr: false })

const propTypes = {
	data: PropTypes.shape({
		createdAt: PropTypes.string.isRequired,
		filename: PropTypes.string.isRequired,
		filetype: PropTypes.string.isRequired,
		metadataUrl: PropTypes.string.isRequired,
	}),
	projects: PropTypes.arrayOf(
		PropTypes.shape({
			_id: PropTypes.string.isRequired,
		}),
	),
}

type StemDetailsPageProps = PropTypes.InferProps<typeof propTypes>

const StemDetailsPage: NextPage<StemDetailsPageProps> = props => {
	const { data, projects } = props
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

				<Divider light sx={userProfileStyles.divider} />
				<Typography variant="h4" gutterBottom>
					Collaborations
					<Typography component="span" sx={userProfileStyles.sectionCount}>
						({projects && projects.length ? 0 : ''})
					</Typography>
				</Typography>
				<Typography sx={userProfileStyles.sectionMeta}>Projects this stem has been used on.</Typography>
				<Grid container spacing={4}>
					{projects && projects.length > 0 ? (
						projects.map(project => (
							<Grid item sm={6} md={4} key={project?._id}>
								<ProjectCard details={project} />
							</Grid>
						))
					) : (
						<Grid item xs={12}>
							<Typography sx={userProfileStyles.noItemsMsg}>
								This stem has not been used in any projects yet.
							</Typography>
						</Grid>
					)}
				</Grid>
			</Container>
		</>
	)
}

export const getServerSideProps: GetServerSideProps = async context => {
	const stemId = context.query.id
	const res = await get(`/stems/${stemId}`)
	const data: IStemDoc | null = res.success ? res.data : null

	// Get all Projects
	const result = await get(`/projects`)
	const projects: IProjectDoc[] | null = result.success ? result.data : null
	return {
		props: {
			data,
			projects,
		},
	}
}

export default StemDetailsPage
