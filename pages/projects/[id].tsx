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
import ImageOptimized from '../../components/ImageOptimized'
import Notification from '../../components/Notification'
import StemUploadDialog from '../../components/StemUploadDialog'
import { useWeb3 } from '../../components/Web3Provider'
import logoBinary from '../../lib/logoBinary'
import type { INft } from '../../models/nft.model'
import { IProjectDoc } from '../../models/project.model'
import type { IStemDoc } from '../../models/stem.model'
import MaticIcon from '../../public/matic_icon.png'
import formatAddress from '../../utils/formatAddress'
import { get, post, remove } from '../../utils/http'
import { detailsStyles as styles } from '../../styles/Projects.styles'

const StemPlayer = dynamic(() => import('../../components/StemPlayer'), { ssr: false })

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
	const [downloading, setDownloading] = useState<boolean>(false)
	const [downloadingMsg, setDownloadingMsg] = useState<string>('')
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

	const handleDownloadAll = async () => {
		try {
			setDownloading(true)
			setDownloadingMsg('Downloading project stems... please wait as we ping IPFS')
			if (details) {
				const stemData = data?.stems.map((stem: IStemDoc) => ({ url: stem.audioUrl, filename: stem.filename })) ?? []
				const res = await post(`/stems/download`, {
					projectId,
					stemData,
				})
				if (!res.success) throw new Error(`Failed to download stem - ${res.error}`)
				// Notify success
				if (!downloading) setDownloading(true)
				setDownloadingMsg('Stems downloaded and compressed, please select a location to save them')
				// Create a temp anchor element to download from this url, then remove it
				let downloadPath: string
				if (process.env.NODE_ENV === 'production') {
					downloadPath = '/' + res.data.split('app/').pop()
				} else {
					downloadPath = '/' + res.data.split('app/').pop()
				}
				// window.open(downloadPath, '_blank')
				const anchor = document.createElement('a')
				anchor.style.display = 'none'
				anchor.href = downloadPath
				// Give it a good name for local downloading
				anchor.download = `PEStems_${details.name}_${Date.now()}.zip`
				document.body.appendChild(anchor)
				console.log(anchor, { anchor })
				anchor.click()
				document.body.removeChild(anchor)
				// Completed saving them
				setDownloading(false)
				setDownloadingMsg('')
				setSuccessOpen(true)
				setSuccessMsg(`Stem(s) downloaded succussfully`)
				// Clean up the tmp directories and remove files after user saves them to disk, 30s later just in case
				setTimeout(() => {
					remove('/stems/download', { projectId })
				}, 30000)
			}
		} catch (e: any) {
			console.error(e.message)
			setErrorOpen(true)
			setErrorMsg('Failed to download all stems')
		}
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

				// Construct files and post to flattening service
				const formData = new FormData()
				for (let i = 0; i < files.length; i++) {
					formData.append(`files`, files[i])
				}
				if (!process.env.PYTHON_HTTP_HOST) throw new Error('Flattening host not set.')
				// NOTE: We hit this directly with fetch because Next.js API routes have a 4MB limit
				// See - https://nextjs.org/docs/messages/api-routes-response-size-limit
				const response = await fetch(process.env.PYTHON_HTTP_HOST + '/merge', {
					method: 'POST',
					body: formData,
				})

				// Catch flatten audio error
				if (!response.ok) throw new Error('Failed to flatten the audio files')
				if (response.body === null) throw new Error('Failed to flatten audio files, response body empty.')

				const flattenedAudioBlob = await response.blob()
				if (!flattenedAudioBlob) throw new Error('Failed to flatten the audio files')

				if (!mintingOpen) setMintingOpen(true)
				setMintingMsg('Uploading to NFT.storage...')

				// Construct NFT.storage data and store
				const nftsRes = await NFTStore.store({
					name: details.name, // TODO: plus a version number?
					description:
						'A Polyecho NFT representing collaborative music from multiple contributors on the decentralized web.',
					image: new Blob([Buffer.from(logoBinary, 'base64')], { type: 'image/*' }),
					properties: {
						createdOn: new Date().toISOString(),
						createdBy: currentUser.address,
						audio: flattenedAudioBlob,
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
					stems: details.stems, // Direct 1:1 deep clone
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
		setErrorOpen(false)
		setErrorMsg('')
		setDownloading(false)
		setDownloadingMsg('')
		setMintingOpen(false)
		setMintingMsg('')
	}

	return (
		<>
			<Head>
				<title>Polyecho | Project Details</title>
			</Head>
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
								title={isPlayingAll ? 'Pause playback' : 'Play all stems simultaneously'}
							>
								{isPlayingAll ? <PauseRounded sx={styles.playAllIcon} /> : <PlayArrowRounded sx={styles.playAllIcon} />}
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
										<ImageOptimized src={MaticIcon} width={50} height={50} alt="Polygon" />
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
								{details.stems.length} Stem{details.stems.length === 1 ? '' : 's'} from {details.collaborators.length}{' '}
								Collaborator{details.collaborators.length === 1 ? '' : 's'}
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
								<IconButton
									sx={styles.playStopBtn}
									onClick={handlePlayPauseStems}
									disableRipple
									disableFocusRipple
									title={isPlayingAll ? 'Pause playback' : 'Play all stems simultaneously'}
								>
									{isPlayingAll ? (
										<PauseRounded sx={{ width: '2rem', height: '2rem' }} />
									) : (
										<PlayArrowRounded sx={{ width: '2rem', height: '2rem' }} />
									)}
								</IconButton>
								<IconButton
									sx={styles.playStopBtn}
									onClick={handleStop}
									disableRipple
									disableFocusRipple
									title="Stop playback"
								>
									<Square />
								</IconButton>
								<IconButton
									sx={styles.playStopBtn}
									onClick={handleSkipPrev}
									disableRipple
									disableFocusRipple
									title="Skip to beginning"
								>
									<SkipPrevious />
								</IconButton>
								<Box sx={styles.playTracker} />
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
					{downloading && (
						<Notification
							open={downloading}
							msg={downloadingMsg}
							type="info"
							onClose={onNotificationClose}
							duration={10000}
						/>
					)}
					{mintingOpen && (
						<Notification
							open={mintingOpen}
							msg={mintingMsg}
							type="info"
							onClose={onNotificationClose}
							duration={10000}
						/>
					)}
					{successOpen && (
						<Notification open={successOpen} msg={successMsg} type="success" onClose={onNotificationClose} />
					)}
					{errorOpen && <Notification open={errorOpen} msg={errorMsg} type="error" onClose={onNotificationClose} />}
				</>
			) : (
				<Typography sx={styles.error} color="error">
					Sorry, no details were found for this project.
				</Typography>
			)}
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
