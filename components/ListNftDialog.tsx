import {
	Button,
	CircularProgress,
	Dialog,
	DialogActions,
	DialogContent,
	DialogTitle,
	FormControl,
	InputAdornment,
	InputLabel,
	OutlinedInput,
	Typography,
} from '@mui/material'
import { formatBytes32String } from 'ethers/lib/utils'
import PropTypes from 'prop-types'
import { useState } from 'react'
import web3 from 'web3'

import { NETWORK_CURRENCY } from '../constants/networks'
import { update } from '../utils/http'
import Notification from './Notification'
import { useWeb3 } from './Web3Provider'

const propTypes = {
	onClose: PropTypes.func,
	open: PropTypes.bool,
	unlist: PropTypes.bool,
	nft: PropTypes.shape({
		_id: PropTypes.string.isRequired,
		listPrice: PropTypes.number,
		token: PropTypes.shape({
			id: PropTypes.number.isRequired,
		}).isRequired,
	}).isRequired,
	onListSuccess: PropTypes.func.isRequired,
}

type ListNftDialogProps = PropTypes.InferProps<typeof propTypes>

const ListNftDialog = (props: ListNftDialogProps): JSX.Element => {
	const { onClose, open, unlist, nft, onListSuccess } = props
	const [isOpen, setIsOpen] = useState<boolean>(open ?? false)
	const [isOpenUnlist, setIsOpenUnlist] = useState<boolean>(open ?? false)
	const [listPrice, setListPrice] = useState<number>(1)
	const [loading, setLoading] = useState<boolean>(false)
	const [successOpen, setSuccessOpen] = useState<boolean>(false)
	const [successMsg, setSuccessMsg] = useState<string>('')
	const [errorOpen, setErrorOpen] = useState<boolean>(false)
	const [errorMsg, setErrorMsg] = useState<string>('')
	const { contracts, currentUser } = useWeb3()
	const nftIdBytes32 = formatBytes32String(nft._id)

	const handleClose = () => {
		if (onClose) onClose()
		setIsOpen(false)
		setIsOpenUnlist(false)
		setListPrice(1)
		setLoading(false)
	}

	const handleList = async () => {
		setLoading(true)
		try {
			if (currentUser) {
				await createAuction(60, 60, '0xf39Fd6e51aad88F6F4ce6aB8827279cffFb92266')
				// Allow it to be bought on chain
				const amount = web3.utils.toWei(listPrice?.toString(), 'ether')
				// console.log(nft.token.id)
				const scRes: any = await contracts.nft.allowBuy(1, amount, {
					from: currentUser.address,
					gasLimit: 2000000,
				})
				window.alert('buy allowed')
				if (!scRes) throw new Error('Failed to list the NFT for sale')

				const auctionAddress = await contracts.blindAuctionFactory.auctionAddress(formatBytes32String(nft._id), {
					gasLimit: 2000000,
				})
				// Make PUT request
				const res = await update(`/nfts/${nft._id}`, {
					isListed: true,
					listPrice,
					auction: { address: auctionAddress },
				})
				if (!res.success) throw new Error(`Failed to list user NFT- ${res.error}`)
				// Close dialog
				handleClose()
				// Notify success
				if (!successOpen) setSuccessOpen(true)
				setSuccessMsg('Success! You have listed this NFT!')
				setLoading(false)
				// Emit callback
				onListSuccess()
				// Reset price
				setListPrice(1)
				window.location.reload()
			}
		} catch (e: any) {
			console.error(e.message)
			// Notify error
			setErrorOpen(true)
			setErrorMsg('Uh oh, failed to list the NFT')
			setLoading(false)
		}
	}

	const handleUnlist = async () => {
		setLoading(true)
		try {
			if (currentUser) {
				// Disallow it to be bought on chain
				const scRes: any = await contracts.nft.disallowBuy(nft.token.id, {
					from: currentUser.address,
					gasLimit: 2000000,
				})
				if (!scRes) throw new Error('Failed to remove the listing for the NFT on-chain')

				// Make PUT request
				const res = await update(`/nfts/${nft._id}`, {
					isListed: false,
					listPrice: 0,
					auction: { address: '' },
				})
				if (!res.success) throw new Error(`Failed to remove the listing for this user NFT - ${res.error}`)
				// Close dialog
				handleClose()
				// Notify success
				if (!successOpen) setSuccessOpen(true)
				setSuccessMsg('Success! You have removed the NFT listing!')
				setLoading(false)
				// Emit callback
				onListSuccess()
				// Reset price
				setListPrice(1)
			}
		} catch (e: any) {
			console.error(e.message)
			// Notify error
			setErrorOpen(true)
			setErrorMsg('Uh oh, failed to remove the NFT listing')
			setLoading(false)
		}
	}

	const onNotificationClose = () => {
		setSuccessOpen(false)
		setSuccessMsg('')
		setErrorOpen(false)
		setErrorMsg('')
	}

	const createAuction = async (bidTime: number, revealTime: number, beneficiary: string) => {
		const blindAuctionCreated = await contracts.blindAuctionFactory.createBlindAuctionProxy(
			bidTime,
			revealTime,
			beneficiary,
			nftIdBytes32,
			{
				gasLimit: 2000000,
			},
		)

		if (!blindAuctionCreated) throw new Error('Failed to create a blind auction')
		window.alert('Blind auction created')
	}

	// dev
	const MINT = async () => {
		const amount = web3.utils.toWei('0.01', 'ether')
		const nftsRes = { url: '' }
		const details = {
			collaborators: [],
		}
		const mintRes: any = await contracts.nft.mintAndBuy(currentUser?.address, nftsRes?.url, details?.collaborators, {
			value: amount,
			from: currentUser?.address,
			gasLimit: 2000000,
		})
		const receipt = await mintRes.wait()
	}

	return (
		<>
			{unlist ? (
				<Button variant="contained" color="secondary" onClick={() => setIsOpenUnlist(true)}>
					Unlist It
				</Button>
			) : (
				<Button variant="contained" color="secondary" onClick={() => setIsOpen(true)}>
					List It
				</Button>
			)}
			{/* List */}
			<Dialog onClose={handleClose} open={isOpen}>
				<DialogTitle>List This NFT</DialogTitle>
				<DialogContent>
					{/* <DialogContentText> */}

					{/* <form onSubmit={createAuction} className="w-full max-w-lg">
						<div>
							<div>
								<label htmlFor="grid-bid-time">Bid Time (in seconds)</label>
								<input id="grid-bid-time" name="bid-time" type="text" placeholder="60" value="60" />
								<p>This must be a number.</p>
							</div>
							<div>
								<label htmlFor="grid-reveal-time">Reveal Time (in seconds)</label>
								<input id="grid-reveal-time" type="text" placeholder="60" name="reveal-time" value="60" />
							</div>
						</div> */}
					{/* <div>
							<div>
								<label htmlFor="grid-beneficiary">Beneficiary Address</label>
								<input id="grid-beneficiary" type="text" placeholder="0x..." name="beneficiary" />
								<p>This is the address of the seller, who will receive the proceeds of the auction.</p>
							</div>
						</div> */}
					{/* <button>Create Auction</button>
						<p>Warning: The connected wallet {currentUser?.address} will become the auctioneer.</p>
					</form> */}

					<Typography gutterBottom>You are about to list this NFT on the open market.</Typography>
					<Typography variant="overline">
						Note: 10% of the proceeds will go to original collaborators as royalties.
					</Typography>
					<FormControl variant="filled" fullWidth margin="normal">
						<InputLabel htmlFor="list-price-input">List Price</InputLabel>
						<OutlinedInput
							id="list-price-input"
							value={listPrice}
							type="number"
							placeholder="0.01"
							/* @ts-ignore */
							step="0.01"
							min="0"
							max="10000"
							onChange={e => setListPrice(parseFloat(e.target.value))}
							endAdornment={<InputAdornment position="end">{NETWORK_CURRENCY}</InputAdornment>}
							fullWidth
						/>
					</FormControl>
					{/* </DialogContentText> */}
				</DialogContent>
				<DialogActions>
					<Button onClick={handleClose} color="primary">
						Cancel
					</Button>
					<Button onClick={handleList} variant="contained" color="primary" disabled={loading}>
						{loading ? <CircularProgress size={18} sx={{ my: 1 }} /> : 'Yes, List It'}
					</Button>
				</DialogActions>
			</Dialog>
			{/* Unlist */}
			<Dialog onClose={handleClose} open={isOpenUnlist}>
				<DialogTitle>Unlist This NFT</DialogTitle>
				<DialogContent>
					<Typography gutterBottom>
						You are about to remove your listing off of the marketplace for this NFT.
					</Typography>
				</DialogContent>
				<DialogActions>
					<Button onClick={handleClose} color="primary" disabled={loading}>
						Cancel
					</Button>
					<Button onClick={handleUnlist} variant="contained" color="primary" disabled={loading}>
						{loading ? <CircularProgress size={18} sx={{ my: 0.5 }} /> : 'Yes, Unlist'}
					</Button>
				</DialogActions>
			</Dialog>
			{successOpen && <Notification open={successOpen} msg={successMsg} type="success" onClose={onNotificationClose} />}
			{errorOpen && <Notification open={errorOpen} msg={errorMsg} type="error" onClose={onNotificationClose} />}
		</>
	)
}

ListNftDialog.defaultProps = {
	unlist: false,
}

export default ListNftDialog
