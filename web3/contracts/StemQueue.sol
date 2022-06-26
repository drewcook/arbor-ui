//SPDX-License-Identifier: MIT
pragma solidity >=0.8.0;

import "@semaphore-protocol/contracts/interfaces/IVerifier.sol";
import "@semaphore-protocol/contracts/interfaces/ISemaphore.sol";
import "@semaphore-protocol/contracts/base/SemaphoreCore.sol";
import "@semaphore-protocol/contracts/base/SemaphoreGroups.sol";

/// @title StemQueue contract.
/// @dev The following code is just a example to show how Semaphore con be used.
/// @dev StemQueue holds the votes around the stems within each project's stem queue
contract StemQueue is SemaphoreCore, SemaphoreGroups {
    // A new vote is published every time a user's proof is validated.
    event NewVote(bytes32 vote);

    // Voters are identified by a Merkle root.
    // The offchain Merkle tree contains the voters' identity commitments.
    uint256 public voters;

    // The external verifier used to verify Semaphore proofs.
    IVerifier public verifier;

		/// @dev Gets a group id and returns the group admin address.
    mapping(uint256 => address) public groupAdmins;

		/// @dev Emitted when an admin is assigned to a group.
    /// @param groupId: Id of the group.
    /// @param oldAdmin: Old admin of the group.
    /// @param newAdmin: New admin of the group.
    event GroupAdminUpdated(uint256 indexed groupId, address indexed oldAdmin, address indexed newAdmin);

		/// @dev Checks if the group admin is the transaction sender.
    /// @param groupId: Id of the group.
    modifier onlyGroupAdmin(uint256 groupId) {
        require(groupAdmins[groupId] == _msgSender(), "Semaphore: caller is not the group admin");
        _;
    }

    constructor(uint256 _voters, address _verifier) {
        voters = _voters;
        verifier = IVerifier(_verifier);
    }

		/// @dev Allow anyone to create a new group
		function createProjectGroup(
        uint256 groupId,
        uint8 depth,
        uint256 zeroValue,
        address admin
    ) external {
        _createGroup(groupId, depth, zeroValue);

        groupAdmins[groupId] = admin;

        emit GroupAdminUpdated(groupId, address(0), admin);
    }

		/// @dev Allow anyone to add themselves to ta group
    function addMemberToProjectGroup(uint256 groupId, uint256 identityCommitment) external {
        _addMember(groupId, identityCommitment);
    }

		/// @dev Allow only group admin to remove
    function removeMemberFromProjectGroup(
        uint256 groupId,
        uint256 identityCommitment,
        uint256[] calldata proofSiblings,
        uint8[] calldata proofPathIndices
    ) external onlyGroupAdmin(groupId) {
        _removeMember(groupId, identityCommitment, proofSiblings, proofPathIndices);
    }

    // Only users who create valid proofs can vote.
    // The contract owner must only send the transaction and they will not know anything about the identity of the voters.
    // The external nullifier is in this example the root of the Merkle tree.
    function vote(
        bytes32 _vote,
        uint256 _nullifierHash,
        uint256[8] calldata _proof
    ) external {
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
