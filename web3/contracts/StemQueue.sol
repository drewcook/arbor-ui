// SPDX-License-Identifier: MIT
pragma solidity >=0.8.0;

contract MerkleTree {
	// TODO: this should extend another implementation, likely the SparseMerkleTree from zk-kit
}

contract StemQueue {

	// Mapping of project IDs to their Merkle trees which represent the state of stems in the queue and votes tallied against them
  mapping(uint256 => MerkleTree) projectStemQueues;
}
