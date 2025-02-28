const { expect } = require("chai");
const { ethers, network } = require("hardhat");

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

    // Vérification de `totalSupply()`
    const totalSupply = await monopolyToken.totalSupply();
    console.log("Total Supply après déploiement :", totalSupply.toString());

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

    // Avance le temps de 5 minutes pour bypasser le cooldown
    await network.provider.send("evm_increaseTime", [300]);
    await network.provider.send("evm_mine");

    // Achat de la propriété par l'acheteur
    console.log("Buying property...");
    const buyTx = await monopolyToken
      .connect(buyer)
      .buyProperty(0, { value: salePrice });
    await buyTx.wait();
    console.log("Property bought successfully!");

    // Vérifiez que l'acheteur est maintenant le propriétaire du token 0
    expect(await monopolyToken.ownerOf(0)).to.equal(buyer.address);

    // Vérifiez que la propriété n'est plus à vendre
    const updatedPropertyDetails = await monopolyToken.getPropertyDetails(0);
    expect(updatedPropertyDetails.forSale).to.be.false;
    expect(updatedPropertyDetails.salePrice.toString()).to.equal("0");

    // Vérification du cooldown après achat
    const cooldownInfo = await monopolyToken.getCooldownAndOwnershipInfo(
      buyer.address
    );
    console.log("Cooldown info:", cooldownInfo);

    // ✅ Nouvelle vérification pour éviter l'erreur
    expect(Number(cooldownInfo.purchaseLockTime)).to.equal(
      Number(cooldownInfo.lastTxTime) + 600
    );

    // Avance encore 10 minutes pour bypasser le purchase lock
    await network.provider.send("evm_increaseTime", [600]);
    await network.provider.send("evm_mine");
  });

  it("Should prevent user from buying another property before cooldown expires", async function () {
    console.log("Trying to buy another property before cooldown...");

    await expect(
      monopolyToken
        .connect(buyer)
        .buyProperty(1, { value: ethers.parseEther("1.0") })
    ).to.be.revertedWith("Wait 5 min before next transaction");

    console.log("Cooldown correctly enforced!");
  });

  it("Should enforce max 4 property ownership", async function () {
    console.log("Minting 3 more properties for buyer...");

    for (let i = 1; i <= 3; i++) {
      const mintTx = await monopolyToken.mintMonopolyToken(
        buyer.address,
        `Maison Extra ${i}`,
        "maison",
        `Rue Extra ${i}`,
        10,
        100,
        "docHash1",
        "imgHash1"
      );
      await mintTx.wait();
      console.log(`Property ${i} minted for buyer!`);
    }

    // Vérification que l'acheteur a 4 propriétés
    const cooldownInfo = await monopolyToken.getCooldownAndOwnershipInfo(
      buyer.address
    );
    expect(Number(cooldownInfo.propertiesOwned)).to.equal(4);

    // Attendre que le cooldown expire (Simulation)
    await network.provider.send("evm_increaseTime", [300]);
    await network.provider.send("evm_mine");

    console.log("Trying to buy a 5th property...");

    await expect(
      monopolyToken
        .connect(buyer)
        .buyProperty(1, { value: ethers.parseEther("1.0") })
    ).to.be.revertedWith("Max 4 properties allowed");

    console.log("Max 4 properties rule correctly enforced!");
  });
});
