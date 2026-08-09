# VitalityX

Gamified "Lifestyle-to-Earn" (L2E) and AI Wellness Companion deployed on OKX Web3 X Layer Testnet.

## Quickstart

1. **Install dependencies:**
   ```bash
   npm install
   ```

2. **Run the Next.js development server:**
   ```bash
   npm run dev
   ```

3. **Environment Variables (`.env`):**
   Create a `.env` file in the root with:
   ```
   PRIVATE_KEY="your_wallet_private_key"
   ORACLE_PRIVATE_KEY="your_oracle_private_key"
   ```

## Deploying to X Layer Testnet

1. Compile the smart contracts:
   ```bash
   npx hardhat compile
   ```

2. Deploy using Hardhat Ignition or scripts:
   Since Hardhat is configured for `xlayerTestnet` in `hardhat.config.ts`, you can deploy by running:
   ```bash
   npx hardhat run scripts/deploy.ts --network xlayerTestnet
   ```
   (Make sure you have X Layer Testnet OKB to pay for gas, and update `CONTRACT_ADDRESS` in `components/Dashboard.tsx` with your newly deployed contract).

## Tech Stack
* Smart Contracts: Solidity, Hardhat, OpenZeppelin
* Frontend: Next.js (App Router), TailwindCSS, React, Wagmi
* AI Backend: Next.js API Routes, Ethers
