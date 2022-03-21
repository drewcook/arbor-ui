/**
 * Formats a given stem file name into a better display name
 * @param stemName - The filename of the stem to format
 * @returns {string} - The formatted name.
 */
const formatStemName = (stemName: string): string => {
	const formattedName: string = stemName.split('.')[0] // Remove file extension
	return formattedName
}

export default formatStemName
