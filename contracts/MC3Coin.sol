// SPDX-License-Identifier: MIT
pragma solidity ^0.8.22;

import "@openzeppelin/contracts-upgradeable/token/ERC20/ERC20Upgradeable.sol";
import "@openzeppelin/contracts-upgradeable/access/OwnableUpgradeable.sol";
import "@openzeppelin/contracts-upgradeable/proxy/utils/Initializable.sol";
import "@openzeppelin/contracts-upgradeable/proxy/utils/UUPSUpgradeable.sol";

/**
 * @title MC3Coin
 * @dev Upgradeable ERC20 token with admin-controlled minting/burning and buy/sell functionality
 *
 * Features:
 * - Upgradeable using UUPS proxy pattern
 * - Admin role management (add/remove admins)
 * - Admins can mint and burn tokens
 * - Users can buy tokens from the contract (1 MC3 = 0.01 ETH)
 * - Users can sell tokens back to the contract
 * - Initial supply of 1,000,000 tokens minted to deployer
 */
contract MC3Coin is Initializable, ERC20Upgradeable, OwnableUpgradeable, UUPSUpgradeable {
    // Events
    event AdminAdded(address indexed admin);
    event AdminRemoved(address indexed admin);
    event TokensPurchased(address indexed buyer, uint256 amount, uint256 cost);
    event TokensSold(address indexed seller, uint256 amount, uint256 payment);
    event PriceUpdated(uint256 newPrice);

    // State variables
    mapping(address => bool) private admins;
    uint256 public tokenPrice; // Price in wei per token (1 MC3 = 0.01 ETH)

    /// @custom:oz-upgrades-unsafe-allow constructor
    constructor() {
        _disableInitializers();
    }

    /**
     * @dev Initializes the contract
     * Sets up the token name/symbol, mints initial supply, and sets the deployer as admin
     */
    function initialize() public initializer {
        __ERC20_init("MC3Coin", "MC3");
        __Ownable_init(msg.sender);

        // Set initial price: 1 MC3 = 0.01 ETH
        tokenPrice = 0.01 ether;

        // Mint 1,000,000 tokens (with 18 decimals) to deployer
        _mint(msg.sender, 1_000_000 * 10 ** decimals());

        // Make deployer an admin
        admins[msg.sender] = true;
        emit AdminAdded(msg.sender);
    }

    /**
     * @dev Modifier to restrict functions to admins only
     */
    modifier onlyAdmin() {
        require(admins[msg.sender], "MC3Coin: caller is not an admin");
        _;
    }

    /**
     * @dev Adds a new admin
     * @param admin Address to grant admin privileges
     * Can only be called by owner
     */
    function addAdmin(address admin) external onlyOwner {
        require(admin != address(0), "MC3Coin: admin is zero address");
        require(!admins[admin], "MC3Coin: address is already an admin");

        admins[admin] = true;
        emit AdminAdded(admin);
    }

    /**
     * @dev Removes an admin
     * @param admin Address to revoke admin privileges
     * Can only be called by owner
     */
    function removeAdmin(address admin) external onlyOwner {
        require(admins[admin], "MC3Coin: address is not an admin");

        admins[admin] = false;
        emit AdminRemoved(admin);
    }

    /**
     * @dev Checks if an address is an admin
     * @param account Address to check
     * @return bool True if address is an admin
     */
    function isAdmin(address account) external view returns (bool) {
        return admins[account];
    }

    /**
     * @dev Mints new tokens
     * @param to Address to receive minted tokens
     * @param amount Amount of tokens to mint (in wei units)
     * Can only be called by admins
     */
    function mint(address to, uint256 amount) external onlyAdmin {
        require(to != address(0), "MC3Coin: mint to zero address");
        _mint(to, amount);
    }

    /**
     * @dev Burns tokens from caller's balance
     * @param amount Amount of tokens to burn
     * Can only be called by admins
     */
    function burn(uint256 amount) external onlyAdmin {
        _burn(msg.sender, amount);
    }

    /**
     * @dev Burns tokens from a specific address
     * @param from Address to burn tokens from
     * @param amount Amount of tokens to burn
     * Can only be called by admins
     */
    function burnFrom(address from, uint256 amount) external onlyAdmin {
        _burn(from, amount);
    }

    /**
     * @dev Allows users to buy tokens from the contract
     * Sends ETH and receives MC3 tokens at the current price
     */
    function buyTokens() external payable {
        require(msg.value > 0, "MC3Coin: must send ETH to buy tokens");

        // Calculate token amount: (msg.value * 10**decimals()) / tokenPrice
        uint256 tokenAmount = (msg.value * 10 ** decimals()) / tokenPrice;
        require(tokenAmount > 0, "MC3Coin: insufficient ETH for 1 token");

        // Mint tokens to buyer
        _mint(msg.sender, tokenAmount);

        emit TokensPurchased(msg.sender, tokenAmount, msg.value);
    }

    /**
     * @dev Allows users to sell tokens back to the contract
     * @param amount Amount of tokens to sell (in wei units)
     * Requires contract to have sufficient ETH balance
     */
    function sellTokens(uint256 amount) external {
        require(amount > 0, "MC3Coin: must sell at least 1 token");
        require(balanceOf(msg.sender) >= amount, "MC3Coin: insufficient token balance");

        // Calculate ETH payment: (amount * tokenPrice) / 10**decimals()
        uint256 ethPayment = (amount * tokenPrice) / 10 ** decimals();
        require(address(this).balance >= ethPayment, "MC3Coin: insufficient contract ETH balance");

        // Burn tokens from seller
        _burn(msg.sender, amount);

        // Send ETH to seller
        (bool success,) = msg.sender.call{value: ethPayment}("");
        require(success, "MC3Coin: ETH transfer failed");

        emit TokensSold(msg.sender, amount, ethPayment);
    }

    /**
     * @dev Updates the token price
     * @param newPrice New price in wei per token
     * Can only be called by owner
     */
    function setTokenPrice(uint256 newPrice) external onlyOwner {
        require(newPrice > 0, "MC3Coin: price must be greater than 0");
        tokenPrice = newPrice;
        emit PriceUpdated(newPrice);
    }

    /**
     * @dev Allows owner to withdraw ETH from contract
     * @param amount Amount of ETH to withdraw
     */
    function withdrawETH(uint256 amount) external onlyOwner {
        require(address(this).balance >= amount, "MC3Coin: insufficient balance");
        (bool success,) = owner().call{value: amount}("");
        require(success, "MC3Coin: ETH transfer failed");
    }

    /**
     * @dev Returns the contract's ETH balance
     */
    function getContractBalance() external view returns (uint256) {
        return address(this).balance;
    }

    /**
     * @dev Required by UUPS pattern - authorizes upgrades
     * Can only be called by owner
     */
    function _authorizeUpgrade(address newImplementation) internal override onlyOwner {}

    /**
     * @dev Allows contract to receive ETH
     */
    receive() external payable {}
}
