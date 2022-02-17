import { Close } from '@mui/icons-material'
import { Alert, IconButton, Snackbar, SnackbarCloseReason } from '@mui/material'
import { useState } from 'react'

type NotificationProps = {
	msg: string,
	open: boolean,
	type: string,
	onClose: () => void,
}

const Notification = (props: NotificationProps): JSX.Element => {
	const { msg, open, type, onClose } = props
	const [isOpen, setIsOpen] = useState(open)

	const handleClose = (event, reason) => {
		if (reason === 'clickaway') return
		setIsOpen(false)
		onClose()
	}

	const action = (
		<IconButton size="small" aria-label="close" color="inherit" onClick={handleClose}>
			<Close fontSize="small" />
		</IconButton>
	)

	return (
		<Snackbar
			open={isOpen}
			autoHideDuration={5000}
			onClose={handleClose}
			action={action}
			anchorOrigin={{ vertical: 'top', horizontal: 'center' }}
		>
			<Alert onClose={handleClose} severity={type}>
				{msg}
			</Alert>
		</Snackbar>
	)
}

export default Notification
