import '../styles/globals.css'
import type { AppProps } from 'next/app'
import { Web3Provider } from '../components/Web3Provider'

import { ThemeProvider, createTheme } from '@mui/material/styles'

const polyEchoTheme = createTheme({
	palette: {
		primary: {
			main: '#00f0ff',
		},
		secondary: {
			main: '#0500ff',
		},
		divider: '#ccc',
	},
})

function MyApp({ Component, pageProps }: AppProps) {
	return (
		<ThemeProvider theme={polyEchoTheme}>
			<Web3Provider>
				<Component {...pageProps} />
			</Web3Provider>
		</ThemeProvider>
	)
}

export default MyApp
