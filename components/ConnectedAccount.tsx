import { Avatar, Button, Box, IconButton, Menu, MenuItem, Tooltip, Typography } from '@mui/material'
import { useEffect, useState } from 'react'
import { useWeb3 } from './Web3Provider'

const styles = {
	wrapper: {
		display: 'flex',
		justifyContent: 'right',
		alignItems: 'center',
	},
	avatar: {
		marginRight: 0.5,
	},
	address: {
		color: '#fff',
	},
}

const ConnectedAccount = (): JSX.Element => {
	const [currentAccount, setCurrentAccount] = useState('')
	const [authenticated, setAuthenticated] = useState(false)
	const [anchorEl, setAnchorEl] = useState(null)
	const { accounts, onboard } = useWeb3()

	useEffect(() => {
		const { address } = onboard.getState()
		if (address) setAuthenticated(true)

		window.addEventListener('walletChange', data => console.log('wallet changed', { data }))
	}, [])

	useEffect(() => {
		setCurrentAccount(accounts[0])
	}, [accounts])

	const handleOpenMenu = e => {
		if (authenticated) setAnchorEl(e.target)
	}

	const handleCloseMenu = () => {
		setAnchorEl(null)
	}

	const handleMenuItemClick = () => {
		// TODO: Link to page
		// Close for now
		setAnchorEl(null)
	}

	const handleConnectWallet = async () => {
		const connected = await onboard.walletSelect()
		if (connected) {
			const { address } = onboard.getState()
			setCurrentAccount(address)
			setAuthenticated(true)
		}
	}

	const handleLogout = async () => {
		await onboard.walletReset()
		const { address } = onboard.getState()
		if (!address) {
			setCurrentAccount(address)
			setAuthenticated(false)
			setAnchorEl(null)
		}
	}

	return (
		<>
			<Box sx={styles.wrapper}>
				{!authenticated ? (
					<Button size="small" variant="contained" color="secondary" onClick={handleConnectWallet}>
						Connect Wallet
					</Button>
				) : (
					<>
						<IconButton
							sx={styles.avatar}
							aria-label="Current user menu"
							aria-controls="user-menu"
							aria-haspopup="true"
							onClick={handleOpenMenu}
							color="inherit"
						>
							<Avatar
								alt="Avatar"
								src="https://www.gravatar.com/avatar/94d093eda664addd6e450d7e9881bcad?s=32&d=identicon&r=PG"
							/>
						</IconButton>
						<Menu
							id="user-menu"
							anchorEl={anchorEl}
							anchorOrigin={{
								vertical: 'top',
								horizontal: 'right',
							}}
							keepMounted
							transformOrigin={{
								vertical: 'top',
								horizontal: 'right',
							}}
							open={Boolean(anchorEl)}
							onClose={handleCloseMenu}
						>
							<MenuItem onClick={handleMenuItemClick}>My Samples</MenuItem>
							<MenuItem onClick={handleMenuItemClick}>Settings</MenuItem>
							{/* <MenuItem onClick={() => onboard.accountSelect()}>Connect Hardware Wallet</MenuItem> */}
							<MenuItem onClick={handleLogout}>Logout</MenuItem>
						</Menu>
						{currentAccount && (
							<Typography sx={styles.address} variant="body2">
								{currentAccount?.substring(0, 2) +
									'.................' +
									currentAccount?.substring(currentAccount.length - 4)}
							</Typography>
						)}
					</>
				)}
			</Box>
		</>
	)
}

export default ConnectedAccount
