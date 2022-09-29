import type { AppProps } from 'next/app'
import NextNProgress from 'nextjs-progressbar'
import AppLayout from '../components/AppLayout'
import ArborThemeProvider from '../components/ArborThemeProvider'
import { Web3Provider } from '../components/Web3Provider'
import '../styles/globals.css'

// Allow New Relic APM
require('../newrelic')

const ArborApp = ({ Component, pageProps }: AppProps) => (
	<ArborThemeProvider>
		<Web3Provider>
			<NextNProgress color="#23F09A" />
			<AppLayout>
				<Component {...pageProps} />
			</AppLayout>
		</Web3Provider>
	</ArborThemeProvider>
)

export default ArborApp
