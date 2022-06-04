import axios from 'axios'
import fs from 'fs'
import archiver from 'archiver'
import logger from './logger'

/**
 * Given a stem URL, downloads and returns the binary data of the stem.
 * @param stemURL - The URL of a stem to be downloaded.
 * @returns Promise<Blob>
 */

export const downloadStem = async (stemURL: string): Promise<Blob> => {
	try {
		return await (await fetch(stemURL)).blob()
	} catch (e: any) {
		console.log(`Error downloading stem: ${e}`)
		return Promise.reject()
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
		// TODO: Noah - Rewrite this function to the data as binary / blobs files and not depend on filesystem
		// Create archiver to compress with zlib
		// A higher level will result in better compression, but will take longer to complete. A lower level will result in less compression, but will be much faster. Level 5 is a good balance.s
		const archive = archiver('zip', { zlib: { level: 5 } })

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
			writer.on('close', () => {
				console.log(`File downloaded. Total of ${archive.pointer()} bytes transferred.`)
				fs.readdir(sourceDir, {}, (err, files) => {
					console.log('SOURCE DIR')
					files.forEach(console.log)
				})
				fs.readdir(outDir, {}, (err, files) => {
					console.log('OUT DIR')
					files.forEach(console.log)
				})
			})
			// https://www.archiverjs.com/docs/archiver/#finalize
			archive.finalize()
		})
	} catch (e: any) {
		console.error(e)
		return Promise.reject(e)
	}
}

export default downloadStem
