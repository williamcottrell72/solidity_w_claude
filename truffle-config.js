module.exports = {
  // Configure networks
  networks: {
    // Development network (Ganache GUI)
    development: {
      host: "127.0.0.1",     // Localhost
      port: 7545,            // Ganache GUI default port
      network_id: "5777",    // Ganache GUI default network id
    },

    // Ganache CLI network
    ganache_cli: {
      host: "127.0.0.1",
      port: 8545,            // Ganache CLI default port
      network_id: "1337",    // Ganache CLI default network id
    },

    // Hardhat/Anvil network
    localhost: {
      host: "127.0.0.1",
      port: 8545,
      network_id: "*",       // Match any network id
    },
  },

  // Configure your compilers
  compilers: {
    solc: {
      version: "0.8.20",
      settings: {
        optimizer: {
          enabled: true,
          runs: 200
        },
        // Set EVM version to "paris" for Ganache compatibility
        // Ganache doesn't support the PUSH0 opcode from Shanghai (EIP-3855)
        evmVersion: "paris"
      }
    }
  },

  // Truffle DB is currently disabled by default
  db: {
    enabled: false
  },

  // Specify the contracts directory
  contracts_directory: "./contracts",
  contracts_build_directory: "./build/contracts",

  // Configure migrations
  migrations_directory: "./migrations"
};
