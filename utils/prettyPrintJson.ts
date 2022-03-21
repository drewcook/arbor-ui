// @ts-ignore
const replacer = (match, pIndent, pKey, pVal, pEnd) => {
	const key = '<span class=json-key>'
	const val = '<span class=json-value>'
	const str = '<span class=json-string>'
	let r = pIndent || ''
	if (pKey) r = r + key + pKey.replace(/[": ]/g, '') + '</span>: '
	if (pVal) r = r + (pVal[0] == '"' ? str : val) + pVal + '</span>'
	return r + (pEnd || '')
}

/**
 * Used for prettifying the JSON code for use within a <pre><code>[here]</code></pre> block
 * @param {any} obj Any JSON like object
 * @returns A prettified JSON string to use within a <code> HTML tag
 */
const prettyPrintJson = (obj: object) => {
	const jsonLine = /^( *)("[\w]+": )?("[^"]*"|[\w.+-]*)?([,[{])?$/gm

	const string = JSON.stringify(obj, null, 3)
		.replace(/&/g, '&amp;')
		.replace(/\\"/g, '&quot;')
		.replace(/</g, '&lt;')
		.replace(/>/g, '&gt;')
		.replace(jsonLine, replacer)

	return string
}

// Example:
// var account = { active: true, codes: [48348, 28923, 39080], city: 'London' }
// var planets = [
// 	{ name: 'Earth', order: 3, stats: { life: true, mass: 5.9736 * Math.pow(10, 24) } },
// 	{ name: 'Saturn', order: 6, stats: { life: null, mass: 568.46 * Math.pow(10, 24) } },
// ]
// prettyPring(account)
// prettyPring(planets)

export default prettyPrintJson
