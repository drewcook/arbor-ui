import { Box, Typography } from '@mui/material'

const styles = {
	footer: {
		backgroundColor: '#111',
		color: '#eee',
		display: 'flex',
		flex: 1,
		padding: '2rem 0',
		flexDirection: 'column',
		justifyContent: 'center',
		alignItems: 'center',
	},
	copy: {
		textAlign: 'center',
	},
}

const Footer = (): JSX.Element => {
	return (
		<footer>
			<Box sx={styles.footer}>
				<Typography sx={styles.copy} variant="body2">
					&copy; 2022 | All Rights Reserved
				</Typography>
			</Box>
		</footer>
	)
}

export default Footer
