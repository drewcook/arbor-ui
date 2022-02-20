/** @type {import('next').NextConfig} */
const nextConfig = {
	reactStrictMode: true,
	env: {
		MONGODB_URI: process.env.MONGODB_URI,
		CLIENT_HOST: process.env.CLIENT_HOST,
		BLOCKNATIVE_KEY: process.env.BLOCKNATIVE_KEY,
		NFT_STORAGE_KEY: process.env.NFT_STORAGE_KEY,
		PYTHON_HTTP_HOST: process.env.PYTHON_HTTP_HOST,
	},
}

module.exports = nextConfig
