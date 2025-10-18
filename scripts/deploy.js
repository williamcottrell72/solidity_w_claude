const hre = require("hardhat");

async function main() {
  console.log("Deploying SimpleStorage contract...");

  // Get the contract factory
  const SimpleStorage = await hre.ethers.getContractFactory("SimpleStorage");

  // Deploy the contract
  const simpleStorage = await SimpleStorage.deploy();

  // Wait for deployment to finish
  await simpleStorage.waitForDeployment();

  const address = await simpleStorage.getAddress();

  console.log(`SimpleStorage deployed to: ${address}`);

  // Test the contract
  console.log("\nTesting the contract...");

  // Get initial value
  let value = await simpleStorage.get();
  console.log(`Initial value: ${value}`);

  // Set a new value
  console.log("Setting value to 42...");
  const tx = await simpleStorage.set(42);
  await tx.wait();

  // Get the new value
  value = await simpleStorage.get();
  console.log(`New value: ${value}`);

  console.log("\nDeployment and testing completed successfully!");
}

main()
  .then(() => process.exit(0))
  .catch((error) => {
    console.error(error);
    process.exit(1);
  });
