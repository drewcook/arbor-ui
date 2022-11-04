/** @type {import('next').NextConfig} */

// eslint-disable-next-line
const withBundleAnalyzer = require('@next/bundle-analyzer')({
	enabled: process.env.ANALYZE === 'true',
})

const nextConfig = {
	reactStrictMode: true,
	env: {
		HOME: process.env.HOME,
		CLIENT_HOST: process.env.CLIENT_HOST,
		MONGODB_URI: process.env.MONGODB_URI,
		WALLETCONNECT_ID: process.env.WALLETCONNECT_ID,
		BLOCKNATIVE_KEY: process.env.BLOCKNATIVE_KEY,
		NFT_STORAGE_KEY: process.env.NFT_STORAGE_KEY,
		COVALENT_API_KEY: process.env.COVALENT_API_KEY,
		PYTHON_HTTP_HOST: process.env.PYTHON_HTTP_HOST,
		ALCHEMY_POLYGON_KEY: process.env.ALCHEMY_POLYGON_KEY,
		ALCHEMY_POLYGON_TESTNET_KEY: process.env.ALCHEMY_POLYGON_TESTNET_KEY,
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
		],
		imageSizes: [16, 32, 48, 64, 96, 128, 256, 384],
	},
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
