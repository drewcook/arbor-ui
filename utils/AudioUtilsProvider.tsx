import { createFFmpeg, fetchFile, FFmpeg } from '@ffmpeg/ffmpeg'
import { createContext, ReactNode, useContext } from 'react'

// Context
type AudioUtilsContextProps = {
	ffmpeg: FFmpeg
	getAudio: (href: string) => any
	mergeAudio: (files: Blob[]) => any
}
// @ts-ignore
const AudioUtilsContext = createContext<AudioUtilsContextProps>({})

// Provider
type AudioUtilsProviderProps = {
	children: ReactNode
}

export const AudioUtilsProvider = ({ children }: AudioUtilsProviderProps) => {
	const ffmpeg: FFmpeg = createFFmpeg({ log: true })

	const getAudio = async (href: string): any => {
		console.log('getting audio file', href)
		await ffmpeg.load()
		const audio = ffmpeg.FS('readFile', href)
		console.log({ audio })
	}

	/**
	 * Merges in several audio files sources into a singular designation source
	 * @param files - The audio blobs to convert into one
	 * @returns {Blob} - THe single audio file as a blob
	 */
	const mergeAudio = async (files: Blob[]): Promise<Blob> => {
		console.log('merging audio files', files)
		if (!ffmpeg.isLoaded()) {
			console.log('not loaded', { ffmpeg })
			await ffmpeg.load()
		}
		// const outputFile = 'output.wav'
		const inputPaths: string[] = []
		for (const file of files) {
			// const { name } = file
			ffmpeg.FS('writeFile', 'file 1', await fetchFile(file))
			inputPaths.push(`file 1`)
		}
		ffmpeg.FS('writeFile', 'concat_list.txt', inputPaths.join('\n'))
		await ffmpeg.run('-f', 'concat', '-safe', '0', '-i', 'concat_list.txt', 'output.mp4')
		// Complete Concating
		const data = ffmpeg.FS('readFile', 'output.mp4')
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
