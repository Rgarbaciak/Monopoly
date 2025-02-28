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

const tradeProperty = async (tokenIdsFromUser1, tokenIdsFromUser2, user2) => {
  try {
    const contract = getContract();
    const signer = await provider.getSigner();

    console.log("Échange de propriétés en cours...");
    console.log("Propriétés User1 : ", tokenIdsFromUser1);
    console.log("Propriétés User2 : ", tokenIdsFromUser2);
    console.log("User2 : ", user2);

    const tx = await contract
      .connect(signer)
      .tradeProperty(tokenIdsFromUser1, tokenIdsFromUser2, user2);

    await tx.wait();
    console.log("Échange effectué avec succès !");
    return true;
  } catch (err) {
    console.error("Erreur lors de l'échange :", err);
    return false;
  }
};

const getUserPropertiesByAddress = async (userAddress) => {
  try {
    const contract = getContract();
    const propertyIds = await contract.getUserPropertiesByAddress(userAddress);

    // ✅ Vérifier si on reçoit bien un tableau valide
    console.log("IDs des propriétés récupérées :", propertyIds);

    if (!propertyIds || propertyIds.length === 0) {
      console.warn("L'utilisateur ne possède aucune propriété.");
      return [];
    }

    const properties = [];
    for (let i = 0; i < propertyIds.length; i++) {
      const propertyDetails = await contract.getPropertyDetails(propertyIds[i]);
      properties.push({
        id: propertyIds[i].toString(),
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
        owner: userAddress,
      });
    }

    console.log("Propriétés récupérées :", properties);
    return properties;
  } catch (err) {
    console.error("🚨 Erreur lors de la récupération des propriétés :", err);
    return [];
  }
};
const tradeWithMetaMask = async (toAddress, valueInEth) => {
  try {
    if (!window.ethereum) throw new Error("MetaMask n'est pas installé !");

    const provider = new ethers.BrowserProvider(window.ethereum);
    const signer = await provider.getSigner();
    const senderAddress = await signer.getAddress();

    console.log("📌 Envoi depuis :", senderAddress);
    console.log("📌 Envoi vers :", toAddress);
    console.log("📌 Montant :", valueInEth);

    const tx = await signer.sendTransaction({
      to: toAddress,
      value: ethers.parseEther(valueInEth.toString()), // Convertir en Wei
    });

    console.log("✅ Transaction envoyée :", tx);
    await tx.wait();
    console.log("🎉 Échange validé !");
    return tx;
  } catch (err) {
    console.error("🚨 Erreur lors de l'échange :", err);
    return null;
  }
};

const proposeTradeWithMetaMask = async (
  user1Tokens,
  user2Tokens,
  user2Address
) => {
  try {
    if (!window.ethereum) throw new Error("MetaMask n'est pas installé !");

    const provider = new ethers.BrowserProvider(window.ethereum);
    const signer = await provider.getSigner();
    const user1Address = await signer.getAddress();

    const tradeData = {
      user1: user1Address,
      user2: user2Address,
      user1Tokens: user1Tokens.join(","), // Stocker sous forme de chaîne
      user2Tokens: user2Tokens.join(","),
      timestamp: Date.now(),
    };

    console.log("📌 Échange proposé :", tradeData);

    const signature = await signer.signMessage(JSON.stringify(tradeData));

    console.log("✅ Signature générée :", signature);

    return { tradeData, signature };
  } catch (err) {
    console.error("🚨 Erreur lors de la signature de l'échange :", err);
    return null;
  }
};

const acceptTradeWithMetaMask = async (tradeData, signature) => {
  try {
    if (!window.ethereum) throw new Error("MetaMask n'est pas installé !");

    const provider = new ethers.BrowserProvider(window.ethereum);
    const signer = await provider.getSigner();
    const user2Address = await signer.getAddress();

    if (user2Address.toLowerCase() !== tradeData.user2.toLowerCase()) {
      throw new Error(
        "🚨 Vous n'êtes pas l'utilisateur autorisé à accepter cet échange !"
      );
    }

    const recoveredAddress = ethers.verifyMessage(
      JSON.stringify(tradeData),
      signature
    );

    if (recoveredAddress.toLowerCase() !== tradeData.user1.toLowerCase()) {
      throw new Error(
        "🚨 Signature invalide ! L'échange pourrait être falsifié."
      );
    }

    console.log("✅ Signature vérifiée ! L'échange est authentique.");

    const contract = getContract();
    const tx = await contract
      .connect(signer)
      .tradeProperty(
        tradeData.user1Tokens.split(",").map(Number),
        tradeData.user2Tokens.split(",").map(Number),
        tradeData.user2
      );

    await tx.wait();
    console.log("🎉 Échange validé et exécuté !");
    return true;
  } catch (err) {
    console.error("🚨 Erreur lors de l'acceptation de l'échange :", err);
    return false;
  }
};
const getCooldownAndOwnershipInfo = async (userAddress) => {
  try {
    const contract = getContract(); // Récupérer l'instance du contrat
    const cooldownData = await contract.getCooldownAndOwnershipInfo(
      userAddress
    );

    if (!cooldownData || cooldownData.length < 4) {
      console.error("❌ Données de cooldown invalides :", cooldownData);
      return {
        lastTxTime: 0,
        nextAllowedTx: 0,
        purchaseLockTime: 0,
        propertiesOwned: 0,
      };
    }

    return {
      lastTxTime: Number(cooldownData[0] || 0),
      nextAllowedTx: Number(cooldownData[1] || 0),
      purchaseLockTime: Number(cooldownData[2] || 0),
      propertiesOwned: Number(cooldownData[3] || 0),
    };
  } catch (error) {
    console.error("🚨 Erreur lors de la récupération du cooldown :", error);
    return {
      lastTxTime: 0,
      nextAllowedTx: 0,
      purchaseLockTime: 0,
      propertiesOwned: 0,
    };
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
  tradeProperty,
  getUserPropertiesByAddress,
  proposeTradeWithMetaMask,
  acceptTradeWithMetaMask,
  getCooldownAndOwnershipInfo,
};
