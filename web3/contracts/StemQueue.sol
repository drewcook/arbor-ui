// SPDX-License-Identifier: MIT
pragma solidity >=0.8.0;

// TODO: this should be the proof generated from ZK
interface Proof {}

	// TODO: this should extend another implementation, likely the SparseMerkleTree from zk-kit
contract MerkleTree {}


contract StemQueue {

	// Mapping of project IDs to their Merkle trees which represent the state of stems in the queue and votes tallied against them
  mapping(uint256 => MerkleTree) projectStemQueues;

	function castVote(Proof _validityProof, uint256 _projectId, uint256 _stemId, uint256 _userKey) internal returns (uint) {
		// TODO: flesh this function out
		return 1;
	}
}
