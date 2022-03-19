import MenuIcon from '@mui/icons-material/Menu'
import { AppBar, Box, Button, Chip, Container, IconButton, Menu, MenuItem, Toolbar, Typography } from '@mui/material'
import Link from 'next/link'
import { useState } from 'react'
import ConnectedAccount from './ConnectedAccount'

const styles = {
	appbar: {
		marginBottom: 4,
		backgroundColor: '#fff',
		color: '#111',
		boxShadow: 0,
	},
	alphaChip: {
		backgroundColor: '#FF5200',
		ml: 1,
		fontSize: '.6rem',
		height: '1.25rem',
		textShadow: 'none',
	},
	logoDesktop: {
		mr: 2,
		display: { xs: 'none', md: 'flex' },
		cursor: 'pointer',
		textTransform: 'uppercase',
		fontSize: '2rem',
	},
	logoMobile: {
		display: { xs: 'flex', alignItems: 'center', md: 'none' },
		ml: 1,
		cursor: 'pointer',
		textTransform: 'uppercase',
		fontSize: '2rem',
	},
}

const pages = [
	{ href: '/projects/new', title: 'Create' },
	{ href: '/projects', title: 'Projects' },
	{ href: '/samples', title: 'Stems' },
	{ href: '/nfts', title: 'Marketplace' },
]

const AppHeader = (): JSX.Element => {
	const [anchorElNav, setAnchorElNav] = useState(null)

	const handleOpenNavMenu = (e: { target: any }) => {
		setAnchorElNav(e.target)
	}

	const handleCloseNavMenu = () => {
		setAnchorElNav(null)
	}

	return (
		<AppBar position="static" sx={styles.appbar} enableColorOnDark>
			<Container maxWidth="xl">
				<Toolbar disableGutters>
					<Link href="/" passHref>
						{/* @ts-ignore */}
						<Typography variant="h6" noWrap component="div" sx={styles.logoDesktop}>
							PolyEcho
							<Chip label="Alpha" size="small" color="secondary" sx={styles.alphaChip} />
						</Typography>
					</Link>

					<Box sx={{ flexGrow: 1, display: { xs: 'flex', md: 'none' } }}>
						<IconButton
							size="large"
							aria-label="account of current user"
							aria-controls="menu-appbar"
							aria-haspopup="true"
							onClick={handleOpenNavMenu}
							color="inherit"
						>
							<MenuIcon />
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
								<Link key={page.href} href={page.href} passHref>
									<MenuItem onClick={handleCloseNavMenu} color="primary">
										<Typography textAlign="center">{page.title}</Typography>
									</MenuItem>
								</Link>
							))}
						</Menu>
						<Link href="/" passHref>
							{/* @ts-ignore */}
							<Typography variant="h6" noWrap component="div" sx={styles.logoMobile}>
								PolyEcho
								<Chip label="Alpha" size="small" color="secondary" sx={styles.alphaChip} />
							</Typography>
						</Link>
					</Box>

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
						<ConnectedAccount />
					</Box>
				</Toolbar>
			</Container>
		</AppBar>
	)
}

export default AppHeader
