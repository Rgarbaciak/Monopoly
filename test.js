const { ethers } = require("ethers");
const MonopolyTokenABI = require("./frontend/src/MonopolyTokenABI.json");

(async () => {
  const provider = new ethers.JsonRpcProvider("http://127.0.0.1:8545"); // URL du nœud local
  const contractAddress = "0x36C02dA8a0983159322a80FFE9F24b1acfF8B570"; // Remplacez par l'adresse correcte
  const contract = new ethers.Contract(
    contractAddress,
    MonopolyTokenABI.abi,
    provider
  );

  try {
    const totalSupply = await contract.totalSupply();
    console.log("Total supply :", totalSupply.toString());
  } catch (error) {
    console.error("Erreur lors de l'appel à totalSupply :", error);
  }
})();
