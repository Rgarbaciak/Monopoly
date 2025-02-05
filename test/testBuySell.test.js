const { expect } = require("chai");
const { ethers } = require("hardhat");

describe("MonopolyToken Buy and Sell Tests", function () {
  let monopolyToken, owner, seller, buyer;

  before(async function () {
    [owner, seller, buyer] = await ethers.getSigners();

    // Déploiement du contrat
    const MonopolyTokenFactory = await ethers.getContractFactory(
      "MonopolyToken"
    );
    monopolyToken = await MonopolyTokenFactory.deploy();
    await monopolyToken.waitForDeployment();
    console.log("Contract deployed at:", monopolyToken.target);

    // Mint d'une propriété pour le vendeur
    console.log("Minting property for seller...");
    const mintTx = await monopolyToken.mintMonopolyToken(
      seller.address,
      "Maison A",
      "maison",
      "Rue 1",
      10,
      100,
      "docHash1",
      "imgHash1"
    );
    await mintTx.wait();
    console.log("Minting done!");
  });

  it("Should list a property for sale and buy it", async function () {
    console.log("Listing property for sale...");

    // Vérifiez que le token 0 existe et appartient au vendeur
    expect(await monopolyToken.ownerOf(0)).to.equal(seller.address);

    // Mettre en vente le token 0
    const salePrice = ethers.parseEther("1.0"); // 1 ETH
    const sellTx = await monopolyToken
      .connect(seller)
      .sellProperty(0, salePrice);
    await sellTx.wait();
    console.log("Property listed for sale!");

    // Vérifiez que la propriété est marquée comme "à vendre"
    const propertyDetails = await monopolyToken.getPropertyDetails(0);
    expect(propertyDetails.forSale).to.be.true;
    expect(propertyDetails.salePrice.toString()).to.equal(salePrice.toString());

    // Achat de la propriété par l'acheteur
    console.log("Buying property...");
    const buyTx = await monopolyToken.connect(buyer).buyProperty(0, {
      value: salePrice,
    });
    await buyTx.wait();
    console.log("Property bought successfully!");

    // Vérifiez que l'acheteur est maintenant le propriétaire du token 0
    expect(await monopolyToken.ownerOf(0)).to.equal(buyer.address);

    // Vérifiez que la propriété n'est plus à vendre
    const updatedPropertyDetails = await monopolyToken.getPropertyDetails(0);
    expect(updatedPropertyDetails.forSale).to.be.false;
    expect(updatedPropertyDetails.salePrice.toString()).to.equal("0");
  });
});
