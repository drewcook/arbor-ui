// contracts/GameItem.sol
// SPDX-License-Identifier: MIT
pragma solidity >=0.8.0;

import "@openzeppelin/contracts/token/ERC721/ERC721.sol";
import "@openzeppelin/contracts/utils/Counters.sol";
import "@openzeppelin/contracts/access/Ownable.sol";

contract PolyechoSample is ERC721, Ownable {
    using Counters for Counters.Counter;
    Counters.Counter private _tokenIds;

    // Fields
    string public displayName = "Sampled PolyEcho NFT!";
    string public companyName = "PolyEcho";
    mapping(uint256=> address[]) public contributors;
    mapping(uint256=> string) tokenURIs;
    uint256 public constant mintPrice = 10000000000000000; // 0.01 ETH
    // Events
    event NameUpdated(string name);
    event TokenCreated(string tokenURI);

    constructor() ERC721("PolyEchoSample", "PES") {}

    function updateName(string calldata _name) external onlyOwner {
        displayName = _name;
        emit NameUpdated(_name);
    }

    function getContributors(uint256 tokenId) public view returns (address[] memory){
        require(_exists(tokenId), "ERC721: Contributor query for nonexistent token");

        return contributors[tokenId];
    }


    function tokenURI(uint256 tokenId) public view override returns (string memory) {
        require(_exists(tokenId), "ERC721Metadata: URI query for nonexistent token");
        return tokenURIs[tokenId];
    }


    function mint(address _buyer, string calldata _metadataURI, address payable[] calldata _contributors) public payable returns (string memory) {
        require(msg.value >= mintPrice, 'Sent ether value is invalid');        

        uint256 tokenId = _tokenIds.current();
        tokenURIs[tokenId] = _metadataURI;        
        contributors[tokenId] = _contributors;
        
        _safeMint(_buyer, tokenId);

        for(uint i = 0; i < _contributors.length; i++){
            address payable contributor = _contributors[i];
            contributor.transfer(msg.value / _contributors.length);
        }

        string memory newURI = tokenURI(tokenId);
        emit TokenCreated(newURI);

        _tokenIds.increment();
        return newURI;
    }
}
