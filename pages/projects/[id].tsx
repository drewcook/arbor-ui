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
import type { GetServerSideProps, NextPage } from 'next'
// Because our sample player uses Web APIs for audio, we must ignore it for SSR to avoid errors
import dynamic from 'next/dynamic'
import Head from 'next/head'
import Link from 'next/link'
import PropTypes from 'prop-types'
import { Fragment, useEffect, useState } from 'react'
import AppFooter from '../../components/AppFooter'
import AppHeader from '../../components/AppHeader'
import ImageOptimized from '../../components/ImageOptimized'
import Notification from '../../components/Notification'
import SampleDropzone from '../../components/SampleDropzone'
import { useWeb3 } from '../../components/Web3Provider'
import logoBinary from '../../lib/logoBinary'
import { INft } from '../../models/nft.model'
import { IProjectDoc } from '../../models/project.model'
import EthereumIcon from '../../public/ethereum_icon.png'
import formatAddress from '../../utils/formatAddress'
import { get, post } from '../../utils/http'

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
		samples: PropTypes.array.isRequired,
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
	const [files, setFiles] = useState<Array<Blob>>([])

	const [isPlayingAll, setIsPlayingAll] = useState<boolean>(false)
	const [minting, setMinting] = useState<boolean>(false)
	const [successOpen, setSuccessOpen] = useState<boolean>(false)
	const [successMsg, setSuccessMsg] = useState<string>('')
	const [errorOpen, setErrorOpen] = useState<boolean>(false)
	const [errorMsg, setErrorMsg] = useState<string>('')
	const [mintingOpen, setMintingOpen] = useState<boolean>(false)
	const [mintingMsg, setMintingMsg] = useState<string>('')
	const { NFTStore, connected, contract, currentUser, handleConnectWallet } = useWeb3()

	const handlePlayPauseAllSamples = () => {
		// TODO: check if each sample is playing or not to prevent toggling each
		document.querySelectorAll('button.samplePlayPauseBtn').forEach(el => {
			const btn = el as HTMLElement
			btn.click()
		})
		// Toggle state
		setIsPlayingAll(!isPlayingAll)
	}

	// TODO: Fix downloading files
	const handleDownloadAll = () => {
		console.log('download all samples')
	}

	const onUploadSuccess = (projectData: IProjectDoc) => {
		// Refresh UI
		setDetails(projectData)
		setSuccessOpen(true)
		setSuccessMsg('Successfully uploaded file to NFT.storage!')
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

				// Hit Python HTTP server to flatten samples into a singular one
				// TODO: Move uploading to NFT.storage out from the flattening service
				// Have it return a file, or base64 of the audio and add to payload as;
				// audioUrl: new Blob([Buffer.from(file, 'base64')], { type: 'audio/wav' })

				// TODO: Allow support of '{cid}/blob' files to be flattened, or dlink.web links to files
				// console.log(details.samples)
				if (files) {
					console.log('Files:')
					console.log(files)
				}
				const formData = new FormData()
				for (let i = 0; i < files.length; i++) {
					formData.append(`file_${i}`, files[i])
				}
				const response = await fetch('/api/flatten', {
					method: 'POST',
					// headers: {
					// 	'Content-Type': 'application/json',
					// },
					body: formData,
				})
				// // Catch flatten audio error
				if (!response.ok) throw new Error('Failed to flatten the audio files')
				response.json().then(r => console.log(r))
				// const flattenedData = await response.json() // Catch fro .json()
				// if (!flattenedData.success) throw new Error('Failed to flatten the audio files')

				// TODO: create new sample from flattened audio
				// TODO: add new sample created to user's info

				if (!mintingOpen) setMintingOpen(true)
				setMintingMsg('Uploading to NFT.storage...')

				// Construct NFT.storage data and store
				const nftsRes = await NFTStore.store({
					name: details.name, // TODO: plus a version number?
					description:
						'A PolyEcho NFT representing collaborative music from multiple contributors on the decentralized web.',
					image: new Blob([Buffer.from(logoBinary, 'base64')], { type: 'image/*' }),
					properties: {
						createdOn: new Date().toISOString(),
						createdBy: currentUser.address,
						audio: `ipfs//[cid]/blob`, // TODO: use new Blob([Buffer.from(file, 'base64')], { type: 'audio/wav' })
						collaborators: details.collaborators,
						samples: details.samples.map((s: any) => s.metadataUrl),
					},
				})

				// console.groupCollapsed('NFT.storage response')
				// console.info('res', nftsRes)
				// console.info('data', nftsRes.data)
				// console.info('embed', nftsRes.embed())
				// console.groupEnd()

				// Check for data
				if (!nftsRes) throw new Error('Failed to store on NFT.storage')

				// Call smart contract and mint an nft out of the original CID
				if (!mintingOpen) setMintingOpen(true)
				setMintingMsg('Minting the NFT. This could take a moment...')

				const tokenURI: any = await contract.methods
					.mint(currentUser.address, nftsRes.url, details.collaborators)
					// TODO: Should this be non-lowercased?
					.send({ from: currentUser.address, value: '10000000000000000', gas: 650000 }) // 0.01 ETH

				// Add new NFT to database and user details
				if (!mintingOpen) setMintingOpen(true)
				setMintingMsg('Updating user details...')
				const newNftPayload: INft = {
					createdBy: currentUser.address,
					token: tokenURI,
					name: details.name,
					metadataUrl: nftsRes.url,
					audioHref: nftsRes.data.properties.audio,
					projectId,
					collaborators: details.collaborators,
					samples: details.samples, // Direct 1:1 map
				}
				const nftCreated = await post('/nfts', newNftPayload)
				if (!nftCreated.success) throw new Error(nftCreated.error)

				// Notify success
				if (!successOpen) setSuccessOpen(true)
				setSuccessMsg('Success! You now own this music NFT!')
				setMinting(false)
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
				<title>{files.length} PolyEcho | Project Details</title>
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
												<ImageOptimized src={EthereumIcon} width={50} height={50} alt="Ethereum" />
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
											<IconButton sx={styles.downloadAllBtn} onClick={handleDownloadAll} color="primary">
												<Download />
											</IconButton>
										</Box>
									</Grid>
								</Grid>
							</Box>
							{details.samples.length > 0 ? (
								details.samples.map((sample, idx) => (
									<Fragment key={idx}>
										<SamplePlayer idx={idx + 1} details={sample} showEyebrow={true} onNewFile={onNewFile} />
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
