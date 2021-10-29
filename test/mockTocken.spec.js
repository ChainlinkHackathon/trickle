const { expect } = require("chai");
const { ethers } = require("hardhat");

describe("MockToken", function () {
  it("Should return correct total supply upon deployment", async function () {
    const deployerBalance = 1000;
    const MockToken = await ethers.getContractFactory("MockToken");
    const mockToken = await MockToken.deploy(deployerBalance);
    await mockToken.deployed();

    expect(await mockToken.totalSupply()).to.equal(deployerBalance);

  });
});
