# Simple Storage Smart Contract

A simple Solidity smart contract for testing your development setup. This contract allows you to store and retrieve a single `uint256` value.

This project supports **Hardhat**, **Foundry**, and **Truffle** deployment methods, giving you flexibility to use your preferred development framework.

## Prerequisites

### For Hardhat
- Node.js (v16 or higher)
- npm or yarn

### For Foundry
- [Foundry](https://book.getfoundry.sh/getting-started/installation) installed
  ```bash
  curl -L https://foundry.paradigm.xyz | bash
  foundryup
  ```

### For Truffle
- Node.js (v16 or higher)
- Truffle installed globally
  ```bash
  npm install -g truffle
  ```

### For Ganache (Optional)
- **Ganache GUI**: Download from [https://trufflesuite.com/ganache/](https://trufflesuite.com/ganache/)
- **Ganache CLI**: Install via npm
  ```bash
  npm install -g ganache
  ```

## Project Structure

```
.
├── contracts/
│   └── SimpleStorage.sol           # Main smart contract
├── script/
│   └── DeploySimpleStorage.s.sol   # Foundry deployment script (Solidity)
├── scripts/
│   └── deploy.js                   # Hardhat deployment script (JavaScript)
├── migrations/
│   └── 1_deploy_contracts.js       # Truffle migration script
├── foundry-tests/                  # Foundry test directory (Solidity tests)
│   ├── SimpleStorage.t.sol         # Foundry tests for SimpleStorage
│   └── Counter.t.sol               # Foundry default test
├── test/                           # Truffle/Hardhat test directory (JavaScript tests)
│   └── SimpleStorage.test.js       # Truffle/Hardhat tests for SimpleStorage
├── foundry.toml                    # Foundry configuration
├── hardhat.config.js               # Hardhat configuration
├── truffle-config.js               # Truffle configuration
├── package.json                    # NPM dependencies (for Hardhat/Truffle)
└── README.md                       # This file
```

**Note on Test Directory Structure:**
- **`foundry-tests/`**: Contains Solidity test files (`.t.sol`) for Foundry, which use `forge-std` library
- **`test/`**: Contains JavaScript test files (`.test.js`) for Truffle and Hardhat
- This separation ensures compatibility between Foundry and Truffle, as they use different testing frameworks and dependencies

## Important Configuration Notes

### Ganache Compatibility

Both Foundry and Truffle are configured for Ganache compatibility.

**Foundry (foundry.toml)**:

The `foundry.toml` file is configured for Ganache compatibility:

```toml
evm_version = "paris"
```

This setting ensures that contracts compiled with Solidity 0.8.20+ will work with Ganache. Ganache doesn't support the PUSH0 opcode introduced in the Shanghai hard fork (EIP-3855), so we target the "paris" EVM version. This setting:
- ✅ Allows you to use modern Solidity syntax (0.8.20+)
- ✅ Ensures compiled bytecode works with Ganache
- ✅ Doesn't affect deployment to modern networks like Anvil, testnets, or mainnet

If you only use Anvil or modern testnets, you can remove this line for full Shanghai support.

**Truffle (truffle-config.js)**:

The `truffle-config.js` file also includes the same compatibility setting:

```javascript
compilers: {
  solc: {
    version: "0.8.20",
    settings: {
      evmVersion: "paris"  // Ganache compatibility
    }
  }
}
```

This ensures that Truffle-compiled contracts work with Ganache as well.

### Test Directory Configuration

**Foundry (foundry.toml)**:

```toml
test = "foundry-tests"
```

Foundry tests are located in the `foundry-tests/` directory to keep them separate from Truffle/Hardhat JavaScript tests. This separation is necessary because:
- Foundry tests (`.t.sol`) use the `forge-std` library which Truffle cannot compile
- Truffle scans the `test/` directory and would try to compile any `.sol` files it finds there
- Keeping them separate prevents compilation conflicts between the two frameworks

## Setup

### Option A: Using Hardhat

#### 1. Install Dependencies

```bash
npm install
```

#### 2. Compile the Contract

```bash
npm run compile
```

This will compile the smart contract and generate artifacts in the `artifacts/` directory.

### Option B: Using Foundry

#### 1. Install Foundry Dependencies

```bash
forge install foundry-rs/forge-std --no-commit
```

#### 2. Build the Contract

```bash
forge build
```

This will compile the smart contract and generate artifacts in the `out/` directory.

### Option C: Using Truffle

#### 1. Install Truffle (if not already installed)

```bash
npm install -g truffle
```

#### 2. Compile the Contract

```bash
truffle compile
```

This will compile the smart contract and generate artifacts in the `build/contracts/` directory.

## Usage

### Using Foundry (Solidity Script)

#### Deploy to Anvil (Local Network)

The recommended way to deploy using Foundry:

1. Start Anvil (Foundry's local Ethereum node):
   ```bash
   anvil
   ```
   This starts a local node at `http://127.0.0.1:8545` with 10 pre-funded accounts. Keep this terminal open.

2. In a new terminal, run the deployment script:
   ```bash
   forge script script/DeploySimpleStorage.s.sol --fork-url http://localhost:8545 --broadcast
   ```

   For more verbose output:
   ```bash
   forge script script/DeploySimpleStorage.s.sol --fork-url http://localhost:8545 --broadcast -vvvv
   ```

This will:
- Deploy the SimpleStorage contract
- Test it by setting a value to 42
- Display the contract address and test results

#### Quick Deploy (In-Memory)

For quick testing without broadcasting to a network:

```bash
forge script script/DeploySimpleStorage.s.sol
```

### Using Hardhat (JavaScript)

#### Deploy to Local Hardhat Network

The easiest way to test is using Hardhat's built-in network:

```bash
npm run deploy
```

This command will:
- Deploy the SimpleStorage contract to the Hardhat network
- Test the contract by setting a value to 42
- Display the contract address and test results

#### Start a Local Blockchain Node

If you want to run a persistent local blockchain:

```bash
npm run node
```

This starts a local Ethereum node at `http://127.0.0.1:8545`. Keep this terminal open.

In a new terminal, deploy to the local node:

```bash
npx hardhat run scripts/deploy.js --network localhost
```

### Using Ganache (GUI and CLI)

Ganache provides a visual blockchain explorer that lets you see transactions, blocks, contracts, and events in a GUI.

**Important Note about Ganache Compatibility**:
This project is configured to work with Ganache out of the box. The `foundry.toml` file includes `evm_version = "paris"` which ensures compatibility with Ganache's EVM implementation. Ganache doesn't support the newer PUSH0 opcode introduced in Solidity 0.8.20+, so we target the "paris" EVM version to avoid "invalid opcode" errors.

#### Option 1: Using Ganache GUI

1. **Start Ganache GUI**:
   - Launch the Ganache application
   - Click "Quickstart" to create a new workspace
   - By default, Ganache runs on `http://127.0.0.1:7545` (note the different port from Anvil/Hardhat)
   - You'll see 10 pre-funded accounts with 100 ETH each

2. **Ganache is Pre-configured**:

   The Ganache network is already configured in `hardhat.config.js`:
   ```javascript
   ganache: {
     url: "http://127.0.0.1:7545",
     chainId: 5777  // Ganache GUI default chain ID
   }
   ```

   **Note on Chain IDs**:
   - Ganache GUI: Chain ID 5777 (default)
   - Ganache CLI: Chain ID 1337 (default, but configurable with `--chain.chainId 5777`)
   - Anvil: Chain ID 31337
   - Hardhat Network: Chain ID 31337

3. **Deploy to Ganache using Hardhat**:
   ```bash
   npx hardhat run scripts/deploy.js --network ganache
   ```

4. **Deploy to Ganache using Foundry**:

   First, get a private key from Ganache:
   - In Ganache GUI, click on the key icon (🔑) next to any account to reveal its private key
   - Copy the private key (it will look like: `0x4f3edf983ac636a65a842ce7c78d9aa706d3b113bce9c46f30d7d21715b23b1d`)

   Then deploy using the private key:
   ```bash
   forge script script/DeploySimpleStorage.s.sol --fork-url http://127.0.0.1:7545 --private-key YOUR_PRIVATE_KEY_HERE --broadcast
   ```

   **For better security**, use an environment variable:
   ```bash
   # Set the private key in your terminal (this session only)
   export PRIVATE_KEY=0x4f3edf983ac636a65a842ce7c78d9aa706d3b113bce9c46f30d7d21715b23b1d

   # Deploy using the environment variable
   forge script script/DeploySimpleStorage.s.sol --fork-url http://127.0.0.1:7545 --private-key $PRIVATE_KEY --broadcast
   ```

   **Note**: Never commit private keys to version control! The Ganache default keys are only for local testing.

5. **View Results in Ganache GUI**:
   - **Accounts Tab**: See the account balances decrease as gas is spent
   - **Blocks Tab**: View all blocks created during deployment
   - **Transactions Tab**: Click on transactions to see:
     - Gas used
     - Transaction hash
     - From/To addresses
     - Contract creation details
   - **Contracts Tab**: View deployed contracts with their addresses
   - **Events Tab**: See the `ValueChanged` event emitted when setting a value
   - **Logs Tab**: View detailed execution logs

#### Option 2: Using Ganache CLI

1. **Start Ganache CLI**:
   ```bash
   ganache --port 7545 --chain.chainId 5777
   ```

   Or with custom options:
   ```bash
   ganache --port 7545 --chain.chainId 5777 --accounts 10 --defaultBalanceEther 100
   ```

   **Note**: Ganache CLI uses Chain ID 1337 by default. Use `--chain.chainId 5777` to match Ganache GUI.

2. **Deploy using Hardhat**:
   ```bash
   npx hardhat run scripts/deploy.js --network ganache
   ```

3. **Deploy using Foundry**:
   ```bash
   # Get a private key from Ganache output (first account)
   # Then use it with the --private-key flag
   forge script script/DeploySimpleStorage.s.sol --fork-url http://127.0.0.1:7545 --private-key YOUR_PRIVATE_KEY_HERE --broadcast
   ```

   Ganache CLI displays private keys when it starts. Look for output like:
   ```
   Available Accounts
   ==================
   (0) 0x742d35Cc6634C0532925a3b844Bc454e4438f44e (100 ETH)

   Private Keys
   ==================
   (0) 0x4f3edf983ac636a65a842ce7c78d9aa706d3b113bce9c46f30d7d21715b23b1d
   ```

#### Viewing Transaction Details in Ganache GUI

After deployment, you can explore the blockchain state:

1. **Contract Creation Transaction**:
   - Go to "Transactions" tab
   - Find the contract creation transaction (usually the first one)
   - Click on it to see:
     - Gas used: ~125,000 gas
     - Contract address: The deployed SimpleStorage address
     - Transaction data: The contract bytecode

2. **Set Value Transaction**:
   - Find the transaction where `set(42)` was called
   - Click to see:
     - Function called: `set(uint256)`
     - Input data: `0x60fe47b1...` (encoded function call)
     - Gas used: ~43,000 gas
     - Event emitted: `ValueChanged(42)`

3. **Account Changes**:
   - Go to "Accounts" tab
   - See the first account's balance decreased by the gas costs
   - Hover over the balance to see the exact change

4. **Block Information**:
   - Go to "Blocks" tab
   - Each transaction creates a new block
   - Click on blocks to see:
     - Block number
     - Gas used
     - Transactions included
     - Timestamp

### Using Truffle

Truffle is a popular development framework that works seamlessly with Ganache and other networks.

#### Deploy to Ganache GUI (Default)

1. **Start Ganache GUI**:
   - Launch the Ganache application
   - Click "Quickstart" to create a new workspace
   - Ganache will run on `http://127.0.0.1:7545` with Network ID 5777

2. **Deploy using Truffle**:
   ```bash
   truffle migrate --network development
   ```

   This will:
   - Deploy the SimpleStorage contract to Ganache
   - Test the contract by setting a value to 42
   - Display the contract address and test results

3. **View Results in Ganache GUI**:
   - See all the details in the Ganache GUI tabs as described in the Ganache section above

#### Deploy to Other Networks

**Deploy to Ganache CLI**:
```bash
# Start Ganache CLI
ganache --port 8545 --chain.chainId 1337

# In another terminal, deploy
truffle migrate --network ganache_cli
```

**Deploy to Hardhat/Anvil**:
```bash
# Start Anvil or Hardhat node
anvil

# In another terminal, deploy
truffle migrate --network localhost
```

#### Interact with Deployed Contract

Use the Truffle console to interact with your deployed contract:

```bash
truffle console --network development
```

Then in the console:

```javascript
// Get the deployed instance
let instance = await SimpleStorage.deployed()

// Get the current value
let value = await instance.get()
console.log("Current value:", value.toString())

// Set a new value
await instance.set(100)

// Get the new value
value = await instance.get()
console.log("New value:", value.toString())
```

#### Run Truffle Tests

The project includes comprehensive tests in `test/SimpleStorage.test.js` that verify:
- Storing and retrieving values
- Event emissions
- Initial state
- Multiple value updates

Run all tests with:

```bash
truffle test
```

Run tests on a specific network (e.g., Ganache):

```bash
truffle test --network development
```

## Available Commands

### Foundry Commands

| Command | Description |
|---------|-------------|
| `forge install` | Install Foundry dependencies |
| `forge build` | Compile smart contracts |
| `forge test` | Run tests |
| `forge script script/DeploySimpleStorage.s.sol` | Run deployment script (simulation) |
| `forge script script/DeploySimpleStorage.s.sol --broadcast` | Deploy to network |
| `forge clean` | Clean build artifacts |
| `anvil` | Start local Ethereum node |

### Hardhat Commands

| Command | Description |
|---------|-------------|
| `npm install` | Install all dependencies |
| `npm run compile` | Compile smart contracts |
| `npm run deploy` | Deploy contract to Hardhat network |
| `npm run node` | Start local blockchain node |
| `npm run clean` | Clean artifacts and cache |
| `npm test` | Run tests (when you add them) |

### Ganache Commands

| Command | Description |
|---------|-------------|
| `ganache` | Start Ganache CLI on default port (8545) with Chain ID 1337 |
| `ganache --port 7545 --chain.chainId 5777` | Start Ganache CLI on port 7545 with Chain ID 5777 (matches GUI) |
| `npx hardhat run scripts/deploy.js --network ganache` | Deploy to Ganache GUI using Hardhat |
| `forge script script/DeploySimpleStorage.s.sol --fork-url http://127.0.0.1:7545 --private-key $PRIVATE_KEY --broadcast` | Deploy to Ganache GUI using Foundry |

### Truffle Commands

| Command | Description |
|---------|-------------|
| `truffle compile` | Compile smart contracts |
| `truffle migrate` | Run migrations (deploy contracts) |
| `truffle migrate --network development` | Deploy to Ganache GUI (default network) |
| `truffle migrate --network ganache_cli` | Deploy to Ganache CLI |
| `truffle migrate --network localhost` | Deploy to Hardhat/Anvil node |
| `truffle migrate --reset` | Re-run all migrations from the beginning |
| `truffle test` | Run tests |
| `truffle console` | Open interactive console |
| `truffle console --network development` | Open console connected to Ganache GUI |
| `truffle debug <tx_hash>` | Debug a transaction |

## Contract Details

### SimpleStorage.sol

The contract provides two main functions:

- `set(uint256 x)`: Store a value
- `get()`: Retrieve the stored value

Events:
- `ValueChanged(uint256 newValue)`: Emitted when a value is stored

## Interacting with the Contract

### Using Foundry Cast

After deploying with Foundry, you can interact with the contract using `cast`:

```bash
# Set the contract address (replace with your deployed address)
CONTRACT_ADDRESS=0x5FbDB2315678afecb367f032d93F642f64180aa3

# Call the get function (read-only)
cast call $CONTRACT_ADDRESS "get()(uint256)"

# Send a transaction to set a value
cast send $CONTRACT_ADDRESS "set(uint256)" 123 --private-key 0xac0974bec39a17e36ba4a6b4d238ff944bacb478cbed5efcae784d7bf4f2ff80

# Check the new value
cast call $CONTRACT_ADDRESS "get()(uint256)"
```

Note: The private key shown above is the default Anvil account #0 private key (for local testing only).

### Using Hardhat Console

```bash
npx hardhat console
```

Then in the console:

```javascript
const SimpleStorage = await ethers.getContractFactory("SimpleStorage");
const contract = await SimpleStorage.deploy();
await contract.waitForDeployment();

// Set a value
await contract.set(123);

// Get the value
const value = await contract.get();
console.log(value.toString()); // Should print "123"
```

### Using Scripts

You can create additional scripts in the `scripts/` directory and run them with:

```bash
npx hardhat run scripts/your-script.js
```

## Testing

### Foundry Tests

This project includes comprehensive tests in `foundry-tests/SimpleStorage.t.sol` that cover:
- **Basic functionality**: set/get operations, initial state
- **Edge cases**: max uint256 values, zero values, multiple updates
- **Event emissions**: ValueChanged event testing
- **Fuzz testing**: Random value testing (256 runs)
- **Deployment testing**: Verification of DeploySimpleStorage.s.sol script

Run all tests with:

```bash
forge test
```

Expected output:
```
Ran 7 tests for foundry-tests/SimpleStorage.t.sol:SimpleStorageTest
[PASS] testFuzz_SetValue(uint256) (runs: 256, μ: 30490, ~: 30568)
[PASS] testInitialValue() (gas: 8012)
[PASS] testMaxUint256() (gas: 30276)
[PASS] testMultipleSets() (gas: 26072)
[PASS] testSetAndGet() (gas: 30342)
[PASS] testSetZero() (gas: 23048)
[PASS] testValueChangedEvent() (gas: 33640)
Suite result: ok. 7 passed; 0 failed; 0 skipped

Ran 2 tests for foundry-tests/SimpleStorage.t.sol:DeploySimpleStorageTest
[PASS] testDeployedContractFunctionality() (gas: 157706)
[PASS] testDeployment() (gas: 155551)
Suite result: ok. 2 passed; 0 failed; 0 skipped
```

For verbose output (useful for debugging):

```bash
forge test -vvvv
```

Run specific test contract:

```bash
forge test --match-contract SimpleStorageTest
```

Run specific test function:

```bash
forge test --match-test testSetAndGet
```

View gas reports:

```bash
forge test --gas-report
```

### Hardhat Tests

Create JavaScript test files in the `test/` directory. Example test file (`test/SimpleStorage.test.js`):

```javascript
const { expect } = require("chai");

describe("SimpleStorage", function () {
  it("Should store and retrieve a value", async function () {
    const SimpleStorage = await ethers.getContractFactory("SimpleStorage");
    const simpleStorage = await SimpleStorage.deploy();
    await simpleStorage.waitForDeployment();

    await simpleStorage.set(42);
    expect(await simpleStorage.get()).to.equal(42);
  });
});
```

Run tests with:

```bash
npm test
```

### Truffle Tests

This project includes comprehensive Truffle tests in `test/SimpleStorage.test.js` that verify:
- Storing and retrieving values
- Event emissions
- Initial state
- Multiple value updates

Run all tests with:

```bash
truffle test
```

Run tests on a specific network:

```bash
truffle test --network development
```

For verbose output:

```bash
truffle test --show-events
```

## Troubleshooting

### Foundry Issues

1. **"forge: command not found"**: Install Foundry using the installation command in Prerequisites

2. **Missing forge-std**: Run `forge install foundry-rs/forge-std --no-commit`

3. **Build fails**: Try running `forge clean` and then `forge build` again

4. **Anvil connection issues**: Make sure Anvil is running and listening on the correct port (default: 8545)

### Hardhat Issues

1. **"Cannot find module" errors**: Run `npm install` to install dependencies

2. **Compilation errors**: Make sure you're using Solidity 0.8.20 or compatible version

3. **Deployment fails**: Ensure the contract compiles successfully first with `npm run compile`

### Ganache Issues

1. **"You seem to be using Foundry's default sender"** (when using `forge script`):
   - **Solution**: You must provide a private key when deploying to Ganache with Foundry
   - Get a private key from Ganache (click the key icon 🔑 next to any account in the GUI)
   - Add `--private-key YOUR_PRIVATE_KEY` to your forge command:
     ```bash
     forge script script/DeploySimpleStorage.s.sol --fork-url http://127.0.0.1:7545 --private-key 0x4f3edf... --broadcast
     ```
   - Or use an environment variable for better security:
     ```bash
     export PRIVATE_KEY=0x4f3edf...
     forge script script/DeploySimpleStorage.s.sol --fork-url http://127.0.0.1:7545 --private-key $PRIVATE_KEY --broadcast
     ```

2. **Connection refused**: Make sure Ganache is running before deploying

3. **Wrong port**: Ganache GUI uses port 7545 by default, while Ganache CLI uses 8545. Update your commands accordingly

4. **Wrong Chain ID**: If you see chain ID mismatch errors:
   - Ganache GUI uses Chain ID 5777 by default
   - Ganache CLI uses Chain ID 1337 by default
   - The `hardhat.config.js` is configured for Chain ID 5777 (Ganache GUI)
   - To use Ganache CLI, either:
     - Start it with `--chain.chainId 5777` to match the config, OR
     - Update `hardhat.config.js` to use `chainId: 1337`

5. **Account locked errors**: Ganache auto-unlocks accounts by default, but ensure you're using the correct network configuration in `hardhat.config.js`

6. **"Invalid JSON RPC response"**: Check that Ganache is running and the URL is correct (`http://127.0.0.1:7545` for GUI)

7. **"invalid opcode" error / EIP-3855 incompatibility**:
   - **Problem**: Ganache doesn't support the PUSH0 opcode introduced in Solidity 0.8.20+ (EIP-3855/Shanghai hard fork)
   - **Symptoms**: You see "invalid opcode" error or warning about EIP-3855 not being supported
   - **Solution**: This project is already configured to use `evm_version = "paris"` in `foundry.toml`, which targets a Ganache-compatible EVM version
   - **If you still have issues**:
     - Make sure you've rebuilt after any changes: `forge build`
     - Or downgrade Solidity version in `foundry.toml` to `solc_version = "0.8.19"`
     - Or use Anvil instead of Ganache (which has full support for newer EIPs)

### Truffle Issues

1. **"truffle: command not found"**: Install Truffle globally with `npm install -g truffle`

2. **"Error: No network specified"**: Specify a network with `--network development` or configure a default network in `truffle-config.js`

3. **"Network up to date" when trying to redeploy**: Use `truffle migrate --reset` to force redeployment

4. **Compilation errors**: Make sure your contract is in the `contracts/` directory and Solidity version matches in `truffle-config.js`

5. **"Could not connect to your Ethereum client"**:
   - Make sure Ganache (or another local blockchain) is running
   - Verify the network configuration in `truffle-config.js` matches your blockchain's port and network ID
   - For Ganache GUI: default is `127.0.0.1:7545` with network ID 5777
   - For Ganache CLI: default is `127.0.0.1:8545` with network ID 1337

6. **EVM version compatibility**: The `truffle-config.js` is already configured with `evmVersion: "paris"` for Ganache compatibility

7. **"Source 'forge-std/...' not found" compilation errors**:
   - This occurs if Truffle tries to compile Foundry test files (`.t.sol`)
   - **Solution**: This project separates Foundry and Truffle tests into different directories:
     - Foundry tests are in `foundry-tests/` directory
     - Truffle tests are in `test/` directory
   - If you accidentally place `.t.sol` files in the `test/` directory, move them to `foundry-tests/`
   - Truffle cannot compile Foundry tests because it doesn't have access to the `forge-std` library

8. **Performance warning about µWS**: You may see a warning like "This version of µWS is not compatible with your Node.js build". This is safe to ignore - Truffle will fall back to a NodeJS implementation with slightly degraded performance

## Next Steps

- Add more functions to the SimpleStorage contract
- Create comprehensive tests
- Try deploying to testnets (Sepolia, Goerli)
- Integrate with a frontend using ethers.js or web3.js

## License

MIT
