const { ethers } = require("hardhat");

async function main() {
  const contractAddress = "0xDc64a140Aa3E981100a9becA4E685f962f0cF6C9"; // Remplacez par l'adresse correcte de votre contrat
  const MonopolyToken = await ethers.getContractAt(
    "MonopolyToken",
    contractAddress
  );

  const name = "Propriété Rue de la Paix"; // Nom du NFT
  const description = "Une propriété emblématique dans le jeu Monopoly."; // Description
  const image =
    "https://files.structurae.net/files/photos/1/20080621/dsc06031.jpg"; // Lien de l'image
  const recipient = "0xdD2FD4581271e230360230F9337D5c0430Bf44C0"; // Adresse du destinataire

  console.log("Minting token avec des métadonnées...");
  const tx = await MonopolyToken.mintMonopolyToken(
    recipient,
    name,
    description,
    image
  );
  await tx.wait();

  console.log("Token minted successfully !");
}

main()
  .then(() => process.exit(0))
  .catch((error) => {
    console.error("Erreur :", error);
    process.exit(1);
  });
