/**
 * Encodes a blob to base64 string.
 *
 * @param blob - The blob to encode.
 * @returns The base64 encoded string.
 */
export async function encodeBlobToBase64(blob: Blob): Promise<string> {
	const buffer = await blob.arrayBuffer()
	const base64String = Buffer.from(buffer).toString('base64')
	return base64String
}

/**
 * Decodes a base64 string to a blob.
 *
 * @param base64String - The base64 encoded string to decode.
 * @returns The decoded blob.
 */
export async function decodeBase64ToBlob(base64String: string): Promise<Blob> {
	const buffer = Buffer.from(base64String, 'base64')
	const blob = new Blob([buffer])
	return blob
}
