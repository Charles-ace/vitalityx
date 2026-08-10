'use client'

import { useMemo, useState } from 'react'
import { useRouter } from 'next/navigation'
import {
  useAccount,
  useConnect,
  useWriteContract,
  useWaitForTransactionReceipt,
  useWatchContractEvent,
} from 'wagmi'
import { Sparkles, ShieldCheck, ArrowRight, RefreshCw, Wallet, AlertCircle, CheckCircle2 } from 'lucide-react'
import { WELLNESS_ESCROW_ABI } from '@/config/abis'
import { escrowAddress, isContractsConfigured, writeGoalMeta } from '@/config/constants'

export interface ProviderCandidate {
  providerAddress: string
  serviceName: string
  price: string
  priceFormatted: string
  category: string
  completedOrders: number
  disputes: number
  reputationScore: number
  isCategoryMatch: boolean
  matchReason: string
}

type FlowStage = 'idle' | 'planning' | 'planned' | 'preparing_payment' | 'confirming_escrow' | 'escrowed' | 'error'

const quickPresets = [
  'I want a baseline biomarker blood test kit',
  'I need an advanced sleep optimization routine',
  'Post-workout knee joint physio rehabilitation',
  'DeSci longevity & hormone telehealth consultation',
]

export function GoalIntake() {
  const router = useRouter()
  const { address, isConnected } = useAccount()
  const { connect, connectors } = useConnect()

  const [goalInput, setGoalInput] = useState('')
  const [stage, setStage] = useState<FlowStage>('idle')
  const [agentReasoning, setAgentReasoning] = useState<string | null>(null)
  const [providers, setProviders] = useState<ProviderCandidate[]>([])
  const [selectedProvider, setSelectedProvider] = useState<ProviderCandidate | null>(null)
  const [errorMessage, setErrorMessage] = useState<string | null>(null)

  const { writeContract, data: escrowTxHash } = useWriteContract()
  const { isLoading: isTxLoading, isSuccess: isTxSuccess } = useWaitForTransactionReceipt({ hash: escrowTxHash })

  // When the user's createGoal tx is mined we learn the goalId from GoalCreated
  useWatchContractEvent({
    address: escrowAddress,
    abi: WELLNESS_ESCROW_ABI,
    eventName: 'GoalCreated',
    args: useMemo(() => (address ? { user: address } : undefined), [address]),
    onLogs: (logs) => {
      const log = logs[0]
      if (!log) return
      const goalId = log.args.goalId
      if (goalId === undefined || !selectedProvider) return
      writeGoalMeta(goalId.toString(), {
        goalText: goalInput,
        providerAddress: selectedProvider.providerAddress,
        providerName: selectedProvider.serviceName,
        price: selectedProvider.priceFormatted,
        category: selectedProvider.category,
        createdAt: Date.now(),
      })
      setStage('escrowed')
      router.push(`/goal/${goalId.toString()}`)
    },
    enabled: isConnected && stage === 'confirming_escrow',
  })

  const handleAnalyzeGoal = async (e?: React.FormEvent) => {
    if (e) e.preventDefault()
    if (!goalInput.trim()) return

    setStage('planning')
    setErrorMessage(null)
    setAgentReasoning(null)
    setProviders([])
    setSelectedProvider(null)

    try {
      const res = await fetch('/api/agent/plan', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ goal: goalInput }),
      })
      const data = await res.json()
      if (!res.ok) throw new Error(data.error || 'Planning failed')
      setAgentReasoning(data.agentReasoning)
      setProviders(data.providers)
      setSelectedProvider(data.providers[0] ?? null)
      setStage('planned')
    } catch (err: any) {
      setErrorMessage(err.message || 'Failed to plan goal')
      setStage('error')
    }
  }

  const handleConfirmProcurement = async () => {
    if (!selectedProvider) return
    setErrorMessage(null)

    if (!isConnected) {
      setErrorMessage('Connect your OKX wallet to escrow funds — the agent can plan, but only you can approve payment.')
      return
    }

    setStage('preparing_payment')
    try {
      const payRes = await fetch('/api/agent/pay', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          providerAddress: selectedProvider.providerAddress,
          goalText: goalInput,
          amount: selectedProvider.price,
        }),
      })
      const payData = await payRes.json()
      if (!payRes.ok) throw new Error(payData.error || 'Payment preparation failed')

      if (!payData.escrowTx || payData.escrowTx.address === '0x0000000000000000000000000000000000000000') {
        // Demo mode without deployed contracts — keep the flow explorable
        const demoGoalId = Math.floor(Date.now() / 1000) % 1_000_000_000
        writeGoalMeta(demoGoalId, {
          goalText: goalInput,
          providerAddress: selectedProvider.providerAddress,
          providerName: selectedProvider.serviceName,
          price: selectedProvider.priceFormatted,
          category: selectedProvider.category,
          createdAt: Date.now(),
        })
        setStage('escrowed')
        router.push(`/goal/${demoGoalId}`)
        return
      }

      setStage('confirming_escrow')
      writeContract({
        address: payData.escrowTx.address as `0x${string}`,
        abi: WELLNESS_ESCROW_ABI,
        functionName: 'createGoal',
        args: [selectedProvider.providerAddress as `0x${string}`, payData.goalHash as `0x${string}`],
        value: BigInt(payData.escrowTx.value),
      })
    } catch (err: any) {
      setErrorMessage(err.message || 'Payment preparation failed')
      setStage('planned')
    }
  }

  const busy = stage === 'planning' || stage === 'preparing_payment' || isTxLoading || stage === 'confirming_escrow'

  return (
    <div className="clinical-card p-6 md:p-10 my-8">
      <div className="max-w-3xl">
        <span className="badge-clinical px-3 py-1 rounded-full text-clinical-red font-bold">
          Autonomous Agent Procurement
        </span>
        <h1 className="text-2xl md:text-3xl font-extrabold text-clinical-text mt-3 tracking-tight">
          What is your health or longevity goal?
        </h1>
        <p className="text-sm text-clinical-muted mt-2 leading-relaxed">
          State your goal in plain language. The agent classifies intent, searches the ProviderRegistry on X Layer,
          scores ERC-8004 reputation, and prepares an x402 escrow for your approval.
        </p>

        <form onSubmit={handleAnalyzeGoal} className="mt-6 space-y-4">
          <textarea
            rows={3}
            value={goalInput}
            onChange={(e) => setGoalInput(e.target.value)}
            placeholder="e.g. I want better sleep, and a recovery routine after a knee injury..."
            className="w-full bg-white border border-clinical-border rounded-xl p-4 text-sm text-clinical-text placeholder-gray-400 focus:outline-none focus:ring-2 focus:ring-clinical-red focus:border-transparent transition-all resize-none shadow-sm"
          />

          <div className="flex flex-wrap gap-2 pt-1">
            <span className="text-xs text-clinical-muted font-medium py-1">Try preset:</span>
            {quickPresets.map((preset) => (
              <button
                key={preset}
                type="button"
                onClick={() => setGoalInput(preset)}
                className="text-xs bg-gray-100 hover:bg-gray-200 text-clinical-text font-medium px-3 py-1 rounded-full transition-colors"
              >
                {preset}
              </button>
            ))}
          </div>

          <button
            type="submit"
            disabled={busy || !goalInput.trim()}
            className="btn-clinical-red px-6 py-3.5 text-sm font-bold flex items-center justify-center gap-2 disabled:opacity-50 disabled:cursor-not-allowed shadow-md"
          >
            {stage === 'planning' ? (
              <>
                <RefreshCw className="w-4 h-4 animate-spin" />
                <span>Evaluating Providers on X Layer...</span>
              </>
            ) : (
              <>
                <Sparkles className="w-4 h-4" />
                <span>Evaluate & Rank Providers</span>
              </>
            )}
          </button>
        </form>
      </div>

      {errorMessage && (
        <div className="mt-6 flex items-start gap-3 bg-red-50 border border-clinical-red/20 rounded-xl p-4">
          <AlertCircle className="w-4 h-4 text-clinical-red shrink-0 mt-0.5" />
          <p className="text-xs text-gray-800 font-medium leading-relaxed">{errorMessage}</p>
        </div>
      )}

      {agentReasoning && providers.length > 0 && (
        <div className="mt-8 pt-8 border-t border-clinical-border space-y-6">
          <div className="bg-red-50/60 border border-clinical-red/20 rounded-xl p-4">
            <div className="flex items-center gap-2 text-clinical-red font-bold text-xs uppercase tracking-wider mb-1">
              <ShieldCheck className="w-4 h-4" />
              <span>Agent Reasoning — ERC-8004 Scoring</span>
            </div>
            <p className="text-xs text-gray-800 leading-relaxed font-medium">{agentReasoning}</p>
          </div>

          <h3 className="text-sm font-bold text-clinical-text uppercase tracking-wider">
            Ranked Providers on X Layer ({providers.length})
          </h3>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            {providers.map((p) => {
              const isSelected = selectedProvider?.providerAddress === p.providerAddress
              return (
                <div
                  key={p.providerAddress}
                  onClick={() => !busy && setSelectedProvider(p)}
                  className={`p-5 rounded-xl border cursor-pointer transition-all ${
                    isSelected
                      ? 'bg-white border-clinical-red ring-2 ring-clinical-red/20 shadow-md'
                      : 'bg-white border-clinical-border hover:border-gray-300'
                  }`}
                >
                  <div className="flex justify-between items-start mb-2 gap-3">
                    <div>
                      <span className="badge-clinical px-2.5 py-0.5 rounded-md text-[10px] uppercase tracking-wider">
                        {p.category}
                      </span>
                      <h4 className="text-base font-bold text-clinical-text mt-1.5 leading-snug">{p.serviceName}</h4>
                    </div>
                    <span className="text-sm font-extrabold text-clinical-red bg-red-50 px-2.5 py-1 rounded-lg shrink-0">
                      {p.priceFormatted}
                    </span>
                  </div>

                  <p className="text-xs text-clinical-muted mb-4">{p.matchReason}</p>

                  <div className="flex items-center justify-between pt-3 border-t border-gray-100 text-xs text-gray-600">
                    <span className="font-semibold text-clinical-text">
                      Score: <strong className="text-clinical-red">{p.reputationScore}/100</strong>
                    </span>
                    <span>
                      {p.completedOrders} Orders • {p.disputes} Disputes
                    </span>
                  </div>
                </div>
              )
            })}
          </div>

          <div className="flex flex-wrap items-center justify-end gap-4 pt-4">
            {!isConnected && (
              <button
                onClick={() => connect({ connector: connectors[0] })}
                className="flex items-center gap-2 text-xs font-bold text-clinical-red border border-clinical-red/40 rounded-full px-5 py-2.5 hover:bg-red-50 transition-colors"
              >
                <Wallet className="w-4 h-4" />
                Connect OKX Wallet to Approve
              </button>
            )}
            <button
              onClick={handleConfirmProcurement}
              disabled={busy}
              className="btn-clinical-red px-8 py-3.5 text-sm font-extrabold flex items-center gap-2 shadow-lg disabled:opacity-50 disabled:cursor-not-allowed"
            >
              {stage === 'preparing_payment' || isTxLoading ? (
                <>
                  <RefreshCw className="w-4 h-4 animate-spin" />
                  <span>Preparing x402 Escrow...</span>
                </>
              ) : stage === 'confirming_escrow' ? (
                <>
                  <RefreshCw className="w-4 h-4 animate-spin" />
                  <span>Waiting for Wallet Signature...</span>
                </>
              ) : isTxSuccess ? (
                <>
                  <CheckCircle2 className="w-4 h-4" />
                  <span>Escrow Confirmed — Opening Goal</span>
                </>
              ) : (
                <>
                  <span>Authorize Escrow & Procure via x402</span>
                  <ArrowRight className="w-4 h-4" />
                </>
              )}
            </button>
          </div>

          {!isContractsConfigured && (
            <p className="text-[11px] text-clinical-muted text-right">
              Demo mode: contracts not deployed yet (NEXT_PUBLIC_ESCROW_ADDRESS unset) — flow runs without on-chain
              settlement.
            </p>
          )}
        </div>
      )}
    </div>
  )
}
