// import AuctionDetails from '../../components/auction-details';
import { blindAuctionProxyContract } from '@constants/contracts'
import { NETWORK_CURRENCY } from '@constants/networks'
import { INftDoc } from '@models/nft.model'
import { Button, Grid, Typography } from '@mui/material'
import { buildPoseidonOpt as buildPoseidon } from 'circomlibjs'
import { BigNumber, Contract, ethers, Signer } from 'ethers'
import { MutableRefObject, useEffect, useRef, useState } from 'react'

import { detailsStyles as styles } from '../styles/NFTs.styles'
import { useWeb3 } from './Web3Provider'

const snarkjs = require('snarkjs')

const Data = {
	beneficiary: '',
	auctioneer: '',
	winnerAddress: ethers.constants.AddressZero,
	winningBid: 0,
	inputs: { blindedBids: [], bids: [[]] },
}

type AuctionDetailsProps = {
	auctionContract: string
	beneficiary: string
	auctioneer: string
	bidEnd: string
	revealEnd: string
	paymentEnd: string
	winner: string
	winningBid: number
	amountRef: MutableRefObject<{ value: string }>
	bidLoading: boolean
	handleBid: () => void
	bidData: string
	blindedBids: typeof Data.inputs.blindedBids
	getBids: () => void
	bidsLoading: boolean
	inputsRef: MutableRefObject<{ value: string }>
	witnessPlaceholder: string
	highestLoading: boolean
	handleWitness: () => void
	secret: string
}

function AuctionDetails({
	auctionContract,
	beneficiary,
	auctioneer,
	bidEnd,
	revealEnd,
	paymentEnd,
	winner,
	winningBid,
	amountRef,
	bidLoading,
	handleBid,
	bidData,
	blindedBids,
	getBids,
	bidsLoading,
	inputsRef,
	witnessPlaceholder,
	highestLoading,
	handleWitness,
	secret,
}: AuctionDetailsProps) {
	const copyRef = useRef(null)
	return (
		<>
			<Grid container spacing={4}>
				<Grid item xs={12} md={5}>
					<Typography sx={styles.metadata}>
						<Typography component="span" sx={styles.metadataKey}>
							Auction Address:
						</Typography>
						{auctionContract}
					</Typography>
					<Typography sx={styles.metadata}>
						<Typography component="span" sx={styles.metadataKey}>
							Start Date:
						</Typography>
					</Typography>
					<Typography sx={styles.metadata}>
						<Typography component="span" sx={styles.metadataKey}>
							End Date:
						</Typography>
					</Typography>
					<Typography sx={styles.metadata}>
						<Typography component="span" sx={styles.metadataKey}>
							Reveal Date:
						</Typography>
					</Typography>
					<Typography sx={styles.metadata}>
						<Typography component="span" sx={styles.metadataKey}>
							Floor price:
						</Typography>
						1 {NETWORK_CURRENCY}
					</Typography>

					{!winner && (
						<>
							<Typography sx={styles.metadata}>
								<Typography component="span" sx={styles.metadataKey}>
									Blinded Bids:
								</Typography>

								{blindedBids && (
									<div>
										<div>
											<div ref={copyRef}>{JSON.stringify(blindedBids)}</div>
										</div>
									</div>
								)}
								<button disabled={bidsLoading} onClick={() => getBids()}>
									Get Bids
								</button>
							</Typography>

							<Typography sx={styles.metadata}>
								<Typography component="span" sx={styles.metadataKey}>
									Winner Processing:
								</Typography>
								<textarea
									style={{ height: '120px', width: '1120px' }}
									ref={inputsRef as any}
									id="witness"
									name="witness"
									placeholder={witnessPlaceholder}
								></textarea>
								<button disabled={highestLoading} onClick={handleWitness}>
									Get Winner
								</button>
							</Typography>
						</>
					)}
					{!winner && (
						<>
							<Typography sx={styles.metadata}>
								<Typography component="span" sx={styles.metadataKey}>
									Bid Amount:
								</Typography>
								<input ref={amountRef as any} id="grid-amount" type="text" placeholder="1" name="amount" />
								{/* <p>
											{bidData
												? `🎉 Bid Transaction Hash: ${bidData?.hash}`
												: 'Whole numbers only, or it will be rounded down for you.'}
										</p> */}
								<button disabled={bidLoading} onClick={handleBid}>
									Bid
								</button>
							</Typography>
						</>
					)}

					{!winner && bidData && (
						<Typography sx={styles.metadata}>
							<Typography component="span" sx={styles.metadataKey}>
								Secret:
							</Typography>
							{secret}
							<p>Save this or you will lose it upon leaving or refreshing the page and forfeit your deposit!</p>
						</Typography>
					)}
				</Grid>
			</Grid>

			{winner && winningBid !== 0 && (
				<>
					<div>
						<h6>Winner</h6>
						<dd>{winner}</dd>
					</div>
					<div>
						<h6>Winning Bid</h6>
						<dd>{Number(winningBid)}</dd>
					</div>
				</>
			)}
		</>
	)
}

/**
 * Generates a random big number.
 * @param numberOfBytes The number of bytes of the number.
 * @returns The generated random number.
 */
export function genRandomNumber(numberOfBytes = 31) {
	return ethers.BigNumber.from(ethers.utils.randomBytes(numberOfBytes)).toBigInt()
}

const witnessInputs = {
	blindedBids: [
		'0x1bef7cdd7e3bf88ddfef2257b97f2131adae3a5776b47d13586858185ef5f3df',
		'0x1c62d7c545b609d53fe210a00f785edeef7442c33ea2aafc6437a096dc22821c',
		'0x0b5898ceee69fc2e0e924f307b92c1fcc16420c32f47c5cb72dd2cc52e3cec0f',
		'0x2f1345472d2120ee140c42a8a73eaa1fbf56ac19e3ff14156af7f19e6accfb2f',
	],
	bids: [
		['3', '4390288406633841039374905140997088596816213696357408910893002029934783691'],
		['6', '425744023157111131062054548477432108186780490046799368572579595744705568174'],
		['2', '435168916971332117746148190886796251054477518570929335324154158232639029895'],
		['5', '305426238497509460922354612122454773243230993719084718458819055507992229935'],
	],
}

const witnessPlaceholder = JSON.stringify(witnessInputs)

type AuctionProps = {
	details: INftDoc | any
	transferNft: (winningBid, winner) => void
}

export default function Auction({ details, transferNft }: AuctionProps) {
	const [secret, setSecret] = useState('')
	const [secrets, setSecrets] = useState({})
	const [winner, setWinner] = useState<string>('')
	const [data, setData] = useState(Data)
	const amountRef = useRef({ value: '' })
	const inputsRef = useRef({ value: '' })
	const [blindAuctionProxy, setBlindAuctionProxy] = useState<Contract>()
	const {
		beneficiary,
		auctioneer,
		winnerAddress,
		winningBid,
		inputs: { blindedBids },
	} = data

	const { currentUser } = useWeb3()

	const auction = details.auction.address
	const bidData = 'none'
	const bidsLoading = false
	const bidLoading = false
	const highestLoading = false

	useEffect(() => {
		if (currentUser?.signer) {
			setBlindAuctionProxy(blindAuctionProxyContract(auction).connect(currentUser?.signer as Signer))
			console.log('signer connected')
			getAuctionDetails()
		}
	}, [currentUser])

	useEffect(() => {
		if (
			winnerAddress !== ethers.constants.AddressZero &&
			winnerAddress.startsWith('0x') &&
			winnerAddress.length == 42
		) {
			setWinner(winnerAddress)
		}
	}, [data])

	async function getBids() {
		try {
			const res = await blindAuctionProxy?.getBidsDev()
			const blindedBids = res[0]
			const bids = res[1].map((amounts: string, idx: number) => [amounts, res[2][idx]])
			const inputs = {
				blindedBids,
				bids,
			}
			console.log(JSON.stringify(inputs))
			console.log({ data })
			setData({ ...data, inputs })
		} catch (error) {
			window.alert('todo: error handling')
		}
	}

	async function getData() {
		const res = await blindAuctionProxy?.getData()
		const [beneficiary, auctioneer, winnerAddress, winningBid] = Object.values(res).map((d: string | BigNumber | any) =>
			d._isBigNumber ? Number(d) / 10 ** 18 : d,
		)
		// console.log({winnerAddress})
		// console.log({winningBid})
		setData({ ...data, beneficiary, auctioneer, winnerAddress, winningBid })
	}

	async function getAuctionDetails() {
		await getData()
	}

	const handleBid = async () => {
		if (auction) {
			const amount = parseInt(amountRef.current.value)
			if (Number.isInteger(amount)) {
				const bidAmount = ethers.utils.parseEther(amount.toString())
				if (bidAmount.gt(0)) {
					const poseidon = await buildPoseidon()
					const blindingNumber = genRandomNumber()
					setSecret(blindingNumber.toString())
					setSecrets({ ...secrets, [amount]: blindingNumber.toString() })
					const blindedBid = ethers.BigNumber.from(poseidon.F.toString(poseidon([amount, blindingNumber])))
					const deposit = ethers.utils.parseEther('1')
					await blindAuctionProxy?.bidDev(blindedBid.toHexString(), amount.toString(), blindingNumber.toString(), {
						value: deposit,
						gasLimit: 5000000,
					})
				}
			}
		}
	}

	const handleWitness = async () => {
		try {
			window.alert('generating proof')
			const inputs = JSON.parse(inputsRef?.current?.value)
			const { proof, publicSignals } = await snarkjs.groth16.fullProve(
				{ blindedBids: inputs.blindedBids, bids: inputs.bids },
				'/zkproof/highestbidder.wasm',
				'/zkproof/highestbidder_final.zkey',
			)

			const vKey = await (await fetch('/zkproof/verification_key.json')).json()

			const res = await snarkjs.groth16.verify(vKey, publicSignals, proof)
			console.log({ res })
			if (res == true) {
				window.alert('Verification OK')
				const { proofList, a, b, c } = getSolidityProofArray(proof)

				const call = await blindAuctionProxy?.getHighestBidderDev(a, b, c, publicSignals, { gasLimit: 2000000 })

				const tx = await call.wait()
				console.log(tx)
				window.location.reload()
			}
		} catch (e: any) {
			const err = e.error.data.message
			console.log(err)
		}
	}

	const getSolidityProofArray = proof => {
		const proofList = [
			proof['pi_a'][0],
			proof['pi_a'][1],
			proof['pi_b'][0][1],
			proof['pi_b'][0][0],
			proof['pi_b'][1][1],
			proof['pi_b'][1][0],
			proof['pi_c'][0],
			proof['pi_c'][1],
		]

		const a = [proofList[0], proofList[1]]
		const b = [
			[proofList[2], proofList[3]],
			[proofList[4], proofList[5]],
		]
		const c = [proofList[6], proofList[7]]
		return { proofList, a, b, c }
	}

	return (
		<>
			{winner && winningBid > 0 && (
				<Button
					size="large"
					variant="contained"
					color="secondary"
					sx={styles.buyNowBtn}
					onClick={() => transferNft(winningBid, winner)}
				>
					{' '}
					send nft{' '}
				</Button>
			)}
			{currentUser && (
				<>
					<h1 className="text-5xl bg-clip-text text-transparent bg-gradient-to-r from-pink-500 to-violet-500 mb-8">
						Auction Details
					</h1>

					<AuctionDetails
						auctionContract={auction}
						beneficiary={beneficiary}
						auctioneer={auctioneer}
						bidEnd={''}
						revealEnd={''}
						paymentEnd={''}
						getBids={getBids}
						amountRef={amountRef}
						handleBid={handleBid}
						bidLoading={bidLoading}
						bidsLoading={bidsLoading}
						bidData={bidData}
						blindedBids={blindedBids}
						secret={secret}
						witnessPlaceholder={witnessPlaceholder}
						inputsRef={inputsRef}
						handleWitness={handleWitness}
						highestLoading={highestLoading}
						winner={winner}
						winningBid={winningBid}
					></AuctionDetails>
				</>
			)}
		</>
	)
}
