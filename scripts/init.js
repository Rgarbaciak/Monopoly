const { ethers } = require("hardhat");

async function main() {
  const contractAddress = "0x36C02dA8a0983159322a80FFE9F24b1acfF8B570";
  const MonopolyToken = await ethers.getContractAt(
    "MonopolyToken",
    contractAddress
  );
  const [owner] = await ethers.getSigners();

  console.log("Initializing properties...");
  const initTx = await MonopolyToken.connect(owner).initializeProperties();
  await initTx.wait();
  console.log("Properties initialized!");

  // Vérifier la totalSupply
  const supply = await MonopolyToken.totalSupply();
  console.log("Total Supply:", supply.toString());

  // Vérifier les propriétaires des premiers tokens
  console.log("Owner of token 0:", await MonopolyToken.ownerOf(0));
  console.log("Owner of token 1:", await MonopolyToken.ownerOf(1));
}

main()
  .then(() => process.exit(0))
  .catch((error) => {
    console.error("❌ Script failed completely:", error);
    process.exit(1);
  });
