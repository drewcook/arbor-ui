import { Box, CircularProgress } from '@mui/material'

const styles = {
	wrapper: {
		width: '100vw',
		height: '100vh',
		display: 'flex',
		justifyContent: 'center',
		alignItems: 'center',
	},
	spinner: {
		marginX: 'auto',
		marginY: 4,
	},
}

const FullPageLoading = (): JSX.Element => (
	<Box sx={styles.wrapper}>
		<CircularProgress size={50} sx={styles.spinner} color="secondary" />
	</Box>
)

export default FullPageLoading
