import { createTheme, ThemeProvider } from '@mui/material/styles'
import type { AppProps } from 'next/app'
import NextNProgress from 'nextjs-progressbar'
import { Web3Provider } from '../components/Web3Provider'
import '../styles/globals.css'

const polyEchoTheme = createTheme({
	palette: {
		primary: {
			main: '#23F09A',
			contrastText: '#000',
		},
		secondary: {
			main: '#0500ff',
			contrastText: '#fff',
		},
		divider: '#ccc',
	},
})

function MyApp({ Component, pageProps }: AppProps) {
	return (
		<ThemeProvider theme={polyEchoTheme}>
			<Web3Provider>
				<NextNProgress color="#23F09A" />
				<Component {...pageProps} />
			</Web3Provider>
		</ThemeProvider>
	)
}

export default MyApp
