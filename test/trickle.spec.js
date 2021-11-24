const { expect } = require("chai");
const { ethers } = require("hardhat");
const networkMapping = require("../front_end/src/chain-info/map.json");

describe("Trickle", function () {
    let chainId;
    let TrickleFactory;

    async function getChainId() {
        const network = await ethers.provider.getNetwork();
        chainId = network.chainId;
        return chainId;
    }

    async function deployTrickle() {
        const TrickleFactory = await ethers.getContractFactory("Trickle");
        const trickle = await TrickleFactory.deploy();
        await trickle.deployed();
        return trickle;
    }

    context("#constructor", function () {
        it("Should not revert", async function () {
            const trickle = await deployTrickle();
        });
    });

    context("#setDca", function () {
        const sellAmount = ethers.utils.parseEther("1");
        const interval = ethers.BigNumber.from(100);

        async function getTokenAddresses() {
            const chainId = await getChainId();
            const wethAddress = networkMapping[String(chainId)].Weth;
            const daiAddress = networkMapping[String(chainId)].Dai;
            return { wethAddress, daiAddress };
        }

        async function getWeth() {
            const { wethAddress } = await getTokenAddresses();
            const weth = await ethers.getContractAt("IWETH", wethAddress);
            return weth;
        }

        async function getDai() {
            const { daiAddress } = await getTokenAddresses();
            const dai = await ethers.getContractAt("IERC20", daiAddress);
            return dai;
        }

        async function subject() {
            const [owner] = await ethers.getSigners();
            const trickle = await deployTrickle();

            const { wethAddress, daiAddress } = await getTokenAddresses();

            const result = await trickle.setDca(wethAddress, daiAddress, sellAmount, interval);
            return result;
        }

        it("Should be able to set dca", async function () {
            await subject();
        });
    });
});
