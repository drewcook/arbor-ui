// SPDX-License-Identifier: MIT
pragma solidity >=0.8.0;

import "@openzeppelin/contracts/token/ERC721/ERC721.sol";
import "@openzeppelin/contracts/utils/Counters.sol";
import "@openzeppelin/contracts/access/Ownable.sol";
import "@openzeppelin/contracts/utils/math/SafeMath.sol";


contract PolyEchoNFT is ERC721, Ownable {
	  using SafeMath for uint256;
    using Counters for Counters.Counter;
    Counters.Counter private _tokenIds;

    // Fields
    string public displayName = "PolyEcho Audio NFT";
    string public companyName = "PolyEcho";
    uint256 public constant mintPrice = 10000000000000000; // 0.01 ETH

		// Events
    event NameUpdated(string name);
    event TokenCreated(uint256 _tokenId, string _tokenURI);
		event NftBought(uint256 _tokenId, address _seller, address _buyer, uint256 _price);
		event SellerPaid(uint256 _tokenId, uint256 _price);
		event RoyaltiesPaid(uint256 _tokenId, uint256 _price, address[] _contributors);

		// Mapping of tokenIDs to their current data points
    mapping(uint256 => string) tokenIdToUri;
    mapping(uint256 => address[]) public tokenIdToContributors;
    mapping (uint256 => uint256) public tokenIdToPrice;

    constructor() ERC721("PolyEcho", "ECHO") {}

    function updateDisplayName(string calldata _name) external onlyOwner {
        displayName = _name;
        emit NameUpdated(_name);
    }

    function getContributors(uint256 tokenId)
        public
        view
        returns (address[] memory)
    {
        require(
            _exists(tokenId),
            "ERC721: Contributor query for nonexistent token"
        );

        return tokenIdToContributors[tokenId];
    }

    function tokenURI(uint256 tokenId)
        public
        view
        override
        returns (string memory)
    {
        require(
            _exists(tokenId),
            "ERC721Metadata: URI query for nonexistent token"
        );
        return tokenIdToUri[tokenId];
    }

		// Both mints a new token and pays out value equally to sample contributors
    function mintAndBuy(
        address _buyer,
        string calldata _metadataURI,
        address payable[] calldata _contributors
    ) public payable returns (uint256, string memory) {
				// Require sender is paying the mint price
        require(
            msg.value >= mintPrice,
            "Sent ether value is not enough to mint"
        );

				// Update local state
        uint256 tokenId = _tokenIds.current();
        tokenIdToUri[tokenId] = _metadataURI;
        tokenIdToContributors[tokenId] = _contributors;

				// Mint the new token for the buyer
        _safeMint(_buyer, tokenId);

				// Payout out value sent from buyer equally to contributors
        for (uint256 i = 0; i < _contributors.length; i++) {
            address payable contributor = _contributors[i];
            contributor.transfer(msg.value / _contributors.length);
        }

				// Emit event with new metadata url
        string memory newURI = tokenURI(tokenId);
        emit TokenCreated(tokenId, newURI);

				// Auto-increment for next mint
        _tokenIds.increment();

				// Return back a tuple with new metadataURL and tokenId
        return (tokenId, newURI);
    }

		// This is called when an owner wants to list the NFT for sale and sets a price.
    function allowBuy(uint256 _tokenId, uint256 _price) external {
        require(msg.sender == ownerOf(_tokenId), 'Not owner of this token');
        require(_price > 0, 'Price zero');
        tokenIdToPrice[_tokenId] = _price;
    }

		// This is called when an owner wants to remove the NFT from being for sale.
    function disallowBuy(uint256 _tokenId) external {
        require(msg.sender == ownerOf(_tokenId), 'Not owner of this token');
        tokenIdToPrice[_tokenId] = 0;
    }

    function buy(uint256 _tokenId) external payable {
        uint256 price = tokenIdToPrice[_tokenId];
				// Check if for sale, based off of zero value
        require(price > 0, 'This token is not for sale');
				// Check for right sale price
        require(msg.value == price, 'Incorrect value');

				// Make the transfer of ownership
        address seller = ownerOf(_tokenId);
        safeTransferFrom(seller, msg.sender, _tokenId);

				// Make the transfer of funds from sale price
				// 10% - Royalties to all contributors, evenly split
				// 90% - Sale proceeds to seller
				uint256 royaltiesCut = msg.value.div(10);
				uint256 sellersCut = msg.value.div(10).mul(9);
				address[] storage contributors = tokenIdToContributors[_tokenId];

				// Payout out royalties evently amongst contributors
        for (uint256 i = 0; i < contributors.length; i++) {
            address contributor = contributors[i];
            payable(contributor).transfer(royaltiesCut / contributors.length);
        }

				// Pay out the sellers cut
        payable(seller).transfer(sellersCut);

				// The NFT is not for sale anymore, set zero value
				tokenIdToPrice[_tokenId] = 0;

				// Emit events
        emit NftBought(_tokenId, seller, msg.sender, msg.value);
				emit SellerPaid(_tokenId, sellersCut);
				emit RoyaltiesPaid(_tokenId, royaltiesCut, contributors);
    }
}
