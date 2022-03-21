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
	btn: {
		borderColor: '#000',
		borderWidth: '3px',
		fontWeight: 600,
		fontStyle: 'italic',
		'&:hover': {
			borderWidth: '3px',
		},
	},
	avatar: {
		mr: 1,
		p: 0,
		border: '2px solid #000',
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
					<Button size="small" variant="outlined" color="primary" onClick={handleConnectWallet} sx={styles.btn}>
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
							<Link href={`/users/${currentUser.address}`} passHref>
								<MenuItem onClick={handleCloseMenu}>Profile</MenuItem>
							</Link>
							<MenuItem onClick={handleLogout}>Logout</MenuItem>
						</Menu>
						<Typography variant="body2">{formatAddress(currentUser.address)}</Typography>
					</>
				)}
			</Box>
		</>
	)
}

export default ConnectedAccount
