import { MusicNote } from '@mui/icons-material'
import { Box, Container, List, ListItem, ListItemIcon, Typography } from '@mui/material'
import React from 'react'

import styles from './Banner.styles'

const Banner = (): JSX.Element => {
	return (
		<Box sx={styles.banner} component="section" className="homepage-banner">
			<Container maxWidth="xl">
				<Typography variant="h2" sx={styles.heading}>
					Create Together,
					<br />
					Earn Together.
				</Typography>
				<List>
					<ListItem>
						<ListItemIcon sx={{ color: '#fff' }}>
							<MusicNote />
						</ListItemIcon>
						<Typography variant="h5" component="p" sx={styles.subHeading}>
							Co-create songs with anyone
						</Typography>
					</ListItem>
					<ListItem>
						<ListItemIcon sx={{ color: '#fff' }}>
							<MusicNote />
						</ListItemIcon>
						<Typography variant="h5" component="p" sx={styles.subHeading}>
							Use the DAW you already love
						</Typography>
					</ListItem>
					<ListItem>
						<ListItemIcon sx={{ color: '#fff' }}>
							<MusicNote />
						</ListItemIcon>
						<Typography variant="h5" component="p" sx={styles.subHeading}>
							Collectors buy songs as NFTs
						</Typography>
					</ListItem>
					<ListItem>
						<ListItemIcon sx={{ color: '#fff' }}>
							<MusicNote />
						</ListItemIcon>
						<Typography variant="h5" component="p" sx={styles.subHeading}>
							The artists earn{' '}
							<Typography component="span" sx={{ textDecoration: 'underline' }}>
								all
							</Typography>{' '}
							proceeds.
						</Typography>
					</ListItem>
				</List>
			</Container>
		</Box>
	)
}

export default Banner
