// SPDX-License-Identifier: MIT
pragma solidity ^0.8.20;

import "@openzeppelin/contracts/utils/ReentrancyGuard.sol";
import "@openzeppelin/contracts/utils/Pausable.sol";
import "@openzeppelin/contracts/utils/cryptography/ECDSA.sol";
import "@openzeppelin/contracts/utils/cryptography/MessageHashUtils.sol";
import "@openzeppelin/contracts/access/Ownable.sol";

error VitalityVault__InvalidStakeAmount();
error VitalityVault__CommitmentAlreadyActive();
error VitalityVault__NoActiveCommitment();
error VitalityVault__CooldownNotPassed();
error VitalityVault__InvalidSignature();
error VitalityVault__CommitmentNotCompleted();
error VitalityVault__CommitmentAlreadyResolved();

contract VitalityVault is ReentrancyGuard, Pausable, Ownable {
    using ECDSA for bytes32;
    using MessageHashUtils for bytes32;

    struct Commitment {
        address user;
        uint256 amountStaked;
        uint256 startTime;
        uint256 lastLogTime;
        uint256 daysCompleted;
        bool isActive;
    }

    uint256 public constant MIN_STAKE = 0.01 ether; // Minimum OKB
    uint256 public constant STREAK_GOAL = 7;
    uint256 public constant COOLDOWN = 1 days;

    address public aiOracleSigner;
    uint256 public rewardPool;

    mapping(address => Commitment) public commitments;

    event CommitmentStarted(address indexed user, uint256 amountStaked, uint256 startTime);
    event HabitLogged(address indexed user, uint256 daysCompleted, uint256 timestamp);
    event CommitmentResolved(address indexed user, bool success, uint256 payout);

    constructor(address _aiOracleSigner) Ownable(msg.sender) {
        aiOracleSigner = _aiOracleSigner;
    }

    function setOracleSigner(address _newSigner) external onlyOwner {
        aiOracleSigner = _newSigner;
    }

    function stakeCommitment() external payable whenNotPaused nonReentrant {
        if (msg.value < MIN_STAKE) revert VitalityVault__InvalidStakeAmount();
        if (commitments[msg.sender].isActive) revert VitalityVault__CommitmentAlreadyActive();

        commitments[msg.sender] = Commitment({
            user: msg.sender,
            amountStaked: msg.value,
            startTime: block.timestamp,
            lastLogTime: 0,
            daysCompleted: 0,
            isActive: true
        });

        emit CommitmentStarted(msg.sender, msg.value, block.timestamp);
    }

    function logDailyHabit(bytes calldata signature, uint256 timestamp) external whenNotPaused {
        Commitment storage userCommit = commitments[msg.sender];
        if (!userCommit.isActive) revert VitalityVault__NoActiveCommitment();
        if (block.timestamp < userCommit.lastLogTime + COOLDOWN) revert VitalityVault__CooldownNotPassed();

        // Verify the signature from the AI Oracle Backend
        // The message hash should be: keccak256(abi.encodePacked(msg.sender, timestamp))
        bytes32 messageHash = keccak256(abi.encodePacked(msg.sender, timestamp));
        bytes32 ethSignedMessageHash = messageHash.toEthSignedMessageHash();
        address recoveredSigner = ethSignedMessageHash.recover(signature);

        if (recoveredSigner != aiOracleSigner) revert VitalityVault__InvalidSignature();

        userCommit.lastLogTime = block.timestamp;
        userCommit.daysCompleted += 1;

        emit HabitLogged(msg.sender, userCommit.daysCompleted, block.timestamp);
    }

    function resolveCommitment() external nonReentrant {
        Commitment storage userCommit = commitments[msg.sender];
        if (!userCommit.isActive) revert VitalityVault__NoActiveCommitment();
        if (block.timestamp < userCommit.startTime + (STREAK_GOAL * 1 days)) revert VitalityVault__CommitmentNotCompleted();

        userCommit.isActive = false;

        if (userCommit.daysCompleted >= STREAK_GOAL) {
            // Success: Return stake + a small reward from the pool (if any)
            uint256 payout = userCommit.amountStaked;
            
            // Simple logic: if pool > 0, give 5% bonus from pool
            uint256 bonus = (userCommit.amountStaked * 5) / 100;
            if (rewardPool >= bonus) {
                payout += bonus;
                rewardPool -= bonus;
            }
            
            (bool success, ) = msg.sender.call{value: payout}("");
            require(success, "Transfer failed");
            
            emit CommitmentResolved(msg.sender, true, payout);
        } else {
            // Failed: Slash stake to reward pool
            rewardPool += userCommit.amountStaked;
            emit CommitmentResolved(msg.sender, false, 0);
        }
    }

    // Owner functions to manage vault state
    function pause() external onlyOwner {
        _pause();
    }

    function unpause() external onlyOwner {
        _unpause();
    }
}
