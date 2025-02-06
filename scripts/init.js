const { ethers } = require("hardhat");
const propertiesData = require("../data/properties.json"); // Charger le fichier JSON

async function main() {
  const contractAddress = process.env.CONTRACT_ADDRESS;
  const MonopolyToken = await ethers.getContractAt(
    "MonopolyToken",
    contractAddress
  );
  const [owner] = await ethers.getSigners();

  console.log("Ajout de propriétés au contrat...");

  for (const property of propertiesData) {
    console.log(`Ajout de ${property.name} au contrat...`);
    const tx = await MonopolyToken.createProperty(
      owner.address, // Utilisation de l'adresse du propriétaire
      property.name,
      property.propertyType,
      property.location,
      ethers.parseEther(property.value.toString()), // Convertir la valeur en Wei
      property.surface,
      property.documentHash,
      property.imageHash,
      property.forSale,
      ethers.parseEther(property.salePrice.toString()) // Convertir le prix de vente en Wei
    );
    await tx.wait();
    console.log(`${property.name} ajouté avec succès !`);
  }

  console.log("Toutes les propriétés ont été ajoutées !");
}

main()
  .then(() => process.exit(0))
  .catch((error) => {
    console.error("❌ Erreur :", error);
    process.exit(1);
  });
