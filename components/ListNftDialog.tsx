import {
	Button,
	Dialog,
	DialogActions,
	DialogContent,
	DialogContentText,
	DialogTitle,
	FormControl,
	InputAdornment,
	InputLabel,
	OutlinedInput,
	Typography,
} from '@mui/material'
import PropTypes from 'prop-types'
import { useState } from 'react'

const propTypes = {
	onClose: PropTypes.func,
	open: PropTypes.bool,
	unlist: PropTypes.bool,
	nft: PropTypes.shape({
		_id: PropTypes.string.isRequired,
	}).isRequired,
}

type ListNftDialogProps = PropTypes.InferProps<typeof propTypes>

const ListNftDialog = (props: ListNftDialogProps): JSX.Element => {
	const { onClose, open, unlist, nft } = props
	const [isOpen, setIsOpen] = useState<boolean>(open ?? false)
	const [isOpenUnlist, setIsOpenUnlist] = useState<boolean>(open ?? false)
	// 0.1 ETH
	const [listPrice, setListPrice] = useState(10000000000000000)

	const handleClose = () => {
		if (onClose) onClose()
		setIsOpen(false)
		setIsOpenUnlist(false)
	}

	const handleList = () => {
		console.log('listing...', nft._id, listPrice)
		// PUT to nfts/id
		handleClose()
	}

	const handleUnlist = () => {
		console.log('unlisting...', nft._id)
		// PUT to nfts/{id}
		handleClose()
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
					<DialogContentText>
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
					</DialogContentText>
				</DialogContent>
				<DialogActions>
					<Button onClick={handleClose} color="info">
						Cancel
					</Button>
					<Button onClick={handleList} variant="contained" color="info">
						Yes, List It
					</Button>
				</DialogActions>
			</Dialog>
			{/* Unlist */}
			<Dialog onClose={handleClose} open={isOpenUnlist}>
				<DialogTitle>Unlist This NFT</DialogTitle>
				<DialogContent>
					<DialogContentText>
						<Typography gutterBottom>
							You are about to remove your listing off of the marketplace for this NFT.
						</Typography>
					</DialogContentText>
					<DialogActions>
						<Button onClick={handleClose} color="info">
							Cancel
						</Button>
						<Button onClick={handleUnlist} variant="contained" color="info">
							Yes, Unlist
						</Button>
					</DialogActions>
				</DialogContent>
			</Dialog>
		</>
	)
}

ListNftDialog.propTypes = propTypes

ListNftDialog.defaultProps = {
	unlist: false,
}

export default ListNftDialog
