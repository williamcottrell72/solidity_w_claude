const SimpleStorage = artifacts.require("SimpleStorage");

module.exports = function (deployer) {
  deployer.deploy(SimpleStorage).then(function(instance) {
    console.log("\n=================================");
    console.log("SimpleStorage deployed to:", instance.address);
    console.log("=================================\n");

    // Test the contract after deployment
    return instance.get();
  }).then(function(initialValue) {
    console.log("Testing the contract...");
    console.log("Initial value:", initialValue.toString());

    // Get the deployed instance
    return SimpleStorage.deployed();
  }).then(function(instance) {
    console.log("Setting value to 42...");
    return instance.set(42);
  }).then(function() {
    return SimpleStorage.deployed();
  }).then(function(instance) {
    return instance.get();
  }).then(function(newValue) {
    console.log("New value:", newValue.toString());
    console.log("\nDeployment and testing completed successfully!\n");
  });
};
