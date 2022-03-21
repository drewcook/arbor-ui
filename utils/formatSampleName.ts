/**
 * Formats a given sample file name into a better display name
 * @param sampleName - The filename of the sample to format
 * @returns {string} - The formatted name.
 */
const formatSampleName = (sampleName: string): string => {
	const formattedName: string = sampleName.split('.')[0] // Remove file extension
	return formattedName
}

export default formatSampleName
