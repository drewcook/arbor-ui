import DiscordIconSvg from '../public/discord_circle_black.svg'
import GithubIconSvg from '../public/github_circle_black.svg'
import TwitterIconSvg from '../public/twitter_circle_black.svg'
import { Box, Typography } from '@mui/material'
import { useRouter } from 'next/router'
import { useEffect, useState } from 'react'
import ImageOptimized from './ImageOptimized'
import Link from 'next/link'

const styles = {
	footer: {
		backgroundColor: '#fff',
		color: '#111',
		display: 'flex',
		flex: 1,
		flexDirection: 'column',
		justifyContent: 'center',
		alignItems: 'center',
		py: 4,
		px: 2,
		'&.stuck': {
			position: 'fixed',
			bottom: 0,
			width: '100%',
		},
	},
	social: {
		mb: 4,
	},
	socialIcon: {
		display: 'inline-block',
		mx: 1,
		cursor: 'pointer',
		'&:hover': {
			opacity: 0.5,
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
		handleCheckSticky()
	}, [router.asPath])

	return (
		<>
			{/* @ts-ignore */}
			<Box sx={styles.footer} component="footer" className={stuck ? 'stuck' : ''}>
				<Box sx={styles.social}>
					<Link href="https://discord.gg/Hp99UC5cGX" passHref>
						<Box sx={styles.socialIcon}>
							<ImageOptimized src={DiscordIconSvg} width={40} height={40} />
						</Box>
					</Link>
					<Link href="https://twitter.com/polyecho_" passHref>
						<Box sx={styles.socialIcon}>
							<ImageOptimized src={TwitterIconSvg} width={40} height={40} />
						</Box>
					</Link>
					<Link href="https://github.com/polyecho" passHref>
						<Box sx={styles.socialIcon}>
							<ImageOptimized src={GithubIconSvg} width={40} height={40} />
						</Box>
					</Link>
				</Box>
				<Typography sx={styles.copy} variant="body2">
					&copy; 2022 POLYECHO | All Rights Reserved
				</Typography>
			</Box>
		</>
	)
}

export default AppFooter
