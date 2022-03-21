import {
	AddCircleOutline,
	Download,
	PauseRounded,
	Person,
	PlayArrowRounded,
	SkipPrevious,
	Square,
} from '@mui/icons-material'
import {
	Avatar,
	AvatarGroup,
	Box,
	Button,
	Chip,
	CircularProgress,
	Container,
	Divider,
	Fab,
	IconButton,
	Typography,
} from '@mui/material'
import type { GetServerSideProps, NextPage } from 'next'
// Because our stem player uses Web APIs for audio, we must ignore it for SSR to avoid errors
import dynamic from 'next/dynamic'
import Head from 'next/head'
import Link from 'next/link'
import { useRouter } from 'next/router'
import PropTypes from 'prop-types'
import { Fragment, useState } from 'react'
import AppFooter from '../../components/AppFooter'
import AppHeader from '../../components/AppHeader'
import ImageOptimized from '../../components/ImageOptimized'
import Notification from '../../components/Notification'
import StemUploadDialog from '../../components/StemUploadDialog'
import { useWeb3 } from '../../components/Web3Provider'
import logoBinary from '../../lib/logoBinary'
import type { INft } from '../../models/nft.model'
import { IProjectDoc } from '../../models/project.model'
import PolygonIcon from '../../public/polygon_logo_black.png'
import formatAddress from '../../utils/formatAddress'
import { get, post } from '../../utils/http'

const StemPlayer = dynamic(() => import('../../components/StemPlayer'), { ssr: false })

const styles = {
	error: {
		textAlign: 'center',
		marginY: 4,
	},
	limitReachedChip: {
		backgroundColor: '#ff399f',
		color: '#fff',
		ml: 1,
		fontSize: '.8rem',
		height: '1.75rem',
		textShadow: 'none',
		mb: 1,
	},
	headingWrap: {
		position: 'relative',
		display: 'flex',
		alignItems: 'center',
		justifyContent: 'flex-start',
	},
	createdBy: {
		color: '#a8a8a8',
		fontStyle: 'italic',
		fontWeight: 300,
		textTransform: 'uppercase',
	},
	title: {
		mb: 1,
		fontSize: '54px',
	},
	playAllWrap: {
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
	playAllBtn: {
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
	playAllIcon: {
		fontSize: '4rem',
	},
	metadataWrap: {
		mb: 1,
	},
	metadata: {
		display: 'inline-block',
		mr: 5,
	},
	metadataKey: {
		mr: 0.5,
		display: 'inline-block',
		color: '#a8a8a8',
	},
	desc: {
		color: '#777',
		fontSize: '18px',
		mb: 2,
		fontWeight: 300,
	},
	tag: {
		m: 1,
		fontWeight: 400,
	},
	mintAndBuy: {
		mt: 3,
		display: 'flex',
		flexDirection: 'row',
		alignItems: 'center',
	},
	mintAndBuyBtn: {
		fontWeight: 800,
		fontStyle: 'italic',
		fontSize: '2rem',
		letterSpacing: '.5px',
		color: '#111',
		width: '225px',
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
	imgWrapper: {
		border: '3px solid #000',
		borderRadius: '10px',
		overflow: 'clip',
		maxHeight: '300px',
		maxWidth: '300px',
		m: 'auto',
		'@media (min-width: 600px)': {
			mr: 0,
		},
	},
	stemsHeader: {
		borderTopLeftRadius: '10px',
		borderTopRightRadius: '10px',
		backgroundColor: '#000',
		color: '#fff',
		display: 'flex',
		justifyContent: 'space-between',
		alignItems: 'center',
		px: 3,
		py: 5,
		mt: '60px',
		position: 'relative',
		'&::before': {
			content: '""',
			display: 'block',
			backgroundColor: '#000',
			width: '3px',
			height: '60px',
			position: 'absolute',
			top: '-60px',
			left: '43px',
		},
		'.MuiAvatar-root': {
			cursor: 'pointer',
			'&:hover': {
				backgroundColor: '#aaa',
			},
		},
	},
	stemsTitle: {
		display: 'inline-block',
		fontSize: '2rem',
		fontStyle: 'italic',
		fontWeight: 600,
		textTransform: 'uppercase',
	},
	stemsMeta: {
		display: 'flex',
		alignItems: 'center',
		fontStyle: 'italic',
		textTransform: 'uppercase',
	},
	avatarGroup: {
		ml: 2,
	},
	exportStemsBtn: {
		fontStyle: 'italic',
		fontWeight: 800,
		textTransform: 'uppercase',
		color: '#fff',
		'&:hover': {
			color: '#4CE79D',
		},
	},
	playSection: {
		p: 2,
		border: '3px solid #000',
		// borderRight: '3px solid #000',
		display: 'flex',
		alignItems: 'center',
		justifyContent: 'space-between',
	},
	playStopBtn: {
		color: '#000',
	},
	playTracker: {
		flexGrow: 1,
		backgroundColor: '#eaeaea',
		ml: 2,
		p: 2,
		textAlign: 'center',
	},
	noStemsMsg: {
		textAlign: 'center',
		py: 3,
		px: 2,
		border: '3px solid #000',
		borderBottomLeftRadius: '10px',
		borderBottomRightRadius: '10px',
	},
	addStemBtn: {
		borderWidth: '3px',
		borderColor: '#111',
		borderRadius: '5px',
		fontWeight: 800,
		mt: 4,
		'&:hover': {
			borderWidth: '3px',
		},
		'&::before': {
			content: '""',
			display: 'block',
			backgroundColor: '#000',
			width: '3px',
			height: '35px', // margin top + 2px border
			position: 'absolute',
			top: '-35px',
			left: '43px',
		},
	},
}

const propTypes = {
	projectId: PropTypes.string.isRequired,
	data: PropTypes.shape({
		stems: PropTypes.array.isRequired,
		createdBy: PropTypes.string.isRequired,
		name: PropTypes.string.isRequired,
		description: PropTypes.string.isRequired,
		bpm: PropTypes.number.isRequired,
		trackLimit: PropTypes.number.isRequired,
		tags: PropTypes.arrayOf(PropTypes.string.isRequired).isRequired,
		collaborators: PropTypes.arrayOf(PropTypes.string.isRequired).isRequired,
		cid: PropTypes.string,
	}),
}

type ProjectPageProps = PropTypes.InferProps<typeof propTypes>

const ProjectPage: NextPage<ProjectPageProps> = props => {
	const { data, projectId } = props
	// Project details
	const [details, setDetails] = useState(data)
	const [files, setFiles] = useState<Array<Blob>>([])

	// Notifications
	const [successOpen, setSuccessOpen] = useState<boolean>(false)
	const [successMsg, setSuccessMsg] = useState<string>('')
	const [errorOpen, setErrorOpen] = useState<boolean>(false)
	const [errorMsg, setErrorMsg] = useState<string>('')
	// Minting
	const [minting, setMinting] = useState<boolean>(false)
	const [mintingOpen, setMintingOpen] = useState<boolean>(false)
	const [mintingMsg, setMintingMsg] = useState<string>('')
	// Play/Pause
	const [stems, setStems] = useState<Map<number, any>>(new Map())
	const [isPlayingAll, setIsPlayingAll] = useState<boolean>(false)
	// Stem Upload
	const [uploadStemOpen, setUploadStemOpen] = useState<boolean>(false)
	// Other
	const router = useRouter()
	const { NFTStore, connected, contract, currentUser, handleConnectWallet, web3 } = useWeb3()
	const limitReached = details ? details.stems.length >= details.trackLimit : false

	const onWavesInit = (idx: number, ws: any) => {
		const tmp = new Map(stems.entries())
		tmp.set(idx, ws)
		setStems(tmp)
	}

	const handlePlayPauseStems = () => {
		// Play or pause each stem audio from wavesurfer
		stems.forEach(ws => {
			if (ws !== null) ws?.playPause()
		})
		// Toggle state
		setIsPlayingAll(!isPlayingAll)
	}

	const handleStop = () => {
		// Stop playing all tracks
		stems.forEach(ws => {
			if (ws !== null) ws?.stop()
		})
		setIsPlayingAll(false)
	}

	const handleSkipPrev = () => {
		// Bring all tracks back to beginning
		stems.forEach(ws => {
			if (ws !== null) ws?.seekTo(0)
		})
	}

	const handleSoloStem = (idx: number) => {
		stems.forEach((ws, i) => {
			if (ws !== null && i !== idx) {
				ws?.setMute(!ws?.getMute())
			}
		})
	}

	// TODO: Fix downloading files
	const handleDownloadAll = () => {
		console.log('download all stems')
	}

	const handleUploadStemOpen = () => {
		setUploadStemOpen(true)
	}

	const handleUploadStemClose = () => {
		setUploadStemOpen(false)
	}

	const onStemUploadSuccess = (projectData: IProjectDoc) => {
		// Refresh UI
		setDetails(projectData)
		setSuccessOpen(true)
		setSuccessMsg("Success! You've uploaded a new stem to this project and become a contributor.")
		handleUploadStemClose()
	}
	const onNewFile = (newFile: Blob) => {
		console.log('New File Found')
		if (!files) {
			setFiles(() => [newFile])
		} else {
			setFiles(files => [...files, newFile])
		}
	}
	// TODO: Keep track of minted versions and how many mints a project has undergone
	const handleMintAndBuy = async () => {
		try {
			if (details && currentUser) {
				setMinting(true)

				if (!mintingOpen) setMintingOpen(true)
				setMintingMsg('Combining stems into a single song...')

				const formData = new FormData()
				for (let i = 0; i < files.length; i++) {
					formData.append(`files`, files[i])
				}
				if (!process.env.PYTHON_HTTP_HOST) throw new Error('Flattening host not set.')
				const response = await fetch(process.env.PYTHON_HTTP_HOST + '/merge', {
					method: 'POST',
					body: formData,
				})

				// // Catch flatten audio error
				if (!response.ok) throw new Error('Failed to flatten the audio files')
				// const flattenedData = await response.json() // Catch fro .json()
				// if (!flattenedData.success) throw new Error('Failed to flatten the audio files')

				// TODO: create new stem from flattened audio
				// TODO: add new stem created to user's info

				if (!mintingOpen) setMintingOpen(true)
				setMintingMsg('Uploading to NFT.storage...')

				if (response.body === null) throw new Error('Failed to flatten audio files, response body empty.')
				// Construct NFT.storage data and store
				const nftsRes = await NFTStore.store({
					name: details.name, // TODO: plus a version number?
					description:
						'A PolyEcho NFT representing collaborative music from multiple contributors on the decentralized web.',
					image: new Blob([Buffer.from(logoBinary, 'base64')], { type: 'image/*' }),
					properties: {
						createdOn: new Date().toISOString(),
						createdBy: currentUser.address,
						audio: await response.blob(),
						collaborators: details.collaborators,
						stems: details.stems.map((s: any) => s.metadataUrl),
					},
				})

				// Check for data
				if (!nftsRes) throw new Error('Failed to store on NFT.storage')

				// Call smart contract and mint an nft out of the original CID
				if (!mintingOpen) setMintingOpen(true)
				setMintingMsg('Minting the NFT. This could take a moment...')
				const amount = web3.utils.toWei('0.01', 'ether')
				const mintRes: any = await contract.methods
					.mintAndBuy(currentUser.address, nftsRes.url, details.collaborators)
					.send({ from: currentUser.address, value: amount, gas: 650000 })

				// Add new NFT to database and user details
				if (!mintingOpen) setMintingOpen(true)
				setMintingMsg('Updating user details...')
				const newNftPayload: INft = {
					createdBy: currentUser.address,
					owner: currentUser.address,
					isListed: false,
					listPrice: 0,
					token: {
						id: parseInt(
							mintRes.events.TokenCreated.returnValues.newTokenId ||
								mintRes.events.TokenCreated.returnValues.tokenId ||
								mintRes.events.TokenCreated.returnValues._tokenId,
						),
						tokenURI:
							mintRes.events.TokenCreated.returnValues.newTokenURI ||
							mintRes.events.TokenCreated.returnValues.tokenURI ||
							mintRes.events.TokenCreated.returnValues._tokenURI,
						data: mintRes,
					},
					name: details.name,
					metadataUrl: nftsRes.url,
					audioHref: nftsRes.data.properties.audio,
					projectId,
					collaborators: details.collaborators,
					stems: details.stems, // Direct 1:1 map
				}
				const nftCreated = await post('/nfts', newNftPayload)
				if (!nftCreated.success) throw new Error(nftCreated.error)

				// Notify success
				if (!successOpen) setSuccessOpen(true)
				setSuccessMsg('Success! You now own this music NFT, redirecting...')
				setMinting(false)
				setMintingMsg('')

				// Route to user's profile page
				router.push(`/users/${currentUser.address}`)
			}
		} catch (e: any) {
			console.error(e)
			// Notify error
			setMintingOpen(false)
			setMintingMsg('')
			setErrorOpen(true)
			setErrorMsg('Uh oh, failed to mint the NFT')
			setMinting(false)
		}
	}

	const onNotificationClose = () => {
		setSuccessOpen(false)
		setSuccessMsg('')
		setMintingOpen(false)
		setMintingMsg('')
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
							<Box sx={styles.headingWrap}>
								<Box sx={styles.playAllWrap}>
									<Fab
										size="large"
										onClick={handlePlayPauseStems}
										/* @ts-ignore */
										sx={styles.playAllBtn}
										disabled={details.stems.length === 0}
									>
										{isPlayingAll ? (
											<PauseRounded sx={styles.playAllIcon} />
										) : (
											<PlayArrowRounded sx={styles.playAllIcon} />
										)}
									</Fab>
								</Box>
								<Box sx={{ flexGrow: 1 }}>
									<Box>
										<Typography sx={styles.createdBy}>
											Created by <Link href={`/users/${details.createdBy}`}>{formatAddress(details.createdBy)}</Link>
										</Typography>
										<Typography variant="h4" component="h2" sx={styles.title}>
											{details.name}
										</Typography>
									</Box>
									<Box sx={styles.metadataWrap}>
										<Typography sx={styles.metadata}>
											<Typography component="span" sx={styles.metadataKey}>
												BPM
											</Typography>
											{details.bpm}
										</Typography>
										<Typography sx={styles.metadata}>
											<Typography component="span" sx={styles.metadataKey}>
												Track Limit
											</Typography>
											{details.trackLimit} Tracks
											{limitReached && <Chip label="Limit Reached" size="small" sx={styles.limitReachedChip} />}
										</Typography>
										<Typography sx={styles.metadata}>
											<Typography component="span" sx={styles.metadataKey}>
												Open To
											</Typography>
											Anyone
										</Typography>
									</Box>
									<Typography sx={styles.desc}>{details.description}</Typography>
									{details.tags.length > 0 &&
										details.tags.map((tag: string) => (
											<Chip key={tag} label={tag} variant="outlined" color="primary" sx={styles.tag} />
										))}
									<Divider sx={styles.divider} />
									{details.stems.length > 0 && (
										<Box sx={styles.mintAndBuy}>
											<Button
												size="large"
												onClick={connected ? handleMintAndBuy : handleConnectWallet}
												variant="contained"
												color="secondary"
												sx={styles.mintAndBuyBtn}
												disabled={minting || details.stems.length < 2}
											>
												{minting ? <CircularProgress size={30} sx={{ my: 1.5 }} /> : 'Mint & Buy'}
											</Button>
											<Box sx={styles.price}>
												<ImageOptimized src={PolygonIcon} width={50} height={50} alt="Polygon" />
												<Typography variant="h4" component="div" sx={{ ml: 1 }}>
													0.01{' '}
													<Typography sx={styles.eth} component="span">
														MATIC
													</Typography>
												</Typography>
											</Box>
										</Box>
									)}
								</Box>
							</Box>
							{/* @ts-ignore */}
							<Box sx={styles.stemsHeader}>
								<Typography variant="h4" component="h3" sx={styles.stemsTitle}>
									Song Stems
								</Typography>
								<Box sx={styles.stemsMeta}>
									<Typography>
										{details.stems.length} Stem{details.stems.length === 1 ? '' : 's'} from{' '}
										{details.collaborators.length} Collaborator{details.collaborators.length === 1 ? '' : 's'}
									</Typography>
									<AvatarGroup sx={styles.avatarGroup} total={details.collaborators.length}>
										{details.collaborators.map(c => (
											<Link key={c} href={`/users/${c}`} passHref>
												<Avatar>
													<Person />
												</Avatar>
											</Link>
										))}
									</AvatarGroup>
								</Box>
								<Box>
									{/* @ts-ignore */}
									<Button sx={styles.exportStemsBtn} onClick={handleDownloadAll} endIcon={<Download />}>
										Export Stems
									</Button>
								</Box>
							</Box>
							{details.stems.length > 0 ? (
								<>
									<Box sx={styles.playSection}>
										<IconButton sx={styles.playStopBtn} onClick={handlePlayPauseStems} disableRipple disableFocusRipple>
											{isPlayingAll ? (
												<PauseRounded sx={{ width: '2rem', height: '2rem' }} />
											) : (
												<PlayArrowRounded sx={{ width: '2rem', height: '2rem' }} />
											)}
										</IconButton>
										<IconButton sx={styles.playStopBtn} onClick={handleStop} disableRipple disableFocusRipple>
											<Square />
										</IconButton>
										<IconButton sx={styles.playStopBtn} onClick={handleSkipPrev} disableRipple disableFocusRipple>
											<SkipPrevious />
										</IconButton>
										<Box sx={styles.playTracker}>Timeline of full song will go here</Box>
									</Box>
									{details.stems.map((stem, idx) => (
										<Fragment key={idx}>
											<StemPlayer
												idx={idx + 1}
												details={stem}
												onWavesInit={onWavesInit}
												onFinish={() => setIsPlayingAll(false)}
												onSolo={handleSoloStem}
												onNewFile={onNewFile}
											/>
										</Fragment>
									))}
								</>
							) : (
								<Typography sx={styles.noStemsMsg}>No stems to show, upload one!</Typography>
							)}
						</>
					) : (
						<Typography sx={styles.error} color="error">
							Sorry, no details were found for this project.
						</Typography>
					)}
					{!limitReached && (
						<>
							<Button
								variant="outlined"
								size="large"
								onClick={handleUploadStemOpen}
								/* @ts-ignore */
								sx={styles.addStemBtn}
								startIcon={<AddCircleOutline sx={{ fontSize: '32px' }} />}
							>
								Add Stem
							</Button>
							<StemUploadDialog
								open={uploadStemOpen}
								onClose={handleUploadStemClose}
								onSuccess={onStemUploadSuccess}
								/* @ts-ignore */
								projectDetails={details}
							/>
						</>
					)}
				</Container>
			</main>

			<AppFooter />
			{mintingOpen && (
				<Notification open={mintingOpen} msg={mintingMsg} type="info" onClose={onNotificationClose} duration={10000} />
			)}
			{successOpen && <Notification open={successOpen} msg={successMsg} type="success" onClose={onNotificationClose} />}
			{errorOpen && <Notification open={errorOpen} msg={errorMsg} type="error" onClose={onNotificationClose} />}
		</>
	)
}

ProjectPage.propTypes = propTypes

export const getServerSideProps: GetServerSideProps = async context => {
	// Get project details from ID
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
