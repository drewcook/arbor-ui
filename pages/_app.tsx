import type { AppProps } from 'next/app'
import NextNProgress from 'nextjs-progressbar'
import AppLayout from '../components/AppLayout'
import PolyechoThemeProvider from '../components/PolyEchoThemeProvider'
import { Web3Provider } from '../components/Web3Provider'
import '../styles/globals.css'

// Allow New Relic APM
require('../newrelic')

const PolyechoApp = ({ Component, pageProps }: AppProps) => (
	<PolyechoThemeProvider>
		<Web3Provider>
			<NextNProgress color="#23F09A" />
			<AppLayout>
				<Component {...pageProps} />
			</AppLayout>
		</Web3Provider>
	</PolyechoThemeProvider>
)

export default PolyechoApp
