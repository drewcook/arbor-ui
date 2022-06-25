const { plonk } = require('snarkjs')

export async function exportCallDataPlonk(input, wasmPath, zkeyPath) {
	// Generate the proof with the given input
	console.log({ input, wasmPath, zkeyPath })
	const { proof: _proof, publicSignals: _publicSignals } = await plonk.fullProve(input, wasmPath, zkeyPath)
	console.log(_proof, _publicSignals)

	// Export solidity calldata
	const calldata = await plonk.exportSolidityCallData(_proof, _publicSignals)
	console.log('calldata', calldata)

	// transform the calldata into readable values
	const calldataSplit = calldata.split(',')
	const [proof, ...rest] = calldataSplit
	const publicSignals = JSON.parse(rest.join(',')).map(x => BigInt(x).toString())
	return { proof, publicSignals }
}
