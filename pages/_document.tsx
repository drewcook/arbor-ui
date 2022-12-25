import type { DocumentContext } from 'next/document'
import Document, { Head, Html, Main, NextScript } from 'next/document'
import Script from 'next/script'

class AppDocument extends Document {
	static async getInitialProps(ctx: DocumentContext) {
		const initialProps = await Document.getInitialProps(ctx)
		return { ...initialProps }
	}

	render() {
		return (
			<Html>
				<Head>
					<meta
						name="description"
						content="The Arbor Protocol is a collaborative, music-making experience where artists can create music NFTs and benefit from split revenue and royalties via collectors."
					/>
					<link rel="icon" href="/favicon.ico" />
					<link rel="preconnect" href="https://fonts.googleapis.com" />
					<link rel="preconnect" href="https://fonts.gstatic.com" crossOrigin="true" />
					<link
						href="https://fonts.googleapis.com/css2?family=Kanit:ital,wght@0,300;0,400;0,600;0,800;1,300;1,400;1,600;1,800&display=swap"
						rel="stylesheet"
					/>
					<link rel="stylesheet" href="https://fonts.googleapis.com/icon?family=Material+Icons" />
					{process.env.NODE_ENV === 'production' && (
						<>
							<Script src="https://www.googletagmanager.com/gtag/js?id=G-BV6RKG6N7H" strategy="afterInteractive" />
							<Script id="google-analytics" strategy="afterInteractive">
								{`
									window.dataLayer = window.dataLayer || [];
									function gtag(){window.dataLayer.push(arguments);}
									gtag('js', new Date());

									gtag('config', 'G-BV6RKG6N7H');
								`}
							</Script>
						</>
					)}
				</Head>
				<body>
					<Main />
					<NextScript />
				</body>
			</Html>
		)
	}
}

export default AppDocument
