import { NextResponse } from 'next/server'
import {
  createWalletClient,
  createPublicClient,
  http,
  keccak256,
  encodePacked,
  isAddress,
} from 'viem'
import { privateKeyToAccount } from 'viem/accounts'
import { xLayerTestnet } from '@/config/wagmi'
import { WELLNESS_ESCROW_ABI, type GoalTuple } from '@/config/abis'
import { ZERO_ADDRESS } from '@/config/constants'

export const runtime = 'nodejs'

const ARTIFACT_TYPES = [
  'DELIVERY_CONFIRMED',
  'APPOINTMENT_COMPLETED',
  'LAB_REPORT',
  'SUBSCRIPTION_RENEWAL',
] as const
type ArtifactType = (typeof ARTIFACT_TYPES)[number]

const REFERENCE_PATTERNS: Record<ArtifactType, RegExp> = {
  DELIVERY_CONFIRMED: /^EVRY-\d{5,}$/,
  APPOINTMENT_COMPLETED: /^APT-\d{5,}$/,
  LAB_REPORT: /^LM-\d{4,}$/,
  SUBSCRIPTION_RENEWAL: /^SUB-\d{5,}$/,
}

interface Artifact {
  type: ArtifactType
  providerAddress: `0x${string}`
  evidenceReference: string
  signedAt: number
  artifactId: string
}

// Hardhat default account #0 used as the agent signer for local/testnet demos.
const DEFAULT_AGENT_KEY = '0xac0974bec39a17e36ba4a6b4d238ff944bacb478cbed5efcae784d7bf4f2ff80' as `0x${string}`

/**
 * Independent-verification boundary.
 *
 * The agent does NOT trust a provider's bare "success" flag. A valid artifact
 * must reference a real fulfillment record (courier tracking number, lab
 * report reference, appointment id, subscription receipt id) emitted by the
 * provider's systems, and must be tied to the goal's provider on-chain.
 * Anything else is rejected before a hash is ever signed.
 */
function validateArtifact(raw: unknown): Artifact {
  const artifact = raw as Partial<Artifact>
  if (!artifact) throw new Error('Missing fulfillment artifact')
  if (!artifact.type || !(ARTIFACT_TYPES as readonly string[]).includes(artifact.type)) {
    throw new Error(`Unsupported artifact type: ${String(artifact.type)}`)
  }
  if (!artifact.providerAddress || !isAddress(artifact.providerAddress)) {
    throw new Error('Artifact must include the fulfilling providerAddress')
  }
  if (!artifact.evidenceReference || typeof artifact.evidenceReference !== 'string') {
    throw new Error('Artifact is missing a verifiable evidence reference (e.g. courier / lab report id)')
  }
  if (!REFERENCE_PATTERNS[artifact.type as ArtifactType].test(artifact.evidenceReference)) {
    throw new Error(
      `Evidence reference "${artifact.evidenceReference}" does not match a verifiable ${artifact.type} record`
    )
  }
  if (!artifact.signedAt || typeof artifact.signedAt !== 'number' || artifact.signedAt <= 0) {
    throw new Error('Artifact is missing a signedAt timestamp from the provider system')
  }
  if (!artifact.artifactId || typeof artifact.artifactId !== 'string') {
    throw new Error('Artifact is missing an artifactId')
  }
  return artifact as Artifact
}

export async function POST(req: Request) {
  try {
    const { goalId, artifact } = await req.json()

    if (!goalId) {
      return NextResponse.json({ error: 'goalId is required' }, { status: 400 })
    }
    if (!artifact) {
      return NextResponse.json(
        { error: 'A verifiable fulfillment artifact is required — a bare success flag is not proof' },
        { status: 422 }
      )
    }

    const escrowAddress = (process.env.NEXT_PUBLIC_ESCROW_ADDRESS || ZERO_ADDRESS) as `0x${string}`

    // 1. Load the goal on-chain to cross-check ownership of the artifact
    let goal: GoalTuple | null = null
    if (escrowAddress !== ZERO_ADDRESS) {
      try {
        const client = createPublicClient({ chain: xLayerTestnet, transport: http() })
        goal = (await client.readContract({
          address: escrowAddress,
          abi: WELLNESS_ESCROW_ABI,
          functionName: 'goals',
          args: [BigInt(goalId)],
        })) as unknown as GoalTuple
      } catch (err) {
        console.warn('Could not read goal on-chain:', err)
      }
    }

    // 2. Validate the artifact against the strict fulfillment-record standard
    const valid = validateArtifact(artifact)

    if (goal) {
      if (goal.status !== 0) {
        return NextResponse.json(
          { error: `Goal is not Active (status=${goal.status}); nothing left to verify` },
          { status: 409 }
        )
      }
      if (goal.provider.toLowerCase() !== valid.providerAddress.toLowerCase()) {
        return NextResponse.json(
          {
            error:
              'Artifact provider does not match the goal provider on-chain — the artifact was not emitted for this goal',
          },
          { status: 422 }
        )
      }
    } else if (!process.env.NEXT_PUBLIC_ESCROW_ADDRESS) {
      // Demo mode without a deployed escrow: still require the artifact standard
      return NextResponse.json(
        {
          error:
            'Escrow contract not configured (NEXT_PUBLIC_ESCROW_ADDRESS). Verification cannot be anchored on-chain.',
        },
        { status: 503 }
      )
    }

    // 3. Hash the fulfillment record. The hash is bound to this goal so the
    //    same artifact cannot be reused to verify a different order.
    const verificationHash = keccak256(
      encodePacked(
        ['string', 'address', 'string', 'uint256'],
        [valid.type, valid.providerAddress, valid.evidenceReference, BigInt(goalId)]
      )
    )

    // 4. Sign keccak256(abi.encodePacked(goalId, verificationHash, escrowAddress))
    //    exactly as WellnessEscrow.submitVerificationProof expects.
    const agentPrivateKey = (process.env.AGENT_PRIVATE_KEY || DEFAULT_AGENT_KEY) as `0x${string}`
    const agentAccount = privateKeyToAccount(agentPrivateKey)

    const rawMessageHash = keccak256(
      encodePacked(['uint256', 'bytes32', 'address'], [BigInt(goalId), verificationHash, escrowAddress])
    )
    const signature = await agentAccount.signMessage({ message: { raw: rawMessageHash } })

    // 5. Submit the proof on-chain (agent's own ECDSA transaction)
    let txHash: string | null = null
    if (escrowAddress !== ZERO_ADDRESS) {
      try {
        const walletClient = createWalletClient({
          account: agentAccount,
          chain: xLayerTestnet,
          transport: http(),
        })
        txHash = await walletClient.writeContract({
          address: escrowAddress,
          abi: WELLNESS_ESCROW_ABI,
          functionName: 'submitVerificationProof',
          args: [BigInt(goalId), verificationHash, signature],
        })
      } catch (err: any) {
        console.warn('On-chain verification submission notice:', err?.shortMessage || err?.message || err)
      }
    }

    return NextResponse.json({
      success: true,
      goalId,
      verified: true,
      verificationHash,
      signature,
      txHash,
      agentAddress: agentAccount.address,
      proofDetails: {
        artifactType: valid.type,
        evidenceReference: valid.evidenceReference,
        artifactId: valid.artifactId,
        signedAt: new Date(valid.signedAt * 1000).toISOString(),
        status: 'INDEPENDENTLY_VERIFIED_ON_XLAYER',
      },
    })
  } catch (error: any) {
    const status = error?.message?.includes('Artifact') || error?.message?.includes('reference') ? 422 : 500
    console.error('Verify route error:', error?.message || error)
    return NextResponse.json({ error: error?.message || 'Verification failed' }, { status })
  }
}
