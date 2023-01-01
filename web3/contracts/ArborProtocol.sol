// SPDX-License-Identifier: MIT
pragma solidity >=0.8.4;

import "@openzeppelin/contracts/token/ERC1155/ERC1155.sol";
import "@openzeppelin/contracts/utils/Counters.sol";
import "@openzeppelin/contracts/access/Ownable.sol";
import "@openzeppelin/contracts/utils/math/SafeMath.sol";


contract ArborAudioCollections is ERC1155, Ownable {
	  using SafeMath for uint256;
    using Counters for Counters.Counter;
    Counters.Counter private _tokenIds;

    // Fields
    uint256 public constant mintPrice = 10000000000000000; // 0.01 ETH

		// Events
    event CollectionNameUpdated(string name,uint256 _tokenId);
    event TokenCreated(uint256 _tokenId, string _tokenURI);
		event ListedForSale(address _lister, uint256 _tokenId, uint256 _price,uint256 _tokenIndex);
		event RemovedForSale(address _lister, uint256 _tokenId,uint256 _tokenIndex);
		event NftBought(uint256 _tokenId, address _seller, address _buyer, uint256 _price,uint256 _tokenIndex);
		event SellerPaid(uint256 _tokenId, uint256 _price);
		event RoyaltiesPaid(uint256 _tokenId, uint256 _price, address[] _contributors);

		// Mapping of tokenIDs to their current data points
    mapping(uint256 => string) tokenIdToUri;
    mapping(uint256 => address[]) public tokenIdToContributors;
    mapping (uint256 => mapping(uint256 => uint256)) public tokenIdToPrice;
    mapping(uint256 => uint256) public tokenIdToTotalSupply;
    mapping(uint256 => address) public tokenIdToInitialOwner;
    mapping(uint256 => string) public tokenIdToCollectionName;

    // Mapping from token ID to owner address
    mapping(uint256 => mapping(uint256 => address)) public  tokenIdToOwners;

    constructor() ERC1155("") {}

    function updateCollectionName(string calldata _name,uint256 _tokenId) external {

        require(_exists(_tokenId),"ERC1155: CollectionName query for nonexistent token");

        address _initialOwner = tokenIdToInitialOwner[_tokenId];

        require(msg.sender == _initialOwner,"Not owner of this token");

        tokenIdToCollectionName[_tokenId] = _name;

        emit CollectionNameUpdated(_name,_tokenId);
    }

    function _exists(uint256 tokenId) internal view virtual returns (bool) {
        return tokenIdToTotalSupply[tokenId] > 0;
    }

    function getContributors(uint256 tokenId)
        public
        view
        returns (address[] memory)
    {
        require(
            _exists(tokenId),
            "ERC1155: Contributor query for nonexistent token"
        );

        return tokenIdToContributors[tokenId];
    }

    function tokenURI(uint256 tokenId)
        public
        view
        returns (string memory)
    {
        require(
            _exists(tokenId),
            "ERC1155Metadata: URI query for nonexistent token"
        );
        return tokenIdToUri[tokenId];
    }

		// Both mints a new token and pays out value equally to stem contributors
    function mintAndBuy(
        address _buyer,
        uint256 _amount,
        string calldata _metadataURI,
        string calldata _collectionName,
        address payable[] calldata _contributors
    ) public payable returns (uint256, string memory) {
				// Require sender is paying the mint price
        require(
            msg.value >= (mintPrice * _amount),
            "Sent ether value is not enough to mint"
        );

				// Update local state
				// Auto-increment, also we can start minting from 1 instead of 0
				_tokenIds.increment();
        uint256 newTokenId = _tokenIds.current();
        tokenIdToUri[newTokenId] = _metadataURI;
        tokenIdToContributors[newTokenId] = _contributors;

				// Mint the new token for the buyer
				// Buyer becomes owner
        _mint(_buyer, newTokenId, _amount,"");

        //Mapp initial owner to token id
        tokenIdToInitialOwner[newTokenId] = _buyer;

        //Mapp collectionName to token id
        tokenIdToCollectionName[newTokenId] = _collectionName;

        // Mapp total Supply to token id
        tokenIdToTotalSupply[newTokenId] = _amount;
				
        // Mapp owner to token id
        for (uint256 i = 1; i <= _amount; i++) {
            tokenIdToOwners[newTokenId][i] = _buyer;
        }

				// Payout out value sent from buyer equally to contributors
        for (uint256 i = 0; i < _contributors.length; i++) {
            address payable contributor = _contributors[i];
            contributor.transfer(msg.value / _contributors.length);
        }

				// Emit event with new metadata url
        string memory newTokenURI = tokenURI(newTokenId);
        emit TokenCreated(newTokenId, newTokenURI);

				// Return back a tuple with new metadataURL and tokenId
        return (newTokenId, newTokenURI);
    }

		// This is called when an owner wants to list the NFT for sale and sets a price.
    function allowBuy(uint256 _tokenId, uint256 _price, uint256 _tokenIndex) external {
        address _owner = tokenIdToOwners[_tokenId][_tokenIndex];
				// Only an owner can list it
        require(msg.sender == _owner, 'Not owner of this token');
				// Required a sale price
        require(_price > 0, 'Price zero');

				// Set the sale price
        tokenIdToPrice[_tokenId][_tokenIndex] = _price;

				// Emit the event
				emit ListedForSale(msg.sender, _tokenId, _price,_tokenIndex);
    }

		// This is called when an owner wants to remove the NFT from being for sale.
    function disallowBuy(uint256 _tokenId,uint256 _tokenIndex) external {
        address _owner = tokenIdToOwners[_tokenId][_tokenIndex];
				// Only an owner can unlist it
        require(msg.sender == _owner, 'Not owner of this token');

				// Unlist the tokenId, null price
        tokenIdToPrice[_tokenId][_tokenIndex] = 0;

				// Emit the event
				emit RemovedForSale(msg.sender, _tokenId,_tokenIndex);
    }

		// This is called when a caller wants to buy a token at its sale price
		// The msg.sender is already pre-approved to buy the token, as set in allowBuy()
    function buy(uint256 _tokenId,uint256 _tokenIndex) external payable {
				// Get the current sale price
        uint256 price = tokenIdToPrice[_tokenId][_tokenIndex];
        address seller = tokenIdToOwners[_tokenId][_tokenIndex];

				// Check if for sale, based off of zero value
        require(price > 0, 'This token is not for sale');

				// Check for right sale price
        require(msg.value == price, 'Incorrect value');

        // Check for token balance
        require(balanceOf(seller,_tokenId) > 0,'Not enough token balance');

				// Make the transfer of ownership
				// Approve any buyer, rather than seller manually approving a buyer/offer

				_setApprovalForAll(seller,msg.sender, true);
				safeTransferFrom(seller, msg.sender, _tokenId,1,"");

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
				tokenIdToPrice[_tokenId][_tokenIndex] = 0;

        // Mapp tokenIndex to new owner
        tokenIdToOwners[_tokenId][_tokenIndex] = msg.sender;

				// Emit events
        emit NftBought(_tokenId, seller, msg.sender, msg.value,_tokenIndex);
				emit SellerPaid(_tokenId, sellersCut);
				emit RoyaltiesPaid(_tokenId, royaltiesCut, contributors);
    }
}
