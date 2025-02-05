const { expect } = require("chai");
const { ethers } = require("hardhat");

describe("MonopolyToken", function () {
  let monopolyToken, owner, addr1;

  beforeEach(async function () {
    [owner, addr1] = await ethers.getSigners();
    const MonopolyToken = await ethers.getContractFactory("MonopolyToken");
    monopolyToken = await MonopolyToken.deploy();
    await monopolyToken.waitForDeployment();
  });

  it("Doit mint un token et récupérer le tokenURI", async function () {
    const tokenURI = "ipfs://testHash";
    await monopolyToken.mintMonopolyToken(owner.address, tokenURI);

    expect(await monopolyToken.tokenURI(0)).to.equal(tokenURI);
    expect(await monopolyToken.ownerOf(0)).to.equal(owner.address);
  });

  it("Ne doit pas permettre à un non-owner de mint", async function () {
    await expect(
      monopolyToken
        .connect(addr1)
        .mintMonopolyToken(addr1.address, "ipfs://anotherHash")
    ).to.be.reverted;
  });
});
