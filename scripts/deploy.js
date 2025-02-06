// scripts/deploy.js
const hre = require("hardhat");

async function main() {
  const [deployer] = await hre.ethers.getSigners();
  console.log("Déploiement avec le compte :", deployer.address);
  console.log(
    "Solde du déployeur :",
    (await hre.ethers.provider.getBalance(deployer.address)).toString(),
    "wei"
  );

  const MonopolyToken = await hre.ethers.getContractFactory("MonopolyToken");
  console.log("Déploiement en cours du contrat MonopolyToken...");

  const monopolyToken = await MonopolyToken.deploy();
  await monopolyToken.waitForDeployment();

  console.log("Contrat déployé avec succès !");
  console.log("Adresse du contrat :", monopolyToken.target);
  console.log(
    "Hash de la transaction :",
    monopolyToken.deploymentTransaction().hash
  );

  // Afficher les informations sur le réseau
  const network = await hre.ethers.provider.getNetwork();
  console.log("Réseau connecté :", network.name, "Chain ID :", network.chainId);
}

main()
  .then(() => process.exit(0))
  .catch((error) => {
    console.error("Erreur lors du déploiement :", error);
    process.exit(1);
  });
