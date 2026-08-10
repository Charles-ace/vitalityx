// SPDX-License-Identifier: MIT
pragma solidity ^0.8.20;

import "@openzeppelin/contracts/access/Ownable.sol";

/**
 * @title ProviderRegistry
 * @dev Manages wellness provider listings on X Layer and tracks ERC-8004 style reputation signals.
 */
contract ProviderRegistry is Ownable {

    struct Provider {
        address providerAddress;
        string serviceName;
        uint256 price; // In wei (OKB native token)
        string category; // e.g. "sleep", "lab-tests", "telehealth", "recovery"
        uint32 completedOrders;
        uint32 disputes;
        bool isActive;
    }

    // Mapping from provider address to Provider details
    mapping(address => Provider) public providers;
    
    // Array of registered provider addresses for iteration
    address[] public providerAddresses;

    // Authorized callers allowed to update reputation (Escrow contract or Agent)
    mapping(address => bool) public authorizedReputationUpdaters;

    // Events
    event ProviderRegistered(
        address indexed providerAddress,
        string serviceName,
        uint256 price,
        string category
    );
    event ProviderUpdated(address indexed providerAddress, uint256 price, bool isActive);
    event ReputationUpdated(address indexed providerAddress, uint32 completedOrders, uint32 disputes);
    event UpdaterAuthorized(address indexed updater, bool isAuthorized);

    // Custom errors
    error AlreadyRegistered();
    error NotRegistered();
    error Unauthorized();
    error InvalidPrice();

    modifier onlyAuthorized() {
        if (msg.sender != owner() && !authorizedReputationUpdaters[msg.sender]) {
            revert Unauthorized();
        }
        _;
    }

    constructor() Ownable(msg.sender) {}

    /**
     * @notice Authorize an address (e.g., WellnessEscrow contract) to update reputation metrics
     */
    function setAuthorizedUpdater(address updater, bool isAuthorized) external onlyOwner {
        authorizedReputationUpdaters[updater] = isAuthorized;
        emit UpdaterAuthorized(updater, isAuthorized);
    }

    /**
     * @notice Register a new wellness service provider
     */
    function registerProvider(
        string memory serviceName,
        uint256 price,
        string memory category
    ) external {
        if (providers[msg.sender].providerAddress != address(0)) revert AlreadyRegistered();
        if (price == 0) revert InvalidPrice();

        providers[msg.sender] = Provider({
            providerAddress: msg.sender,
            serviceName: serviceName,
            price: price,
            category: category,
            completedOrders: 0,
            disputes: 0,
            isActive: true
        });

        providerAddresses.push(msg.sender);

        emit ProviderRegistered(msg.sender, serviceName, price, category);
    }

    /**
     * @notice Update provider service price or status
     */
    function updateProviderDetails(uint256 price, bool isActive) external {
        if (providers[msg.sender].providerAddress == address(0)) revert NotRegistered();
        if (price == 0) revert InvalidPrice();

        providers[msg.sender].price = price;
        providers[msg.sender].isActive = isActive;

        emit ProviderUpdated(msg.sender, price, isActive);
    }

    /**
     * @notice Update ERC-8004 reputation metrics for a provider after order completion or dispute
     */
    function updateReputation(address providerAddress, bool success) external onlyAuthorized {
        Provider storage provider = providers[providerAddress];
        if (provider.providerAddress == address(0)) revert NotRegistered();

        if (success) {
            provider.completedOrders += 1;
        } else {
            provider.disputes += 1;
        }

        emit ReputationUpdated(providerAddress, provider.completedOrders, provider.disputes);
    }

    /**
     * @notice Query candidate providers by category
     */
    function getProvidersByCategory(string memory category) external view returns (Provider[] memory) {
        uint256 matchCount = 0;
        bytes32 categoryHash = keccak256(abi.encodePacked(category));

        for (uint256 i = 0; i < providerAddresses.length; i++) {
            Provider memory p = providers[providerAddresses[i]];
            if (p.isActive && (bytes(category).length == 0 || keccak256(abi.encodePacked(p.category)) == categoryHash)) {
                matchCount++;
            }
        }

        Provider[] memory result = new Provider[](matchCount);
        uint256 index = 0;

        for (uint256 i = 0; i < providerAddresses.length; i++) {
            Provider memory p = providers[providerAddresses[i]];
            if (p.isActive && (bytes(category).length == 0 || keccak256(abi.encodePacked(p.category)) == categoryHash)) {
                result[index] = p;
                index++;
            }
        }

        return result;
    }

    /**
     * @notice Get all registered providers
     */
    function getAllProviders() external view returns (Provider[] memory) {
        Provider[] memory result = new Provider[](providerAddresses.length);
        for (uint256 i = 0; i < providerAddresses.length; i++) {
            result[i] = providers[providerAddresses[i]];
        }
        return result;
    }
}
