import { NextResponse } from 'next/server'
import { keccak256, toHex } from 'viem'

export async function POST(req: Request) {
  try {
    const { providerAddress, goalText, amount } = await req.json()

    if (!providerAddress || !goalText || !amount) {
      return NextResponse.json({ error: 'Missing providerAddress, goalText, or amount' }, { status: 400 })
    }

    // Generate cryptographic goal hash
    const timestamp = Date.now()
    const goalHashPayload = `${goalText}:${providerAddress}:${timestamp}`
    const goalHash = keccak256(toHex(goalHashPayload))

    // Simulate x402 payment execution receipt
    const x402PaymentReceipt = {
      protocol: 'x402-v1',
      settlementNetwork: 'X Layer (Chain ID 195)',
      token: 'OKB',
      amountWei: amount,
      status: 'ESCROW_PREPARED',
      providerAddress,
      goalHash,
      timestamp,
    }

    return NextResponse.json({
      success: true,
      goalHash,
      providerAddress,
      amount,
      x402Receipt: x402PaymentReceipt,
    })
  } catch (error: any) {
    return NextResponse.json({ error: error.message || 'Payment execution failed' }, { status: 500 })
  }
}
