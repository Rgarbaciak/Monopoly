// SPDX-License-Identifier: MIT
pragma solidity ^0.8.28;

import "@openzeppelin/contracts/token/ERC721/ERC721.sol";
import "@openzeppelin/contracts/access/Ownable.sol";

contract MonopolyToken is ERC721, Ownable {
    uint256 private _tokenIdCounter;
    mapping(uint256 => string) private _tokenURIs;
    mapping(address => uint256) private _ownershipCounts;
    mapping(address => uint256) private _lastTransactionTime;
    mapping(address => uint256) private _purchaseLock;
    mapping(uint256 => address[]) private _previousOwners;
    mapping(address => uint256) private _purchaseLockTime;

    struct Property {
        string name;
        string propertyType;
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
        require(
            _initializing || _ownershipCounts[owner] < 4,
            "Max 4 properties allowed"
        );
        _;
    }
    modifier purchaseLock() {
        require(
            block.timestamp >= _purchaseLock[msg.sender] + 600,
            "Wait 10 min before new purchase"
        );
        _;
    }

    modifier transactionCooldown() {
        require(
            block.timestamp >= _lastTransactionTime[msg.sender] + 300,
            "Wait 5 min before next transaction"
        );
        _;
    }

    function _setTokenURI(uint256 tokenId, string memory _tokenURI) internal {
        _tokenURIs[tokenId] = _tokenURI;
    }

    function tokenURI(
        uint256 tokenId
    ) public view override returns (string memory) {
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
                '{"name":"',
                name,
                '","type":"',
                propertyType,
                '","location":"',
                location,
                '","value":"',
                uint2str(value),
                ' ETH","surface":"',
                uint2str(surface),
                ' m2","documentHash":"',
                documentHash,
                '","imageHash":"',
                imageHash,
                '"}'
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
                '{"name":"',
                name,
                '","type":"',
                propertyType,
                '","location":"',
                location,
                '","value":"',
                uint2str(value),
                ' ETH","surface":"',
                uint2str(surface),
                ' m2","documentHash":"',
                documentHash,
                '","imageHash":"',
                imageHash,
                '"}'
            )
        );

        _setTokenURI(tokenId, metadata);

        _ownershipCounts[owner]++;
    }

    function updateProperty(
        uint256 tokenId,
        uint256 newValue,
        uint256 newSurface,
        bool newForSale,
        uint256 newSalePrice
    ) public {
        require(
            ownerOf(tokenId) == msg.sender,
            "You are not the owner of this property"
        );

        Property storage property = _properties[tokenId];

        property.value = newValue;
        property.surface = newSurface;
        property.forSale = newForSale;
        property.salePrice = newSalePrice;

        emit PropertyUpdated(
            tokenId,
            newValue,
            newSurface,
            newForSale,
            newSalePrice
        );
    }

    event PropertyUpdated(
        uint256 tokenId,
        uint256 newValue,
        uint256 newSurface,
        bool newForSale,
        uint256 newSalePrice
    );
    event PropertyTransferred(
        uint256 indexed tokenId,
        address indexed from,
        address indexed to,
        uint256 value
    );

    struct TradeRequest {
        address user1;
        uint256[] user1Tokens;
        address user2;
        uint256[] user2Tokens;
        bool accepted;
    }

    mapping(uint256 => TradeRequest) public tradeRequests;
    uint256 public tradeCounter;
    function proposeTrade(
        uint256[] memory tokenIdsFromUser1,
        uint256[] memory tokenIdsFromUser2,
        address user2
    ) public {
        require(msg.sender != user2, "You cannot trade with yourself");

        require(
            tokenIdsFromUser1.length > 0,
            "You must exchange at least one token"
        );
        require(
            tokenIdsFromUser2.length > 0,
            "The other user must exchange at least one token"
        );
        (
            uint256 houses1,
            uint256 stations1,
            uint256 hotels1
        ) = getPropertyTypeCount(tokenIdsFromUser1);
        (
            uint256 houses2,
            uint256 stations2,
            uint256 hotels2
        ) = getPropertyTypeCount(tokenIdsFromUser2);

        require(
            (houses1 == houses2 &&
                stations1 == stations2 &&
                hotels1 == hotels2) ||
                (houses1 == 3 && stations2 == 1) ||
                (houses2 == 3 && stations1 == 1) ||
                (houses1 == 4 && hotels2 == 1) ||
                (houses2 == 4 && hotels1 == 1),
            "Exchange must be of equivalent value"
        );

        tradeRequests[tradeCounter] = TradeRequest({
            user1: msg.sender,
            user1Tokens: tokenIdsFromUser1,
            user2: user2,
            user2Tokens: tokenIdsFromUser2,
            accepted: false
        });

        tradeCounter++;
    }
    function acceptTrade(uint256 tradeId) public {
        TradeRequest storage trade = tradeRequests[tradeId];

        require(
            msg.sender == trade.user2,
            "Only the second user can accept the exchange"
        );

        for (uint256 i = 0; i < trade.user1Tokens.length; i++) {
            _previousOwners[trade.user1Tokens[i]].push(
                ownerOf(trade.user1Tokens[i])
            );

            _transfer(trade.user1, trade.user2, trade.user1Tokens[i]);
        }
        for (uint256 i = 0; i < trade.user2Tokens.length; i++) {
            _previousOwners[trade.user2Tokens[i]].push(
                ownerOf(trade.user2Tokens[i])
            );

            _transfer(trade.user2, trade.user1, trade.user2Tokens[i]);
        }

        trade.accepted = true;
        _lastTransactionTime[msg.sender] = block.timestamp;
    }
    function getUserPropertiesByAddress(
        address user
    ) public view returns (uint256[] memory) {
        uint256 totalProperties = totalSupply();
        uint256 count = 0;

        require(user != address(0), "Adresse utilisateur invalide");

        for (uint256 i = 0; i < totalProperties; i++) {
            if (ownerOf(i) == user) {
                count++;
            }
        }

        if (count == 0) {
            return new uint256[](0);
        }

        // Créer un tableau pour stocker les IDs des propriétés
        uint256[] memory userProperties = new uint256[](count);
        uint256 index = 0;

        for (uint256 i = 0; i < totalProperties; i++) {
            if (ownerOf(i) == user) {
                userProperties[index] = i;
                index++;
            }
        }

        return userProperties;
    }

    function tradeProperty(
        uint256[] memory tokenIdsFromUser1,
        uint256[] memory tokenIdsFromUser2,
        address user2
    ) public {
        require(
            tokenIdsFromUser1.length > 0,
            "User1 must trade at least one property"
        );
        require(
            tokenIdsFromUser2.length > 0,
            "User2 must trade at least one property"
        );

        for (uint256 i = 0; i < tokenIdsFromUser1.length; i++) {
            require(
                ownerOf(tokenIdsFromUser1[i]) == msg.sender,
                "User1 does not own all these properties"
            );
        }

        // Verify ownership for user2
        for (uint256 i = 0; i < tokenIdsFromUser2.length; i++) {
            require(
                ownerOf(tokenIdsFromUser2[i]) == user2,
                "User2 does not own all these properties"
            );
        }

        // Execute the trade
        for (uint256 i = 0; i < tokenIdsFromUser1.length; i++) {
            _previousOwners[tokenIdsFromUser1[i]].push(
                ownerOf(tokenIdsFromUser1[i])
            );

            _transfer(msg.sender, user2, tokenIdsFromUser1[i]);
        }
        for (uint256 i = 0; i < tokenIdsFromUser2.length; i++) {
            _previousOwners[tokenIdsFromUser2[i]].push(
                ownerOf(tokenIdsFromUser2[i])
            );

            _transfer(user2, msg.sender, tokenIdsFromUser2[i]);
        }
        _lastTransactionTime[msg.sender] = block.timestamp;
    }

    function sellProperty(uint256 tokenId, uint256 price) public {
        require(ownerOf(tokenId) == msg.sender, "You do not own this property");
        require(price > 0, "Price must be greater than zero");

        Property storage property = _properties[tokenId];
        property.forSale = true;
        property.salePrice = price;

        emit PropertyListedForSale(tokenId, price);
    }

    function buyProperty(
        uint256 tokenId
    ) public payable transactionCooldown limitPossession(msg.sender) {
        Property storage property = _properties[tokenId];

        require(property.forSale, "Property is not for sale");
        require(msg.value >= property.salePrice, "Insufficient funds");
        require(
            ownerOf(tokenId) != msg.sender,
            "You cannot buy your own property"
        );

        // Vérification cooldown
        require(
            block.timestamp >= _lastTransactionTime[msg.sender] + 300,
            "Wait 5 minutes before buying again"
        );

        // Vérification lock 10 minutes
        require(
            block.timestamp >= _purchaseLock[msg.sender] + 600,
            "Wait 10 minutes after purchase"
        );

        // Vérification max 4 propriétés
        require(_ownershipCounts[msg.sender] < 4, "Max 4 properties allowed");

        address seller = ownerOf(tokenId);
        _previousOwners[tokenId].push(seller);
        _transfer(seller, msg.sender, tokenId);

        property.forSale = false;
        property.salePrice = 0;
        property.lastTransferAt = block.timestamp;

        _ownershipCounts[seller]--;
        _ownershipCounts[msg.sender]++;
        _lastTransactionTime[msg.sender] = block.timestamp;
        _purchaseLock[msg.sender] = block.timestamp;

        payable(seller).transfer(msg.value);

        emit PropertyTransferred(tokenId, seller, msg.sender, msg.value);
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
    function getPropertyTypeCount(
        uint256[] memory tokenIds
    ) internal view returns (uint256 houses, uint256 stations, uint256 hotels) {
        for (uint256 i = 0; i < tokenIds.length; i++) {
            if (
                keccak256(bytes(_properties[tokenIds[i]].propertyType)) ==
                keccak256(bytes("maison"))
            ) {
                houses++;
            } else if (
                keccak256(bytes(_properties[tokenIds[i]].propertyType)) ==
                keccak256(bytes("gare"))
            ) {
                stations++;
            } else if (
                keccak256(bytes(_properties[tokenIds[i]].propertyType)) ==
                keccak256(bytes("hotel"))
            ) {
                hotels++;
            }
        }
    }

    function getPropertyDetails(
        uint256 tokenId
    )
        public
        view
        returns (
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
        )
    {
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
    event PropertySold(
        uint256 tokenId,
        address seller,
        address buyer,
        uint256 price
    );
    function getPreviousOwners(
        uint256 tokenId
    ) public view returns (address[] memory) {
        return _previousOwners[tokenId];
    }

    function getCooldownAndOwnershipInfo(
        address user
    )
        public
        view
        returns (
            uint256 lastTxTime,
            uint256 nextAllowedTx,
            uint256 purchaseLockTime,
            uint256 propertiesOwned
        )
    {
        require(user != address(0), "Adresse utilisateur invalide");

        uint256 lastTx = _lastTransactionTime[user];
        uint256 nextTx = lastTx + 300;
        uint256 lockTime = _purchaseLockTime[user] + 600;
        uint256 ownedProps = _ownershipCounts[user];

        return (
            lastTx > 0 ? lastTx : 0,
            nextTx > 0 ? nextTx : 0,
            lockTime > 0 ? lockTime : 0,
            ownedProps > 0 ? ownedProps : 0
        );
    }
}
