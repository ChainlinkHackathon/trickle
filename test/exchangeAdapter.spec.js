const { expect } = require("chai");
const { ethers } = require("hardhat");
const networkMapping = require("../front_end/src/chain-info/map.json");

describe("ExchangeAdapter", function () {
    const sushiswapAddress = "0x1b02dA8Cb0d097eB8D57A175b88c7D8b47997506";
    let chainId;

    async function getChainId() {
        const network = await ethers.provider.getNetwork();
        chainId = network.chainId;
        return chainId;
    }

    async function deployExchangeAdapter() {
        const ExchangeIntefaceFactory = await ethers.getContractFactory("ExchangeAdapter");
        const exchangeAdapter = await ExchangeIntefaceFactory.deploy(sushiswapAddress);
        await exchangeAdapter.deployed();
        return exchangeAdapter;
    }

    context("#constructor", function () {
        it("Should return uniswap / exchange address when deployed", async function () {
            const exchangeAdapter = await deployExchangeAdapter();
            expect(await exchangeAdapter.exchangeRouter()).to.equal(sushiswapAddress);
        });
    });

    context("#swapExactTokensForTokens", function () {
        const wethAmount = ethers.utils.parseEther("1");

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
            const exchangeAdapter = await deployExchangeAdapter();

            const { wethAddress, daiAddress } = await getTokenAddresses();

            const weth = await getWeth();
            await weth.connect(owner).approve(exchangeAdapter.address, wethAmount);
            const result = await exchangeAdapter
                .connect(owner)
                .swapExactTokensForTokens(wethAddress, daiAddress, wethAmount, owner.address);
            return result;
        }

        it("Should be able to swap WETH to DAI", async function () {
            const [owner] = await ethers.getSigners();
            const weth = await getWeth();
            const dai = await getDai();
            await weth.connect(owner).deposit({ value: wethAmount });
            const daiBalanceBefore = await dai.balanceOf(owner.address);
            const wethBalanceBefore = await weth.balanceOf(owner.address);
            await subject();
            const daiBalanceAfter = await dai.balanceOf(owner.address);
            const wethBalanceAfter = await weth.balanceOf(owner.address);
            expect(wethBalanceBefore.sub(wethBalanceAfter)).to.eq(wethAmount);
            expect(daiBalanceAfter.gt(daiBalanceBefore));
        });

    });
});
