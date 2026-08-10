import hre from "hardhat";

const { ethers } = hre;

async function main() {
  const [deployer] = await ethers.getSigners();
  console.log("Deploying contracts with account:", deployer.address);

  // 1. Deploy ProviderRegistry
  const ProviderRegistry = await ethers.getContractFactory("ProviderRegistry");
  const registry = await ProviderRegistry.deploy();
  await registry.waitForDeployment();
  const registryAddress = await registry.getAddress();
  console.log("ProviderRegistry deployed to:", registryAddress);

  // 2. Deploy WellnessEscrow
  const agentSignerAddress = process.env.AGENT_PUBLIC_ADDRESS || deployer.address;
  const WellnessEscrow = await ethers.getContractFactory("WellnessEscrow");
  const escrow = await WellnessEscrow.deploy(registryAddress, agentSignerAddress);
  await escrow.waitForDeployment();
  const escrowAddress = await escrow.getAddress();
  console.log("WellnessEscrow deployed to:", escrowAddress);

  // 3. Authorize WellnessEscrow on ProviderRegistry
  const txAuth = await registry.setAuthorizedUpdater(escrowAddress, true);
  await txAuth.wait();
  console.log("Authorized WellnessEscrow as reputation updater on ProviderRegistry");

  // 4. Seed initial mock providers for X Layer Testnet hackathon demonstration
  console.log("\nSeeding wellness providers on X Layer...");
  const seedProviders = [
    {
      name: "SleepMax Longevity Subscription",
      price: ethers.parseEther("0.01"),
      category: "sleep"
    },
    {
      name: "At-Home Biomarker Blood Test Kit",
      price: ethers.parseEther("0.025"),
      category: "lab-tests"
    },
    {
      name: "Post-Injury Knee Recovery Physio",
      price: ethers.parseEther("0.015"),
      category: "recovery"
    },
    {
      name: "DeSci Telehealth Longevity Consult",
      price: ethers.parseEther("0.02"),
      category: "telehealth"
    }
  ];

  for (const p of seedProviders) {
    const tx = await registry.registerProvider(p.name, p.price, p.category);
    await tx.wait();
    console.log(`Registered provider: "${p.name}" (${p.category}) - Price: ${ethers.formatEther(p.price)} OKB`);
  }

  console.log("\nDeployment completed successfully!");
  console.log("==========================================");
  console.log("NEXT_PUBLIC_REGISTRY_ADDRESS=", registryAddress);
  console.log("NEXT_PUBLIC_ESCROW_ADDRESS=", escrowAddress);
  console.log("==========================================");
}

main().catch((error) => {
  console.error(error);
  process.exitCode = 1;
});
