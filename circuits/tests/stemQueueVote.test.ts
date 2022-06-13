import { wasm as wasm_tester } from 'circom_tester'

const testProject = {
	contributors: ['0x0000001', '0x0000002', '0x0000003'],
	queueStemIds: ['stem_001, stem_002'],
}

const testVoteSuccess = {
	address: '0x0000001',
	stemId: 'stem_001',
}

const testVoteFailAddress = {
	address: '0x0000004',
	stemId: 'stem_001',
}

const testVoteFailStem = {
	address: '0x0000001',
	stemId: 'stem_003',
}

describe('Stem Queue circuit', () => {
	let stemQueueVoteCircuit

	beforeAll(async () => {
		stemQueueVoteCircuit = await wasm_tester('../stemQueue.circom')
	})

	it('Should generate the witness successfully', async () => {
		const input = {
			...testProject,
			voter: testVoteSuccess.address,
			stemId: testVoteSuccess.stemId,
		}

		const witness = await stemQueueVoteCircuit.calculateWitness(input)
		await stemQueueVoteCircuit.assertOut(witness, {})
	})

	it('Should fail because the voter is not an approved contributor', async () => {
		const input = {
			...testProject,
			voter: testVoteFailAddress.address,
			stemId: testVoteFailAddress.stemId,
		}

		try {
			await stemQueueVoteCircuit.calculateWitness(input)
		} catch (err: any) {
			// console.log(err);
			expect(err.message).toContain('Assert Failed')
		}
	})

	it('Should fail because the stem being voted on is not in the stem queue', async () => {
		const input = {
			...testProject,
			voter: testVoteFailStem.address,
			stemId: testVoteFailStem.stemId,
		}

		try {
			await stemQueueVoteCircuit.calculateWitness(input)
		} catch (err: any) {
			// console.log(err);
			expect(err.message).toContain('Assert Failed')
		}
	})
})
