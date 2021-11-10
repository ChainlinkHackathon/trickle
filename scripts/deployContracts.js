// We require the Hardhat Runtime Environment explicitly here. This is optional
// but useful for running the script in a standalone fashion through `node <script>`.
//
// When running the script with `npx hardhat run <script>` you'll find the Hardhat
// Runtime Environment's members available in the global scope.
const hre = require("hardhat");
const fs = require("fs");

const UPDATE_INTERVAL = 10;

const contractsToDeploy = [
    { name: "Counter", constructorArgs: [UPDATE_INTERVAL] },
    { name: "TokenAllowances", constructorArgs: [] },
];

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
}

async function saveAddress(name, address) {
    const addressPath = `./front_end/src/chain-info/map.json`;
    let addresses = {};
    const { chainId } = await ethers.provider.getNetwork();
    if (fs.existsSync(addressPath)) addresses = JSON.parse(fs.readFileSync(addressPath, "utf8"));

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
    for(const contractData of contractsToDeploy){
        await deployContract(contractData);
    }
}

main()
    .then(() => process.exit(0))
    .catch((error) => {
        console.error(error);
        process.exit(1);
    });
