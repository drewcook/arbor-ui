import { exportCallDataGroth16 } from './snarkjsZkproof'

const stemQueueVoteCalldata = async (
	voter: string,
	stemId: string,
	contributors: string[],
	queueStemIds: string[],
): Promise<any> => {
	const input = {
		voter,
		stemId,
		contributors,
		queueStemIds,
	}

	let dataResult
	try {
		dataResult = await exportCallDataGroth16(input, '/zkproof/stemQueueVote.wasm', '/zkproof/stemQueueVote_final.zkey')
	} catch (error) {
		// console.log(error);
		window.alert('Wrong answer')
	}

	return dataResult
}

export default stemQueueVoteCalldata
