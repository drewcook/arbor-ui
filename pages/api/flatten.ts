import { withSentry } from '@sentry/nextjs'
import axios from 'axios'
import { spawn } from 'child_process'
import ffmpeg from 'ffmpeg-static'
import type { NextApiRequest, NextApiResponse } from 'next'
import { Stream } from 'stream'

import logger from '../../lib/logger'

export type AudioFile = {
	cid: string
	filename: string
	contents: Buffer
}

/**
 * Fetches an audio stream from the IPFS network via the a provided IPFS gateway.
 * @async
 * @param {string} cid - The CID of the audio file on IPFS.
 * @returns {Promise<Stream.PassThrough>} A Promise that resolves to a PassThrough stream containing the audio data.
 * @throws {Error} If the request to fetch the audio fails with a non-200 status code.
 */
const fetchAudioStream = async (cid: string) => {
	// Use the Infura gateway
	const url = `https://arbor-audio.infura-ipfs.io/${cid}/blob`
	console.log({ url })
	const response = await axios.get(url, { responseType: 'stream' })

	if (response.status !== 200) {
		throw new Error(`Failed to fetch audio: ${response.status} ${response.statusText}`)
	}

	// Pipe the contents into the audio stream passthrough and return it
	const audioStream = new Stream.PassThrough()
	response.data.pipe(audioStream)
	return audioStream
}

/**
 * Downloads multiple audio files in parallel from IPFS given their CIDs and returns an array of AudioFile objects, containeng their filename and CID.
 *
 * @async
 * @function downloadAudio
 * @param {string[]} cids - The array of CIDs of the audio files to download.
 * @returns {Promise<AudioFile[]>} A promise that resolves with the array of AudioFiles that have been downloaded from IPFS
 */
async function downloadAudio(audioFiles: AudioFile[]): Promise<AudioFile[]> {
	try {
		const files: AudioFile[] = await Promise.all(
			audioFiles.map(async file => {
				// Fetch each audio file as a stream from IPFS
				const audioStream = await fetchAudioStream(file.cid)

				// Pipe the audio stream into a buffer
				const chunks: Uint8Array[] = []
				for await (const chunk of audioStream) {
					chunks.push(chunk)
				}
				const buffer = Buffer.concat(chunks)

				// Return the file with its contents as a buffer
				return { ...file, contents: buffer }
			}),
		)

		return files
	} catch (error) {
		logger.red(`Error occurred in downloadAudio() - ${error}`)
	}
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
	try {
		if (!ffmpeg) throw new Error('The FFMpeg library is required to call this function')
		if (!inputFiles) throw new Error('No input files provided')

		// Create an array of input file streams from the buffer contents
		const inputStreams = inputFiles.map(({ contents }) => Stream.Readable.from(contents))

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
			'-', // Read input files from stdin
			'-f',
			'mp3', // Output format
			'-c:a',
			'libmp3lame', // Use the LAME MP3 audio encoder
			'-q:a',
			'2', // Set audio quality to 2 (128 Kbps)
			'-', // Output to stdout
		]

		const ffmpegProcess = spawn(ffmpeg, args)

		// Pipe each input file stream into FFmpeg's stdin
		for (const stream of inputStreams) {
			stream.pipe(ffmpegProcess.stdin, { end: false })
		}

		// Handle output from FFmpeg's stdout
		const outputChunks: Uint8Array[] = []
		ffmpegProcess.stdout.on('data', chunk => {
			outputChunks.push(chunk)
		})

		// Handle errors and completion of the FFmpeg process
		const processError = new Promise<void>((resolve, reject) => {
			ffmpegProcess.on('error', reject)
			ffmpegProcess.on('exit', code => {
				if (code === 0) {
					resolve()
				} else {
					reject(new Error(`FFmpeg process exited with code ${code}`))
				}
			})
		})

		// Wait for the FFmpeg process to complete and output
		const processComplete = new Promise<void>((resolve, reject) => {
			ffmpegProcess.stdout?.on('end', resolve)
			ffmpegProcess.stdout?.on('error', reject)
		})

		await Promise.all([processError, processComplete])

		// Combine the output chunks into a single buffer
		const outputBuffer = Buffer.concat(outputChunks)

		return outputBuffer
	} catch (error) {
		logger.red(`Error occurred in mergeAudioFiles() - ${error}`)
	}
}

async function handler(req: NextApiRequest, res: NextApiResponse) {
	try {
		const { method, body } = req

		// Handle for unsupported request methods
		if (method !== 'POST') {
			return res.status(405).end()
		}

		// Ensure the payload includes the proper 'audioFiles' property
		if (!body?.audioFiles) {
			return res.status(400).json({ error: 'Missing audioFiles property in request body' })
		}

		const { audioFiles } = body

		// Ensure that there is an array of at least two audio files being passed in
		if (!Array.isArray(audioFiles) || audioFiles.length < 2) {
			return res.status(400).json({ error: 'Invalid CIDs parameter' })
		}

		// Download the audio files in parallel from IPFS
		const inputFiles = await downloadAudio(audioFiles)

		// Merge them together using FFMpeg
		const outputBuffer = await mergeAudioFiles(inputFiles)
		console.log({ outputBuffer })

		if (!outputBuffer) {
			throw new Error('Failed to merge audio files')
		}

		// Return 200 with the buffer, set the proper headers
		res.setHeader('Content-Type', 'audio/mpeg')
		res.setHeader('Content-Disposition', 'attachment; filename="output.mp3"')
		return res.status(200).send(outputBuffer)
	} catch (error) {
		logger.red(error)
		return res.status(500).json({ success: false, error })
	}
}

// Use Sentry as a logging tool when running production environments
export default process.env.NODE_ENV === 'production' ? withSentry(handler) : handler
