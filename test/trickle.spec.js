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
            await deployTrickle();
        });
    });

    context("#setDca", function () {
        const sellAmount = ethers.utils.parseEther("1");
        const interval = ethers.BigNumber.from(100);
        let trickle;

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

            const { wethAddress, daiAddress } = await getTokenAddresses();

            const result = await trickle.setDca(wethAddress, daiAddress, sellAmount, interval);
            return result;
        }


        it("Should update list of token pairs correctly", async function () {
            const[owner] = await ethers.getSigners();
            trickle = await deployTrickle();
            await subject();
            const tokenPairList = await trickle.getTokenPairs(owner.address);
            expect(tokenPairList.length).to.eq(1);
        });

        it("Should update list of orders correctly", async function () {
            const[owner] = await ethers.getSigners();
            trickle = await deployTrickle();
            await subject();
            const [tokenPairHash] = await trickle.getTokenPairs(owner.address);
            const orderHashList = await trickle.getOrders(owner.address, tokenPairHash);
            expect(orderHashList.length).to.eq(1);
        });


    });
});
