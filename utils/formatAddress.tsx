/**
 * Converts a long wallet address to a somewhat hidden one, showing the first two characters and the last 4 characters
 * @param address The wallet address abcdefg12345678
 * @returns An obfusicated address ab.................5678
 */
const formatAddress = (address: string): string => {
	if (!address) return ''
	return address.substring(0, 2) + '.................' + address.substring(address.length - 4)
}

export default formatAddress
