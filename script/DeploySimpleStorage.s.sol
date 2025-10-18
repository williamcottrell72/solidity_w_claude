// SPDX-License-Identifier: MIT
pragma solidity ^0.8.0;

import {Script} from "forge-std/Script.sol";
import {SimpleStorage} from "../contracts/SimpleStorage.sol";
import {console} from "forge-std/console.sol";

contract DeploySimpleStorage is Script {
    function run() external returns (SimpleStorage) {
        // Start broadcasting transactions
        vm.startBroadcast();

        // Deploy the SimpleStorage contract
        SimpleStorage simpleStorage = new SimpleStorage();

        console.log("SimpleStorage deployed to:", address(simpleStorage));

        // Test the contract
        console.log("\nTesting the contract...");

        // Get initial value
        uint256 initialValue = simpleStorage.get();
        console.log("Initial value:", initialValue);

        // Set a new value
        console.log("Setting value to 42...");
        simpleStorage.set(42);

        // Get the new value
        uint256 newValue = simpleStorage.get();
        console.log("New value:", newValue);

        // Stop broadcasting transactions
        vm.stopBroadcast();

        console.log("\nDeployment and testing completed successfully!");

        return simpleStorage;
    }
}
