import { ethers, Contract } from "ethers";
import MonopolyTokenABI from "../MonopolyTokenABI.json";

const contractAddress = "0x36C02dA8a0983159322a80FFE9F24b1acfF8B570";

let provider, signer, contract;
const connectWallet = async () => {
  if (window.ethereum) {
    provider = new ethers.BrowserProvider(window.ethereum);
    const network = await provider.getNetwork();
    console.log(
      "Réseau connecté :",
      network.name,
      "Chain ID :",
      network.chainId
    );
    await provider.send("eth_requestAccounts", []);
    signer = await provider.getSigner();
    contract = new Contract(contractAddress, MonopolyTokenABI.abi, signer);
    console.log("Contrat initialisé :", contract);
    testContract();

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

const getAllProperties = async () => {
  // try {
  //   const contract = getContract();
  //   console.log("Contrat connecté :", contract);
  //   const totalSupply = await contract.totalSupply();
  //   console.log("Total Supply :", totalSupply.toBigInt().toString()); // ou totalSupply.toNumber()
  //   const properties = [];
  //   for (let i = 0; i < totalSupply; i++) {
  //     try {
  //       const propertyDetails = await contract.getPropertyDetails(i);
  //       properties.push({
  //         id: i,
  //         name: propertyDetails[0],
  //         type: propertyDetails[1],
  //         location: propertyDetails[2],
  //         value: ethers.formatEther(propertyDetails[3]), // Convertir Wei en ETH
  //         surface: propertyDetails[4],
  //         documentHash: propertyDetails[5],
  //         imageHash: propertyDetails[6],
  //         createdAt: new Date(propertyDetails[7] * 1000).toLocaleDateString(),
  //         lastTransferAt: new Date(
  //           propertyDetails[8] * 1000
  //         ).toLocaleDateString(),
  //         forSale: propertyDetails[9],
  //         salePrice: ethers.formatEther(propertyDetails[10]), // Convertir Wei en ETH
  //       });
  //     } catch (err) {
  //       console.error(
  //         `Erreur lors de la récupération de la propriété ${i}`,
  //         err
  //       );
  //     }
  //   }
  //   console.log("Propriétés récupérées :", properties);
  //   return properties;
  // } catch (err) {
  //   console.error("Erreur lors de la récupération des propriétés :", err);
  //   throw err;
  // }
};

const testContract = async () => {
  try {
    const contract = getContract();
    const totalSupply = contract.totalSupply();
    console.log("Fonctions disponibles :", totalSupply);

    // const name = await contract.name();
    // console.log("Nom du contrat :", name);
  } catch (err) {
    console.error("Erreur lors de l'appel à name :", err);
  }
};

export { connectWallet, getContract, getAllProperties, testContract };
