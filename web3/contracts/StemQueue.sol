//SPDX-License-Identifier: MIT
pragma solidity >=0.8.0;

import "@semaphore-protocol/contracts/interfaces/IVerifier.sol";
import "@semaphore-protocol/contracts/base/SemaphoreCore.sol";
import "@openzeppelin/contracts/access/Ownable.sol";

/// @title StemQueue contract.
/// @dev The following code is just a example to show how Semaphore con be used.
/// @dev StemQueue holds the votes around the stems within each project's stem queue
contract StemQueue is SemaphoreCore, Ownable {
    // A new vote is published every time a user's proof is validated.
    event NewVote(bytes32 vote);

    // Voters are identified by a Merkle root.
    // The offchain Merkle tree contains the voters' identity commitments.
    uint256 public voters;

    // The external verifier used to verify Semaphore proofs.
    IVerifier public verifier;

    constructor(uint256 _voters, address _verifier) {
        voters = _voters;
        verifier = IVerifier(_verifier);
    }

    // Only users who create valid proofs can vote.
    // The contract owner must only send the transaction and they will not know anything about the identity of the voters.
    // The external nullifier is in this example the root of the Merkle tree.
    function vote(
        bytes32 _vote,
        uint256 _nullifierHash,
        uint256[8] calldata _proof
    ) external onlyOwner {
        _verifyProof(_vote, voters, _nullifierHash, voters, _proof, verifier);

        // Prevent double-voting (nullifierHash = hash(root + identityNullifier)).
        // Every user can vote once.
        _saveNullifierHash(_nullifierHash);

        emit NewVote(_vote);
    }
}


// // TODO: this should be the proof generated from ZK
// interface Proof {}

// 	// TODO: this should extend another implementation, likely the SparseMerkleTree from zk-kit
// contract MerkleTree {}


// contract StemQueue {

// 	// Mapping of project IDs to their Merkle trees which represent the state of stems in the queue and votes tallied against them
//   mapping(uint256 => MerkleTree) projectStemQueues;

// 	function castVote(Proof _validityProof, uint256 _projectId, uint256 _stemId, uint256 _userKey) internal returns (uint) {
// 		// TODO: flesh this function out
// 		return 1;
// 	}
// }
