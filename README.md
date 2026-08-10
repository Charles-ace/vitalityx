# VitalityX — Autonomous Wellness Procurement Agent on X Layer

> **OKX Web3 Developer Challenge / Build X Series 2026 (X Layer Arena / OKX.AI Genesis Track Submission)**

VitalityX is an autonomous **Wellness Procurement Agent** deployed on **X Layer** (OKX's EVM L2, Chain ID 195).

Unlike move-to-earn habit pools that rely on subjective AI verification or gambling mechanics, VitalityX functions as an end-to-end autonomous procurement agent:
1. **Goal Parsing:** Plain-language user wellness intake.
2. **On-Chain Provider Search & ERC-8004 Scoring:** Queries candidate providers on X Layer and evaluates reputation signals (completed orders, dispute rate, fulfillment speed).
3. **x402 Payment & Escrow:** Escrows user funds in `WellnessEscrow.sol` using x402 protocol standards.
4. **Independent Proof Verification:** Verifies fulfillment webhooks/artifacts (delivery hash, lab report hash, telehealth receipt) on-chain via agent ECDSA signatures before releasing funds.

---

## 🛠️ Tech Stack & Architecture

- **Smart Contracts:** Solidity `0.8.24`, Hardhat, OpenZeppelin 5.x (`ReentrancyGuard`, `Pausable`, `Ownable`, `ECDSA`).
  - `ProviderRegistry.sol`: Provider listing & ERC-8004 reputation signal tracking.
  - `WellnessEscrow.sol`: Holds user funds in escrow, verifies agent signatures, handles refund timeouts.
- **Network:** X Layer Testnet (Chain ID `195`, RPC `https://testnetrpc.xlayer.tech`, Native token `OKB`, Explorer `https://www.oklink.com/xlayer-test`).
- **Frontend:** Next.js 14 (App Router), TypeScript, Tailwind CSS (Prenetics/IM8 clinical aesthetic), Lucide Icons.
- **Web3 Integration:** Wagmi v2, Viem, OKX Wallet connector explicitly prioritized.
- **Agent API Routes:**
  - `POST /api/agent/plan`: Intent classification & ERC-8004 candidate scoring.
  - `POST /api/agent/pay`: x402 payment execution header & escrow preparation.
  - `POST /api/agent/verify`: Independent artifact hash computation & agent ECDSA signature submission.

---

## 🚀 Quickstart & Local Setup

### 1. Install Dependencies
```bash
npm install
```

### 2. Environment Configuration
Create a `.env.local` file in the root directory:
```env
PRIVATE_KEY="your_x_layer_deployer_private_key"
AGENT_PRIVATE_KEY="your_agent_signer_private_key"
NEXT_PUBLIC_REGISTRY_ADDRESS="0x..."
NEXT_PUBLIC_ESCROW_ADDRESS="0x..."
```

### 3. Run Development Server
```bash
npm run dev
```
Open [http://localhost:3000](http://localhost:3000) in your browser.

---

## 📜 Deploying Contracts to X Layer Testnet

1. **Compile Contracts:**
   ```bash
   npx hardhat compile
   ```

2. **Deploy & Seed Test Providers:**
   ```bash
   npx hardhat run scripts/deploy.ts --network xlayerTestnet
   ```

3. **Update Environment Addresses:**
   Copy the output `NEXT_PUBLIC_REGISTRY_ADDRESS` and `NEXT_PUBLIC_ESCROW_ADDRESS` into `.env.local`.

---

## 🔒 Security & Independent Verification

- **Escrow Safety:** `ReentrancyGuard` on all state-modifying payable methods.
- **No Trust-on-Claim:** Providers cannot release escrow funds unilaterally. Only a valid ECDSA signature from the authorized agent over `keccak256(abi.encodePacked(goalId, verificationHash, contractAddress))` can trigger release.
- **User Refund Guarantee:** If verification fails or times out (default 7 days), funds are safely returned to the user.
