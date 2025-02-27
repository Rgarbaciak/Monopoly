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
    console.log("Total Supply :", totalSupply.toString());
    const properties = [];

    for (let i = 0; i < totalSupply; i++) {
      try {
        const propertyDetails = await contract.getPropertyDetails(i);
        const owner = await contract.ownerOf(i);
        properties.push({
          id: i,
          name: propertyDetails[0],
          type: propertyDetails[1],
          location: propertyDetails[2],
          value: ethers.formatEther(propertyDetails[3].toString()),
          surface: Number(propertyDetails[4]),
          documentHash: propertyDetails[5],
          imageHash: propertyDetails[6],
          createdAt: new Date(
            Number(propertyDetails[7]) * 1000
          ).toLocaleDateString(),
          lastTransferAt: new Date(
            Number(propertyDetails[8]) * 1000
          ).toLocaleDateString(),
          forSale: propertyDetails[9],
          salePrice: ethers.formatEther(propertyDetails[10].toString()),
          owner: owner,
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

const updateProperty = async (
  tokenId,
  newValue,
  newSurface,
  newForSale,
  newSalePrice
) => {
  try {
    const contract = getContract();
    const signer = await provider.getSigner();

    // Vérifications avant conversion
    const formattedValue = newValue
      ? ethers.parseEther(newValue.toString())
      : ethers.parseEther("0");
    const formattedSalePrice = newSalePrice
      ? ethers.parseEther(newSalePrice.toString())
      : ethers.parseEther("0");
    const formattedSurface = newSurface ? Number(newSurface) : 0;

    console.log("Données avant mise à jour :", {
      tokenId,
      formattedValue,
      formattedSurface,
      newForSale,
      formattedSalePrice,
    });

    const tx = await contract.connect(signer).updateProperty(
      tokenId,
      formattedValue, // Valeur convertie
      formattedSurface, // Surface convertie en nombre
      newForSale,
      formattedSalePrice // Prix converti en wei
    );

    await tx.wait();
    console.log(`Propriété ${tokenId} mise à jour avec succès !`);
  } catch (err) {
    console.error("Erreur lors de la mise à jour de la propriété :", err);
    alert(`Erreur lors de la mise à jour : ${err.message}`);
  }
};

const getUserTransactions = async (userAddress) => {
  try {
    const contract = getContract();

    console.log("Adresse du contrat :", contract.target);
    console.log("Adresse de l'utilisateur :", userAddress);

    // Récupérer les logs des transactions
    const filter = contract.filters.PropertyTransferred(
      null,
      null,
      userAddress
    );
    const logs = await contract.queryFilter(filter);

    console.log("Logs récupérés :", logs);

    const transactions = await Promise.all(
      logs.map(async (log) => {
        const block = await provider.getBlock(log.blockNumber); // Récupérer le block
        const date = new Date(block.timestamp * 1000).toLocaleDateString(); // Convertir timestamp

        return {
          tokenId: log.args.tokenId.toString(),
          from: log.args.from,
          to: log.args.to,
          value: ethers.formatEther(log.args.value.toString()),
          date: date, // Ajout de la date
        };
      })
    );

    console.log("Transactions formatées :", transactions);
    return transactions;
  } catch (err) {
    console.error(
      "Erreur lors de la récupération de l'historique des transactions :",
      err
    );
    return [];
  }
};

const getUserProperties = async () => {
  try {
    const contract = getContract();
    const signer = await provider.getSigner();
    const userAddress = await signer.getAddress(); // Récupération de l'adresse de l'utilisateur connecté

    const totalSupply = await contract.totalSupply();
    console.log("Total Supply :", totalSupply.toString());

    const userProperties = [];

    for (let i = 0; i < totalSupply; i++) {
      try {
        const propertyDetails = await contract.getPropertyDetails(i);
        const owner = await contract.ownerOf(i);

        // Vérifie si l'utilisateur connecté est propriétaire de la propriété
        if (owner.toLowerCase() === userAddress.toLowerCase()) {
          userProperties.push({
            id: i,
            name: propertyDetails[0],
            type: propertyDetails[1],
            location: propertyDetails[2],
            value: ethers.formatEther(propertyDetails[3].toString()),
            surface: Number(propertyDetails[4]),
            documentHash: propertyDetails[5],
            imageHash: propertyDetails[6],
            createdAt: new Date(
              Number(propertyDetails[7]) * 1000
            ).toLocaleDateString(),
            lastTransferAt: new Date(
              Number(propertyDetails[8]) * 1000
            ).toLocaleDateString(),
            forSale: propertyDetails[9],
            salePrice: ethers.formatEther(propertyDetails[10].toString()),
            owner: owner,
          });
        }
      } catch (err) {
        console.error(
          `Erreur lors de la récupération de la propriété ${i}:`,
          err
        );
      }
    }

    console.log("Propriétés de l'utilisateur :", userProperties);
    return userProperties;
  } catch (err) {
    console.error(
      "Erreur lors de la récupération des propriétés de l'utilisateur :",
      err
    );
    throw err;
  }
};

export {
  connectWallet,
  getContract,
  getProperties,
  buyProperty,
  updateProperty,
  getUserTransactions,
  getUserProperties,
};
