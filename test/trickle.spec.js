const { expect } = require("chai");
const { ethers } = require("hardhat");
const networkMapping = require("../front_end/src/chain-info/map.json");

describe("Trickle", function () {
    let chainId;
    let minimumUpkeepInterval;
    let owner;

    beforeEach(async () => {
        [owner] = await ethers.getSigners();
        const network = await ethers.provider.getNetwork();
        chainId = network.chainId;
        minimumUpkeepInterval = ethers.BigNumber.from(1000);
    });

    async function subject() {
        const TrickleFactory = await ethers.getContractFactory("Trickle");
        const trickle = await TrickleFactory.deploy(minimumUpkeepInterval);
        await trickle.deployed();
        return trickle;
    }

    context("#constructor", function () {
        it("Should not revert", async function () {
            await subject();
        });
    });

    describe("when trickle contract is deployed", async () => {
        let trickle;
        let wethAddress;
        let daiAddress;

        beforeEach(async () => {
            const TrickleFactory = await ethers.getContractFactory("Trickle");
            trickle = await TrickleFactory.deploy(minimumUpkeepInterval);
            await trickle.deployed();

            wethAddress = networkMapping[String(chainId)].Weth;
            daiAddress = networkMapping[String(chainId)].Dai;
        });

        context("#setDca", function () {
            let sellAmount;
            let interval;

            beforeEach(async () => {
                sellAmount = ethers.utils.parseEther("1");
                interval = ethers.BigNumber.from(10000);
            });

            async function subject() {
                const result = await trickle.setDca(wethAddress, daiAddress, sellAmount, interval);
                return result;
            }

            it("Should not revert", async function () {
                await subject();
            });

            describe("When sellAmount is 0", async function () {
                beforeEach(async () => {
                    sellAmount = 0;
                });
                it("Should revert", async function () {
                    await expect(subject()).to.be.revertedWith("amount cannot be 0");
                });
            });

            describe("When interval is less than minimumUpkeepInterval", async function () {
                beforeEach(async () => {
                    interval = minimumUpkeepInterval.div(2);
                });
                it("Should revert", async function () {
                    await expect(subject()).to.be.revertedWith("interval has to be greater than minimumUpkeepInterval");
                });
            });
        });
        context("#setDcaWithStartTimestamp", function () {
            let sellAmount;
            let interval;
            let startTimestamp;
            const delayInMs = 10000;

            beforeEach(async () => {
                sellAmount = ethers.utils.parseEther("1");
                interval = ethers.BigNumber.from(10000);
                const blockNum = await ethers.provider.getBlockNumber();
                const block = await ethers.provider.getBlock(blockNum);
                startTimestamp = block.timestamp + delayInMs;
            });

            async function subject() {
                const result = await trickle.setDcaWithStartTimestamp(wethAddress, daiAddress, sellAmount, interval, startTimestamp);
                return result;
            }

            it("Should not revert", async function () {
                await subject();
            });

            describe("When sellAmount is 0", async function () {
                beforeEach(async () => {
                    sellAmount = 0;
                });
                it("Should revert", async function () {
                    await expect(subject()).to.be.revertedWith("amount cannot be 0");
                });
            });

            describe("When interval is less than minimumUpkeepInterval", async function () {
                beforeEach(async () => {
                    interval = minimumUpkeepInterval.div(2);
                });
                it("Should revert", async function () {
                    await expect(subject()).to.be.revertedWith("interval has to be greater than minimumUpkeepInterval");
                });
            });
        });
        context("#getTokenPairs", function () {
            let user;

            beforeEach(async () => {
                user = owner.address;
            });

            async function subject() {
                return await trickle.getTokenPairs(user);
            }

            describe("When no dca is set", async function () {
                beforeEach(async () => {
                    interval = minimumUpkeepInterval.div(2);
                });
                it("Should return empty list ", async function () {
                    const tokenPairList = await subject();
                    expect(tokenPairList.length).to.eq(0);
                });
            });

            describe("When a dca is set", async function () {
                beforeEach(async () => {
                    const sellAmount = ethers.utils.parseEther("1");
                    const interval = ethers.BigNumber.from(10000000);
                    await trickle.setDca(wethAddress, daiAddress, sellAmount, interval);
                });

                it("Should return list of length 1", async function () {
                    const tokenPairList = await subject();
                    expect(tokenPairList.length).to.eq(1);
                });
            });
        });
        context("#getorders", function () {
            let tokenPairHash;
            let user;

            beforeEach(async () => {
                user = owner.address;
                const sellAmount = ethers.utils.parseEther("1");
                const interval = ethers.BigNumber.from(10000000);
                await trickle.setDca(wethAddress, daiAddress, sellAmount, interval);
                [tokenPairHash] = await trickle.getTokenPairs(owner.address);
            });

            async function subject() {
                return await trickle.getOrders(user, tokenPairHash);
            }

            describe("When specifing a user with a dca set", function () {
                it("Should return list of length 1", async function () {
                    const orderHashList = await subject();
                    expect(orderHashList.length).to.eq(1);
                });
            });

            describe("When specifing a user without any dca set", function () {
                beforeEach(async () => {
                    [_, otherAccount] = await ethers.getSigners();
                    user = otherAccount.address;
                });

                it("Should return list of length 0", async function () {
                    const orderHashList = await subject();
                    expect(orderHashList.length).to.eq(0);
                });
            });
        });

        context("#checkUpKeep", function () {
            let callData;
            beforeEach(async () => {
                callData = ethers.utils.hexlify(0);
            });

            async function subject() {
                return await trickle.checkUpkeep(callData);
            }

            describe("When no dca is set", function () {
                it("should return false for upkeepNeeded", async function () {
                    const { upkeepNeeded } = await subject();
                    expect(upkeepNeeded).to.eq(false);
                });
            });

            describe("When a dca is set", function () {
                let interval;

                beforeEach(async () => {
                    const sellAmount = ethers.utils.parseEther("1");
                    interval = ethers.BigNumber.from(10000);
                    await trickle.setDca(wethAddress, daiAddress, sellAmount, interval);
                });

                it("should return true for upkeepNeeded", async function () {
                    const { upkeepNeeded } = await subject();
                    expect(upkeepNeeded).to.eq(true);
                });
            });

            describe("When a dca is set with starting time in the future", function () {
                let interval;
                const delayInMs = 10**7

                beforeEach(async () => {
                    const sellAmount = ethers.utils.parseEther("1");
                    interval = ethers.BigNumber.from(10000);
                    const blockNum = await ethers.provider.getBlockNumber();
                    const block = await ethers.provider.getBlock(blockNum);
                    const startTimestamp = block.timestamp + delayInMs;
                    await trickle.setDcaWithStartTimestamp(wethAddress, daiAddress, sellAmount, interval, startTimestamp);
                });

                it("should return false for upkeepNeeded", async function () {
                    const { upkeepNeeded } = await subject();
                    expect(upkeepNeeded).to.eq(false);
                });
            });
        });
    });
});
