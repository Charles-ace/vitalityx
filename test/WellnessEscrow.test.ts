import { expect } from "chai";
import hre from "hardhat";
import { anyValue } from "@nomicfoundation/hardhat-chai-matchers/withArgs.js";
import { loadFixture, time } from "@nomicfoundation/hardhat-toolbox/network-helpers.js";
import { ProviderRegistry, WellnessEscrow } from "../typechain-types";
import { Signer } from "ethers";

const { ethers } = hre;

describe("WellnessEscrow", () => {
  async function deployFixture() {
    const [deployer, user, provider, stranger] = await ethers.getSigners();

    const ProviderRegistry = await ethers.getContractFactory("ProviderRegistry");
    const registry = (await ProviderRegistry.deploy()) as ProviderRegistry;
    await registry.waitForDeployment();

    const WellnessEscrow = await ethers.getContractFactory("WellnessEscrow");
    const escrow = (await WellnessEscrow.deploy(await registry.getAddress(), deployer.address)) as WellnessEscrow;
    await escrow.waitForDeployment();

    await (await registry.setAuthorizedUpdater(await escrow.getAddress(), true)).wait();
    await (await registry.connect(provider).registerProvider("Test Sleep Protocol", ethers.parseEther("0.01"), "sleep")).wait();

    return { deployer, user, provider, stranger, registry, escrow };
  }

  async function createGoalFixture() {
    const ctx = await deployFixture();
    const { user, provider, registry, escrow } = ctx;
    const goalHash = ethers.keccak256(ethers.toUtf8Bytes("better sleep"));
    await (await escrow.connect(user).createGoal(provider.address, goalHash, { value: ethers.parseEther("0.01") })).wait();
    return { ...ctx, goalHash };
  }

  function signVerification(agent: Signer, goalId: bigint, verificationHash: string, escrowAddress: string) {
    const rawHash = ethers.solidityPackedKeccak256(
      ["uint256", "bytes32", "address"],
      [goalId, verificationHash, escrowAddress]
    );
    return agent.signMessage(ethers.getBytes(rawHash));
  }

  it("locks user funds in escrow on createGoal", async () => {
    const { user, provider, escrow, goalHash } = await loadFixture(createGoalFixture);
    expect(await ethers.provider.getBalance(await escrow.getAddress())).to.equal(ethers.parseEther("0.01"));
    const goal = await escrow.goals(1);
    expect(goal.user).to.equal(user.address);
    expect(goal.provider).to.equal(provider.address);
    expect(goal.amount).to.equal(ethers.parseEther("0.01"));
    expect(goal.goalHash).to.equal(goalHash);
    expect(goal.status).to.equal(0); // Active
  });

  it("rejects escrow creation for an unregistered provider", async () => {
    const { deployer, escrow, goalHash } = await loadFixture(deployFixture);
    const goalHash2 = ethers.keccak256(ethers.toUtf8Bytes("ghost provider"));
    await expect(
      escrow.connect(deployer).createGoal(await deployer.getAddress(), goalHash2, { value: ethers.parseEther("0.01") })
    ).to.be.revertedWithCustomError(escrow, "InvalidProvider");
  });

  it("releases funds to provider on valid agent verification and accrues reputation", async () => {
    const { provider, registry, escrow, goalHash } = await loadFixture(createGoalFixture);
    const verificationHash = ethers.keccak256(ethers.toUtf8Bytes("tracking:EVRY-88421"));

    const [agent] = await ethers.getSigners();
    const signature = await signVerification(agent, 1n, verificationHash, await escrow.getAddress());

    const balanceBefore = await ethers.provider.getBalance(provider.address);
    await (await escrow.submitVerificationProof(1n, verificationHash, signature)).wait();
    expect(await ethers.provider.getBalance(provider.address)).to.equal(
      balanceBefore + ethers.parseEther("0.01")
    );
    expect(await ethers.provider.getBalance(await escrow.getAddress())).to.equal(0n);

    const goal = await escrow.goals(1);
    expect(goal.status).to.equal(1); // Verified
    expect(goal.verificationHash).to.equal(verificationHash);

    const p = await registry.providers(provider.address);
    expect(p.completedOrders).to.equal(1);
    expect(p.disputes).to.equal(0);
  });

  it("rejects verification signatures from a non-agent signer", async () => {
    const { stranger, escrow, goalHash } = await loadFixture(createGoalFixture);
    const verificationHash = ethers.keccak256(ethers.toUtf8Bytes("tracking:EVRY-99999"));
    const signature = await signVerification(stranger, 1n, verificationHash, await escrow.getAddress());

    await expect(escrow.submitVerificationProof(1n, verificationHash, signature)).to.be.revertedWithCustomError(
      escrow,
      "InvalidSignature"
    );
  });

  it("cannot refund before the timeout window elapses", async () => {
    const { user, escrow, goalHash } = await loadFixture(createGoalFixture);
    await expect(escrow.connect(user).refund(1n)).to.be.revertedWithCustomError(escrow, "TimeoutNotReached");
  });

  it("refunds the user after timeout and records a dispute against the provider", async () => {
    const { user, provider, registry, escrow, goalHash } = await loadFixture(createGoalFixture);
    await time.increase(7 * 24 * 60 * 60 + 1);

    const balanceBefore = await ethers.provider.getBalance(user.address);
    const tx = await escrow.connect(user).refund(1n);
    const receipt = await tx.wait();
    const gasUsed = receipt!.gasUsed * receipt!.gasPrice;
    expect(await ethers.provider.getBalance(user.address)).to.equal(balanceBefore + ethers.parseEther("0.01") - gasUsed);
    expect(await ethers.provider.getBalance(await escrow.getAddress())).to.equal(0n);

    const goal = await escrow.goals(1);
    expect(goal.status).to.equal(2); // Refunded

    const p = await registry.providers(provider.address);
    expect(p.disputes).to.equal(1);
  });

  it("emits GoalCreated and GoalVerified events", async () => {
    const { user, provider, registry, escrow, goalHash } = await loadFixture(deployFixture);
    const goalHash2 = ethers.keccak256(ethers.toUtf8Bytes("baseline blood panel"));

    await expect(escrow.connect(user).createGoal(provider.address, goalHash2, { value: ethers.parseEther("0.02") }))
      .to.emit(escrow, "GoalCreated")
      .withArgs(1, user.address, provider.address, ethers.parseEther("0.02"), goalHash2, anyValue);
    const goal2 = await escrow.goals(1);
    expect(goal2.timeoutAt).to.be.closeTo((await time.latest()) + 7 * 24 * 60 * 60, 2);

    const [agent] = await ethers.getSigners();
    const verificationHash = ethers.keccak256(ethers.toUtf8Bytes("lab-report:LM-8812"));
    const signature = await signVerification(agent, 1n, verificationHash, await escrow.getAddress());
    await expect(escrow.submitVerificationProof(1n, verificationHash, signature))
      .to.emit(escrow, "GoalVerified")
      .withArgs(1, provider.address, ethers.parseEther("0.02"), verificationHash);
  });
});
