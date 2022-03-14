/** @type {import('next').NextConfig} */
const nextConfig = {
	reactStrictMode: true,
	env: {
		MONGODB_URI: process.env.MONGODB_URI,
		CLIENT_HOST: process.env.CLIENT_HOST,
		BLOCKNATIVE_KEY: process.env.BLOCKNATIVE_KEY,
		NFT_STORAGE_KEY: process.env.NFT_STORAGE_KEY,
		COVALENT_API_KEY: process.env.COVALENT_API_KEY,
		PYTHON_HTTP_HOST: process.env.PYTHON_HTTP_HOST,
	},
	images: {
		deviceSizes: [640, 750, 828, 1080, 1200, 1920, 2048, 3840],
		domains: [
			'', // Catchall, maybe?
			'ipfs.io', // Anything from IPFS directly
			'dweb.link', // Anything from NFT.storage
			'bafkreia7jo3bjr2mirr5h2okf5cjsgg6zkz7znhdboyikchoe6btqyy32u.ipfs.dweb.link', // Default PE Logo NFT Placeholder Image
			'robohash.org', // User avatars
		],
		imageSizes: [16, 32, 48, 64, 96, 128, 256, 384],
	},
}

module.exports = nextConfig
