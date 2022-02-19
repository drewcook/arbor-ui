import { Fragment, useEffect, useState } from 'react'
import type { GetServerSideProps, NextPage } from 'next'
import Head from 'next/head'
import Footer from '../../components/Footer'
import AppHeader from '../../components/AppHeader'
import { get } from '../../utils/http'
import { Howl } from 'howler'
import {
	Box,
	Chip,
	Container,
	Divider,
  Fab,
	Grid,
	IconButton,
	Typography,
} from '@mui/material'
import { IProjectDoc } from '../../models/project.model'
import { Download, PauseRounded, PlayArrowRounded } from '@mui/icons-material'
import SamplePlayer from '../../components/SamplePlayer'
import SampleDropzone from '../../components/SampleDropzone'

const styles = {
	error: {
		textAlign: 'center',
		marginY: 4,
	},
	title: {
    textTransform: 'uppercase',
    fontStyle: 'italic',
    fontWeight: 900,
    mb: 2,
    display: 'flex',
    alignItems: 'center',
  },
  playAllBtn: {
    mr: 2,
    color: '#fff',
  },
	desc: {
		color: "#777",
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
	tag: {
		m: 1,
    color: "#fff",
    fontWeight: 500,
	},
  divider: {
		my: 3,
		borderColor: '#ccc',
	},
  stemMetadata: {
    mb: 4,
  },
  stemHistoryTitle: {
    fontSize: '2rem',
    fontStyle: 'italic',
    fontWeight: 400,
    textTransform: 'uppercase',
  },
  stemHistoryMeta: {
    fontStyle: 'italic',
    fontWeight: 300,
    textTransform: 'uppercase',
    color: "#777"
  },
  downloadAllWrap: {
    display: 'flex',
    justifyContent: 'flex-end',
    alignItems: 'center',
    pt: 1,
  },
  downloadAllBtn: {
    ml: 1,
  },
  downloadAllText: {
    color: '#a8a8a8',
    fontStyle: 'italic',
    fontWeight: 900,
    textTransform: 'uppercase',
  },
	noSamplesMsg: {
		textAlign: 'center',
		marginY: 4,
	},
}

type ProjectPageProps = {
	data: IProjectDoc | null,
}

const ProjectPage: NextPage<ProjectPageProps> = props => {
	const { data } = props
	const [details, setDetails] = useState(data)
  const [sounds, setSounds] = useState<Howl[]>([])
  const [isPlayingAll, setIsPlayingAll] = useState<boolean>(false)

  useEffect(() => {
    if (data) {
      const sources = []
      for (let sample of data.samples) {
        sources.push(new Howl({
          src: sample.audioUrl
        }))
      }
      setSounds(sources)
    }
	}, []) /* eslint-disable-line react-hooks/exhaustive-deps */

	useEffect(() => {
		// Re-initialize the play all button
    if (details) {
      const sources = []
      for (let sample of details.samples) {
        sources.push(new Howl({
          src: sample.audioUrl
        }))
      }
      setSounds(sources)
    }
	}, [details])

  const handlePlayPauseAllSamples = () => {
    for (let sound of sounds) isPlayingAll ? sound.pause() : sound.play()
    setIsPlayingAll(!isPlayingAll)
  }

  const handleDownloadAll = () => {
    console.log('download all samples')
    // if (details) {
    //   details.samples.forEach(s => {
    //     const a = document.createElement('a');
    //     document.body.appendChild(a);
    //     a.download = s.audioUrl
    //     a.href = s.audioUrl
    //     a.text = 'Click'
        // a.click()
        // document.body.removeChild(a)
      // })
    // }
  }

	const onUploadSuccess = (projectData: IProjectDoc) => {
		// Refresh UI
		setDetails(projectData)
		// TODO: Hit Python HTTP server and pass along array of project sample CIDs
		// - Get back single CID representing layered samples as one
		// TODO: Call smart contract and mint an nft out of the original CID
	}

	return (
		<>
			<Head>
				<title>ETHDenver Hack Web App | Create A New Project</title>
				<meta name="description" content="A hackathon music app" />
				<link rel="icon" href="/favicon.ico" />
			</Head>

			<AppHeader />

			<main id="app-main">
				<Container maxWidth="xl">
					{details ? (
            <>
            <Grid container spacing={4}>
              <Grid item xs={12} md={8}>
                <Box>
                  <Typography variant="h4" component="h2" sx={styles.title}>
                    <Fab size="large" onClick={handlePlayPauseAllSamples} sx={styles.playAllBtn} color="primary">
                      {isPlayingAll ? <PauseRounded /> : <PlayArrowRounded />}
                    </Fab>
                    {details.name}
                  </Typography>
                  <Typography sx={styles.desc}>{details.description}</Typography>
                  <Box sx={styles.metadataWrap}>
                    <Typography sx={styles.metadata}>
                      <Typography component="span" sx={styles.metadataKey}>BPM:</Typography>
                      {details.bpm}
                    </Typography>
                    <Typography sx={styles.metadata}>
                      <Typography component="span" sx={styles.metadataKey}>Time Box:</Typography>
                      {details.timeboxMins} Minutes
                    </Typography>
                    <Typography sx={styles.metadata}>
                      <Typography component="span" sx={styles.metadataKey}>Open To:</Typography>
                      Anyone
                    </Typography>
                  </Box>
                </Box>
                {details.tags.length > 0 &&
                  details.tags.map((tag: string) => (
                    <Chip
                      key={tag}
                      label={tag}
                      variant="filled"
                      color="secondary"
                      sx={styles.tag}
                    />
                  ))}
              </Grid>
              <Grid item xs={12} md={4}>
                <SampleDropzone
                  project={details}
                  onSuccess={onUploadSuccess}
                />
              </Grid>
            </Grid>
              <Divider light sx={styles.divider} />
              <Box sx={styles.stemMetadata}>
                  <Grid container spacing={3}>
                    <Grid item xs={12} sm={4}>
                      <Typography variant="h4" component="h3" sx={styles.stemHistoryTitle}>
                        Stem History
                      </Typography>
                      <Typography sx={styles.stemHistoryMeta}>
                        {details.samples.length} Stem{details.samples.length === 1 ? '' : 's'} from {details.collaborators.length} Collaborator{details.collaborators.length === 1 ? '' : 's'}
                      </Typography>
                    </Grid>
                    <Grid item xs={12} sm={8}>
                      <Box sx={styles.downloadAllWrap}>
                        <Typography sx={styles.downloadAllText} variant="body2">Download All Stems</Typography>
                        <IconButton
                          sx={styles.downloadAllBtn}
                          onClick={handleDownloadAll}
                          color="primary"
                        >
                          <Download />
                        </IconButton>
                      </Box>
                    </Grid>
                  </Grid>
                </Box>
                {details.samples.length > 0 ? (
                  details.samples.map((sample, idx) => (
                    <Fragment key={idx}>
                      <SamplePlayer idx={idx + 1} details={sample} />
                    </Fragment>
                  ))
                ) : (
                  <Typography sx={styles.noSamplesMsg}>No samples to show, add one!</Typography>
                )}
            </>
					) : (
						<Typography sx={styles.error} color="error">
							Sorry, no details were found for this project.
						</Typography>
					)}
				</Container>
			</main>

			<Footer />
		</>
	)
}

export const getServerSideProps: GetServerSideProps = async context => {
	const projectId = context.query.id
	const res = await get(`/projects/${projectId}`)
	let data: IProjectDoc | null = res.success ? res.data : null
	return {
		props: {
			data,
		},
	}
}

export default ProjectPage
