const { expect } = require("chai");
const { ethers } = require("hardhat");

describe("MonopolyToken Trade Tests", function () {
  let monopolyToken, owner, user1, user2;

  before(async function () {
    // Déploiement du contrat avant les tests
    [owner, user1, user2] = await ethers.getSigners();

    // Déploiement d'un nouveau contrat MonopolyToken
    const MonopolyTokenFactory = await ethers.getContractFactory(
      "MonopolyToken"
    );
    monopolyToken = await MonopolyTokenFactory.deploy();
    console.log("Contract deployed at:", monopolyToken.address);
  });

  beforeEach(async function () {
    // Réinitialisation de l'état de la blockchain avant chaque test
    console.log("Taking initial snapshot...");
    this.snapshotId = await ethers.provider.send("evm_snapshot", []);
    console.log("Snapshot taken with ID:", this.snapshotId);

    // Minting initial properties
    console.log("Minting 3 houses for user1...");
    await Promise.all([
      monopolyToken.mintMonopolyToken(
        user1.address,
        "Maison A",
        "maison",
        "Rue 1",
        10,
        100,
        "docHash1",
        "imgHash1"
      ),
      monopolyToken.mintMonopolyToken(
        user1.address,
        "Maison B",
        "maison",
        "Rue 2",
        12,
        120,
        "docHash2",
        "imgHash2"
      ),
      monopolyToken.mintMonopolyToken(
        user1.address,
        "Maison C",
        "maison",
        "Rue 3",
        15,
        130,
        "docHash3",
        "imgHash3"
      ),
    ]);
    console.log("Minting 3 houses for user1 done!");

    console.log("Minting a train station for user2...");
    await monopolyToken.mintMonopolyToken(
      user2.address,
      "Gare Centrale",
      "gare",
      "Place Gare",
      50,
      500,
      "docHash4",
      "imgHash4"
    );
    console.log("Minting a train station for user2 done!");
  });

  afterEach(async function () {
    // Nettoyage de l'état de la blockchain après chaque test
    console.log("Reverting blockchain to snapshot:", this.snapshotId);
    await ethers.provider.send("evm_revert", [this.snapshotId]);
    console.log("Blockchain state cleaned!");
  });

  it("Should trade properties between user1 and user2", async function () {
    // Vérifier les propriétaires avant le trade
    console.log("Owner of token 0:", await monopolyToken.ownerOf(0));
    console.log("Owner of token 1:", await monopolyToken.ownerOf(1));
    console.log("Owner of token 2:", await monopolyToken.ownerOf(2));
    console.log("Owner of token 3:", await monopolyToken.ownerOf(3));

    // Effectuer le trade
    console.log("Trading properties...");
    const tradeTx = await monopolyToken.connect(user1).tradeProperty(
      [0, 1, 2], // Les IDs des maisons de user1
      [3], // L'ID de la gare de user2
      user2.address
    );
    await tradeTx.wait();
    console.log("Trade successful!");

    // Vérifier les nouveaux propriétaires
    expect(await monopolyToken.ownerOf(0)).to.equal(user2.address);
    expect(await monopolyToken.ownerOf(1)).to.equal(user2.address);
    expect(await monopolyToken.ownerOf(2)).to.equal(user2.address);
    expect(await monopolyToken.ownerOf(3)).to.equal(user1.address);
  });
});
