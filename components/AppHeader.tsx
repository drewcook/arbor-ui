import MenuIcon from '@mui/icons-material/Menu'
import { AppBar, Box, Button, Chip, Container, IconButton, Menu, MenuItem, Toolbar, Typography } from '@mui/material'
import Link from 'next/link'
import { useState } from 'react'
import ConnectedAccount from './ConnectedAccount'
import styles from './AppHeader.styles'

const pages = [
	{ href: '/projects/new', title: 'Create' },
	{ href: '/projects', title: 'Projects' },
	{ href: '/stems', title: 'Stems' },
	{ href: '/nfts', title: 'Marketplace' },
	// { href: '/stats', title: 'Stats' },
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
		<AppBar id="app-header" position="static" sx={styles.appbar} enableColorOnDark>
			<Container maxWidth="xl">
				<Toolbar disableGutters>
					<Link href="/" passHref>
						{/* @ts-ignore */}
						<Typography variant="h6" noWrap component="div" sx={styles.logoDesktop}>
							Polyecho
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
									<MenuItem onClick={handleCloseNavMenu}>
										<Typography textAlign="center">{page.title}</Typography>
									</MenuItem>
								</Link>
							))}
						</Menu>
						<Link href="/" passHref>
							{/* @ts-ignore */}
							<Typography variant="h6" noWrap component="div" sx={styles.logoMobile}>
								Polyecho
								<Chip label="Alpha" size="small" color="secondary" sx={styles.alphaChip} />
							</Typography>
						</Link>
					</Box>

					<Box sx={{ flexGrow: 1, display: { xs: 'none', md: 'flex', textAlign: 'center' } }}>
						{pages.map(page => (
							<Link key={page.href} href={page.href} passHref>
								<Button key={page.href}>{page.title}</Button>
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
