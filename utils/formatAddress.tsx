/**
 * Converts a long wallet address to a somewhat hidden one, showing the first two characters and the last 4 characters
 * @param address The wallet address abcdefg12345678
 * @returns An obfusicated address ab.................5678
 */
const formatAddress = (address: string): string => {
	if (!address) return ''
	// Check address vs display name - We limit display names to 20 chars addresses will be longer and typically start with 0x
	// Check if address - Rudimentary check against 0x, but could also ensure only alphanumeric
	if (address.substring(0, 2).toLowerCase() === '0x' && address.length > 20) {
		return address.substring(0, 5) + '.................' + address.substring(address.length - 4)
	}
	// Check if displayName, check for under 20 chars for now, but could be better checking
	if (address.length <= 20) {
		// Return all 20 characters, but lowercased
		return address.toLowerCase()
	}
	// fallback
	return address
}

export default formatAddress
