import { Avatar, Box, Button, IconButton, Menu, MenuItem, Typography } from '@mui/material'
import Link from 'next/link'
import { useState } from 'react'
import formatAddress from '../utils/formatAddress'
import { useWeb3 } from './Web3Provider'

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
	const [anchorEl, setAnchorEl] = useState(null)
	const { currentUser, connected, handleConnectWallet, handleDisconnectWallet } = useWeb3()

	const handleOpenMenu = (e: { target: any }) => setAnchorEl(e.target)
	const handleCloseMenu = () => setAnchorEl(null)

	const handleLogout = async () => {
		await handleDisconnectWallet()
		setAnchorEl(null)
	}

	return (
		<>
			<Box sx={styles.wrapper}>
				{!connected || !currentUser ? (
					<Button size="small" variant="contained" color="secondary" onClick={handleConnectWallet} sx={styles.button}>
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
								alt="User Avatar"
								src={
									currentUser.avatarUrl ??
									'https://www.gravatar.com/avatar/94d093eda664addd6e450d7e9881bcad?s=32&d=identicon&r=PG'
								}
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
							{/* <MenuItem onClick={handleMenuItemClick}>My Samples</MenuItem> */}
							{currentUser && (
								<MenuItem>
									<Link href={`/users/${currentUser._id}`}>Profile</Link>
								</MenuItem>
							)}
							<MenuItem onClick={handleLogout}>Logout</MenuItem>
						</Menu>
						{currentUser && (
							<Typography sx={styles.address} variant="body2">
								{formatAddress(currentUser._id)}
							</Typography>
						)}
					</>
				)}
			</Box>
		</>
	)
}

export default ConnectedAccount
