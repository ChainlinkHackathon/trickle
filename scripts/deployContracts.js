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
  const contractFactory = await hre.ethers.getContractFactory(name);
  const contractInstance = await contractFactory.deploy(...constructorArgs);

  await contractInstance.deployed();
  await saveAddress(name, contractInstance.address);

  console.log(`${name} deployed to:`, contractInstance.address);
}

async function saveAddress(name, address) {
  const addressPath = `addresses/${name}.json`;
  let addresses = {};
  const { chainId } = await ethers.provider.getNetwork();
  if (fs.existsSync(addressPath))
    addresses = JSON.parse(fs.readFileSync(addressPath, "utf8"));

  addresses[chainId] = address;
  fs.writeFileSync(addressPath, JSON.stringify(addresses, null, 2));
}

async function main() {
  const promises = contractsToDeploy.map((contractData) =>
    deployContract(contractData)
  );
  await Promise.all(promises);
}

main()
  .then(() => process.exit(0))
  .catch((error) => {
    console.error(error);
    process.exit(1);
  });
