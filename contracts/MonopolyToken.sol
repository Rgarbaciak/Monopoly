// SPDX-License-Identifier: MIT
pragma solidity ^0.8.28;

import "@openzeppelin/contracts/token/ERC721/ERC721.sol";
import "@openzeppelin/contracts/access/Ownable.sol";

contract MonopolyToken is ERC721, Ownable {
    // Utilisation d'un uint256 simple pour le compteur de tokenId
    uint256 private _tokenIdCounter;

    // Mapping pour stocker les URIs des tokens
    mapping(uint256 => string) private _tokenURIs;

    // Constructeur initialisant les contrats ERC721 et Ownable
    constructor() ERC721("MonopolyToken", "MPT") Ownable(msg.sender) {}

    /// @dev Fonction interne pour définir l’URI d’un token.
    function _setTokenURI(uint256 tokenId, string memory _tokenURI) internal virtual {
        _tokenURIs[tokenId] = _tokenURI;
    }

    /// @notice Récupérer l’URI associée à un token (métadonnées)
    function tokenURI(uint256 tokenId) public view virtual override returns (string memory) {
        // Utilise ownerOf pour vérifier l'existence du token (ownerOf revert automatiquement si le token n'existe pas)
        ownerOf(tokenId);
        return _tokenURIs[tokenId];
    }

    /// @notice Fonction pour créer (mint) un nouveau NFT, réservée à l’owner
    /// @param to Adresse qui recevra le NFT
    /// @param _tokenURI URI pointant vers le JSON des métadonnées (par exemple sur IPFS)
    function mintMonopolyToken(address to, string memory _tokenURI) public onlyOwner {
        uint256 tokenId = _tokenIdCounter;
        _tokenIdCounter++;
        _safeMint(to, tokenId);
        _setTokenURI(tokenId, _tokenURI);
    }
}
