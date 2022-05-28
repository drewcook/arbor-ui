import axios from 'axios'
import fs from 'fs'
import archiver from 'archiver'
import logger from './logger'

/**
 * Reads the data from an external URL as a stream, pipes it into a write stream that writes to a file on disk
 * @param url - The external URL to download data from, a Blob of File
 * @param downloadDir - The dirname in public/ to download to, which will be temporary to hold the files streamed in, then deleted after a user downloads them to the computer.
 * @param downloadPath - The downloads path to download the file to
 * @returns - Promise
 */
const downloadURL = async (url: string, downloadDir: string, downloadPath: string): Promise<string> => {
	// TODO: Figure out how to check if file exists already in directory and re-use, fs.access is synchronous
	try {
		// Delete directory and start fresh each time if exists
		if (fs.existsSync(downloadDir)) fs.rmdirSync(downloadDir, { recursive: true })
		fs.mkdirSync(downloadDir, { recursive: true })
		// Create write stream
		const writer = fs.createWriteStream(downloadPath)

		// Create read stream with axios
		const response = await axios({
			url,
			method: 'GET',
			responseType: 'stream',
		})

		// Pipe read stream into the write stream
		response.data.pipe(writer)

		// Resolve when finished streaming, reject if any error
		return new Promise((resolve, reject) => {
			writer.on('finish', () => {
				return resolve(downloadPath)
			})
			writer.on('error', reject)
		})

		// ====== FOR REFERENCE ONLY ======
		// Alternatively, Use NFT.storage API to download
		// const nftStorage = axios.create({
		// 	baseURL: 'https://api.nft.storage',
		// 	responseType: 'arraybuffer',
		// 	headers: {
		// 		authorization: `Bearer ${process.env.NFT_STORAGE_KEY}`,
		// 	},
		// })
		// cid = cid.replace('ipfs://', '').split('/')[0]
		// console.log({ cid })
		// const response = await nftStorage.get(`/${cid}`)
		// const buffer = Buffer.from(response.data, 'utf-8') // same as response.data
	} catch (e: any) {
		console.error('Error downloading URL', e)
		return Promise.reject(e)
	}
}

/**
 * @param {String} sourceDir: /some/folder/to/compress
 * @param {String} outDir: /path/to
 * @param {String} filename: created.zip
 * @returns {Promise}
 */
export const zipDirectory = (sourceDir: string, outDir: string, filename: string): Promise<string> => {
	try {
		// Create archiver to compress with zlib
		// A higher level will result in better compression, but will take longer to complete. A lower level will result in less compression, but will be much faster. Level 5 is a good balance.s
		const archive = archiver('zip', { zlib: { level: 5 } })
		// Test log
		fs.readdir(outDir, {}, (err, files) => {
			console.log(files)
		})
		fs.access(outDir, fs.constants.W_OK, (err) => {
			if (err) {
				console.log("doesn't exist")
			} else {
				console.log('can execute')
			}
		})

		// Delete directory and start fresh each time if exists
		if (fs.existsSync(outDir)) fs.rmdirSync(outDir, { recursive: true })
		fs.mkdirSync(outDir, { recursive: true })

		// Create write stream
		const writer = fs.createWriteStream(`${outDir}/${filename}`)

		return new Promise((resolve, reject) => {
			// Use Archiver to compress directory and pipe it into the write stream
			archive
				.directory(sourceDir, false)
				.on('progress', ({ entries, fs }) => logger.magenta('progress', { entries, fs }))
				.on('warning', err => {
					if (err.code === 'ENOENT') {
						// log warning
						console.warn(`ARCHIVER WARNING - ${err.message}`)
						console.warn(err.data)
					} else {
						// throw error
						throw err
					}
				})
				.on('error', reject)
				.pipe(writer)
			// Listen to writer stream events
			writer.on('finish', () => resolve(`${outDir}/${filename}`))
			writer.on('error', err => {
				console.error('ARCHIVER ERROR', err)
				reject(err)
			})
			writer.on('close', () => console.log(`File downloaded. Total of ${archive.pointer()} bytes transferred.`))
			// https://www.archiverjs.com/docs/archiver/#finalize
			archive.finalize()
		})
	} catch (e: any) {
		console.error(e)
		return Promise.reject(e)
	}
}

export default downloadURL
