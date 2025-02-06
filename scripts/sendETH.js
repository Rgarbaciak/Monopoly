const { ethers } = require("hardhat");

async function main() {
  const [deployer] = await ethers.getSigners();
  const recipient = process.env.OWNER_ADDRESS;
  const amount = ethers.parseEther("100");

  console.log(`Envoi de ${amount} ETH à ${recipient}...`);
  const tx = await deployer.sendTransaction({
    to: recipient,
    value: amount,
  });

  await tx.wait();
  console.log("Transaction réussie !");
}

main().catch((error) => {
  console.error(error);
  process.exitCode = 1;
});
