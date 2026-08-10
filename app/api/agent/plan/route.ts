import { NextResponse } from 'next/server'
import { createPublicClient, http, formatEther, parseEther } from 'viem'
import { xLayerTestnet } from '@/config/wagmi'

const PROVIDER_REGISTRY_ABI = [
  {
    type: 'function',
    name: 'getAllProviders',
    inputs: [],
    outputs: [
      {
        type: 'tuple[]',
        components: [
          { name: 'providerAddress', type: 'address' },
          { name: 'serviceName', type: 'string' },
          { name: 'price', type: 'uint256' },
          { name: 'category', type: 'string' },
          { name: 'completedOrders', type: 'uint32' },
          { name: 'disputes', type: 'uint32' },
          { name: 'isActive', type: 'bool' },
        ],
      },
    ],
    stateMutability: 'view',
  },
] as const

// Mock/Seeded Provider fallback if contract not yet deployed or RPC unreachable
const FALLBACK_PROVIDERS = [
  {
    providerAddress: '0x70997970C51812dc3A010C7d01b50e0d17dc79C8',
    serviceName: 'SleepMax Bio-Hacking Protocol & Oura Sync',
    price: parseEther('0.01'),
    category: 'sleep',
    completedOrders: 42,
    disputes: 0,
    isActive: true,
  },
  {
    providerAddress: '0x3C44CdDDB6a900fa2b585dd299e03d12FA4293BC',
    serviceName: 'At-Home Longevity Biomarker Blood Panel Kit',
    price: parseEther('0.025'),
    category: 'lab-tests',
    completedOrders: 128,
    disputes: 1,
    isActive: true,
  },
  {
    providerAddress: '0x90F79bf6EB2c4f80B086689C7b18e697E0c0a87a',
    serviceName: 'Post-Injury Joint & Knee Physio Rehabilitation',
    price: parseEther('0.015'),
    category: 'recovery',
    completedOrders: 65,
    disputes: 0,
    isActive: true,
  },
  {
    providerAddress: '0x15d34AA5453488E06562906310D723362b41E460',
    serviceName: 'DeSci Longevity & Hormone Telehealth Consult',
    price: parseEther('0.02'),
    category: 'telehealth',
    completedOrders: 89,
    disputes: 2,
    isActive: true,
  },
]

export async function POST(req: Request) {
  try {
    const { goal } = await req.json()
    if (!goal || typeof goal !== 'string') {
      return NextResponse.json({ error: 'Plain-language wellness goal is required' }, { status: 400 })
    }

    const lowerGoal = goal.toLowerCase()
    let targetCategory = 'general'
    if (lowerGoal.includes('sleep') || lowerGoal.includes('insomnia') || lowerGoal.includes('rest') || lowerGoal.includes('tired')) {
      targetCategory = 'sleep'
    } else if (lowerGoal.includes('blood') || lowerGoal.includes('lab') || lowerGoal.includes('panel') || lowerGoal.includes('biomarker') || lowerGoal.includes('test')) {
      targetCategory = 'lab-tests'
    } else if (lowerGoal.includes('knee') || lowerGoal.includes('injury') || lowerGoal.includes('recovery') || lowerGoal.includes('physio') || lowerGoal.includes('joint') || lowerGoal.includes('pain')) {
      targetCategory = 'recovery'
    } else if (lowerGoal.includes('doctor') || lowerGoal.includes('telehealth') || lowerGoal.includes('consult') || lowerGoal.includes('hormone') || lowerGoal.includes('longevity')) {
      targetCategory = 'telehealth'
    }

    // Try fetching from on-chain ProviderRegistry contract
    let rawProviders: any[] = FALLBACK_PROVIDERS
    const registryAddress = process.env.NEXT_PUBLIC_REGISTRY_ADDRESS as `0x${string}` | undefined

    if (registryAddress && registryAddress !== '0x0000000000000000000000000000000000000000') {
      try {
        const client = createPublicClient({
          chain: xLayerTestnet,
          transport: http(),
        })
        const onChainData = await client.readContract({
          address: registryAddress,
          abi: PROVIDER_REGISTRY_ABI,
          functionName: 'getAllProviders',
        })
        if (onChainData && onChainData.length > 0) {
          rawProviders = onChainData as any[]
        }
      } catch (err) {
        console.warn('Failed to query on-chain registry, using fallback providers:', err)
      }
    }

    // Score and rank candidates using ERC-8004 reputation signals
    const rankedProviders = rawProviders
      .filter((p) => p.isActive)
      .map((p) => {
        const completed = Number(p.completedOrders)
        const disputes = Number(p.disputes)
        const total = completed + disputes
        
        // ERC-8004 Reputation Score calculation (0 - 100%)
        const reputationRate = total > 0 ? (completed / total) * 100 : 95
        const isCategoryMatch = targetCategory === 'general' || p.category.toLowerCase() === targetCategory
        const matchScore = isCategoryMatch ? 100 : 70
        
        const finalScore = Math.round(reputationRate * 0.7 + matchScore * 0.3)
        const priceFormatted = formatEther(BigInt(p.price.toString()))

        return {
          providerAddress: p.providerAddress,
          serviceName: p.serviceName,
          price: p.price.toString(),
          priceFormatted: `${priceFormatted} OKB`,
          category: p.category,
          completedOrders: completed,
          disputes: disputes,
          reputationScore: finalScore,
          isCategoryMatch,
          matchReason: isCategoryMatch
            ? `Top-rated Provider for ${targetCategory.toUpperCase()} procurement with ${completed} verified fulfillments.`
            : `Secondary alternative matching baseline wellness requirements.`,
        }
      })
      .sort((a, b) => b.reputationScore - a.reputationScore)

    const primaryRecommendation = rankedProviders[0]

    const agentReasoning = `Parsed Goal: "${goal}". Identified Category: ${targetCategory.toUpperCase()}. Evaluated ${rankedProviders.length} providers on X Layer using ERC-8004 reputation metrics. Recommended provider: "${primaryRecommendation?.serviceName}" based on high fulfillment rate (${primaryRecommendation?.completedOrders} orders, ${primaryRecommendation?.disputes} disputes).`

    return NextResponse.json({
      success: true,
      category: targetCategory,
      agentReasoning,
      providers: rankedProviders,
    })
  } catch (error: any) {
    return NextResponse.json({ error: error.message || 'Internal Server Error' }, { status: 500 })
  }
}
