import type { AppProps } from 'next/app'
import NextNProgress from 'nextjs-progressbar'
import PolyEchoThemeProvider from '../components/PolyEchoThemeProvider'
import { Web3Provider } from '../components/Web3Provider'
import '../styles/globals.css'

function PolyEchoApp({ Component, pageProps }: AppProps) {
	return (
		<PolyEchoThemeProvider>
			<Web3Provider>
				<NextNProgress color="#23F09A" />
				<Component {...pageProps} />
			</Web3Provider>
		</PolyEchoThemeProvider>
	)
}

export default PolyEchoApp
