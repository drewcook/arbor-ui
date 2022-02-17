import type { AlertColor } from '@mui/material'
import type { SyntheticEvent } from 'react'
import { Alert, IconButton, Snackbar, SnackbarCloseReason } from '@mui/material'
import { Close } from '@mui/icons-material'
import { useState } from 'react'

type NotificationProps = {
	msg: string,
	open: boolean,
	type: AlertColor | undefined,
	onClose: () => void,
}

const Notification = (props: NotificationProps): JSX.Element => {
	const { msg, open, type, onClose } = props
	const [isOpen, setIsOpen] = useState(open)

	const handleAlertClose: (event: SyntheticEvent<Element, Event>) => void = event => {
		setIsOpen(false)
		onClose()
	}

	const handleSnackbarClose:
		| ((event: Event | SyntheticEvent<any, Event>, reason: SnackbarCloseReason) => void)
		| undefined = (event, reason) => {
		if (reason === 'clickaway') return
		setIsOpen(false)
		onClose()
	}

	const action = (
		<IconButton size="small" aria-label="close" color="inherit">
			<Close fontSize="small" />
		</IconButton>
	)

	return (
		<Snackbar
			open={isOpen}
			autoHideDuration={5000}
			onClose={handleSnackbarClose}
			action={action}
			anchorOrigin={{ vertical: 'top', horizontal: 'center' }}
		>
			<Alert onClose={handleAlertClose} severity={type}>
				{msg}
			</Alert>
		</Snackbar>
	)
}

export default Notification
