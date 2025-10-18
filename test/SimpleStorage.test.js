const { expect } = require("chai");
const { ethers } = require("hardhat");

describe("SimpleStorage", function () {
  let simpleStorage;

  beforeEach(async function () {
    const SimpleStorage = await ethers.getContractFactory("SimpleStorage");
    simpleStorage = await SimpleStorage.deploy();
    await simpleStorage.waitForDeployment();
  });

  it("should start with initial value of 0", async function () {
    expect(await simpleStorage.get()).to.equal(0);
  });

  it("should store and retrieve a value", async function () {
    await simpleStorage.set(42);
    expect(await simpleStorage.get()).to.equal(42);
  });

  it("should emit ValueChanged event", async function () {
    await expect(simpleStorage.set(100))
      .to.emit(simpleStorage, "ValueChanged")
      .withArgs(100);
  });

  it("should allow multiple value updates", async function () {
    // Set first value
    await simpleStorage.set(10);
    expect(await simpleStorage.get()).to.equal(10);

    // Set second value
    await simpleStorage.set(20);
    expect(await simpleStorage.get()).to.equal(20);

    // Set third value
    await simpleStorage.set(30);
    expect(await simpleStorage.get()).to.equal(30);
  });

  it("should handle max uint256 value", async function () {
    const maxValue = ethers.MaxUint256;
    await simpleStorage.set(maxValue);
    expect(await simpleStorage.get()).to.equal(maxValue);
  });

  it("should be able to set value to 0", async function () {
    // First set a non-zero value
    await simpleStorage.set(100);
    expect(await simpleStorage.get()).to.equal(100);

    // Then set to zero
    await simpleStorage.set(0);
    expect(await simpleStorage.get()).to.equal(0);
  });
});
