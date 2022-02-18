import Link from 'next/link'
import { Box, Container, Grid, Typography } from '@mui/material'
import ConnectedAccount from './ConnectedAccount'

const styles = {
	header: {
		backgroundColor: '#cccccc',
		paddingY: 3,
	},
	nav: {
		display: 'flex',
		alignItems: 'center',
	},
}

const Header = (): JSX.Element => {
	return (
		<Box sx={styles.header}>
			<header>
				<Container max-width="xl">
					<Grid container spacing={2}>
						<Grid item sm={6} sx={styles.nav}>
							<Typography variant="h6" component="p">
								PolyEcho
							</Typography>
							<nav>
								<ul>
									<li>
										<Link href="/">
											<a>Home</a>
										</Link>
									</li>
									<li>
										<Link href="/projects">
											<a>Explore</a>
										</Link>
									</li>
									<li>
										<Link href="/projects/new">
											<a>Create</a>
										</Link>
									</li>
								</ul>
							</nav>
						</Grid>
						<Grid item sm={6}></Grid>
					</Grid>
				</Container>
			</header>
		</Box>
	)
}

export default Header
