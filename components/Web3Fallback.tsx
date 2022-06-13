import {
	Box,
	Button,
	Container,
	Link,
	List,
	ListItem,
	ListItemButton,
	ListItemIcon,
	ListItemText,
	Typography,
} from '@mui/material'
import NextLink from 'next/link'
import PropTypes from 'prop-types'
import CoinbaseIcon from '../public/coinbasewallet_icon.png'
import EthereumIcon from '../public/ethereum_icon.png'
import MetaMaskIcon from '../public/metamask_icon.png'
import PortisIcon from '../public/portis_icon.png'
import TallyIcon from '../public/tally_icon.svg'
import TorusIcon from '../public/torus_icon.svg'
import ImageOptimized from './ImageOptimized'
import styles from './Web3Fallback.styles'

const Web3Fallback = ({ onBtnClick }): JSX.Element => (
	<Box sx={styles.wrapper}>
		<Container maxWidth="md">
			<Typography gutterBottom variant="h2" component="h2">
				Uh Oh!
			</Typography>
			<Typography gutterBottom variant="h4" component="h3">
				You need an Ethereum wallet to use this app.
			</Typography>
			<Typography gutterBottom>
				Connect with one of our available wallet providers or find a new one not in our list.
			</Typography>
			<Container maxWidth="sm">
				<List disablePadding sx={styles.list}>
					<Link href="https://tally.cash/community-edition" underline="none" color="#111">
						<ListItem disablePadding divider>
							<ListItemButton>
								<ListItemIcon sx={styles.icon}>
									<ImageOptimized src={TallyIcon} alt="Tally" title="Tally" />
								</ListItemIcon>
								<ListItemText primary="Tally" />
								<ListItemText secondary="Recommended" secondaryTypographyProps={{ align: 'right' }} />
							</ListItemButton>
						</ListItem>
					</Link>
					<Link href="https://metamask.io/download/" underline="none" color="#111">
						<ListItem disablePadding divider>
							<ListItemButton>
								<ListItemIcon sx={styles.icon}>
									<ImageOptimized src={MetaMaskIcon} alt="MetaMask" title="MetaMask" />
								</ListItemIcon>
								<ListItemText primary="MetaMask" />
								<ListItemText secondary="Recommended" secondaryTypographyProps={{ align: 'right' }} />
							</ListItemButton>
						</ListItem>
					</Link>
					<Link href="https://www.coinbase.com/wallet" underline="none" color="#111">
						<ListItem disablePadding divider>
							<ListItemButton>
								<ListItemIcon sx={styles.icon}>
									<ImageOptimized src={CoinbaseIcon} alt="Coinbase Wallet" title="Coinbase Wallet" />
								</ListItemIcon>
								<ListItemText primary="Coinbase Wallet" />
							</ListItemButton>
						</ListItem>
					</Link>
					<Link href="https://portis.io/" underline="none" color="#111">
						<ListItem disablePadding divider>
							<ListItemButton>
								<ListItemIcon sx={styles.icon}>
									<ImageOptimized src={PortisIcon} alt="Portis" title="Portis" />
								</ListItemIcon>
								<ListItemText primary="Portis" />
							</ListItemButton>
						</ListItem>
					</Link>
					<Link href="https://toruswallet.io/" underline="none" color="#111">
						<ListItem disablePadding divider>
							<ListItemButton>
								<ListItemIcon sx={styles.icon}>
									<ImageOptimized src={TorusIcon} alt="Torus Labs" title="Torus Labs" />
								</ListItemIcon>
								<ListItemText primary="Torus" />
							</ListItemButton>
						</ListItem>
					</Link>
					<Link href="https://ethereum.org/en/wallets/find-wallet/" underline="none" color="#111">
						<ListItem disablePadding>
							<ListItemButton>
								<ListItemIcon sx={styles.icon}>
									<ImageOptimized src={EthereumIcon} alt="Ethereum Wallets" title="Ethereum Wallets" />
								</ListItemIcon>
								<ListItemText primary="Find an Ethereum Wallets" />
							</ListItemButton>
						</ListItem>
					</Link>
				</List>
				<Box sx={{ mt: 4 }}>
					<Button sx={styles.btn} variant="contained" onClick={onBtnClick}>
						<NextLink href="/" passHref>
							Back To Home
						</NextLink>
					</Button>
				</Box>
			</Container>
		</Container>
	</Box>
)

Web3Fallback.propTypes = {
	onBtnClick: PropTypes.func.isRequired,
}

export default Web3Fallback
