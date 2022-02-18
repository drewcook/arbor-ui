import { Fragment, useState } from 'react'
import Link from 'next/link'
import {
	AppBar,
	Box,
	Toolbar,
	IconButton,
	Typography,
	Menu,
	Container,
	Avatar,
	Button,
	Tooltip,
	MenuItem,
} from '@mui/material'
import MenuIcon from '@mui/icons-material'
import ConnectedAccount from './ConnectedAccount'

const styles = {
	wrapper: {
		marginBottom: 4,
	},
}

const pages = [
	{ href: '/', title: 'Home' },
	{ href: '/projects', title: 'Explore' },
	{ href: '/projects/new', title: 'Collab' },
]

const settings = ['Profile', 'Account', 'Dashboard', 'Logout']

const AppHeader = (): JSX.Element => {
	const [anchorElNav, setAnchorElNav] = useState(null)
	const [anchorElUser, setAnchorElUser] = useState(null)

	// const handleOpenNavMenu = (event: React.MouseEvent<HTMLElement>) => {
	// 	setAnchorElNav(event.currentTarget)
	// }
	// const handleOpenUserMenu = (event: React.MouseEvent<HTMLElement>) => {
	// 	setAnchorElUser(event.currentTarget)
	// }

	const handleCloseNavMenu = () => {
		setAnchorElNav(null)
	}

	const handleCloseUserMenu = () => {
		setAnchorElUser(null)
	}

	return (
		<AppBar position="static" sx={styles.wrapper}>
			<Container maxWidth="xl">
				<Toolbar disableGutters>
					<Typography
						variant="h6"
						noWrap
						component="div"
						sx={{ mr: 2, display: { xs: 'none', md: 'flex' } }}
					>
						PolyEcho
					</Typography>

					<Box sx={{ flexGrow: 1, display: { xs: 'flex', md: 'none' } }}>
						<IconButton
							size="large"
							aria-label="account of current user"
							aria-controls="menu-appbar"
							aria-haspopup="true"
							onClick={() => console.log('open menu')}
							color="inherit"
						>
							menuicon
						</IconButton>
						<Menu
							id="menu-appbar"
							anchorEl={anchorElNav}
							anchorOrigin={{
								vertical: 'bottom',
								horizontal: 'left',
							}}
							keepMounted
							transformOrigin={{
								vertical: 'top',
								horizontal: 'left',
							}}
							open={Boolean(anchorElNav)}
							onClose={handleCloseNavMenu}
							sx={{
								display: { xs: 'block', md: 'none' },
							}}
						>
							{pages.map(page => (
								<Fragment key={page.href}>
									<MenuItem onClick={handleCloseNavMenu}>
										<Typography textAlign="center">{page.title}</Typography>
									</MenuItem>
								</Fragment>
							))}
						</Menu>
					</Box>
					<Typography
						variant="h6"
						noWrap
						component="div"
						sx={{ flexGrow: 1, display: { xs: 'flex', md: 'none' } }}
					>
						LOGO
					</Typography>
					<Box sx={{ flexGrow: 1, display: { xs: 'none', md: 'flex' } }}>
						{pages.map(page => (
							<Link key={page.href} href={page.href} passHref>
								<Button key={page.href} sx={{ my: 2, color: 'white', display: 'block' }}>
									{page.title}
								</Button>
							</Link>
						))}
					</Box>

					<Box sx={{ flexGrow: 0 }}>
						<Tooltip title="Open settings">
							<IconButton onClick={() => console.log('open menu')} sx={{ p: 0 }}>
								<Avatar alt="Remy Sharp" src="/static/images/avatar/2.jpg" />
								<ConnectedAccount />
							</IconButton>
						</Tooltip>
						<Menu
							sx={{ mt: '45px' }}
							id="menu-appbar"
							anchorEl={anchorElUser}
							anchorOrigin={{
								vertical: 'top',
								horizontal: 'right',
							}}
							keepMounted
							transformOrigin={{
								vertical: 'top',
								horizontal: 'right',
							}}
							open={Boolean(anchorElUser)}
							onClose={handleCloseUserMenu}
						>
							{settings.map(setting => (
								<MenuItem key={setting} onClick={handleCloseUserMenu}>
									<Typography textAlign="center">{setting}</Typography>
								</MenuItem>
							))}
						</Menu>
					</Box>
				</Toolbar>
			</Container>
		</AppBar>
	)
}

export default AppHeader
