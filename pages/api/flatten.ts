import { withSentry } from '@sentry/nextjs'
import { spawn } from 'child_process'
import ffmpeg from 'ffmpeg-static'
import fs from 'fs'
import type { NextApiRequest, NextApiResponse } from 'next'
import os from 'os'

import logger from '../../lib/logger'

type AudioFile = {
	cid: string
	filename: string
}

/**
 * Downloads multiple audio files in parallel from IPFS given their CIDs and returns an array of AudioFile objects, containeng their filename and CID.
 *
 * @async
 * @function downloadAudio
 * @param {string[]} cids - The array of CIDs of the audio files to download.
 * @returns {Promise<AudioFile[]>} A promise that resolves with the array of AudioFiles that have been downloaded from IPFS
 */
async function downloadAudio(cids: string[]): Promise<AudioFile[]> {
	logger.cyan(cids)
	const nftStorageApiBaseUrl = 'https://api.nft.storage/'
	const files: AudioFile[] = await Promise.all(
		cids.map(async cid => {
			// TODO: the CIDs are coming back as 404 not founds
			const resp = await fetch(`${nftStorageApiBaseUrl}${cid}`, {
				method: 'GET',
				headers: {
					Authorization: `Bearer ${process.env.NFT_STORAGE_KEY}`,
				},
			})
			console.log({ resp })
			return { cid, filename: 'test' }
			// const { name, ext } = await NFTStorageClient.get(cid)
			// const filename = `${name}.${ext}`
			// // Download and write the contents to a file to the temp dir
			// const { path: outputFilePath } = tmp.fileSync({ prefix: 'audio-', postfix: `.${ext}` })

			// const outputFilePath = `${os.tmpdir()}/${filename}`
			// const writer = fs.createWriteStream(outputFilePath)
			// const response = await NFTStorageClient.download(cid)
			// response.pipe(writer)
			// await new Promise<void>((resolve, reject) => {
			// 	writer.on('finish', resolve)
			// 	writer.on('error', reject)
			// })
			// return { cid, filename }
		}),
	)

	return files
}

/**
 * Merges an array of audio files into a single MP3 file using FFmpeg.
 *
 * @async
 * @function mergeAudioFiles
 * @param {AudioFile[]} inputFiles - The array of AudioFile objects to merge.
 * @returns {Promise<Buffer>} A Promise that resolves with a Buffer containing the merged audio data.
 * @throws {Error} Throws an error if the FFmpeg process exits with a non-zero exit code, or if the output buffer is empty.
 */
async function mergeAudioFiles(inputFiles: AudioFile[]): Promise<Buffer | void> {
	if (!ffmpeg) return

	const inputFilesListPath = `${os.tmpdir()}/input.txt`
	const outputFilePath = `${os.tmpdir()}/output.mp3`

	// Write input file list to a temporary file
	fs.writeFileSync(inputFilesListPath, inputFiles.map(({ filename }) => `file '${os.tmpdir()}/${filename}'`).join('\n'))

	// Concatenate input files and convert to MP3 using FFmpeg
	const args = [
		'-y', // Overwrite output files without asking
		'-hide_banner', // Hide console banner
		'-nostdin', // Do not expect any user input
		'-f',
		'concat', // Use concat filter
		'-safe',
		'0', // Allow unsafe input files
		'-i',
		inputFilesListPath, // Input files list
		'-f',
		'mp3', // Output format
		'-c:a',
		'libmp3lame', // Use the LAME MP3 audio encoder
		'-q:a',
		'2', // Set audio quality to 2 (128 Kbps)
		outputFilePath, // Output file path
	]

	await new Promise((resolve, reject) => {
		if (!ffmpeg) return

		const process = spawn(ffmpeg, args, { stdio: 'ignore' })
		process.on('error', reject)
		process.on('exit', code => {
			if (code === 0) {
				resolve(null)
			} else {
				reject(new Error(`FFmpeg process exited with code ${code}`))
			}
		})
	})

	// Read output file into buffer and return
	const outputBuffer = fs.readFileSync(outputFilePath)

	// Clean up temporary files
	fs.unlinkSync(inputFilesListPath)
	inputFiles.forEach(({ filename }) => fs.unlinkSync(`${os.tmpdir()}/${filename}`))
	fs.unlinkSync(outputFilePath)

	return outputBuffer
}

async function handler(req: NextApiRequest, res: NextApiResponse) {
	const {
		method,
		body: { cids },
	} = req

	// Handle for unsupported request methods
	if (method !== 'POST') {
		return res.status(405).end()
	}

	// Ensure that there is an array of at least two CIDs being passed in
	if (!Array.isArray(cids) || cids.length < 2) {
		return res.status(400).json({ error: 'Invalid CIDs parameter' })
	}

	try {
		// Download the audio files in parallel from IPFS
		const inputFiles = await downloadAudio(cids)
		console.log({ inputFiles })
		return res.status(200).json({ success: true, data: cids })

		// Merge them together using FFMpeg
		// const outputBuffer = await mergeAudioFiles(inputFiles)
		// console.log({ outputBuffer })

		// if (!outputBuffer) {
		// 	throw new Error('Failed to merge audio files')
		// }

		// Return 200 with the buffer, set the proper headers
		// res.setHeader('Content-Type', 'audio/mpeg')
		// res.setHeader('Content-Disposition', 'attachment; filename="output.mp3"')
		// return res.status(200).send(outputBuffer)
	} catch (error) {
		logger.red(error)
		return res.status(500).json({ success: false, error })
	}
}

// Use Sentry as a logging tool when running production environments
export default process.env.NODE_ENV === 'production' ? withSentry(handler) : handler
