const hre = require("hardhat");

async function main() {
  const PongTournament = await hre.ethers.getContractFactory("PongTournament");
  const pongTournament = await PongTournament.deploy();
  // await pongTournament.deployed(); // Deprecated
  await pongTournament.waitForDeployment();

  const contractAddress = await pongTournament.getAddress(); 
  console.log("Contract deployed to:", contractAddress);
}

main().catch((error) => {
  console.error(error);
  process.exitCode = 1;
});
