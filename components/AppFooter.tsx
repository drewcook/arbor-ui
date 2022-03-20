import { Box, Typography } from '@mui/material'
import { useRouter } from 'next/router'
import { useEffect, useState } from 'react'

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
		'&.stuck': {
			position: 'fixed',
			bottom: 0,
			width: '100%',
		},
	},
	copy: {
		textAlign: 'center',
	},
}

const AppFooter = (): JSX.Element => {
	const [stuck, setStuck] = useState(false)
	const router = useRouter()

	// If page content is less than viewport height, stick to bottom
	const handleCheckSticky = () => {
		const footer: HTMLElement | null = document.querySelector('footer')
		if (footer) {
			const shouldStick: boolean = window.innerHeight - (footer.offsetTop + footer.offsetHeight) > 0
			setStuck(shouldStick)
		}
	}

	useEffect(() => {
		handleCheckSticky()
		window.addEventListener('resize', handleCheckSticky)
		return () => {
			window.removeEventListener('resize', handleCheckSticky)
		}
	}, [])

	useEffect(() => {
		console.log({ router })
		handleCheckSticky()
	}, [router.asPath])

	return (
		<Box sx={styles.footer} component="footer" className={stuck ? 'stuck' : ''}>
			<Typography sx={styles.copy} variant="body2">
				&copy; 2022 POLYECHO | All Rights Reserved
			</Typography>
		</Box>
	)
}

export default AppFooter
