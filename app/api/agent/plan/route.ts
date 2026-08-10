import { NextResponse } from 'next/server'
import { createPublicClient, http, formatEther, parseEther } from 'viem'
import { xLayerTestnet } from '@/config/wagmi'
import { PROVIDER_REGISTRY_ABI, type ProviderTuple } from '@/config/abis'
import { ZERO_ADDRESS } from '@/config/constants'

export const runtime = 'nodejs'

const WELLNESS_CATEGORIES = ['sleep', 'lab-tests', 'recovery', 'telehealth'] as const
type WellnessCategory = (typeof WELLNESS_CATEGORIES)[number]

// Mock/Seeded providers used when no registry is deployed or the RPC is unreachable.
export const FALLBACK_PROVIDERS: ProviderTuple[] = [
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

const SYSTEM_PROMPT = `You are the intent classifier of an autonomous wellness procurement agent running on X Layer (EVM L2).
Read the user's plain-language wellness goal and classify which provider category is required.
Reply ONLY with a JSON object of the form {"category": "...", "rationale": "..."} — no markdown, no prose.
Allowed categories: "sleep", "lab-tests", "recovery", "telehealth". If nothing fits, use "general".
Examples:
- "I want better sleep and a morning routine" -> {"category": "sleep", "rationale": "Goal targets sleep optimization."}
- "I need a baseline blood panel" -> {"category": "lab-tests", "rationale": "Goal requires diagnostic lab testing."}
- "recovery routine after a knee injury" -> {"category": "recovery", "rationale": "Goal requires physio/recovery services."}
- "help me find a longevity doctor" -> {"category": "telehealth", "rationale": "Goal requires a remote medical consultation."}`

async function classifyWithLLM(goal: string): Promise<{ category: string; rationale: string } | null> {
  const apiKey = process.env.OPENAI_API_KEY
  if (!apiKey) return null

  const baseUrl = process.env.OPENAI_BASE_URL || 'https://api.openai.com/v1'
  const model = process.env.OPENAI_MODEL || 'gpt-4o-mini'

  try {
    const res = await fetch(`${baseUrl}/chat/completions`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json', Authorization: `Bearer ${apiKey}` },
      body: JSON.stringify({
        model,
        temperature: 0,
        response_format: { type: 'json_object' },
        messages: [
          { role: 'system', content: SYSTEM_PROMPT },
          { role: 'user', content: goal },
        ],
      }),
    })

    if (!res.ok) throw new Error(`LLM request failed with status ${res.status}`)
    const data = await res.json()
    const content: string = data?.choices?.[0]?.message?.content
    if (!content) return null

    const parsed = JSON.parse(content) as { category?: string; rationale?: string }
    const category = parsed.category ?? 'general'
    if (!WELLNESS_CATEGORIES.includes(category as WellnessCategory) && category !== 'general') {
      return { category: 'general', rationale: parsed.rationale ?? 'Unclassified goal.' }
    }
    return { category, rationale: parsed.rationale ?? 'Classified by LLM.' }
  } catch (err) {
    console.warn('LLM classification failed, falling back to keyword classifier:', err)
    return null
  }
}

function classifyWithKeywords(goal: string): { category: string; rationale: string } {
  const lower = goal.toLowerCase()
  if (/sleep|insomnia|rest|tired|night|bedtime/.test(lower)) {
    return { category: 'sleep', rationale: 'Keyword match: sleep quality vocabulary detected.' }
  }
  if (/blood|lab|panel|biomarker|test kit|diagnostic|bloodwork/.test(lower)) {
    return { category: 'lab-tests', rationale: 'Keyword match: diagnostic testing vocabulary detected.' }
  }
  if (/knee|injury|recovery|physio|joint|pain|rehab|stretch/.test(lower)) {
    return { category: 'recovery', rationale: 'Keyword match: recovery/rehabilitation vocabulary detected.' }
  }
  if (/doctor|telehealth|consult|hormone|longevity|physician|clinic/.test(lower)) {
    return { category: 'telehealth', rationale: 'Keyword match: telehealth/consultation vocabulary detected.' }
  }
  return { category: 'general', rationale: 'No strong category signal; scanning all registered providers.' }
}

async function fetchOnChainProviders(registryAddress: `0x${string}`, category: string): Promise<ProviderTuple[]> {
  const client = createPublicClient({ chain: xLayerTestnet, transport: http() })

  try {
    const byCategory = (await client.readContract({
      address: registryAddress,
      abi: PROVIDER_REGISTRY_ABI,
      functionName: 'getProvidersByCategory',
      args: [category],
    })) as unknown as ProviderTuple[]
    if (byCategory.length > 0) return byCategory
  } catch (err) {
    console.warn('getProvidersByCategory failed:', err)
  }

  try {
    const all = (await client.readContract({
      address: registryAddress,
      abi: PROVIDER_REGISTRY_ABI,
      functionName: 'getAllProviders',
    })) as unknown as ProviderTuple[]
    return all
  } catch (err) {
    console.warn('getAllProviders failed:', err)
    return []
  }
}

export async function POST(req: Request) {
  try {
    const { goal } = await req.json()
    if (!goal || typeof goal !== 'string' || goal.trim().length < 3) {
      return NextResponse.json({ error: 'A plain-language wellness goal is required' }, { status: 400 })
    }

    // 1. Intent classification (LLM first, keyword fallback so the demo runs without a key)
    const llmResult = await classifyWithLLM(goal)
    const intent = llmResult ?? classifyWithKeywords(goal)
    const targetCategory = intent.category === 'general' ? 'general' : intent.category

    // 2. Query candidates from the on-chain ProviderRegistry (fallback to seeded list)
    const registryAddress = process.env.NEXT_PUBLIC_REGISTRY_ADDRESS as `0x${string}` | undefined
    let candidates: ProviderTuple[] = FALLBACK_PROVIDERS
    if (registryAddress && registryAddress !== ZERO_ADDRESS) {
      const onChain = await fetchOnChainProviders(registryAddress, targetCategory)
      if (onChain.length > 0) candidates = onChain
    }

    // 3. Score on price + ERC-8004 reputation signals
    const active = candidates.filter((p) => p.isActive)
    const prices = active.map((p) => Number(p.price.toString())).filter((v) => v > 0)
    const cheapest = prices.length > 0 ? Math.min(...prices) : 1

    const ranked = active
      .map((p) => {
        const completed = Number(p.completedOrders)
        const disputes = Number(p.disputes)
        const total = completed + disputes
        const reputationRate = total > 0 ? (completed / total) * 100 : 95
        const isCategoryMatch = targetCategory === 'general' || p.category.toLowerCase() === targetCategory
        const priceWei = Number(p.price.toString())
        const priceScore = priceWei > 0 ? (cheapest / priceWei) * 100 : 0

        const finalScore = Math.round(reputationRate * 0.5 + priceScore * 0.25 + (isCategoryMatch ? 100 : 70) * 0.25)

        return {
          providerAddress: p.providerAddress,
          serviceName: p.serviceName,
          price: p.price.toString(),
          priceFormatted: `${formatEther(BigInt(p.price.toString()))} OKB`,
          category: p.category,
          completedOrders: completed,
          disputes,
          reputationScore: finalScore,
          isCategoryMatch,
          matchReason: isCategoryMatch
            ? `Top-rated ${p.category} provider: ${completed} verified fulfillments, ${disputes} disputes.`
            : `Baseline alternative: ${completed} fulfillments, ${disputes} disputes.`,
        }
      })
      .sort((a, b) => b.reputationScore - a.reputationScore)

    const primary = ranked[0]
    const agentReasoning = `Parsed goal: "${goal}". Intent classified as ${targetCategory.toUpperCase()} (${intent.rationale}). ` +
      `Evaluated ${ranked.length} provider(s) on X Layer using ERC-8004 reputation signals (completion rate, dispute count) weighted against price. ` +
      `Recommended: "${primary?.serviceName}" at ${primary?.priceFormatted} — ${primary?.completedOrders} completed orders, ${primary?.disputes} disputes.`

    return NextResponse.json({
      success: true,
      category: targetCategory,
      agentReasoning,
      providers: ranked,
      intentRationale: intent.rationale,
    })
  } catch (error: any) {
    console.error('Plan route error:', error)
    return NextResponse.json({ error: error.message || 'Internal Server Error' }, { status: 500 })
  }
}
