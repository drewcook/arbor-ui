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
import PropTypes from 'prop-types'
import { useState } from 'react'
import { update } from '../utils/http'
import Notification from './Notification'

const propTypes = {
	onClose: PropTypes.func,
	open: PropTypes.bool,
	unlist: PropTypes.bool,
	nft: PropTypes.shape({
		_id: PropTypes.string.isRequired,
	}).isRequired,
	onListSuccess: PropTypes.func.isRequired,
}

type ListNftDialogProps = PropTypes.InferProps<typeof propTypes>

const ListNftDialog = (props: ListNftDialogProps): JSX.Element => {
	const { onClose, open, unlist, nft, onListSuccess } = props
	const [isOpen, setIsOpen] = useState<boolean>(open ?? false)
	const [isOpenUnlist, setIsOpenUnlist] = useState<boolean>(open ?? false)
	// 0.1 ETH
	const [listPrice, setListPrice] = useState<number>(0.5)
	const [loading, setLoading] = useState<boolean>(false)
	const [successOpen, setSuccessOpen] = useState<boolean>(false)
	const [successMsg, setSuccessMsg] = useState<string>('')
	const [errorOpen, setErrorOpen] = useState<boolean>(false)
	const [errorMsg, setErrorMsg] = useState<string>('')

	const handleClose = () => {
		if (onClose) onClose()
		setIsOpen(false)
		setIsOpenUnlist(false)
		setListPrice(0.5)
	}

	const handleList = async () => {
		setLoading(true)
		try {
			// Make PUT request
			const res = await update(`/nfts/${nft._id}`, {
				isListed: true,
				listPrice,
			})
			if (!res.success) throw new Error('Failed to list user NFT', res.error)
			// Close dialog
			handleClose()
			// Notify success
			if (!successOpen) setSuccessOpen(true)
			setSuccessMsg('Success! You have listed this NFT!')
			setLoading(false)
			// Emit callback
			onListSuccess()
			setListPrice(0.5)
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
			// Make PUT request
			const res = await update(`/nfts/${nft._id}`, {
				isListed: false,
				listPrice: 0,
			})
			if (!res.success) throw new Error('Failed to remove the listing for this user NFT', res.error)
			// Close dialog
			handleClose()
			// Notify success
			if (!successOpen) setSuccessOpen(true)
			setSuccessMsg('Success! You have removed the NFT listing!')
			setLoading(false)
			// Emit callback
			onListSuccess()
			setListPrice(0.5)
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
							placeholder="0.1"
							onChange={e => setListPrice(e.target.value)}
							endAdornment={<InputAdornment position="end">ETH</InputAdornment>}
							fullWidth
						/>
					</FormControl>
					{/* </DialogContentText> */}
				</DialogContent>
				<DialogActions>
					<Button onClick={handleClose} color="info">
						Cancel
					</Button>
					<Button onClick={handleList} variant="contained" color="info" disabled={loading}>
						{loading ? <CircularProgress size={18} sx={{ my: 0.5 }} /> : 'Yes, List It'}
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
					<Button onClick={handleClose} color="info">
						Cancel
					</Button>
					<Button onClick={handleUnlist} variant="contained" color="info" disabled={loading}>
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
