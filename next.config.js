const { withSentryConfig } = require('@sentry/nextjs')

/** @type {import('next').NextConfig} */

// eslint-disable-next-line
const withBundleAnalyzer = require('@next/bundle-analyzer')({
	enabled: process.env.ANALYZE === 'true',
})

const nextConfig = {
	reactStrictMode: true,
	env: {
		HOME: process.env.HOME,
		VERCEL_ENV: process.env.VERCEL_ENV,
		VERCEL_URL: process.env.VERCEL_URL,
		HEROKU_APP_NAME: process.env.HEROKU_APP_NAME,
		CLIENT_HOST: process.env.CLIENT_HOST,
		MONGODB_URI: process.env.MONGODB_URI,
		WALLETCONNECT_ID: process.env.WALLETCONNECT_ID,
		BLOCKNATIVE_KEY: process.env.BLOCKNATIVE_KEY,
		NFT_STORAGE_KEY: process.env.NFT_STORAGE_KEY,
		COVALENT_API_KEY: process.env.COVALENT_API_KEY,
		PYTHON_HTTP_HOST: process.env.PYTHON_HTTP_HOST,
		ALCHEMY_POLYGON_KEY: process.env.ALCHEMY_POLYGON_KEY,
		ALCHEMY_POLYGON_TESTNET_KEY: process.env.ALCHEMY_POLYGON_TESTNET_KEY,
		SENTRY_DSN: process.env.SENTRY_DSN,
		SENTRY_LOG_LEVEL: process.env.SENTRY_LOG_LEVEL,
		SENTRY_AUTH_TOKEN: process.env.SENTRY_AUTH_TOKEN,
	},
	images: {
		deviceSizes: [640, 750, 828, 1080, 1200, 1920, 2048, 3840],
		domains: [
			'', // Catchall, maybe?
			'ipfs.io', // Anything from IPFS directly
			'dweb.link', // Anything from NFT.storage
			'nft.storage',
			'bafkreia7jo3bjr2mirr5h2okf5cjsgg6zkz7znhdboyikchoe6btqyy32u.ipfs.dweb.link', // Default PE Logo NFT Placeholder Image
			'robohash.org', // User avatars
			'gravatar.com',
		],
		imageSizes: [16, 32, 48, 64, 96, 128, 256, 384],
	},
	// Ensure there's a direct match in vercel.json
	async headers() {
		return [
			{
				// matching all API routes
				source: '/api/:path*',
				headers: [
					{ key: 'X-Sentry-Auth', value: process.env.SENTRY_DSN },
					{ key: 'Access-Control-Allow-Credentials', value: 'true' },
					{ key: 'Access-Control-Allow-Origin', value: '*' }, // https://arbor-pr-*.herokuapp.com for preview builds
					{ key: 'Access-Control-Allow-Methods', value: 'GET,OPTIONS,PATCH,DELETE,POST,PUT' },
					{
						key: 'Access-Control-Allow-Headers',
						value:
							'X-CSRF-Token, X-Requested-With, Accept, Accept-Version, Content-Length, Content-MD5, Content-Type, Date, X-Api-Version',
					},
				],
			},
		]
	},
	reactStrictMode: true,
	webpack: (config, options) => {
		if (!options.isServer) {
			config.resolve.fallback.fs = false
		}
		return {
			...config,
			// WASM support
			experiments: {
				asyncWebAssembly: true,
				layers: true,
			},
		}
	},
}

/**
 * Additional config options for the Sentry Webpack plugin.
 * For all available options, see:
 * https://github.com/getsentry/sentry-webpack-plugin#options
 * https://docs.sentry.io/platforms/javascript/guides/nextjs/manual-setup
 * Keep in mind thatthe following options are set automatically, and overriding them is not recommended:
 * 	- release, url, org, project, authToken, configFile, stripPrefix, urlPrefix, include, ignore
 */
const sentryWebpackPluginOptions = {
	org: 'arbor-labs',
	project: 'ui',
	silent: process.env.NODE_ENV === 'production',
	authToken: process.env.SENTRY_AUTH_TOKEN,
	hideSourceMaps: process.env.NODE_ENV === 'production',
}

/**
 * Use Sentry on production environments - Make sure adding Sentry options is the last code to run
 * before exporting, to ensure that your source maps include changes from all other Webpack plugins
 * TODO: update to using two keys, one for all staging, and one for production
 */
module.exports =
	process.env.NODE_ENV === 'production'
		? withSentryConfig(withBundleAnalyzer(nextConfig), sentryWebpackPluginOptions)
		: withBundleAnalyzer(nextConfig)
