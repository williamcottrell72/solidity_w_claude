const { expect } = require("chai");
const { ethers, upgrades } = require("hardhat");

describe("MC3Coin", function () {
  let mc3Coin;
  let owner;
  let admin;
  let user1;
  let user2;

  beforeEach(async function () {
    [owner, admin, user1, user2] = await ethers.getSigners();

    const MC3Coin = await ethers.getContractFactory("MC3Coin");
    mc3Coin = await upgrades.deployProxy(MC3Coin, [], {
      initializer: "initialize",
      kind: "uups",
    });
    await mc3Coin.waitForDeployment();
  });

  describe("Initialization", function () {
    it("should set correct name and symbol", async function () {
      expect(await mc3Coin.name()).to.equal("MC3Coin");
      expect(await mc3Coin.symbol()).to.equal("MC3");
    });

    it("should mint initial supply to deployer", async function () {
      const expectedSupply = ethers.parseEther("1000000");
      expect(await mc3Coin.totalSupply()).to.equal(expectedSupply);
      expect(await mc3Coin.balanceOf(owner.address)).to.equal(expectedSupply);
    });

    it("should set deployer as admin", async function () {
      expect(await mc3Coin.isAdmin(owner.address)).to.be.true;
    });

    it("should set correct initial token price", async function () {
      expect(await mc3Coin.tokenPrice()).to.equal(ethers.parseEther("0.01"));
    });

    it("should set deployer as owner", async function () {
      expect(await mc3Coin.owner()).to.equal(owner.address);
    });
  });

  describe("Admin Management", function () {
    it("should allow owner to add admin", async function () {
      await expect(mc3Coin.addAdmin(admin.address))
        .to.emit(mc3Coin, "AdminAdded")
        .withArgs(admin.address);

      expect(await mc3Coin.isAdmin(admin.address)).to.be.true;
    });

    it("should allow owner to remove admin", async function () {
      await mc3Coin.addAdmin(admin.address);

      await expect(mc3Coin.removeAdmin(admin.address))
        .to.emit(mc3Coin, "AdminRemoved")
        .withArgs(admin.address);

      expect(await mc3Coin.isAdmin(admin.address)).to.be.false;
    });

    it("should not allow non-owner to add admin", async function () {
      await expect(
        mc3Coin.connect(user1).addAdmin(admin.address)
      ).to.be.revertedWithCustomError(mc3Coin, "OwnableUnauthorizedAccount");
    });

    it("should not allow adding zero address as admin", async function () {
      await expect(
        mc3Coin.addAdmin(ethers.ZeroAddress)
      ).to.be.revertedWith("MC3Coin: admin is zero address");
    });

    it("should not allow adding duplicate admin", async function () {
      await mc3Coin.addAdmin(admin.address);
      await expect(
        mc3Coin.addAdmin(admin.address)
      ).to.be.revertedWith("MC3Coin: address is already an admin");
    });

    it("should not allow removing non-admin", async function () {
      await expect(
        mc3Coin.removeAdmin(user1.address)
      ).to.be.revertedWith("MC3Coin: address is not an admin");
    });
  });

  describe("Minting", function () {
    beforeEach(async function () {
      await mc3Coin.addAdmin(admin.address);
    });

    it("should allow admin to mint tokens", async function () {
      const mintAmount = ethers.parseEther("1000");
      await mc3Coin.connect(admin).mint(user1.address, mintAmount);

      expect(await mc3Coin.balanceOf(user1.address)).to.equal(mintAmount);
    });

    it("should not allow non-admin to mint", async function () {
      const mintAmount = ethers.parseEther("1000");
      await expect(
        mc3Coin.connect(user1).mint(user1.address, mintAmount)
      ).to.be.revertedWith("MC3Coin: caller is not an admin");
    });

    it("should not allow minting to zero address", async function () {
      await expect(
        mc3Coin.connect(admin).mint(ethers.ZeroAddress, ethers.parseEther("1000"))
      ).to.be.revertedWith("MC3Coin: mint to zero address");
    });
  });

  describe("Burning", function () {
    beforeEach(async function () {
      await mc3Coin.addAdmin(admin.address);
      await mc3Coin.transfer(admin.address, ethers.parseEther("10000"));
    });

    it("should allow admin to burn their own tokens", async function () {
      const burnAmount = ethers.parseEther("1000");
      const balanceBefore = await mc3Coin.balanceOf(admin.address);

      await mc3Coin.connect(admin).burn(burnAmount);

      expect(await mc3Coin.balanceOf(admin.address)).to.equal(balanceBefore - burnAmount);
    });

    it("should allow admin to burn tokens from another address", async function () {
      const burnAmount = ethers.parseEther("1000");
      await mc3Coin.transfer(user1.address, burnAmount);

      await mc3Coin.burnFrom(user1.address, burnAmount);

      expect(await mc3Coin.balanceOf(user1.address)).to.equal(0);
    });

    it("should not allow non-admin to burn", async function () {
      await expect(
        mc3Coin.connect(user1).burn(ethers.parseEther("1000"))
      ).to.be.revertedWith("MC3Coin: caller is not an admin");
    });
  });

  describe("Buy Tokens", function () {
    it("should allow users to buy tokens", async function () {
      const ethAmount = ethers.parseEther("1"); // 1 ETH
      const expectedTokens = ethers.parseEther("100"); // 1 ETH / 0.01 = 100 MC3

      await expect(mc3Coin.connect(user1).buyTokens({ value: ethAmount }))
        .to.emit(mc3Coin, "TokensPurchased")
        .withArgs(user1.address, expectedTokens, ethAmount);

      expect(await mc3Coin.balanceOf(user1.address)).to.equal(expectedTokens);
      expect(await mc3Coin.getContractBalance()).to.equal(ethAmount);
    });

    it("should calculate correct token amount for different ETH values", async function () {
      const ethAmount = ethers.parseEther("0.5");
      const expectedTokens = ethers.parseEther("50");

      await mc3Coin.connect(user1).buyTokens({ value: ethAmount });

      expect(await mc3Coin.balanceOf(user1.address)).to.equal(expectedTokens);
    });

    it("should not allow buying with zero ETH", async function () {
      await expect(
        mc3Coin.connect(user1).buyTokens({ value: 0 })
      ).to.be.revertedWith("MC3Coin: must send ETH to buy tokens");
    });
  });

  describe("Sell Tokens", function () {
    beforeEach(async function () {
      // User1 buys tokens first
      await mc3Coin.connect(user1).buyTokens({ value: ethers.parseEther("1") });
    });

    it("should allow users to sell tokens", async function () {
      const sellAmount = ethers.parseEther("50");
      const expectedEth = ethers.parseEther("0.5");

      const balanceBefore = await ethers.provider.getBalance(user1.address);

      const tx = await mc3Coin.connect(user1).sellTokens(sellAmount);
      const receipt = await tx.wait();
      const gasUsed = receipt.gasUsed * receipt.gasPrice;

      const balanceAfter = await ethers.provider.getBalance(user1.address);

      expect(await mc3Coin.balanceOf(user1.address)).to.equal(ethers.parseEther("50"));
      expect(balanceAfter - balanceBefore + gasUsed).to.equal(expectedEth);
    });

    it("should emit TokensSold event", async function () {
      const sellAmount = ethers.parseEther("50");
      const expectedEth = ethers.parseEther("0.5");

      await expect(mc3Coin.connect(user1).sellTokens(sellAmount))
        .to.emit(mc3Coin, "TokensSold")
        .withArgs(user1.address, sellAmount, expectedEth);
    });

    it("should not allow selling zero tokens", async function () {
      await expect(
        mc3Coin.connect(user1).sellTokens(0)
      ).to.be.revertedWith("MC3Coin: must sell at least 1 token");
    });

    it("should not allow selling more tokens than balance", async function () {
      await expect(
        mc3Coin.connect(user1).sellTokens(ethers.parseEther("200"))
      ).to.be.revertedWith("MC3Coin: insufficient token balance");
    });

    it("should not allow selling when contract has insufficient ETH", async function () {
      // Owner withdraws all ETH
      const contractBalance = await mc3Coin.getContractBalance();
      await mc3Coin.withdrawETH(contractBalance);

      await expect(
        mc3Coin.connect(user1).sellTokens(ethers.parseEther("10"))
      ).to.be.revertedWith("MC3Coin: insufficient contract ETH balance");
    });
  });

  describe("Price Management", function () {
    it("should allow owner to update token price", async function () {
      const newPrice = ethers.parseEther("0.02");

      await expect(mc3Coin.setTokenPrice(newPrice))
        .to.emit(mc3Coin, "PriceUpdated")
        .withArgs(newPrice);

      expect(await mc3Coin.tokenPrice()).to.equal(newPrice);
    });

    it("should not allow non-owner to update price", async function () {
      await expect(
        mc3Coin.connect(user1).setTokenPrice(ethers.parseEther("0.02"))
      ).to.be.revertedWithCustomError(mc3Coin, "OwnableUnauthorizedAccount");
    });

    it("should not allow setting price to zero", async function () {
      await expect(
        mc3Coin.setTokenPrice(0)
      ).to.be.revertedWith("MC3Coin: price must be greater than 0");
    });

    it("should reflect new price in buy transactions", async function () {
      await mc3Coin.setTokenPrice(ethers.parseEther("0.02"));

      const ethAmount = ethers.parseEther("1");
      const expectedTokens = ethers.parseEther("50"); // 1 ETH / 0.02 = 50 MC3

      await mc3Coin.connect(user1).buyTokens({ value: ethAmount });

      expect(await mc3Coin.balanceOf(user1.address)).to.equal(expectedTokens);
    });
  });

  describe("ETH Withdrawal", function () {
    beforeEach(async function () {
      await mc3Coin.connect(user1).buyTokens({ value: ethers.parseEther("1") });
    });

    it("should allow owner to withdraw ETH", async function () {
      const withdrawAmount = ethers.parseEther("0.5");
      const balanceBefore = await ethers.provider.getBalance(owner.address);

      const tx = await mc3Coin.withdrawETH(withdrawAmount);
      const receipt = await tx.wait();
      const gasUsed = receipt.gasUsed * receipt.gasPrice;

      const balanceAfter = await ethers.provider.getBalance(owner.address);

      expect(balanceAfter - balanceBefore + gasUsed).to.equal(withdrawAmount);
      expect(await mc3Coin.getContractBalance()).to.equal(ethers.parseEther("0.5"));
    });

    it("should not allow non-owner to withdraw ETH", async function () {
      await expect(
        mc3Coin.connect(user1).withdrawETH(ethers.parseEther("0.5"))
      ).to.be.revertedWithCustomError(mc3Coin, "OwnableUnauthorizedAccount");
    });

    it("should not allow withdrawing more than contract balance", async function () {
      await expect(
        mc3Coin.withdrawETH(ethers.parseEther("10"))
      ).to.be.revertedWith("MC3Coin: insufficient balance");
    });
  });

  describe("Upgradeability", function () {
    it("should allow owner to upgrade contract", async function () {
      const MC3CoinV2 = await ethers.getContractFactory("MC3Coin");
      await upgrades.upgradeProxy(await mc3Coin.getAddress(), MC3CoinV2);

      // Verify state is preserved
      expect(await mc3Coin.name()).to.equal("MC3Coin");
      expect(await mc3Coin.totalSupply()).to.equal(ethers.parseEther("1000000"));
    });

    it("should not allow non-owner to upgrade", async function () {
      // This would fail at the proxy level before reaching the contract
      const MC3CoinV2 = await ethers.getContractFactory("MC3Coin", user1);
      await expect(
        upgrades.upgradeProxy(await mc3Coin.getAddress(), MC3CoinV2)
      ).to.be.reverted;
    });
  });

  describe("Receive ETH", function () {
    it("should allow contract to receive ETH directly", async function () {
      const sendAmount = ethers.parseEther("1");

      await owner.sendTransaction({
        to: await mc3Coin.getAddress(),
        value: sendAmount,
      });

      expect(await mc3Coin.getContractBalance()).to.equal(sendAmount);
    });
  });
});
