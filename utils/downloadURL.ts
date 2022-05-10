import axios from 'axios'
import fs from 'fs'

/**
 * Reads the data from an external URL as a stream, pipes it into a write stream that writes to a file on disk
 * @param url - The external URL to download data from, a Blob of File
 * @param downloadPath - The downloads path to download the file to
 * @returns - Promise
 */
const downloadURL = async (url: string, downloadPath: string): Promise<any> => {
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
			console.log('finished')
			return resolve
		})
		writer.on('error', reject)
	})
}

export default downloadURL
