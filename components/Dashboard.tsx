'use client'

import { useMemo } from 'react'
import { useScrollReveal } from '@/hooks/useScrollReveal'
import Link from 'next/link'
import { useAccount, useConnect, useBalance, useReadContract, useWatchContractEvent } from 'wagmi'
import { formatEther } from 'viem'
import { CheckCircle2, ExternalLink, RefreshCw, Wallet, ShieldCheck, Activity } from 'lucide-react'
import { PROVIDER_REGISTRY_ABI, WELLNESS_ESCROW_ABI, GOAL_STATUS, type GoalTuple } from '@/config/abis'
import {
  registryAddress,
  escrowAddress,
  isContractsConfigured,
  readGoalMeta,
  GOAL_STORAGE_PREFIX,
  EXPLORER_BASE,
} from '@/config/constants'

function useLocalGoalIds(): string[] {
  return useMemo(() => {
    if (typeof window === 'undefined') return []
    const ids: string[] = []
    for (let i = 0; i < window.localStorage.length; i++) {
      const key = window.localStorage.key(i)
      if (key?.startsWith(GOAL_STORAGE_PREFIX)) ids.push(key.replace(GOAL_STORAGE_PREFIX, ''))
    }
    return ids
  }, [])
}

function GoalRow({ id }: { id: string }) {
  const goalId = useMemo(() => BigInt(id), [id])
  const meta = useMemo(() => readGoalMeta(id), [id])

  const { data: goalData, refetch } = useReadContract({
    address: escrowAddress,
    abi: WELLNESS_ESCROW_ABI,
    functionName: 'goals',
    args: [goalId],
    query: { enabled: isContractsConfigured },
  })

  const { data: providerTuple } = useReadContract({
    address: registryAddress,
    abi: PROVIDER_REGISTRY_ABI,
    functionName: 'providers',
    args: [goalData ? (goalData as unknown as GoalTuple).provider : '0x0000000000000000000000000000000000000000'],
    query: { enabled: isContractsConfigured && !!goalData },
  })

  useWatchContractEvent({
    address: escrowAddress,
    abi: WELLNESS_ESCROW_ABI,
    eventName: 'GoalVerified',
    args: { goalId },
    enabled: isContractsConfigured,
    onLogs: () => refetch(),
  })
  useWatchContractEvent({
    address: escrowAddress,
    abi: WELLNESS_ESCROW_ABI,
    eventName: 'GoalRefunded',
    args: { goalId },
    enabled: isContractsConfigured,
    onLogs: () => refetch(),
  })

  const goal = goalData as unknown as GoalTuple | undefined
  const onChain = !!goal
  const status = onChain ? GOAL_STATUS[goal.status] : 'Demo'
  const statusColor =
    status === 'Verified'
      ? 'bg-emerald-50 text-emerald-700'
      : status === 'Refunded'
        ? 'bg-amber-50 text-amber-700'
        : status === 'Demo'
          ? 'bg-gray-100 text-gray-600'
          : 'bg-blue-50 text-blue-700'

  const providerName = meta?.providerName ?? (providerTuple?.[1] as string | undefined) ?? 'On-chain provider'
  const amount = onChain ? `${formatEther(goal.amount)} OKB` : meta?.price ?? '—'
  const verificationHash =
    onChain && goal.verificationHash !== '0x0000000000000000000000000000000000000000000000000000000000000000'
      ? goal.verificationHash
      : null
  const created = onChain
    ? new Date(Number(goal.createdAt) * 1000).toLocaleDateString()
    : meta
      ? new Date(meta.createdAt).toLocaleDateString()
      : '—'

  return (
    <tr className="hover:bg-gray-50/50 transition-colors">
      <td className="py-4 px-4">
        <Link href={`/goal/${id}`} className="font-bold text-clinical-text hover:text-clinical-red transition-colors">
          {meta?.goalText ?? `Goal #${id}`}
        </Link>
      </td>
      <td className="py-4 px-4 text-clinical-muted">{providerName}</td>
      <td className="py-4 px-4 font-extrabold text-clinical-red">{amount}</td>
      <td className="py-4 px-4 text-clinical-muted">{created}</td>
      <td className="py-4 px-4">
        {verificationHash ? (
          <a
            href={`${EXPLORER_BASE}`}
            target="_blank"
            rel="noreferrer"
            className="flex items-center gap-1 font-mono text-[11px] text-clinical-red hover:underline"
          >
            <span>
              {verificationHash.slice(0, 10)}...{verificationHash.slice(-6)}
            </span>
            <ExternalLink className="w-3 h-3" />
          </a>
        ) : (
          <span className="text-[11px] text-clinical-muted">—</span>
        )}
      </td>
      <td className="py-4 px-4 text-right">
        <span className={`inline-flex items-center gap-1.5 px-3 py-1 rounded-full font-bold text-[11px] ${statusColor}`}>
          {status === 'Verified' && <CheckCircle2 className="w-3.5 h-3.5" />}
          {status}
        </span>
      </td>
    </tr>
  )
}

export function Dashboard() {
  const { address, isConnected } = useAccount()
  const { connect, connectors } = useConnect()
  const localGoalIds = useLocalGoalIds()

  // Attach scroll reveal observer
  useScrollReveal()

  const { data: balanceData } = useBalance({ address })
  const { data: goalIdsData, refetch: refetchIds } = useReadContract({
    address: escrowAddress,
    abi: WELLNESS_ESCROW_ABI,
    functionName: 'getUserGoalIds',
    args: [address ?? '0x0000000000000000000000000000000000000000'],
    query: { enabled: isConnected && isContractsConfigured },
  })

  const { data: providerCountData, refetch: refetchProviders } = useReadContract({
    address: registryAddress,
    abi: PROVIDER_REGISTRY_ABI,
    functionName: 'getAllProviders',
    query: { enabled: isContractsConfigured },
  })

  useWatchContractEvent({
    address: escrowAddress,
    abi: WELLNESS_ESCROW_ABI,
    eventName: 'GoalCreated',
    args: address ? { user: address } : undefined,
    enabled: isConnected && isContractsConfigured,
    onLogs: () => refetchIds(),
  })

  const onChainIds = useMemo(() => [...(goalIdsData ?? [])] as bigint[], [goalIdsData])
  const allIds = useMemo(() => {
    const ids = new Set<string>()
    onChainIds.forEach((id) => ids.add(id.toString()))
    localGoalIds.forEach((id) => ids.add(id))
    return [...ids].sort((a, b) => Number(BigInt(b)) - Number(BigInt(a)))
  }, [onChainIds, localGoalIds])

  if (!isConnected || !address) {
    return (
      <section className="max-w-3xl mx-auto px-6 py-20 text-center">
        <div className="clinical-card p-10">
          <div className="w-12 h-12 rounded-2xl bg-red-50 text-clinical-red flex items-center justify-center mx-auto mb-5">
            <Wallet className="w-6 h-6" />
          </div>
          <h1 className="text-2xl font-extrabold text-clinical-text">Connect your wallet to view your dashboard</h1>
          <p className="text-sm text-clinical-muted mt-2 max-w-md mx-auto leading-relaxed">
            Your goals, verified spend, and portable procurement trail live on-chain. Connect your OKX wallet to read
            them from WellnessEscrow on X Layer.
          </p>
          <button
            onClick={() => connect({ connector: connectors[0] })}
            className="btn-clinical-red px-7 py-3.5 text-sm font-extrabold mt-6 shadow-md"
          >
            Connect OKX Wallet
          </button>
        </div>
      </section>
    )
  }

  return (
    <section className="max-w-7xl mx-auto px-6 py-10">
      <div className="flex flex-wrap items-end justify-between gap-4 mb-8" data-animate="fade-up">
        <div>
          <span className="badge-clinical px-3 py-1 rounded-full text-clinical-red font-bold text-xs uppercase tracking-wider">
            {address.slice(0, 6)}...{address.slice(-4)}
          </span>
          <span className="accent-bar mt-3" />
          <h1 className="text-3xl font-extrabold text-clinical-text mt-1 tracking-tight">Your Agent Dashboard</h1>
          <p className="text-sm text-clinical-muted mt-1">Goals, verified spend and the permanent procurement trail.</p>
        </div>
        <div className="flex items-center gap-3">
          <button
            onClick={() => {
              refetchIds()
              refetchProviders()
            }}
            className="text-xs font-bold border border-clinical-border rounded-full px-4 py-2 hover:border-clinical-text transition-colors flex items-center gap-1.5"
          >
            <RefreshCw className="w-3.5 h-3.5" />
            Refresh
          </button>
          <Link href="/goal" className="btn-clinical-red px-6 py-2.5 text-xs font-extrabold shadow-sm">
            New Goal
          </Link>
        </div>
      </div>

      <div className="grid grid-cols-2 lg:grid-cols-4 gap-4 md:gap-6">
        <div className="clinical-card p-6" data-animate="stat" data-animate-delay="100">
          <span className="text-xs font-bold text-clinical-muted uppercase tracking-wider">Goals Completed</span>
          <p className="text-3xl md:text-4xl font-extrabold text-clinical-text mt-2">{allIds.length}</p>
          <p className="text-[11px] text-clinical-muted mt-1.5">Independent verification each</p>
        </div>
        <div className="clinical-card p-6" data-animate="stat" data-animate-delay="200">
          <span className="text-xs font-bold text-clinical-muted uppercase tracking-wider">Total Escrowed Spend</span>
          <p className="text-3xl md:text-4xl font-extrabold text-clinical-text mt-2">
            {balanceData ? Number(formatEther(balanceData.value)).toFixed(3) : '0.000'}{' '}
            <span className="text-sm font-semibold text-clinical-muted">OKB</span>
          </p>
          <p className="text-[11px] text-clinical-muted mt-1.5">Wallet balance on X Layer (195)</p>
        </div>
        <div className="clinical-card p-6" data-animate="stat" data-animate-delay="300">
          <span className="text-xs font-bold text-clinical-muted uppercase tracking-wider">Providers Evaluated</span>
          <p className="text-3xl md:text-4xl font-extrabold text-clinical-text mt-2">
            {providerCountData ? (providerCountData as unknown as unknown[]).length : '—'}
          </p>
          <p className="text-[11px] text-clinical-muted mt-1.5">Live ProviderRegistry listings</p>
        </div>
        <div className="clinical-card p-6" data-animate="stat" data-animate-delay="400">
          <span className="text-xs font-bold text-clinical-muted uppercase tracking-wider">Verification Standard</span>
          <div className="flex items-center gap-2 mt-3">
            <ShieldCheck className="w-7 h-7 text-clinical-red" />
            <p className="text-sm font-extrabold text-clinical-text leading-tight">Escrow + artifact proof</p>
          </div>
          <p className="text-[11px] text-clinical-muted mt-1.5">No trust-on-claim settlements</p>
        </div>
      </div>

      <div className="clinical-card p-6 md:p-8 mt-8" data-animate="fade-up" data-animate-delay="100">
        <div className="flex flex-wrap items-center justify-between gap-4 pb-6 border-b border-clinical-border">
          <div>
            <span className="text-xs font-bold text-clinical-red uppercase tracking-wider">Permanent On-Chain History</span>
            <h3 className="text-xl font-extrabold text-clinical-text mt-1">Procurement Trail</h3>
          </div>
          <span className="badge-clinical px-3 py-1 rounded-full text-xs font-semibold flex items-center gap-1.5">
            <Activity className="w-3.5 h-3.5 text-clinical-red" />
            X Layer Testnet (Chain ID 195)
          </span>
        </div>

        {allIds.length === 0 ? (
          <div className="py-16 text-center">
            <p className="text-sm font-bold text-clinical-text">No goals yet</p>
            <p className="text-xs text-clinical-muted mt-1">
              State a wellness goal in plain language and let the agent search, evaluate, escrow and verify.
            </p>
            <Link href="/goal" className="btn-clinical-red px-6 py-3 text-xs font-extrabold inline-block mt-5 shadow-sm">
              Start Your First Goal
            </Link>
          </div>
        ) : (
          <div className="overflow-x-auto mt-6">
            <table className="w-full text-left border-collapse">
              <thead>
                <tr className="border-b border-clinical-border text-xs font-bold text-clinical-muted uppercase">
                  <th className="py-3 px-4">Goal / Service</th>
                  <th className="py-3 px-4">Provider</th>
                  <th className="py-3 px-4">Amount</th>
                  <th className="py-3 px-4">Created</th>
                  <th className="py-3 px-4">Verification Hash</th>
                  <th className="py-3 px-4 text-right">Status</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-gray-100 text-xs">
                {allIds.map((id) => (
                  <GoalRow key={id} id={id} />
                ))}
              </tbody>
            </table>
          </div>
        )}
      </div>
    </section>
  )
}