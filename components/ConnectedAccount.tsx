import { Avatar, Button, Box, IconButton, Menu, MenuItem, Tooltip, Typography } from '@mui/material'
import { useEffect, useState } from 'react'
import { useWeb3 } from './Web3Provider'
import formatAddress from '../utils/formatAddress'

const styles = {
	wrapper: {
		display: 'flex',
		justifyContent: 'flex-end',
		alignItems: 'center',
	},
	button: {
		color: '#fff',
		boxShadow: '3px 3px #23F09A',
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
	const [anchorEl, setAnchorEl] = useState(null)
	const { accounts, connected, handleConnectWallet, handleDisconnectWallet } = useWeb3()

	useEffect(() => {
		setCurrentAccount(accounts[0])
	}, [accounts])

	const handleOpenMenu = (e: { target: any }) => setAnchorEl(e.target)
	const handleCloseMenu = () => setAnchorEl(null)

	const handleLogout = async () => {
		await handleDisconnectWallet()
		setAnchorEl(null)
	}

	return (
		<>
			<Box sx={styles.wrapper}>
				{!connected ? (
					<Button
						size="small"
						variant="contained"
						color="secondary"
						onClick={handleConnectWallet}
						sx={styles.button}
					>
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
							{/* <MenuItem onClick={handleMenuItemClick}>My Samples</MenuItem>
							<MenuItem onClick={handleMenuItemClick}>Settings</MenuItem> */}
							<MenuItem onClick={handleLogout}>Logout</MenuItem>
						</Menu>
						{currentAccount && (
							<Typography sx={styles.address} variant="body2">
								{formatAddress(currentAccount)}
							</Typography>
						)}
					</>
				)}
			</Box>
		</>
	)
}

export default ConnectedAccount
