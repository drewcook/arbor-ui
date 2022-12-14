import { createFFmpeg, FFmpeg } from '@ffmpeg/ffmpeg'
import { createContext, ReactNode, useContext } from 'react'

// Context
type AudioUtilsContextProps = {
	ffmpeg: FFmpeg
	getAudio: (href: string) => any
	mergeAudio: (files: MergeAudioInput[], outputFileName: string) => any
}
// @ts-ignore
const AudioUtilsContext = createContext<AudioUtilsContextProps>({})

// Provider
type AudioUtilsProviderProps = {
	children: ReactNode
}
export type MergeAudioInput = {
	blob: Blob
	href?: string
	filename: string
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
	const mergeAudio = async (files: MergeAudioInput[], outputFileName: string): Promise<Blob> => {
		try {
			if (!ffmpeg.isLoaded()) await ffmpeg.load()

			// Compile together command
			// Example "ffmpeg -iinput0.mp3 -i input1.mp3 -filter_complex amix=inputs=2:duration=longest output.mp3"
			const commands: string[] = []
			for (let i = 0; i < files.length; i++) {
				commands.push('-i')
				const name = await files[i].filename
				commands.push(`${name}.wav`) // hardcode filetype
			}
			commands.push(`-filter_complex "[0:0][1:0] amix=inputs=${files.length}:duration=longest"`)
			// commands.push('-c:a')
			// commands.push('')
			commands.push(outputFileName)
			console.log(commands.join(' '), commands)
			// Run the command using the SDK to merge the files
			const response = await ffmpeg.run(commands.join(' '))
			const newFileData = ffmpeg.FS('readFile', outputFileName)
			const newFileBlob = new Blob([newFileData.buffer], { type: 'audio/wav' })
			console.log({ response, newFileData, newFileBlob })

			// Concating approach
			// for (const file of files) {
			// 	// const { name } = file
			// 	ffmpeg.FS('writeFile', 'file 1', await fetchFile(file.blob))
			// 	inputPaths.push(`file 1`)
			// }
			// ffmpeg.FS('writeFile', 'concat_list.txt', inputPaths.join('\n'))
			// await ffmpeg.run('-f', 'concat', '-safe', '0', '-i', 'concat_list.txt', outputFileName)
			// const data = ffmpeg.FS('readFile', outputFileName)

			return newFileBlob
		} catch (e: any) {
			console.error('Failed to mergeAudio():', e)
			return new Blob([], { type: 'text/plain' })
		}
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
