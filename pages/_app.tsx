import '../styles/globals.css'
import type { AppProps } from 'next/app'
import { Web3Provider } from '../components/Web3Provider'

import { ThemeProvider, createTheme } from '@mui/material/styles'

const darkTheme = createTheme({
	palette: {
		mode: 'dark',
		primary: {
			main: '#0000aa',
		},
		secondary: {
			main: '#00d3a3',
		},
		background: {
			paper: '#2d3e4c',
			default: '#010102',
		},
	},
})

function MyApp({ Component, pageProps }: AppProps) {
	return (
		<ThemeProvider theme={darkTheme}>
			<Web3Provider>
				<Component {...pageProps} />
			</Web3Provider>
		</ThemeProvider>
	)
}

export default MyApp
