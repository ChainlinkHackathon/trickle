# Chainlink Hackathon Project


## Install Project
```shell
yarn install
```

## Smart Contracts
### Run smart contract tests

```shell
yarn hardhat test
```

### Run local test network

```shell
yarn hardhat node
```

### Deploy to local testnetwork and check the upkeep function

Compile and deploy contracts and updating addresses

```shell
yarn hardhat run scripts/deployContracts.js --network localhost
```

Check the upkeep function

```shell
yarn hardhat check-upkeep --network localhost
```

## Frontend

