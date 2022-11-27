// SPDX-License-Identifier: MIT
pragma solidity >=0.8.0;

import "@openzeppelin/contracts/proxy/Clones.sol";
import "./BlindAuction.sol";

contract BlindAuctionFactory {
    // blind auction contract
    address public implementation;
    address public verifierContract;
    address[] public blindAuctionProxies;
    address payable public nft;
    using Clones for address;
    mapping (bytes32 => address) public auctionAddress;


    constructor(address _implementation, address _verifier, address payable _nft) {
        implementation = _implementation;
        verifierContract = _verifier;
        nft = _nft;

    }

    function createBlindAuctionProxy(
        uint256 _biddingTime,
        uint256 _revealTime,
        address payable _beneficiaryAddress,
        bytes32 _nftId
    ) external payable returns (address blindAuctionProxyContract) {
        blindAuctionProxyContract = Clones.clone(implementation);
        BlindAuction(blindAuctionProxyContract).initialize(
            msg.sender,
            verifierContract,
            _biddingTime,
            _revealTime,
            _beneficiaryAddress,
            nft
        );
        blindAuctionProxies.push(blindAuctionProxyContract);
        auctionAddress[_nftId] = blindAuctionProxyContract;

        emit BlindAuctionCloneCreated(
            blindAuctionProxyContract,
            _beneficiaryAddress,
            blindAuctionProxies.length,
            blindAuctionProxies,
            _nftId
        );
    }

    function getAllAuctions() public view returns (address[] memory) {
        return blindAuctionProxies;
    }

    function getAuctionById(uint8 id) public view returns (address) {
        return blindAuctionProxies[id];
    }

    // function getAuctionByNftId(bytes32 _nftId) public view returns (address){
    //     return auctionAddress[_nftId];
    // }

    event BlindAuctionCloneCreated(
        address blindAuctionContract,
        address beneficiary,
        uint256 numAuctions,
        address[] blindAuctionProxies,
        bytes32 _nftId
    );
}
