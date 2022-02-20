// contracts/GameItem.sol
// SPDX-License-Identifier: MIT
pragma solidity >=0.8.0;

import "@openzeppelin/contracts/token/ERC721/ERC721.sol";
import "@openzeppelin/contracts/utils/Counters.sol";
import "@openzeppelin/contracts/access/Ownable.sol";

contract Sample is ERC721, Ownable {
    using Counters for Counters.Counter;
    Counters.Counter private _tokenIds;

    // Fields
    string public displayName = "Sampled PolyEcho NFT!";
    string public companyName = "PolyEcho";
    address[] public contributors;

    // Events
    event NameUpdated(string name);
    event TokenCreated(string tokenURI);

    constructor() ERC721("PolyEchoSample", "PES") {}

    function updateName(string calldata _name) external onlyOwner {
        displayName = _name;
        emit NameUpdated(_name);
    }

    // address, string calldata _sampleMetadataURI, address[] calldata _contributors
    function buySample(address _buyer) public returns (string memory) {
        // 1.Add contributors to local state

        // 2. Increment to create uniqueness
        // Increament the counter to ensure uniqueness (Chainline VRF?)
        _tokenIds.increment();
        uint256 newSampleId = _tokenIds.current();

        // 3. Mint and transfer to buyer
        _safeMint(_buyer, /* _sampleMetadataURI */);

        // 4. Transfer proceeds out equally to contributors
        // Maybe the function is built into the ERC721 standard? safeTransferFrom()? _safeTransfer()?

        // Update the tokenUri and emit event ?? THIS NEEDS SOME IRONING OUT
        string memory newSampleURI = tokenURI(newSampleId);
        emit TokenCreated(newSampleURI);

        // Return the new URI
        return newSampleURI;
    }
}
