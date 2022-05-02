
const { ethers } = require("hardhat");
const hre = require("hardhat");

async function main() {
  const [owner, acc1, acc2] = await ethers.getSigners()
  const Vote = await hre.ethers.getContractFactory('Vote', owner);
  const vote = await Vote.deploy();

  await vote.deployed();

  console.log("Vote-contract deployed to:", vote.address);
}


main()
  .then(() => process.exit(0))
  .catch((error) => {
    console.error(error);
    process.exit(1);
  });
