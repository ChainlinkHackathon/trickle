// We require the Hardhat Runtime Environment explicitly here. This is optional
// but useful for running the script in a standalone fashion through `node <script>`.
//
// When running the script with `npx hardhat run <script>` you'll find the Hardhat
// Runtime Environment's members available in the global scope.
const hre = require("hardhat");
const fs = require("fs");

const MINIMUM_UPDATE_INTERVAL = 10;

const contractsToDeploy = [{ name: "Trickle", constructorArgs: [MINIMUM_UPDATE_INTERVAL] }];
const addressPath = `./front_end/src/chain-info/map.json`;

function sleep(ms) {
  return new Promise((resolve) => setTimeout(resolve, ms));
}

function getAddresses() {
    let addresses = {};
    if (fs.existsSync(addressPath)) addresses = JSON.parse(fs.readFileSync(addressPath, "utf8"));
    return addresses;
}

async function deployContract({ name, constructorArgs }) {
    console.log("Getting Contract Factory");
    const contractFactory = await hre.ethers.getContractFactory(name);
    console.log(`Deploying contract ${name}`);
    const contractInstance = await contractFactory.deploy(...constructorArgs);

    await contractInstance.deployed();
    console.log("Saving Address");
    await saveAddress(name, contractInstance.address);
    saveAbi(name, contractInstance.interface);

    console.log(`${name} deployed to:`, contractInstance.address);

    // Verify on etherscan
    // Etherscan needs some time to register the new contract
    await sleep(60 * 1000);
    await hre.run("verify:verify", {
        address: contractInstance.address,
        constructorArguments: constructorArgs,
    });
}

async function saveAddress(name, address) {
    const addresses = getAddresses();

    const { chainId } = await ethers.provider.getNetwork();
    if (addresses[chainId] == null) {
        addresses[chainId] = {};
    }

    addresses[chainId][name] = address;
    fs.writeFileSync(addressPath, JSON.stringify(addresses, null, 2));
}

function saveAbi(name, interface) {
    const abiPath = `./front_end/src/chain-info/${name}.json`;
    const FormatTypes = hre.ethers.utils.FormatTypes;
    const abi = interface.format(FormatTypes.full);
    fs.writeFileSync(abiPath, JSON.stringify(abi, null, 2));
}

async function main() {
    for (const contractData of contractsToDeploy) {
        if (contractData.name == "Trickle") {
            const addresses = getAddresses();
            const { chainId } = await ethers.provider.getNetwork();
            const sushiSwapAddress = addresses[chainId]?.SushiSwap;
            if (sushiSwapAddress) {
                contractData.constructorArgs.push(sushiSwapAddress);
            } else {
                throw Error("Sushiswap address not provided");
            }
        }
        await deployContract(contractData);
    }
}

main()
    .then(() => process.exit(0))
    .catch((error) => {
        console.error(error);
        process.exit(1);
    });
