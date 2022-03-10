import { Download, PauseRounded, PlayArrowRounded } from '@mui/icons-material'
import {
	Box,
	Button,
	Chip,
	CircularProgress,
	Container,
	Divider,
	Fab,
	Grid,
	IconButton,
	Typography,
} from '@mui/material'
import { Howl } from 'howler'
import type { GetServerSideProps, NextPage } from 'next'
// Because our sample player uses Web APIs for audio, we must ignore it for SSR to avoid errors
import dynamic from 'next/dynamic'
import Head from 'next/head'
import Image from 'next/image'
import Link from 'next/link'
import PropTypes from 'prop-types'
import { Fragment, useEffect, useState } from 'react'
import AppFooter from '../../components/AppFooter'
import AppHeader from '../../components/AppHeader'
import Notification from '../../components/Notification'
import SampleDropzone from '../../components/SampleDropzone'
import { useWeb3 } from '../../components/Web3Provider'
import { IProjectDoc } from '../../models/project.model'
import EthereumIcon from '../../public/ethereum_icon.png'
import formatAddress from '../../utils/formatAddress'
import { get } from '../../utils/http'
const SamplePlayer = dynamic(() => import('../../components/SamplePlayer'), { ssr: false })

const styles = {
	error: {
		textAlign: 'center',
		marginY: 4,
	},
	titleWrap: {
		display: 'flex',
		alignItems: 'center',
		justifyContent: 'flex-start',
		mb: 2,
	},
	title: {
		textTransform: 'uppercase',
		fontStyle: 'italic',
		fontWeight: 900,
		display: 'flex',
		alignItems: 'center',
	},
	playAllBtn: {
		mr: 2,
		width: '80px',
		height: '80px',
		color: '#fff',
		fontSize: '2rem',
	},
	createdBy: {
		color: '#a8a8a8',
		fontStyle: 'italic',
		fontWeight: 900,
		textTransform: 'uppercase',
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
	tag: {
		m: 1,
		color: '#fff',
		fontWeight: 500,
	},
	mintAndBuy: {
		mt: 3,
		display: 'flex',
		flexDirection: 'row',
		alignItems: 'center',
	},
	mintAndBuyBtn: {
		width: '9rem',
		boxShadow: '5px 5px #23F09A',
	},
	price: {
		display: 'flex',
		alignItems: 'center',
		pl: 3,
	},
	eth: {
		color: '#aaa',
		fontSize: '1rem',
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
		color: '#777',
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

const propTypes = {
	projectId: PropTypes.string.isRequired,
	data: PropTypes.shape({
		samples: PropTypes.arrayOf(
			PropTypes.shape({
				cid: PropTypes.string.isRequired,
				audioUrl: PropTypes.string.isRequired,
			}),
		).isRequired,
		createdBy: PropTypes.string.isRequired,
		name: PropTypes.string.isRequired,
		description: PropTypes.string.isRequired,
		bpm: PropTypes.number.isRequired,
		timeboxMins: PropTypes.number.isRequired,
		tags: PropTypes.arrayOf(PropTypes.string.isRequired).isRequired,
		collaborators: PropTypes.arrayOf(PropTypes.string.isRequired).isRequired,
		cid: PropTypes.string,
	}),
}

type ProjectPageProps = PropTypes.InferProps<typeof propTypes>

const ProjectPage: NextPage<ProjectPageProps> = props => {
	const { data, projectId } = props
	const [details, setDetails] = useState(data)
	const [sounds, setSounds] = useState<Howl[]>([])
	const [isPlayingAll, setIsPlayingAll] = useState<boolean>(false)
	const [minting, setMinting] = useState(false)
	const [successOpen, setSuccessOpen] = useState(false)
	const [successMsg, setSuccessMsg] = useState('')
	const [errorOpen, setErrorOpen] = useState(false)
	const [errorMsg, setErrorMsg] = useState('')
	const { connected, currentUser, handleConnectWallet, NFTStore } = useWeb3()

	useEffect(() => {
		// Initialize all samples as Howler objects for "play/pause all" functionality
		if (data) {
			const sources = []
			for (const sample of data?.samples) {
				sources.push(
					new Howl({
						src: sample?.audioUrl,
					}),
				)
			}
			setSounds(sources)
		}
	}, []) /* eslint-disable-line react-hooks/exhaustive-deps */

	useEffect(() => {
		// Re-initialize the play all button
		if (details) {
			const sources = []
			for (const sample of details?.samples) {
				sources.push(
					new Howl({
						src: sample?.audioUrl,
					}),
				)
			}
			setSounds(sources)
		}
	}, [details])

	const handlePlayPauseAllSamples = () => {
		for (const sound of sounds) isPlayingAll ? sound.pause() : sound.play()
		setIsPlayingAll(!isPlayingAll)
	}

	// TODO: Fix downloading files
	const handleDownloadAll = () => {
		// if (details) {
		// 	details.samples.forEach(s => {
		// 		const a = document.createElement('a')
		// 		document.body.appendChild(a)
		// 		a.download = s.audioUrl
		// 		a.href = s.audioUrl
		// 		a.text = 'Click'
		// 		a.click()
		// 		document.body.removeChild(a)
		// 	})
		// }
		console.log('download all samples')
	}

	const onUploadSuccess = (projectData: IProjectDoc) => {
		// Refresh UI
		setDetails(projectData)
		setSuccessOpen(true)
		setSuccessMsg('Successfully uploaded file to NFT.storage!')
	}

	const handleMintAndBuy = async () => {
		try {
			if (details && currentUser) {
				setMinting(true)
				const samples = details.samples.map(s => s?.cid.replace('ipfs://', ''))

				// Hit Python HTTP server to flatten samples into a singular one
				const response = await fetch('/api/flatten', {
					method: 'POST',
					headers: {
						'Content-Type': 'application/json',
					},
					body: JSON.stringify({ sample_cids: samples }),
				})
				// Catch flatten audio error
				if (!response.ok) {
					setErrorOpen(true)
					setErrorMsg('Uh oh, failed to mint the NFT')
					setMinting(false)
				}

				// If we've flattened the file, now mint the NFT and write on-chain
				const flattenedData = await response.json()
				if (!flattenedData.success) throw new Error('Failed to flatten the audio files')

				// TODO: create new sample from flattened audio
				// TODO: add new sample created to user's info

				// Construct JSON obj representing metadata around this NFT and store on NFT.storage
				const metadata = await NFTStore.store({
					name: details.name, // TODO: plus a version number?
					description:
						'A PolyEcho NFT representing collaborative music from multiple contributors on the decentralized web.',
					image: 'https://ipfs.io/ipfs/bafkreia7jo3bjr2mirr5h2okf5cjsgg6zkz7znhdboyikchoe6btqyy32u', //new File([], 'PolyEcho NFT', { type: 'image/*' }),
					properties: {
						audio: new File([`https://ipfs.io/ipfs/${flattenedData.cid}`], details.name, { type: 'audio/wav' }),
						ipfsCid: flattenedData.cid,
						collaborators: details.collaborators,
						projectId,
						samples: details.samples,
					},
				})
				console.log({ nftStorage: metadata })

				// Call smart contract and mint an nft out of the original CID
				// const tokenURI: any = await contract.methods
				// 	.mint(currentUser._id, flattenedData.cid, details.collaborators)
				// 	// TODO: Should this be non-lowercased?
				// 	.send({ from: currentUser._id, value: '10000000000000000', gas: 650000 }) // 0.01 ETH

				// // Add new NFT to user details
				// const userUpdated = await update(`/users/${tokenURI.from}`, {
				// 	newNFT: { token: tokenURI, cid: flattenedData.cid, projectId: projectId, projectName: details.name },
				// })
				// if (!userUpdated.success) throw new Error(userUpdated.error)

				// Notify success
				setSuccessOpen(true)
				setSuccessMsg('Successfully minted a new NFT!')
				setMinting(false)
			}
		} catch (e: any) {
			console.error(e)
			// Notify error
			setMinting(false)
			setErrorOpen(true)
			setErrorMsg('Uh oh, failed to mint the NFT')
		}
	}

	const onNotificationClose = () => {
		setSuccessOpen(false)
		setSuccessMsg('')
		setErrorOpen(false)
		setErrorMsg('')
	}

	return (
		<>
			<Head>
				<title>PolyEcho | Project Details</title>
				<meta
					name="description"
					content="PolyEcho is a schelling game where the objective is to publicly co-create songs worthy of purchase by NFT collectors."
				/>
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
										<Box sx={styles.titleWrap}>
											<Fab size="large" onClick={handlePlayPauseAllSamples} sx={styles.playAllBtn} color="primary">
												{isPlayingAll ? <PauseRounded fontSize="large" /> : <PlayArrowRounded fontSize="large" />}
											</Fab>
											<Box>
												<Typography variant="h4" component="h2" sx={styles.title}>
													{details.name}
												</Typography>
												<Typography sx={styles.createdBy}>
													Created by{' '}
													<Link href={`/users/${details.createdBy}`}>{formatAddress(details.createdBy)}</Link>
												</Typography>
											</Box>
										</Box>
										<Typography sx={styles.desc}>{details.description}</Typography>
										<Box sx={styles.metadataWrap}>
											<Typography sx={styles.metadata}>
												<Typography component="span" sx={styles.metadataKey}>
													BPM:
												</Typography>
												{details.bpm}
											</Typography>
											<Typography sx={styles.metadata}>
												<Typography component="span" sx={styles.metadataKey}>
													Time Box:
												</Typography>
												{details.timeboxMins} Minutes
											</Typography>
											<Typography sx={styles.metadata}>
												<Typography component="span" sx={styles.metadataKey}>
													Open To:
												</Typography>
												Anyone
											</Typography>
										</Box>
									</Box>
									{details.tags.length > 0 &&
										details.tags.map((tag: string) => (
											<Chip key={tag} label={tag} variant="filled" color="secondary" sx={styles.tag} />
										))}
									{details.samples.length > 0 && (
										<Box sx={styles.mintAndBuy}>
											<Button
												size="large"
												onClick={connected ? handleMintAndBuy : handleConnectWallet}
												variant="contained"
												color="secondary"
												sx={styles.mintAndBuyBtn}
												disabled={minting || details.samples.length < 2}
											>
												{minting ? <CircularProgress size={18} sx={{ my: 0.5 }} /> : 'Mint & Buy'}
											</Button>
											<Box sx={styles.price}>
												<Image src={EthereumIcon} width={50} height={50} alt="Ethereum" />
												<Typography variant="h4" component="div">
													0.01{' '}
													<Typography sx={styles.eth} component="span">
														ETH
													</Typography>
												</Typography>
											</Box>
										</Box>
									)}
								</Grid>
								<Grid item xs={12} md={4}>
									<SampleDropzone project={details} onSuccess={onUploadSuccess} />
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
											{details.samples.length} Stem{details.samples.length === 1 ? '' : 's'} from{' '}
											{details.collaborators.length} Collaborator{details.collaborators.length === 1 ? '' : 's'}
										</Typography>
									</Grid>
									<Grid item xs={12} sm={8}>
										<Box sx={styles.downloadAllWrap}>
											<Typography sx={styles.downloadAllText} variant="body2">
												Download All Stems
											</Typography>
											<IconButton
												sx={styles.downloadAllBtn}
												onClick={handleDownloadAll}
												color="primary"
												disabled={true}
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
										<SamplePlayer idx={idx + 1} details={sample} showEyebrow={true} />
									</Fragment>
								))
							) : (
								<Typography sx={styles.noSamplesMsg}>No samples to show, upload one!</Typography>
							)}
						</>
					) : (
						<Typography sx={styles.error} color="error">
							Sorry, no details were found for this project.
						</Typography>
					)}
				</Container>
			</main>

			<AppFooter />
			{successOpen && <Notification open={successOpen} msg={successMsg} type="success" onClose={onNotificationClose} />}
			{errorOpen && <Notification open={errorOpen} msg={errorMsg} type="error" onClose={onNotificationClose} />}
		</>
	)
}

ProjectPage.propTypes = propTypes

export const getServerSideProps: GetServerSideProps = async context => {
	const projectId = context.query.id
	const res = await get(`/projects/${projectId}`)
	const data: IProjectDoc | null = res.success ? res.data : null
	return {
		props: {
			data,
			projectId,
		},
	}
}

export default ProjectPage
