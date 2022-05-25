import axios from 'axios'
import fs from 'fs'
import path from 'path'
import archiver from 'archiver'

/**
 * Reads the data from an external URL as a stream, pipes it into a write stream that writes to a file on disk
 * @param url - The external URL to download data from, a Blob of File
 * @param downloadDir - The dirname in public/ to download to, which will be temporary to hold the files streamed in, then deleted after a user downloads them to the computer.
 * @param downloadPath - The downloads path to download the file to
 * @returns - Promise
 */
const downloadURL = async (url: string, downloadDir: string, downloadPath: string): Promise<any> => {
	// Create write stream
	fs.mkdirSync(downloadDir, { recursive: true })
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
}

/**
 * @param {String} sourceDir: /some/folder/to/compress
 * @param {String} outDir: /path/to
 * @param {String} filename: created.zip
 * @returns {Promise}
 */
export const zipDirectory = (sourceDir: string, outDir: string, filename: string): Promise<string> => {
	// Create archiver to compress with zlib
	const archive = archiver('zip', { zlib: { level: 3 } })
	// Create write stream
	fs.mkdirSync(outDir, { recursive: true })
	const writer = fs.createWriteStream(`${outDir}/${filename}`)

	return new Promise((resolve, reject) => {
		archive
			.directory(sourceDir, false)
			.on('error', err => reject(err))
			.pipe(writer)
		writer.on('close', () => {
			console.log(archive.pointer() + ' total bytes')
			resolve(outDir + filename)
		})
		archive.finalize()
	})
}

export default downloadURL
