import Image from 'next/image'
import {
	Box,
	Container,
	Link,
	List,
	ListItem,
	ListItemButton,
	ListItemIcon,
	ListItemText,
	Typography,
} from '@mui/material'
import CoinbaseIcon from '../public/coinbasewallet_icon.png'
import EthereumIcon from '../public/ethereum_icon.png'
import MetaMaskIcon from '../public/metamask_icon.png'
import PortisIcon from '../public/portis_icon.png'
import TorusIcon from '../public/torus_icon.svg'

const styles = {
	wrapper: {
		width: '100vw',
		height: '100vh',
		display: 'flex',
		flexDirection: 'column',
		justifyContent: 'center',
		alignItems: 'center',
		textAlign: 'center',
	},
	list: {
		border: '1px solid #ccc',
		borderRadius: '8px',
		width: '100%',
		marginTop: '3rem',
	},
	listItem: {
		justifyContent: 'space-between',
	},
	icon: {
		marginRight: '1rem',
		width: 50,
		height: 50,
	},
}

const Web3Fallback = (): JSX.Element => (
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
					<Link href="https://metamask.io/download/" underline="none" color="#111">
						<ListItem disablePadding divider>
							<ListItemButton>
								<ListItemIcon sx={styles.icon}>
									<Image src={MetaMaskIcon} alt="MetaMask" title="MetaMask" />
								</ListItemIcon>
								<ListItemText primary="MetaMask" />
								<ListItemText
									secondary="Most Popular"
									secondaryTypographyProps={{ align: 'right' }}
								/>
							</ListItemButton>
						</ListItem>
					</Link>
					<Link href="https://www.coinbase.com/wallet" underline="none" color="#111">
						<ListItem disablePadding divider>
							<ListItemButton>
								<ListItemIcon sx={styles.icon}>
									<Image src={CoinbaseIcon} alt="Coinbase Wallet" title="Coinbase Wallet" />
								</ListItemIcon>
								<ListItemText primary="Coinbase Wallet" />
							</ListItemButton>
						</ListItem>
					</Link>
					<Link href="https://portis.io/" underline="none" color="#111">
						<ListItem disablePadding divider>
							<ListItemButton>
								<ListItemIcon sx={styles.icon}>
									<Image src={PortisIcon} alt="Portis" title="Portis" />
								</ListItemIcon>
								<ListItemText primary="Portis" />
							</ListItemButton>
						</ListItem>
					</Link>
					<Link href="https://toruswallet.io/" underline="none" color="#111">
						<ListItem disablePadding divider>
							<ListItemButton>
								<ListItemIcon sx={styles.icon}>
									<Image src={TorusIcon} alt="Torus Labs" title="Torus Labs" />
								</ListItemIcon>
								<ListItemText primary="Torus" />
							</ListItemButton>
						</ListItem>
					</Link>
					<Link href="https://ethereum.org/en/wallets/find-wallet/" underline="none" color="#111">
						<ListItem disablePadding>
							<ListItemButton>
								<ListItemIcon sx={styles.icon}>
									<Image src={EthereumIcon} alt="Ethereum Wallets" title="Ethereum Wallets" />
								</ListItemIcon>
								<ListItemText primary="Find an Ethereum Wallets" />
							</ListItemButton>
						</ListItem>
					</Link>
				</List>
			</Container>
		</Container>
	</Box>
)

export default Web3Fallback
