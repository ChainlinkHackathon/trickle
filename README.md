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


## Compile Contract to JSON

```bash
brownie compile
```

## Local deployment


```bash
brownie run deploy
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

## Deploy to testnet

```
brownie run scripts/deploy.py --network kovan
```
