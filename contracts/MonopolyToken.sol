// SPDX-License-Identifier: MIT
pragma solidity ^0.8.28;

import "@openzeppelin/contracts/token/ERC721/ERC721.sol";
import "@openzeppelin/contracts/access/Ownable.sol";

contract MonopolyToken is ERC721, Ownable {
    uint256 private _tokenIdCounter;
    mapping(uint256 => string) private _tokenURIs;
    mapping(address => uint256) private _ownershipCounts;

    struct Property {
        string name;
        string propertyType; // maison, gare, hotel
        string location;
        uint256 value;
        uint256 surface;
        string documentHash;
        string imageHash;
        uint256 createdAt;
        uint256 lastTransferAt;
        bool forSale;
        uint256 salePrice;
    }

    mapping(uint256 => Property) private _properties;
    bool private _initialized = false;
    bool private _initializing = false;


    constructor() ERC721("MonopolyToken", "MPT") Ownable(msg.sender) {}

 modifier limitPossession(address owner) {
    require(_initializing || _ownershipCounts[owner] < 4, "Max 4 properties allowed");
    _;
}

    function _setTokenURI(uint256 tokenId, string memory _tokenURI) internal {
        _tokenURIs[tokenId] = _tokenURI;
    }

    function tokenURI(uint256 tokenId) public view override returns (string memory) {
        return _tokenURIs[tokenId];
    }

    function mintMonopolyToken(
        address to,
        string memory name,
        string memory propertyType,
        string memory location,
        uint256 value,
        uint256 surface,
        string memory documentHash,
        string memory imageHash
    ) public onlyOwner limitPossession(to) {
        uint256 tokenId = _tokenIdCounter;
        _tokenIdCounter++;
        _safeMint(to, tokenId);

        _properties[tokenId] = Property({
            name: name,
            propertyType: propertyType,
            location: location,
            value: value,
            surface: surface,
            documentHash: documentHash,
            imageHash: imageHash,
            createdAt: block.timestamp,
            lastTransferAt: block.timestamp,
            forSale: false,
            salePrice: 0
        });

        string memory metadata = string(
            abi.encodePacked(
                '{"name":"', name,
                '","type":"', propertyType,
                '","location":"', location,
                '","value":"', uint2str(value),
                ' ETH","surface":"', uint2str(surface),
                ' m2","documentHash":"', documentHash,
                '","imageHash":"', imageHash, '"}'
            )
        );

        _setTokenURI(tokenId, metadata);

        _ownershipCounts[to]++;
    }
function createProperty(
    address owner,
    string memory name,
    string memory propertyType,
    string memory location,
    uint256 value,
    uint256 surface,
    string memory documentHash,
    string memory imageHash,
    bool forSale,
    uint256 salePrice
) public onlyOwner {
    uint256 tokenId = _tokenIdCounter;
    _tokenIdCounter++;
    _safeMint(owner, tokenId);

    _properties[tokenId] = Property({
        name: name,
        propertyType: propertyType,
        location: location,
        value: value,
        surface: surface,
        documentHash: documentHash,
        imageHash: imageHash,
        createdAt: block.timestamp,
        lastTransferAt: block.timestamp,
        forSale: forSale,
        salePrice: salePrice
    });

    string memory metadata = string(
        abi.encodePacked(
            '{"name":"', name,
            '","type":"', propertyType,
            '","location":"', location,
            '","value":"', uint2str(value),
            ' ETH","surface":"', uint2str(surface),
            ' m2","documentHash":"', documentHash,
            '","imageHash":"', imageHash, '"}'
        )
    );

    _setTokenURI(tokenId, metadata);

    _ownershipCounts[owner]++;
}



    function tradeProperty(
        uint256[] memory tokenIdsFromUser1,
        uint256[] memory tokenIdsFromUser2,
        address user2
    ) public {
        require(tokenIdsFromUser1.length > 0, "User1 must trade at least one property");
        require(tokenIdsFromUser2.length > 0, "User2 must trade at least one property");

        // Verify ownership for user1
        for (uint256 i = 0; i < tokenIdsFromUser1.length; i++) {
            require(ownerOf(tokenIdsFromUser1[i]) == msg.sender, "User1 does not own all these properties");
        }

        // Verify ownership for user2
        for (uint256 i = 0; i < tokenIdsFromUser2.length; i++) {
            require(ownerOf(tokenIdsFromUser2[i]) == user2, "User2 does not own all these properties");
        }

        // Execute the trade
        for (uint256 i = 0; i < tokenIdsFromUser1.length; i++) {
            _transfer(msg.sender, user2, tokenIdsFromUser1[i]);
        }
        for (uint256 i = 0; i < tokenIdsFromUser2.length; i++) {
            _transfer(user2, msg.sender, tokenIdsFromUser2[i]);
        }
    }

    function sellProperty(uint256 tokenId, uint256 price) public {
        require(ownerOf(tokenId) == msg.sender, "You do not own this property");
        require(price > 0, "Price must be greater than zero");

        Property storage property = _properties[tokenId];
        property.forSale = true;
        property.salePrice = price;

        emit PropertyListedForSale(tokenId, price);
    }

    function buyProperty(uint256 tokenId) public payable {
        Property storage property = _properties[tokenId];
        require(property.forSale, "Property is not for sale");
        require(msg.value >= property.salePrice, "Insufficient funds to buy the property");

        address seller = ownerOf(tokenId);

        // Transfer the property
        _transfer(seller, msg.sender, tokenId);

        // Update property details
        property.forSale = false;
        property.salePrice = 0;
        property.lastTransferAt = block.timestamp;

        // Update ownership counts
        _ownershipCounts[seller]--;
        _ownershipCounts[msg.sender]++;

        // Transfer payment to the seller
        payable(seller).transfer(msg.value);

        emit PropertySold(tokenId, seller, msg.sender, msg.value);
    }

    function totalSupply() public view returns (uint256) {
        return _tokenIdCounter;
    }

    function uint2str(uint256 _i) internal pure returns (string memory) {
        if (_i == 0) {
            return "0";
        }
        uint256 j = _i;
        uint256 len;
        while (j != 0) {
            len++;
            j /= 10;
        }
        bytes memory bstr = new bytes(len);
        uint256 k = len;
        while (_i != 0) {
            k = k - 1;
            uint8 temp = (48 + uint8(_i - (_i / 10) * 10));
            bytes1 b1 = bytes1(temp);
            bstr[k] = b1;
            _i /= 10;
        }
        return string(bstr);
    }

    function getPropertyDetails(uint256 tokenId) public view returns (
    string memory name,
    string memory propertyType,
    string memory location,
    uint256 value,
    uint256 surface,
    string memory documentHash,
    string memory imageHash,
    uint256 createdAt,
    uint256 lastTransferAt,
    bool forSale,
    uint256 salePrice
) {

    Property memory property = _properties[tokenId];
    return (
        property.name,
        property.propertyType,
        property.location,
        property.value,
        property.surface,
        property.documentHash,
        property.imageHash,
        property.createdAt,
        property.lastTransferAt,
        property.forSale,
        property.salePrice
    );
}


    event PropertyListedForSale(uint256 tokenId, uint256 price);
    event PropertySold(uint256 tokenId, address seller, address buyer, uint256 price);
}
