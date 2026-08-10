'use client'

import { useMemo, useState } from 'react'
import Image from 'next/image'
import Link from 'next/link'
import { useReadContract } from 'wagmi'
import { formatEther } from 'viem'
import { ShieldCheck, ArrowRight, Award, AlertTriangle } from 'lucide-react'
import { PROVIDER_REGISTRY_ABI, type ProviderTuple } from '@/config/abis'
import { isContractsConfigured } from '@/config/constants'
import { DEMO_PROVIDERS, CATEGORY_IMAGES, CATEGORY_ALT } from '@/config/demoProviders'

const CATEGORIES = ['all', 'sleep', 'lab-tests', 'recovery', 'telehealth'] as const

export interface DirectoryProvider {
  providerAddress: string
  serviceName: string
  priceFormatted: string
  category: string
  completedOrders: number
  disputes: number
  reputationScore: number
  isActive: boolean
}

export function ProviderDirectory() {
  const [filter, setFilter] = useState<(typeof CATEGORIES)[number]>('all')

  const { data: onChain, isError } = useReadContract({
    address: process.env.NEXT_PUBLIC_REGISTRY_ADDRESS as `0x${string}` | undefined,
    abi: PROVIDER_REGISTRY_ABI,
    functionName: 'getAllProviders',
    query: { enabled: isContractsConfigured },
  })

  const providers: DirectoryProvider[] = useMemo(() => {
    const raw = onChain as ProviderTuple[] | undefined
    const source = raw && raw.length > 0 ? raw : DEMO_PROVIDERS
    const usingOnChain = raw && raw.length > 0

    return source
      .filter((p) => p.isActive)
      .map((p) => {
        const completed = usingOnChain ? Number(p.completedOrders) : p.completedOrders
        const disputes = usingOnChain ? Number(p.disputes) : p.disputes
        const total = completed + disputes
        const reputationScore = total > 0 ? Math.round((completed / total) * 100) : 95
        return {
          providerAddress: p.providerAddress,
          serviceName: p.serviceName,
          priceFormatted: usingOnChain ? `${formatEther(BigInt(p.price.toString()))} OKB` : (p as any).priceFormatted,
          category: p.category,
          completedOrders: completed,
          disputes,
          reputationScore,
          isActive: p.isActive,
        }
      })
      .filter((p) => filter === 'all' || p.category === filter)
  }, [onChain, filter])

  return (
    <section className="max-w-7xl mx-auto px-6 py-10">
      <div className="max-w-2xl">
        <span className="badge-clinical px-3 py-1 rounded-full text-clinical-red font-bold text-xs uppercase tracking-wider">
          Marketplace on X Layer
        </span>
        <h1 className="text-3xl sm:text-4xl font-extrabold text-clinical-text mt-3 tracking-tight">
          Wellness Provider Directory
        </h1>
        <p className="text-sm text-clinical-muted mt-3 leading-relaxed">
          Registered providers with ERC-8004 reputation signals — completion rate from verified fulfillment records,
          not self-reported reviews. The agent scores these same signals when matching your goal.
        </p>
      </div>

      <div className="flex flex-wrap items-center gap-2 mt-8">
        {CATEGORIES.map((cat) => (
          <button
            key={cat}
            onClick={() => setFilter(cat)}
            className={`text-xs font-bold px-4 py-2 rounded-full transition-colors ${
              filter === cat
                ? 'bg-clinical-red text-white shadow-sm'
                : 'bg-gray-100 text-clinical-muted hover:bg-gray-200'
            }`}
          >
            {cat === 'all' ? 'All Providers' : cat.replace('-', ' ')}
          </button>
        ))}
      </div>

      {!isContractsConfigured && (
        <div className="flex items-start gap-3 bg-amber-50 border border-amber-200 rounded-xl p-4 mt-6">
          <AlertTriangle className="w-4 h-4 text-amber-600 shrink-0 mt-0.5" />
          <p className="text-xs text-amber-800 font-medium leading-relaxed">
            Showing the seeded demo marketplace. Deploy ProviderRegistry and set NEXT_PUBLIC_REGISTRY_ADDRESS to read
            live listings from X Layer.
          </p>
        </div>
      )}

      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6 mt-8">
        {providers.map((p) => {
          const image = CATEGORY_IMAGES[p.category] ?? CATEGORY_IMAGES.general
          const alt = CATEGORY_ALT[p.category] ?? CATEGORY_ALT.general
          return (
            <div key={p.providerAddress} className="clinical-card overflow-hidden flex flex-col">
              <div className="relative h-40">
                <Image
                  src={image}
                  alt={alt}
                  width={800}
                  height={600}
                  className="w-full h-full object-cover"
                />
                <span className="absolute top-3 left-3 badge-clinical px-2.5 py-1 rounded-md text-[10px] uppercase tracking-wider bg-white/90">
                  {p.category}
                </span>
              </div>

              <div className="p-5 flex flex-col flex-1">
                <h3 className="text-sm font-bold text-clinical-text leading-snug">{p.serviceName}</h3>
                <p className="font-mono text-[10px] text-clinical-muted mt-1.5 break-all">{p.providerAddress}</p>

                <div className="flex items-center justify-between mt-4">
                  <span className="text-lg font-extrabold text-clinical-red">{p.priceFormatted}</span>
                  <span className="flex items-center gap-1.5 text-[11px] font-bold text-clinical-text">
                    <Award className="w-3.5 h-3.5 text-clinical-red" />
                    {p.reputationScore}/100
                  </span>
                </div>

                <div className="flex items-center justify-between text-[11px] text-clinical-muted mt-1.5">
                  <span>{p.completedOrders} verified orders</span>
                  <span>{p.disputes} disputes</span>
                </div>

                <div className="mt-4 pt-4 border-t border-clinical-border flex items-center justify-between">
                  <span className="flex items-center gap-1.5 text-[10px] font-bold text-emerald-600">
                    <ShieldCheck className="w-3.5 h-3.5" />
                    Escrow-settled
                  </span>
                  <Link
                    href={`/goal`}
                    className="text-[11px] font-extrabold text-clinical-red flex items-center gap-1 hover:underline"
                  >
                    Procure via Agent
                    <ArrowRight className="w-3 h-3" />
                  </Link>
                </div>
              </div>
            </div>
          )
        })}
      </div>

      {isError && (
        <p className="text-xs text-clinical-muted mt-6">
          Could not reach the registry RPC — showing the seeded demo marketplace.
        </p>
      )}
    </section>
  )
}
