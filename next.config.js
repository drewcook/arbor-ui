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
		NEW_RELIC_LICENSE_KEY: process.env.NEW_RELIC_LICENSE_KEY,
		GA_MEASUREMENT_ID: process.env.GA_MEASUREMENT_ID,
		REDIS_HOST: process.env.REDIS_HOST,
		REDIS_USER: process.env.REDIS_USER,
		REDIS_AUTH: process.env.REDIS_AUTH,
	},
	images: {
		deviceSizes: [640, 750, 828, 1080, 1200, 1920, 2048, 3840],
		domains: [
			'', // Catchall, maybe?
			'ipfs.io', // Anything from IPFS directly
			'dweb.link', // Anything from NFT.storage
			'nft.storage',
			'bafkreia7jo3bjr2mirr5h2okf5cjsgg6zkz7znhdboyikchoe6btqyy32u.ipfs.dweb.link', // Default Logo NFT Placeholder Image
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

module.exports = withBundleAnalyzer(nextConfig)
