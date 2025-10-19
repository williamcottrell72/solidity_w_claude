const { ethers, upgrades } = require("hardhat");

async function main() {
  console.log("Deploying MC3Coin upgradeable contract...\n");

  // Get the deployer's address
  const [deployer] = await ethers.getSigners();
  console.log("Deploying with account:", deployer.address);
  console.log("Account balance:", ethers.formatEther(await ethers.provider.getBalance(deployer.address)), "ETH\n");

  // Deploy MC3Coin as upgradeable proxy
  const MC3Coin = await ethers.getContractFactory("MC3Coin");

  console.log("Deploying MC3Coin proxy...");
  const mc3Coin = await upgrades.deployProxy(MC3Coin, [], {
    initializer: "initialize",
    kind: "uups",
  });

  await mc3Coin.waitForDeployment();

  const proxyAddress = await mc3Coin.getAddress();
  const implementationAddress = await upgrades.erc1967.getImplementationAddress(proxyAddress);

  console.log("MC3Coin Proxy deployed to:", proxyAddress);
  console.log("MC3Coin Implementation deployed to:", implementationAddress);

  // Display initial contract state
  console.log("\n=== Contract Information ===");
  console.log("Token Name:", await mc3Coin.name());
  console.log("Token Symbol:", await mc3Coin.symbol());
  console.log("Decimals:", await mc3Coin.decimals());
  console.log("Total Supply:", ethers.formatEther(await mc3Coin.totalSupply()), "MC3");
  console.log("Token Price:", ethers.formatEther(await mc3Coin.tokenPrice()), "ETH per MC3");
  console.log("Deployer Balance:", ethers.formatEther(await mc3Coin.balanceOf(deployer.address)), "MC3");
  console.log("Is Deployer Admin:", await mc3Coin.isAdmin(deployer.address));

  // Test buying tokens
  console.log("\n=== Testing Buy Functionality ===");
  const buyAmount = ethers.parseEther("1"); // 1 ETH
  console.log("Buying tokens with", ethers.formatEther(buyAmount), "ETH...");

  const buyTx = await mc3Coin.buyTokens({ value: buyAmount });
  await buyTx.wait();

  console.log("Purchase successful!");
  console.log("New Total Supply:", ethers.formatEther(await mc3Coin.totalSupply()), "MC3");
  console.log("Deployer Balance:", ethers.formatEther(await mc3Coin.balanceOf(deployer.address)), "MC3");
  console.log("Contract ETH Balance:", ethers.formatEther(await mc3Coin.getContractBalance()), "ETH");

  console.log("\nDeployment and testing completed successfully!");
}

main()
  .then(() => process.exit(0))
  .catch((error) => {
    console.error(error);
    process.exit(1);
  });
