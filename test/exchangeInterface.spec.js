const { expect } = require("chai");
const { ethers } = require("hardhat");

describe("ExchangeInterface", function () {
    it("Should return uniswap / exchange address when deployed", async function () {
        const uniswapAddress = "0x7a250d5630B4cF539739dF2C5dAcb4c659F2488D";
        const ExchangeInterface = await ethers.getContractFactory("ExchangeInterface");
        const exchangeInterface = await ExchangeInterface.deploy(uniswapAddress);
        await exchangeInterface.deployed();

        expect(await exchangeInterface.uniswap()).to.equal(uniswapAddress);
    });
});
