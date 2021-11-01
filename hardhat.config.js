require("@nomiclabs/hardhat-waffle");
require('dotenv').config()
const fs = require("fs");


// This is a sample Hardhat task. To learn how to create your own go to
// https://hardhat.org/guides/create-task.html
task("accounts", "Prints the list of accounts", async (taskArgs, hre) => {
  const accounts = await hre.ethers.getSigners();

  for (const account of accounts) {
    console.log(account.address);
  }
});

const NODE_URL = process.env.INFURA_API_KEY;
const KOVAN_PRIVATE_KEY = process.env.KOVAN_PRIVATE_KEY;

task("check-upkeep", "Check upkeep function", async (_, { ethers }) => {
  const addressPath = "addresses/Counter.json";
  const network = await ethers.provider.getNetwork();
  const chainId = network.chainId;
  console.log("Checking upkeep on chain: ", chainId);
  const addresses = JSON.parse(fs.readFileSync(addressPath, "utf8"));
  const address = addresses[chainId];

  const artifactPath = "artifacts/contracts/Counter.sol/Counter.json";
  const contractArtifact = JSON.parse(fs.readFileSync(artifactPath, "utf8"));
  const abi = contractArtifact.abi;

  const keeperContract = await ethers.getContractAt(abi, address);
  await keeperContract.deployed()

  console.log("Connected to contract instance: ", keeperContract)

  const callData = ethers.utils.formatBytes32String("")
  console.log("Call Data", callData)

  const [upkeepNeeded, performData] = await keeperContract.checkUpkeep(callData);
  console.log("The status of this upkeep is currently", upkeepNeeded);
  console.log("Here is the perform data", performData);
});

// You need to export an object to set up your config
// Go to https://hardhat.org/config/ to learn more

module.exports = {
  solidity: "0.8.4",
  defaultNetwork: "kovan",
  networks: {
    kovan: {
      url: `${NODE_URL}`,
      accounts: [`${KOVAN_PRIVATE_KEY}`]
    }
  },
  paths: {
    sources: "./contracts",
    tests: "./test"
  }
};
