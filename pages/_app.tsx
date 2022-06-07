import type { AppProps } from 'next/app'
import NextNProgress from 'nextjs-progressbar'
import PolyechoThemeProvider from '../components/PolyEchoThemeProvider'
import AppLayout from '../components/AppLayout'
import { Web3Provider } from '../components/Web3Provider'
import '../styles/globals.css'

// Allow New Relic APM
require('../newrelic')

function PolyechoApp({ Component, pageProps }: AppProps) {
	return (
		<PolyechoThemeProvider>
			<Web3Provider>
				<NextNProgress color="#23F09A" />
				<AppLayout isHome={Component.name === 'Home'}>
					<Component {...pageProps} />
				</AppLayout>
			</Web3Provider>
		</PolyechoThemeProvider>
	)
}

export default PolyechoApp
