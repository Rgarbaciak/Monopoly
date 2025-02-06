import { ethers, Contract } from "ethers";
import MonopolyTokenABI from "../MonopolyTokenABI.json";

const contractAddress = process.env.REACT_APP_CONTRACT_ADDRESS;

let provider, signer, contract;

const connectWallet = async () => {
  if (window.ethereum) {
    provider = new ethers.BrowserProvider(window.ethereum);
    await provider.send("eth_requestAccounts", []);
    signer = await provider.getSigner();
    contract = new Contract(contractAddress, MonopolyTokenABI.abi, signer);

    return signer;
  } else {
    throw new Error("MetaMask n'est pas détecté. Veuillez l'installer !");
  }
};

const getContract = () => {
  if (!contract)
    throw new Error("Contrat non initialisé. Connectez d'abord votre wallet.");
  return contract;
};
const getProperties = async () => {
  try {
    const contract = getContract();
    const totalSupply = await contract.totalSupply();
    console.log("Total Supply :", totalSupply.toString()); // Affiche totalSupply
    const properties = [];

    for (let i = 0; i < totalSupply; i++) {
      try {
        const propertyDetails = await contract.getPropertyDetails(i);
        const owner = await contract.ownerOf(i); // Récupère le propriétaire

        // Conversion explicite des BigInt en Number ou String
        properties.push({
          id: i,
          name: propertyDetails[0],
          type: propertyDetails[1],
          location: propertyDetails[2],
          value: ethers.formatEther(propertyDetails[3].toString()), // Convertir en String avant formatEther
          surface: Number(propertyDetails[4]), // Conversion explicite en Number
          documentHash: propertyDetails[5],
          imageHash: propertyDetails[6],
          createdAt: new Date(
            Number(propertyDetails[7]) * 1000
          ).toLocaleDateString(), // Conversion en Number
          lastTransferAt: new Date(
            Number(propertyDetails[8]) * 1000
          ).toLocaleDateString(), // Conversion en Number
          forSale: propertyDetails[9],
          salePrice: ethers.formatEther(propertyDetails[10].toString()), // Convertir en String avant formatEther
          owner: owner, // Ajout du propriétaire
        });
      } catch (err) {
        console.error(
          `Erreur lors de la récupération de la propriété ${i}:`,
          err
        );
      }
    }

    console.log("Propriétés récupérées :", properties);
    return properties;
  } catch (err) {
    console.error("Erreur lors de la récupération des propriétés :", err);
    throw err;
  }
};
const buyProperty = async (propertyId, salePrice) => {
  try {
    const contract = getContract(); // Assurez-vous que le contrat est initialisé
    const tx = await contract.buyProperty(propertyId, {
      value: ethers.parseEther(salePrice.toString()), // Montant à envoyer pour l'achat
    });
    await tx.wait(); // Attendre que la transaction soit confirmée
    console.log(`Propriété ${propertyId} achetée avec succès !`);
    return true;
  } catch (err) {
    console.error(
      `Erreur lors de l'achat de la propriété ${propertyId} :`,
      err
    );
    throw err;
  }
};

export { connectWallet, getContract, getProperties, buyProperty };
