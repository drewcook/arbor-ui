import { format } from 'date-fns'

/**
 * Formats a given datetime string into a more readable format
 * @param {string} dateString - The ISO string representative of the date to format
 * @returns A formatted string showing the date
 */
const formatDate = (dateString: string): string => {
	const displayFormat = 'MM/dd/yyyy @ hh:mm a'
	return format(new Date(dateString), displayFormat)
}

export default formatDate
