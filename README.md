# VitalityX — Autonomous Wellness Procurement Agent on X Layer

> **OKX Web3 Developer Challenge / Build X Series 2026 — X Layer Arena / OKX.AI Genesis Track**

VitalityX is an autonomous **Wellness Procurement Agent** on **X Layer** (OKX's EVM L2, Chain ID `195`, native token `OKB`). It is deliberately *not* a move-to-earn / habit-staking app. There is no slash pool, no zero-sum redistribution, and no single AI judge deciding who keeps their money.

The agent does real work end-to-end:

1. **The Goal** — you state a wellness goal in plain language ("I want better sleep", "help me get a baseline blood panel").
2. **The Search** — the agent queries a marketplace of wellness providers registered on-chain in `ProviderRegistry`.
3. **The Evaluation** — candidates are scored on price + **ERC-8004**-style reputation signals (verified completed orders, disputes).
4. **The Payment** — payment is authorized via an **x402** payment intent and your OKB is locked in the `WellnessEscrow` contract.
5. **The Verification** — the agent **does not trust the provider's "delivered" flag**. It only releases funds after independently checking a verifiable fulfillment record (courier tracking reference, lab report reference, appointment completion id, subscription receipt) bound to your goal, hashing it, and submitting an ECDSA-signed proof on-chain.
6. **The Record** — every goal leaves a permanent on-chain trail: goal → provider → price → verification hash → outcome.

If verification fails or times out, funds stay in escrow and are refunded to you. A goal is never marked "done" on trust alone.

---

## Repository structure

```
app/
  page.tsx                    # Landing page (public, no wallet required)
  goal/page.tsx               # Goal intake (plain-language goal -> ranked shortlist)
  goal/[id]/page.tsx          # Live per-goal status + independent verification flow
  dashboard/page.tsx          # Connected-user dashboard (stats + history table)
  providers/page.tsx          # Public provider directory (ERC-8004 reputation)
  layout.tsx                  # Shared shell (NavBar + Footer)
  api/agent/plan/route.ts     # LLM intent classification + ERC-8004 candidate scoring
  api/agent/pay/route.ts      # x402 payment intent + createGoal escrow payload
  api/agent/verify/route.ts   # Independent artifact validation -> sign -> submit on-chain
  api/mock/provider-fulfillment/route.ts  # Mocked provider fulfillment webhook
components/
  NavBar.tsx / Footer.tsx / GoalIntake.tsx / AgentTimeline.tsx / Dashboard.tsx / ProviderDirectory.tsx
config/
  wagmi.ts                    # X Layer Testnet chain + OKX Wallet connector (prioritized)
  abis.ts                     # Typed ProviderRegistry / WellnessEscrow ABIs
  constants.ts                # Env-driven contract addresses + goal metadata helpers
  demoProviders.ts            # Seeded marketplace (used until contracts are deployed)
contracts/
  ProviderRegistry.sol        # Provider listings + ERC-8004 reputation signals
  WellnessEscrow.sol          # Escrow: verify-to-release, refund-on-timeout
scripts/deploy.ts             # Deploy + authorize + seed providers on X Layer
test/WellnessEscrow.test.ts   # Hardhat test suite (7 tests)
```

## Tech stack

- **Contracts:** Solidity `0.8.20`, Hardhat, OpenZeppelin 5 (`ReentrancyGuard`, `Pausable`, `Ownable`, `ECDSA`)
- **Frontend:** Next.js 14 (App Router), React 18, TypeScript, Tailwind CSS, shadcn-style components (Lucide icons), Prenetics/IM8 clinical aesthetic
- **Web3:** Wagmi v2, Viem, OKX Wallet connector explicitly first in the connector array
- **Agent:** Next.js route handlers, Viem signer for on-chain actions, LLM classification (OpenAI-compatible, with keyword fallback)
- **Network:** X Layer Testnet — Chain ID `195`, RPC `https://testnetrpc.xlayer.tech`, token `OKB`, explorer `https://www.oklink.com/xlayer-test`

---

## Quickstart

### 1. Install

```bash
npm install
```

### 2. Configure environment

```bash
copy .env.example .env.local
```

Fill in `PRIVATE_KEY` (deployer, funded with test OKB) and optionally `OPENAI_API_KEY` (the app works without it via keyword fallback). `AGENT_PRIVATE_KEY` defaults to Hardhat account #0, matching the agent signer used by the deploy script.

### 3. Run locally (no deployment needed)

```bash
npm run dev
```

Open [http://localhost:3000](http://localhost:3000). Without deployed contract addresses the app runs in **demo mode**: the marketplace shows the seeded providers, the escrow step is simulated, and the verification flow runs end-to-end minus the on-chain settlement.

---

## Deploying contracts to X Layer Testnet

1. **Compile + test:**
   ```bash
   npx hardhat compile
   npx hardhat test
   ```

2. **Fund the deployer** with test OKB on X Layer Testnet (OKX faucet / bridge) and set `PRIVATE_KEY` in `.env.local`.

3. **Deploy & seed providers:**
   ```bash
   npx hardhat run scripts/deploy.ts --network xlayerTestnet
   ```
   The script:
   - deploys `ProviderRegistry`,
   - deploys `WellnessEscrow` with `AGENT_PUBLIC_ADDRESS` (defaults to the deployer) as the agent signer,
   - authorizes the escrow contract as the reputation updater on the registry,
   - seeds the four demo providers (sleep, lab-tests, recovery, telehealth).

4. **Copy the printed addresses** into `.env.local`:
   ```env
   NEXT_PUBLIC_REGISTRY_ADDRESS=0x...
   NEXT_PUBLIC_ESCROW_ADDRESS=0x...
   ```

5. **Restart the app** (`npm run dev`) — the dashboard, directory, intake and goal pages now read/write live on X Layer.

> Note: `NEXT_PUBLIC_*` variables are baked at build time — restart the dev server (or rebuild) after updating them.

---

## The agent backend

| Route | Purpose |
| --- | --- |
| `POST /api/agent/plan` | Classifies the goal (LLM → keyword fallback), queries `getProvidersByCategory` on `ProviderRegistry`, scores providers on price + ERC-8004 reputation (0.5 × completion rate + 0.25 × price + 0.25 × category match), returns ranked shortlist + reasoning. |
| `POST /api/agent/pay` | Validates the provider listing on-chain, derives the goal hash, builds the **x402** payment intent (request/response header exchange, mocked provider payment server), and returns the `createGoal` escrow transaction payload the user signs with their wallet. |
| `POST /api/agent/verify` | The **independent-verification boundary**. Rejects artifacts without a real fulfillment reference (`EVRY-` courier, `LM-` lab report, `APT-` appointment, `SUB-` subscription), cross-checks the artifact provider against the on-chain goal, hashes the record, ECDSA-signs `keccak256(goalId, verificationHash, escrow)` with the agent key, and submits `submitVerificationProof`. |
| `POST /api/mock/provider-fulfillment` | Simulates the provider's own fulfillment systems posting a signed artifact (deterministic per goal). |

**Demo script (hackathon):** on `/goal` state a goal → pick a provider → approve the escrow tx → on `/goal/[id]` click *"Simulate Provider Fulfillment Webhook"* then *"Run Independent Verification"* → watch the timeline resolve to a verification hash on-chain.

## Security model

- `WellnessEscrow` uses `ReentrancyGuard` + `Pausable`; all state transitions emit events.
- Only the authorized agent signer's ECDSA signature (bound to `goalId + verificationHash + escrow address`) can release funds.
- Providers cannot self-release escrow, and a bare "success" flag is never accepted as proof.
- Refunds are available to anyone after the 7-day timeout if no valid verification was submitted; the provider's dispute counter accrues.
- `createGoal` rejects providers that are not registered in `ProviderRegistry`.
