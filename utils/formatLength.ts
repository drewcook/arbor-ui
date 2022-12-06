/**
 * Formats a given blob length to minute:seconds
 * @param sampleLength - The length of the sample to format
 * @returns {string} - The formatted length.
 */
const formatLength = (d: number): string => {
	const h = Math.floor(d / 3600)
	const m = Math.floor((d % 3600) / 60)
	let s: string | number = Math.floor((d % 3600) % 60)

	const hDisplay = h > 0 ? h + ':' : ''
	s = String(s).length < 2 ? `0${s}` : s
	return hDisplay + '' + m + ':' + s
}

export default formatLength
