// scripts/deploy.js
const hre = require("hardhat");

async function main() {
  const [deployer] = await hre.ethers.getSigners();
  console.log("Déploiement avec le compte :", deployer.address);

  const MonopolyToken = await hre.ethers.getContractFactory("MonopolyToken");
  console.log("Déploiement en cours du contrat MonopolyToken...");

  const monopolyToken = await MonopolyToken.deploy();
  await monopolyToken.waitForDeployment(); // Attendre que le contrat soit déployé

  // Pour ethers v6, l'adresse se trouve dans la propriété "target"
  console.log("Contrat déployé à l'adresse :", monopolyToken.target);
}

main()
  .then(() => process.exit(0))
  .catch((error) => {
    console.error("Erreur lors du déploiement :", error);
    process.exit(1);
  });
