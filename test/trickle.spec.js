const { expect } = require("chai");
const { ethers } = require("hardhat");
const networkMapping = require("../front_end/src/chain-info/map.json");

describe("Trickle", function () {
    let chainId;
    let minimumUpkeepInterval;
    let owner;
    const sushiswapAddress = ethers.utils.getAddress("0x1b02dA8Cb0d097eB8D57A175b88c7D8b47997506");

    beforeEach(async () => {
        [owner] = await ethers.getSigners();
        const network = await ethers.provider.getNetwork();
        chainId = network.chainId;
        minimumUpkeepInterval = ethers.BigNumber.from(1000);
    });

    async function subject() {
        const TrickleFactory = await ethers.getContractFactory("Trickle");
        const trickle = await TrickleFactory.deploy(minimumUpkeepInterval, sushiswapAddress);
        await trickle.deployed();
        return trickle;
    }

    context("#constructor", function () {
        it("Should not revert", async function () {
            await subject();
        });

        it("Sets minimumUpkeepInterval correctly", async function () {
            const trickle = await subject();
            const returnedMinimumUpkeepInterval = await trickle.minimumUpkeepInterval();
            expect(returnedMinimumUpkeepInterval).to.eq(minimumUpkeepInterval);
        });
    });

    describe("when trickle contract is deployed", async () => {
        let trickle;
        let wethAddress;
        let daiAddress;

        beforeEach(async () => {
            const TrickleFactory = await ethers.getContractFactory("Trickle");
            trickle = await TrickleFactory.deploy(minimumUpkeepInterval, sushiswapAddress);
            await trickle.deployed();

            wethAddress = ethers.utils.getAddress(networkMapping[String(chainId)].Weth);
            daiAddress = ethers.utils.getAddress(networkMapping[String(chainId)].Dai);
        });

        context("#setRecurringOrder", function () {
            let sellAmount;
            let interval;

            beforeEach(async () => {
                sellAmount = ethers.utils.parseEther("1");
                interval = ethers.BigNumber.from(10000);
            });

            async function subject() {
                const result = await trickle.setRecurringOrder(wethAddress, daiAddress, sellAmount, interval);
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
        context("#setRecurringOrderWithStartTimestamp", function () {
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
                const result = await trickle.setRecurringOrderWithStartTimestamp(
                    wethAddress,
                    daiAddress,
                    sellAmount,
                    interval,
                    startTimestamp
                );
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

            describe("When no recurringOrder is set", async function () {
                beforeEach(async () => {
                    interval = minimumUpkeepInterval.div(2);
                });
                it("Should return empty list ", async function () {
                    const tokenPairList = await subject();
                    expect(tokenPairList.length).to.eq(0);
                });
            });

            describe("When a recurringOrder is set", async function () {
                beforeEach(async () => {
                    const sellAmount = ethers.utils.parseEther("1");
                    const interval = ethers.BigNumber.from(10000000);
                    await trickle.setRecurringOrder(wethAddress, daiAddress, sellAmount, interval);
                });

                it("Should return list of length 1", async function () {
                    const tokenPairList = await subject();
                    expect(tokenPairList.length).to.eq(1);
                });
            });
        });
        context("#getTokenPairData", function () {
            let user;
            let tokenPairHash;

            beforeEach(async () => {
                user = owner.address;
                const sellAmount = ethers.utils.parseEther("1");
                const interval = ethers.BigNumber.from(10000000);
                await trickle.setRecurringOrder(wethAddress, daiAddress, sellAmount, interval);
                [tokenPairHash] = await trickle.getTokenPairs(user);
            });

            async function subject() {
                return await trickle.getTokenPairData(tokenPairHash);
            }

            describe("When tokenPair exists", async function () {
                it("Should return correct token Addresses", async function () {
                    const [sellToken, buyToken] = await subject();
                    expect(sellToken).to.eq(wethAddress);
                    expect(buyToken).to.eq(daiAddress);
                });
            });
            describe("When tokenPair does not exist", async function () {
                beforeEach(async () => {
                    tokenPairHash = ethers.utils.formatBytes32String("RANDOMTEXT");
                });
                it("Should return zero addresses", async function () {
                    const [sellToken, buyToken] = await subject();
                    expect(sellToken).to.eq(ethers.constants.AddressZero);
                    expect(buyToken).to.eq(ethers.constants.AddressZero);
                });
            });
        });
        context("#getOrders", function () {
            let tokenPairHash;
            let user;

            beforeEach(async () => {
                user = owner.address;
                const sellAmount = ethers.utils.parseEther("1");
                const interval = ethers.BigNumber.from(10000000);
                await trickle.setRecurringOrder(wethAddress, daiAddress, sellAmount, interval);
                [tokenPairHash] = await trickle.getTokenPairs(owner.address);
            });

            async function subject() {
                return await trickle.getOrders(user, tokenPairHash);
            }

            describe("When specifing a user with a recurringOrder set", function () {
                it("Should return list of length 1", async function () {
                    const orderHashList = await subject();
                    expect(orderHashList.length).to.eq(1);
                });
            });

            describe("When specifing a user without any recurringOrder set", function () {
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

        context("#getOrderData", function () {
            let tokenPairHash;
            let orderHash;
            let user;
            let sellAmount;
            let interval;

            beforeEach(async () => {
                user = owner.address;
                sellAmount = ethers.utils.parseEther("1");
                interval = ethers.BigNumber.from(10000000);
                await trickle.setRecurringOrder(wethAddress, daiAddress, sellAmount, interval);
                [tokenPairHash] = await trickle.getTokenPairs(owner.address);
                [orderHash] = await trickle.getOrders(user, tokenPairHash);
            });

            async function subject() {
                return await trickle.getOrderData(tokenPairHash, orderHash);
            }

            describe("When querying existing order", function () {
                it("Should return correctData", async function () {
                    const orderData = await subject();
                    expect(orderData.sellAmount).to.eq(sellAmount);
                    expect(orderData.interval).to.eq(interval);
                });
            });

            describe("When querying non-existign order", function () {
                beforeEach(async () => {
                    orderHash = ethers.utils.formatBytes32String("RANDOMTEXT");
                });

                it("Should return data with zero fields", async function () {
                    const orderData = await subject();
                    expect(orderData.sellAmount).to.eq(ethers.BigNumber.from(0));
                    expect(orderData.interval).to.eq(ethers.BigNumber.from(0));
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

            describe("When no recurringOrder is set", function () {
                it("should return false for upkeepNeeded", async function () {
                    const { upkeepNeeded } = await subject();
                    expect(upkeepNeeded).to.eq(false);
                });
            });

            describe("When a recurringOrder is set", function () {
                let interval;

                beforeEach(async () => {
                    const sellAmount = ethers.utils.parseEther("1");
                    interval = ethers.BigNumber.from(10000);
                    await trickle.setRecurringOrder(wethAddress, daiAddress, sellAmount, interval);
                });

                it("should return true for upkeepNeeded", async function () {
                    const { upkeepNeeded } = await subject();
                    expect(upkeepNeeded).to.eq(true);
                });
            });

            describe("When a recurringOrder is set with starting time in the future", function () {
                let interval;
                const delayInMs = 10 ** 7;

                beforeEach(async () => {
                    const sellAmount = ethers.utils.parseEther("1");
                    interval = ethers.BigNumber.from(10000);
                    const blockNum = await ethers.provider.getBlockNumber();
                    const block = await ethers.provider.getBlock(blockNum);
                    const startTimestamp = block.timestamp + delayInMs;
                    await trickle.setRecurringOrderWithStartTimestamp(
                        wethAddress,
                        daiAddress,
                        sellAmount,
                        interval,
                        startTimestamp
                    );
                });

                it("should return false for upkeepNeeded", async function () {
                    const { upkeepNeeded } = await subject();
                    expect(upkeepNeeded).to.eq(false);
                });
            });
        });
        context("#checkUpKeep", function () {
            let performData;
            let callData;

            async function subject() {
                return await trickle.performUpkeep(performData);
            }

            describe("When a recurringOrder is set", function () {
                let interval;
                let weth;
                let dai;
                let sellAmount;

                beforeEach(async () => {
                    sellAmount = ethers.utils.parseEther("1");
                    interval = ethers.BigNumber.from(10000);
                    callData = ethers.utils.hexlify(0);
                    weth = await ethers.getContractAt("IWETH", wethAddress);
                    dai = await ethers.getContractAt("IERC20", daiAddress);
                    await trickle.setRecurringOrder(wethAddress, daiAddress, sellAmount, interval);
                    ({ performData, upkeepNeeded } = await trickle.checkUpkeep(callData));
                });

                context("when enough sellToken is approved", function () {
                    beforeEach(async () => {
                        await weth.deposit({ value: sellAmount });
                        await weth.approve(trickle.address, sellAmount);
                    });
                    it("should consume correct amount of sell token", async function () {
                        const wethBalanceBefore = await weth.balanceOf(owner.address);
                        await subject();
                        const wethBalanceAfter = await weth.balanceOf(owner.address);
                        expect(wethBalanceBefore.sub(wethBalanceAfter)).to.eq(sellAmount);
                    });
                    it("should return positive amount of buyToken", async function () {
                        const daiBalanceBefore = await dai.balanceOf(owner.address);
                        await subject();
                        const daiBalanceAfter = await dai.balanceOf(owner.address);
                        expect(daiBalanceAfter.gt(daiBalanceBefore));
                    });
                });
                context("when no sellToken is approved", function () {
                    it("should consume zero amount of sell token", async function () {
                        const wethBalanceBefore = await weth.balanceOf(owner.address);
                        await subject();
                        const wethBalanceAfter = await weth.balanceOf(owner.address);
                        expect(wethBalanceBefore).to.eq(wethBalanceAfter);
                    });
                });
            });
        });
    });
});
