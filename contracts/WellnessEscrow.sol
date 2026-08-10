// SPDX-License-Identifier: MIT
pragma solidity ^0.8.20;

import "@openzeppelin/contracts/utils/ReentrancyGuard.sol";
import "@openzeppelin/contracts/utils/Pausable.sol";
import "@openzeppelin/contracts/access/Ownable.sol";
import "@openzeppelin/contracts/utils/cryptography/ECDSA.sol";
import "@openzeppelin/contracts/utils/cryptography/MessageHashUtils.sol";

interface IProviderRegistry {
    function updateReputation(address providerAddress, bool success) external;
    function providers(address providerAddress) external view returns (
        address providerAddressOut,
        string memory serviceName,
        uint256 price,
        string memory category,
        uint32 completedOrders,
        uint32 disputes,
        bool isActive
    );
}

/**
 * @title WellnessEscrow
 * @dev Holds user funds in escrow for wellness procurement until independent AI agent verification proof is submitted.
 */
contract WellnessEscrow is ReentrancyGuard, Pausable, Ownable {
    using ECDSA for bytes32;

    enum GoalStatus { Active, Verified, Refunded }

    struct Goal {
        uint256 goalId;
        address user;
        address provider;
        uint256 amount;
        bytes32 goalHash;
        bytes32 verificationHash;
        uint256 createdAt;
        uint256 timeoutAt;
        GoalStatus status;
    }

    IProviderRegistry public registry;
    address public agentSigner;

    uint256 public nextGoalId = 1;
    uint256 public constant TIMEOUT_DURATION = 7 days;

    mapping(uint256 => Goal) public goals;
    mapping(address => uint256[]) public userGoals;

    // Events
    event GoalCreated(
        uint256 indexed goalId,
        address indexed user,
        address indexed provider,
        uint256 amount,
        bytes32 goalHash,
        uint256 timeoutAt
    );
    event GoalVerified(
        uint256 indexed goalId,
        address indexed provider,
        uint256 amount,
        bytes32 verificationHash
    );
    event GoalRefunded(uint256 indexed goalId, address indexed user, uint256 amount);
    event AgentSignerUpdated(address indexed newAgentSigner);
    event RegistryUpdated(address indexed newRegistry);

    // Custom errors
    error InvalidProvider();
    error IncorrectPaymentAmount();
    error InvalidGoalId();
    error GoalNotActive();
    error InvalidSignature();
    error TimeoutNotReached();
    error TransferFailed();

    constructor(address _registryAddress, address _agentSigner) Ownable(msg.sender) {
        registry = IProviderRegistry(_registryAddress);
        agentSigner = _agentSigner;
    }

    function setAgentSigner(address _agentSigner) external onlyOwner {
        agentSigner = _agentSigner;
        emit AgentSignerUpdated(_agentSigner);
    }

    function setRegistry(address _registryAddress) external onlyOwner {
        registry = IProviderRegistry(_registryAddress);
        emit RegistryUpdated(_registryAddress);
    }

    /**
     * @notice Create a wellness procurement goal escrow for a chosen provider
     */
    function createGoal(address provider, bytes32 goalHash) external payable whenNotPaused nonReentrant returns (uint256) {
        if (provider == address(0)) revert InvalidProvider();
        if (msg.value == 0) revert IncorrectPaymentAmount();

        uint256 goalId = nextGoalId++;
        uint256 timeoutAt = block.timestamp + TIMEOUT_DURATION;

        goals[goalId] = Goal({
            goalId: goalId,
            user: msg.sender,
            provider: provider,
            amount: msg.value,
            goalHash: goalHash,
            verificationHash: bytes32(0),
            createdAt: block.timestamp,
            timeoutAt: timeoutAt,
            status: GoalStatus.Active
        });

        userGoals[msg.sender].push(goalId);

        emit GoalCreated(goalId, msg.sender, provider, msg.value, goalHash, timeoutAt);
        return goalId;
    }

    /**
     * @notice Submit independent verification proof signed by the authorized AI agent
     */
    function submitVerificationProof(
        uint256 goalId,
        bytes32 verificationHash,
        bytes calldata signature
    ) external whenNotPaused nonReentrant {
        Goal storage goal = goals[goalId];
        if (goal.goalId == 0) revert InvalidGoalId();
        if (goal.status != GoalStatus.Active) revert GoalNotActive();

        // Verify ECDSA signature: message is keccak256(abi.encodePacked(goalId, verificationHash, address(this)))
        bytes32 messageHash = keccak256(abi.encodePacked(goalId, verificationHash, address(this)));
        bytes32 ethSignedMessageHash = MessageHashUtils.toEthSignedMessageHash(messageHash);
        
        address recoveredSigner = ECDSA.recover(ethSignedMessageHash, signature);
        if (recoveredSigner != agentSigner) revert InvalidSignature();

        // Update goal status
        goal.verificationHash = verificationHash;
        goal.status = GoalStatus.Verified;

        // Release funds to provider
        uint256 amountToTransfer = goal.amount;
        (bool success, ) = payable(goal.provider).call{value: amountToTransfer}("");
        if (!success) revert TransferFailed();

        // Accrue reputation signal on registry
        if (address(registry) != address(0)) {
            try registry.updateReputation(goal.provider, true) {} catch {}
        }

        emit GoalVerified(goalId, goal.provider, amountToTransfer, verificationHash);
    }

    /**
     * @notice Refund user if verification fails or times out
     */
    function refund(uint256 goalId) external nonReentrant {
        Goal storage goal = goals[goalId];
        if (goal.goalId == 0) revert InvalidGoalId();
        if (goal.status != GoalStatus.Active) revert GoalNotActive();
        if (block.timestamp < goal.timeoutAt) revert TimeoutNotReached();

        goal.status = GoalStatus.Refunded;

        uint256 amountToRefund = goal.amount;
        (bool success, ) = payable(goal.user).call{value: amountToRefund}("");
        if (!success) revert TransferFailed();

        // Update dispute reputation metric on registry
        if (address(registry) != address(0)) {
            try registry.updateReputation(goal.provider, false) {} catch {}
        }

        emit GoalRefunded(goalId, goal.user, amountToRefund);
    }

    /**
     * @notice View user goal IDs
     */
    function getUserGoalIds(address user) external view returns (uint256[] memory) {
        return userGoals[user];
    }
}
