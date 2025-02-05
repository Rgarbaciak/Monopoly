import { ethers } from "ethers";
import MonopolyTokenABI from "../MonopolyTokenABI.json"; // Remplace par le chemin correct vers ton ABI

// Adresse de déploiement du contrat (à modifier avec l'adresse réelle après le déploiement)
const contractAddress = "ADRESSE_DU_CONTRAT";

let provider, signer, contract;

// Initialiser le provider (MetaMask)
const connectWallet = async () => {
  if (window.ethereum) {
    provider = new ethers.BrowserProvider(window.ethereum); // Version ethers.js v6.x
    await provider.send("eth_requestAccounts", []); // Demande la connexion à MetaMask
    signer = await provider.getSigner();
    contract = new ethers.Contract(contractAddress, MonopolyTokenABI, signer);
    return signer;
  } else {
    throw new Error("MetaMask n'est pas détecté. Veuillez l'installer !");
  }
};

// Récupérer le provider actuel
const getProvider = () => {
  if (!provider)
    throw new Error("Provider non initialisé. Connectez d'abord votre wallet.");
  return provider;
};

// Récupérer le signer actuel
const getSigner = () => {
  if (!signer)
    throw new Error("Signer non initialisé. Connectez d'abord votre wallet.");
  return signer;
};

// Initialiser le contrat (avec le signer)
const getContract = () => {
  if (!contract)
    throw new Error("Contrat non initialisé. Connectez d'abord votre wallet.");
  return contract;
};

// Acheter une propriété
const buyProperty = async (name, type, price) => {
  const contract = getContract();
  const tx = await contract.mintProperty(name, type, {
    value: ethers.parseEther(price.toString()), // Convertir le prix en Wei
  });
  await tx.wait(); // Attendre la confirmation de la transaction
  return tx;
};

// Récupérer toutes les propriétés
const getProperties = async () => {
  const contract = getContract();
  const totalSupply = await contract.totalSupply(); // Nombre total de propriétés mintées
  const properties = [];
  for (let i = 0; i < totalSupply; i++) {
    const tokenURI = await contract.tokenURI(i); // Récupère l'URI du token
    const response = await fetch(tokenURI); // Récupère les métadonnées depuis l'URI
    const metadata = await response.json();
    properties.push(metadata);
  }
  return properties;
};

// Échanger des propriétés
const tradeProperty = async (tokenId1, tokenId2) => {
  const contract = getContract();
  const tx = await contract.tradeProperty(tokenId1, tokenId2); // Appelle la fonction d'échange
  await tx.wait(); // Attendre la confirmation de la transaction
  return tx;
};

export {
  connectWallet,
  getProvider,
  getSigner,
  getContract,
  buyProperty,
  getProperties,
  tradeProperty,
};
