import { createFFmpeg, fetchFile } from '@ffmpeg/ffmpeg'

const ffmpeg = createFFmpeg({ log: true })

export const transcodeFile = async ({ target: { files } }) => {
	const { name } = files[0]
	// Load instance
	await ffmpeg.load()
	// Write data
	ffmpeg.FS('writeFile', name, await fetchFile(files[0]))
	await ffmpeg.run('-i', name, 'output.mp4')
	// Load data to video player from file
	const data = ffmpeg.FS('readFile', 'output.mp4')
	const video = document.getElementById('player')
	video.src = URL.createObjectURL(new Blob([data.buffer], { type: 'video/mp4' }))
}

/**
 * Takes multiple audio files and merges them into a single source
 * Transcodes the audio to .wav
 * https://stackoverflow.com/questions/14498539/how-to-overlay-downmix-two-audio-files-using-ffmpeg
 *
				console.log({ files })
				const song = mergeAudioFile(files, 'mySong.wav')
				console.log({ song })

				// 	// NOTE: We hit this di
 */
export const mergeAudioFiles = async (files: Blob[], outputFileName: string) => {
	// Load instance
	await ffmpeg.load()
	// For each file
	// Example "ffmpeg -iinput0.mp3 -i input1.mp3 -filter_complex amix=inputs=2:duration=longest output.mp3"
	const commands = ['-i']
	for (let i = 0; i < files.length; i++) {
		commands.push('-i')
		commands.push(files[i])
	}

	// Transcode it to .mp3
	commands.push('-filter_complex')
	commands.push(`amix=inputs=${files.length}`)
	commands.push('duration=longest')
	commands.push(outputFileName)
	console.log(commands.join(' '), commands)
	await ffmpeg.run(commands.join(' '))

	// Write file, fetch file contents first
	// const fileContents: Uint8Array = await fetchFile(files[i])
	// ffmpeg.FS('writeFile', `stem-${i}.wav`, fileContents)
	// // await writeFile(`stem-${i}.mp4`, ffmpeg.FS('readFile', `stem-${i}.mp4`))

	// TODO:
	// loop through each file, read data
	// create new destination source
	// concat/mux audio source onto destination source
	// write destination source, read data from it
	// return a buffer or native base64 data
	// Read it and set element source
	const data = await ffmpeg.FS('readFile', outputFileName)
	console.log({ data })
	// const audioSrc = URL.createObjectURL(new Blob([data.buffer], { type: 'audio/wav' }))
}
