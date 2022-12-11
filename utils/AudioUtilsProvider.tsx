import { createFFmpeg, fetchFile, FFmpeg } from '@ffmpeg/ffmpeg'
import { createContext, ReactNode, useContext } from 'react'

// Context
type AudioUtilsContextProps = {
	ffmpeg: FFmpeg
	getAudio: (href: string) => any
	mergeAudio: (files: Blob[], outputFileName: string) => any
}
// @ts-ignore
const AudioUtilsContext = createContext<AudioUtilsContextProps>({})

// Provider
type AudioUtilsProviderProps = {
	children: ReactNode
}

export const AudioUtilsProvider = ({ children }: AudioUtilsProviderProps) => {
	const ffmpeg: FFmpeg = createFFmpeg({ log: true })

	const getAudio = async (href: string): Promise<Blob> => {
		console.log('getting audio file', href)
		await ffmpeg.load()
		const audio = ffmpeg.FS('readFile', href)
		console.log({ audio })
		return new Blob([audio.buffer], { type: 'audio/wav' })
	}

	/**
	 * Merges in several audio files sources into a singular designation source
	 * Transcodes the audio to .wav
	 * https://stackoverflow.com/questions/14498539/how-to-overlay-downmix-two-audio-files-using-ffmpeg
	 * @param files - The audio blobs to convert into one
	 * @param outputFileName - The name of the destination file
	 * @returns {Blob} - THe single audio file as a blob
	 */
	const mergeAudio = async (files: Blob[], outputFileName: string): Promise<Blob> => {
		console.log('merging audio files', files)
		if (!ffmpeg.isLoaded()) {
			console.log('not loaded', { ffmpeg })
			await ffmpeg.load()
		}

		// For each file
		// Example "ffmpeg -iinput0.mp3 -i input1.mp3 -filter_complex amix=inputs=2:duration=longest output.mp3"
		const commands = ['-i']
		for (let i = 0; i < files.length; i++) {
			commands.push('-i')
			const name = await files[i].text()
			commands.push(name)
		}

		// Transcode it to .mp3
		commands.push('-filter_complex')
		commands.push(`amix=inputs=${files.length}`)
		commands.push('duration=longest')
		commands.push(outputFileName)
		console.log(commands.join(' '), commands)
		await ffmpeg.run(commands.join(' '))

		// const outputFile = 'output.wav'
		const inputPaths: string[] = []
		for (const file of files) {
			// const { name } = file
			ffmpeg.FS('writeFile', 'file 1', await fetchFile(file))
			inputPaths.push(`file 1`)
		}
		ffmpeg.FS('writeFile', 'concat_list.txt', inputPaths.join('\n'))
		await ffmpeg.run('-f', 'concat', '-safe', '0', '-i', 'concat_list.txt', outputFileName)
		// Complete Concating
		const data = ffmpeg.FS('readFile', outputFileName)
		console.log({ output: data })
		const newFile = new Blob([data.buffer], { type: 'audio/wav' })
		return newFile
		// for (const file in files) {
		// 	const fileData = await fetchFile(file)
		// 	const data = await ffmpeg.FS('readFile', file)
		// 	// transcode it
		// 	await ffmpeg.run('-i', file, outputFile)
		// 	console.log({ file, fileData, data })
		// }
		// await fs.promises.writeFile(file, this.ffmpeg.FS('readFile', outputFile))
	}

	return <AudioUtilsContext.Provider value={{ ffmpeg, getAudio, mergeAudio }}>{children}</AudioUtilsContext.Provider>
}

// Context hook
export const useAudioUtils = () => {
	const context: Partial<AudioUtilsContextProps> = useContext(AudioUtilsContext)

	if (context === undefined) {
		throw new Error('useAudioUtils must be used within an AudioUtilsProvider component.')
	}
	return context as AudioUtilsContextProps
}

export default AudioUtilsContext
