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
	// Ensure there's a direct match in vercel.json
	async headers() {
		return [
			{
				// ffmpeg.wasm support for all routes
				source: '/:path*',
				headers: [
					{ key: 'Cross-Origin-Embedder-Policy', value: 'require-corp' },
					{ key: 'Cross-Origin-Opener-Policy', value: 'same-origin' },
				],
			},
			{
				// matching all API routes
				source: '/api/:path*',
				headers: [
					// Access control
					{ key: 'Access-Control-Allow-Credentials', value: 'true' },
					// { key: 'Access-Control-Allow-Origin', value: 'https://arbor-pr-*.herokuapp.com' },
					// { key: 'Access-Control-Allow-Origin', value: 'https://ui-*-arbor-protocol.vercel.app' },
					{ key: 'Access-Control-Allow-Origin', value: '*' },
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

		config.module.rules.push({
			test: /\.wasm$/,
			type: 'webassembly/sync',
		})

		// // From https://github.com/vercel/next.js/issues/22581#issuecomment-864476385
		// const ssrPlugin = config.plugins.find(plugin => plugin instanceof SSRPlugin)

		// // Patch the NextJsSSRImport plugin to not throw with WASM generated chunks.
		// function patchSsrPlugin(plugin) {
		// 	plugin.apply = function apply(compiler) {
		// 		compiler.hooks.compilation.tap('NextJsSSRImport', compilation => {
		// 			compilation.mainTemplate.hooks.requireEnsure.tap('NextJsSSRImport', (code, chunk) => {
		// 				// The patch that we need to ensure this plugin doesn't throw
		// 				// with WASM chunks.
		// 				if (!chunk.name) {
		// 					return
		// 				}

		// 				// Update to load chunks from our custom chunks directory
		// 				const outputPath = resolve('/')
		// 				const pagePath = join('/', dirname(chunk.name))
		// 				const relativePathToBaseDir = relative(pagePath, outputPath)
		// 				// Make sure even in windows, the path looks like in unix
		// 				// Node.js require system will convert it accordingly
		// 				const relativePathToBaseDirNormalized = relativePathToBaseDir.replace(/\\/g, '/')
		// 				return code
		// 					.replace('require("./"', `require("${relativePathToBaseDirNormalized}/"`)
		// 					.replace('readFile(join(__dirname', `readFile(join(__dirname, "${relativePathToBaseDirNormalized}"`)
		// 			})
		// 		})
		// 	}
		// }

		// if (ssrPlugin) {
		// 	patchSsrPlugin(ssrPlugin)
		// }

		return {
			...config,
			// Ensures that web workers can import scripts.
			// output: {
			// 	publicPath: '/_next/',
			// },
			// WASM support
			// module: {
			// 	...config.module,
			// 	rules: [
			// 		...config.module.rules,
			// 		{
			// 			test: /\.wasm$/,
			// 			type: 'webassemblly/sync',
			// 		},
			// 	],
			// },
			experiments: {
				asyncWebAssembly: true,
				layers: true,
			},
			// From https://github.com/wasm-tool/wasm-pack-plugin
			// plugins: [
			// 	new WasmPackPlugin({
			// 		crateDirectory: resolve('./rust'),
			// 		args: '--log-level warn',
			// 	}),
			// ],
		}
	},
}

module.exports = withBundleAnalyzer(nextConfig)
