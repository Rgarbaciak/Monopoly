const { ethers } = require("hardhat");

async function main() {
  const contractAddress = process.env.CONTRACT_ADDRESS;
  const MonopolyToken = await ethers.getContractAt(
    "MonopolyToken",
    contractAddress
  );
  const [owner] = await ethers.getSigners();

  console.log("Ajout de propriétés au contrat...");

  const properties = [
    {
      owner: owner.address,
      name: "Maison 1",
      propertyType: "maison",
      location: "Rue 1",
      value: ethers.parseEther("10"),
      surface: 100,
      documentHash: "docHash1",
      imageHash: "imgHash1",
      forSale: true,
      salePrice: ethers.parseEther("0.0000005"), // Prix de vente fixé à 0.5 ETH
    },
    {
      owner: owner.address,
      name: "Maison 2",
      propertyType: "maison",
      location: "Rue 2",
      value: ethers.parseEther("12"),
      surface: 120,
      documentHash: "docHash2",
      imageHash: "imgHash2",
      forSale: false,
      salePrice: ethers.parseEther("15"),
    },
    {
      owner: owner.address,
      name: "Gare 1",
      propertyType: "gare",
      location: "Place Gare 1",
      value: ethers.parseEther("50"),
      surface: 500,
      documentHash: "docHash5",
      imageHash: "imgHash5",
      forSale: true,
      salePrice: ethers.parseEther("100"),
    },
  ];

  for (const property of properties) {
    console.log(`Ajout de ${property.name} au contrat...`);
    const tx = await MonopolyToken.createProperty(
      property.owner,
      property.name,
      property.propertyType,
      property.location,
      property.value,
      property.surface,
      property.documentHash,
      property.imageHash,
      property.forSale,
      property.salePrice
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
