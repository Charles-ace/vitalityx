import { NextResponse } from 'next/server'
import { createPublicClient, http, keccak256, toHex, isAddress } from 'viem'
import { xLayerTestnet } from '@/config/wagmi'
import { PROVIDER_REGISTRY_ABI, type ProviderTuple } from '@/config/abis'
import { ZERO_ADDRESS } from '@/config/constants'

export const runtime = 'nodejs'

/**
 * x402 payment request headers (per the x402 spec, the agent acts as the
 * requesting client toward the provider's payment server). For the hackathon
 * the provider's payment server is mocked deterministically server-side.
 */
function buildX402PaymentRequest(recipient: `0x${string}`, amountWei: bigint, nonce: string) {
  return {
    'X-PAYMENT-RECIPIENT': recipient,
    'X-PAYMENT-TOTAL': amountWei.toString(),
    'X-PAYMENT-NONCE': nonce,
    'X-PAYMENT-NETWORK': 'xlayer:195',
    'X-PAYMENT-TOKEN': 'OKB',
    'X-PAYMENT-REQUEST-URL': '/x402/pay',
  }
}

/**
 * Mocked provider payment-server response. In production this is returned by
 * the provider's x402 endpoint and the agent's x402 client settles against it.
 */
function mockX402Response(paymentRequest: Record<string, string>) {
  const now = Math.floor(Date.now() / 1000)
  return {
    status: 200,
    headers: {
      'X-PAYMENT-EXPIRES': String(now + 600),
      'X-PAYMENT-REQUEST-URL': 'http://provider-mock.example/pay',
      'X-PAYMENT-CHARGE-SUCCESS-URL': 'https://vitalityx.app/goal?verified=true',
      'X-PAYMENT-CHARGE-CANCEL-URL': 'https://vitalityx.app/goal?cancelled=true',
      'X-REQUEST-ID': paymentRequest['X-PAYMENT-NONCE'],
    },
  }
}

export async function POST(req: Request) {
  try {
    const { providerAddress, goalText, amount } = await req.json()

    if (!providerAddress || !isAddress(providerAddress)) {
      return NextResponse.json({ error: 'A valid providerAddress is required' }, { status: 400 })
    }
    if (!goalText || typeof goalText !== 'string') {
      return NextResponse.json({ error: 'goalText is required' }, { status: 400 })
    }
    let amountWei: bigint
    try {
      amountWei = BigInt(amount)
    } catch {
      return NextResponse.json({ error: 'amount must be a wei-value integer string' }, { status: 400 })
    }
    if (amountWei <= 0n) {
      return NextResponse.json({ error: 'amount must be positive' }, { status: 400 })
    }

    // 1. Confirm the provider exists on-chain with a matching active listing
    const registryAddress = process.env.NEXT_PUBLIC_REGISTRY_ADDRESS as `0x${string}` | undefined
    let providerOnChain: ProviderTuple | null = null
    if (registryAddress && registryAddress !== ZERO_ADDRESS) {
      try {
        const client = createPublicClient({ chain: xLayerTestnet, transport: http() })
        const all = (await client.readContract({
          address: registryAddress,
          abi: PROVIDER_REGISTRY_ABI,
          functionName: 'getAllProviders',
        })) as unknown as ProviderTuple[]
        providerOnChain = all.find((p) => p.providerAddress.toLowerCase() === providerAddress.toLowerCase()) ?? null
        if (providerOnChain && (!providerOnChain.isActive || providerOnChain.price !== amountWei)) {
          return NextResponse.json(
            { error: 'Provider listing mismatch: inactive or price does not match the registry' },
            { status: 409 }
          )
        }
      } catch (err) {
        console.warn('Registry validation skipped (unreachable):', err)
      }
    }

    // 2. Deterministic goal hash: goal text + provider + nonce
    const nonce = `${Date.now()}-${Math.floor(Math.random() * 1e9)}`
    const goalHash = keccak256(toHex(`${goalText}:${providerAddress}:${nonce}`))

    // 3. x402 payment intent exchange (agent -> provider payment server, mocked)
    const paymentRequest = buildX402PaymentRequest(providerAddress as `0x${string}`, amountWei, nonce)
    const paymentResponse = mockX402Response(paymentRequest)

    // 4. Return the escrow transaction payload the user's wallet must sign.
    //    The user escrows their own funds (msg.sender = user); the agent can
    //    only ever release them via submitVerificationProof.
    const escrowAddress = process.env.NEXT_PUBLIC_ESCROW_ADDRESS || ZERO_ADDRESS

    return NextResponse.json({
      success: true,
      goalHash,
      providerAddress,
      amount: amountWei.toString(),
      nonce,
      x402: {
        protocol: 'x402-v1',
        settlementNetwork: 'X Layer (Chain ID 195)',
        token: 'OKB',
        paymentRequest,
        paymentResponse,
        status: 'PAYMENT_AUTHORIZED',
      },
      escrowTx: {
        address: escrowAddress,
        functionName: 'createGoal',
        args: [providerAddress, goalHash],
        value: amountWei.toString(),
        signerNote: 'Sign this transaction to escrow your OKB. Funds release only after independent verification.',
      },
      providerRegisteredOnChain: providerOnChain !== null,
    })
  } catch (error: any) {
    console.error('Pay route error:', error)
    return NextResponse.json({ error: error.message || 'Payment preparation failed' }, { status: 500 })
  }
}
