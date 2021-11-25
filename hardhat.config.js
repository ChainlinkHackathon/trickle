require("@nomiclabs/hardhat-waffle");
require("dotenv").config();
const fs = require("fs");

// This is a sample Hardhat task. To learn how to create your own go to
// https://hardhat.org/guides/create-task.html
task("accounts", "Prints the list of accounts", async (taskArgs, hre) => {
    const accounts = await hre.ethers.getSigners();

    for (const account of accounts) {
        console.log(account.address);
    }
});

const KOVAN_PRIVATE_KEY = process.env.KOVAN_PRIVATE_KEY;
const KOVAN_JSON_RPC_URL = process.env.KOVAN_JSON_RPC_URL;

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
    await keeperContract.deployed();

    console.log("Connected to contract instance: ", keeperContract);

    const callData = ethers.utils.formatBytes32String("");
    console.log("Call Data", callData);

    const [upkeepNeeded, performData] = await keeperContract.checkUpkeep(callData);
    console.log("The status of this upkeep is currently", upkeepNeeded);
    console.log("Here is the perform data", performData);
});

task("deposit-weth", "Wrap eth into Weth")
    .addParam("amount", "Amount of ether to wrap")
    .setAction(async (taskArgs, { ethers }) => {
        const abiPath = "front_end/src/chain-info/Weth.json";
        const abi = JSON.parse(fs.readFileSync(abiPath, "utf8"));
        const networkMappingPath = "front_end/src/chain-info/map.json";
        const networkMapping = JSON.parse(fs.readFileSync(networkMappingPath, "utf8"));
        const network = await ethers.provider.getNetwork();
        const chainId = network.chainId;
        console.log("Wrapping Eth on chain", chainId);
        const address = networkMapping[chainId].Weth;
        console.log("Wrapping Eth at address", address);
        const wethContract = await ethers.getContractAt(abi, address);
        await wethContract.deployed();
        console.log("Weth is deployed");

        const amountWei = ethers.utils.parseEther(taskArgs.amount);
        const tx = await wethContract.deposit({ value: amountWei });
        const receipt = await tx.wait();
        console.log(`${taskArgs.amount} Ether wrapped`);
        console.log(receipt);
    });

// You need to export an object to set up your config
// Go to https://hardhat.org/config/ to learn more

module.exports = {
    solidity: "0.8.4",
    defaultNetwork: "hardhat",
    networks: {
        hardhat: {
            forking: {
                url: `${KOVAN_JSON_RPC_URL}`,
            },
            timeout: 50000,
        },
        kovan: {
            url: `${KOVAN_JSON_RPC_URL}`,
            accounts: [`${KOVAN_PRIVATE_KEY}`],
        },
    },
    paths: {
        sources: "./contracts",
        tests: "./test",
    },
    mocha: { timeout: 50000 },
};
