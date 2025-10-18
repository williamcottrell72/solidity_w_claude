// SPDX-License-Identifier: MIT
pragma solidity ^0.8.0;

import {Test} from "forge-std/Test.sol";
import {SimpleStorage} from "../contracts/SimpleStorage.sol";
import {DeploySimpleStorage} from "../script/DeploySimpleStorage.s.sol";
import {console} from "forge-std/console.sol";

contract SimpleStorageTest is Test {
    SimpleStorage public simpleStorage;
    DeploySimpleStorage public deployer;

    function setUp() public {
        simpleStorage = new SimpleStorage();
    }

    // Test initial state
    function testInitialValue() public view {
        assertEq(simpleStorage.get(), 0, "Initial value should be 0");
    }

    // Test basic set and get functionality
    function testSetAndGet() public {
        uint256 testValue = 42;
        simpleStorage.set(testValue);
        assertEq(simpleStorage.get(), testValue, "Value should be 42");
    }

    // Test setting multiple values
    function testMultipleSets() public {
        simpleStorage.set(100);
        assertEq(simpleStorage.get(), 100, "Value should be 100");

        simpleStorage.set(200);
        assertEq(simpleStorage.get(), 200, "Value should be 200");

        simpleStorage.set(0);
        assertEq(simpleStorage.get(), 0, "Value should be 0");
    }

    // Test event emission
    function testValueChangedEvent() public {
        uint256 testValue = 123;

        // Expect the ValueChanged event to be emitted
        vm.expectEmit(false, false, false, true);
        emit ValueChanged(testValue);

        simpleStorage.set(testValue);
    }

    // Define the event for testing
    event ValueChanged(uint256 newValue);

    // Fuzz test: set random values
    function testFuzz_SetValue(uint256 randomValue) public {
        simpleStorage.set(randomValue);
        assertEq(simpleStorage.get(), randomValue, "Value should match the set value");
    }

    // Test maximum uint256 value
    function testMaxUint256() public {
        uint256 maxValue = type(uint256).max;
        simpleStorage.set(maxValue);
        assertEq(simpleStorage.get(), maxValue, "Should handle max uint256 value");
    }

    // Test setting zero explicitly
    function testSetZero() public {
        // First set a non-zero value
        simpleStorage.set(100);
        assertEq(simpleStorage.get(), 100);

        // Then set to zero
        simpleStorage.set(0);
        assertEq(simpleStorage.get(), 0, "Should be able to set value to 0");
    }
}

contract DeploySimpleStorageTest is Test {
    DeploySimpleStorage public deployer;

    function setUp() public {
        deployer = new DeploySimpleStorage();
    }

    // Test that deployment script works correctly
    function testDeployment() public {
        SimpleStorage simpleStorage = deployer.run();

        // Verify the contract was deployed
        assertTrue(address(simpleStorage) != address(0), "Contract should be deployed");

        // Verify initial state
        assertEq(simpleStorage.get(), 42, "Deployment script should set value to 42");
    }

    // Test that deployed contract is functional
    function testDeployedContractFunctionality() public {
        SimpleStorage simpleStorage = deployer.run();

        // Test setting a new value
        simpleStorage.set(999);
        assertEq(simpleStorage.get(), 999, "Deployed contract should work correctly");
    }
}
