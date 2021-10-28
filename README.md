# Chainlink Hackathon Project

## Requirements and

Install solidity compiler

Example:

```bash
yay -S solidity
```

Install brownie:

```bash
python3 -m pip install --user pipx

pipx install eth-brownie
```

Install ganache (local blockchain)

```bash
npm i -g ganache-cli
```

Install brownie python lib (recommend doing this in a virtual env)

```bash
pip install brownie
```

Install web3

```bash
pip install web3
```

## Compile Contract to JSON

```bash
brownie compile
```

## Local deployment


```bash
brownie run deploy
```

```bash
ganache-cli --port 8545 --gasLimit 12000000 --accounts 10 --hardfork istanbul --mnemonic brownie

```

## Environment Variables

```
touch .env
```

Add the following:

```
WEB3_INFURA_PROJECT_ID = XXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXX
PRIVATE_KEY = 0xXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXX
ETHERSCAN_TOKEN = XXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXX
```

You will need to setup accounts with both infura and etherscan

## Deploy to testnet

```
brownie run scripts/deploy.py --network kovan
```

## Test wallets

- Louell: `0x2d8005d7449Bc885c9a540E1d93F1a24DAA20854`

- Chris: `0x8E3bd49e2625f43C83E9e42a806551bC090b8652`

## TODO

- move contract code into separate directory and create anther dir for frontend code

