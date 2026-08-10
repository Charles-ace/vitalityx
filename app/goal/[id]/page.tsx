'use client'

import { useMemo, useState, useEffect } from 'react'
import { useParams } from 'next/navigation'
import {
  useReadContract,
  useWriteContract,
  useWaitForTransactionReceipt,
  useWatchContractEvent,
} from 'wagmi'
import Link from 'next/link'
import {
  RefreshCw,
  ShieldCheck,
  ExternalLink,
  FileCheck2,
  Undo2,
  Clock,
  AlertCircle,
  CheckCircle2,
} from 'lucide-react'
import { AgentTimeline, type TimelineStage } from '@/components/AgentTimeline'
import { PROVIDER_REGISTRY_ABI, WELLNESS_ESCROW_ABI, GOAL_STATUS, type GoalTuple } from '@/config/abis'
import {
  registryAddress,
  escrowAddress,
  isContractsConfigured,
  readGoalMeta,
  EXPLORER_BASE,
} from '@/config/constants'

const ARTIFACT_BY_CATEGORY: Record<string, string> = {
  sleep: 'SUBSCRIPTION_RENEWAL',
  'lab-tests': 'LAB_REPORT',
  recovery: 'DELIVERY_CONFIRMED',
  telehealth: 'APPOINTMENT_COMPLETED',
}

interface Artifact {
  type: string
  providerAddress: string
  evidenceReference: string
  signedAt: number
  artifactId: string
}

export default function GoalDetailPage() {
  const params = useParams<{ id: string }>()
  const goalId = useMemo(() => BigInt(params.id), [params.id])

  const meta = useMemo(() => readGoalMeta(params.id), [params.id])

  const [localStage, setLocalStage] = useState<TimelineStage>('searching')
  const [artifact, setArtifact] = useState<Artifact | null>(null)
  const [isWebhookPending, setIsWebhookPending] = useState(false)
  const [isVerifying, setIsVerifying] = useState(false)
  const [verificationHash, setVerificationHash] = useState<string | null>(null)
  const [verifyTxHash, setVerifyTxHash] = useState<string | null>(null)
  const [agentAddress, setAgentAddress] = useState<string | null>(null)
  const [errorMessage, setErrorMessage] = useState<string | null>(null)
  const [now, setNow] = useState(() => Math.floor(Date.now() / 1000))

  useEffect(() => {
    const t = setInterval(() => setNow(Math.floor(Date.now() / 1000)), 30_000)
    return () => clearInterval(t)
  }, [])

  const { data: onChainGoal, isLoading: goalLoading } = useReadContract({
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
    args: [onChainGoal ? (onChainGoal as unknown as GoalTuple).provider : '0x0000000000000000000000000000000000000000'],
    query: { enabled: isContractsConfigured && !!onChainGoal },
  })

  const providerName = meta?.providerName ?? (providerTuple?.[1] as string | undefined) ?? null

  const isRefundable = useMemo(() => {
    const g = onChainGoal as unknown as GoalTuple | undefined
    return !!g && g.status === 0 && now > Number(g.timeoutAt)
  }, [onChainGoal, now])

  // Live event refresh: verified / refunded on-chain
  useWatchContractEvent({
    address: escrowAddress,
    abi: WELLNESS_ESCROW_ABI,
    eventName: 'GoalVerified',
    args: { goalId },
    enabled: isContractsConfigured,
    onLogs: (logs) => {
      const hash = logs[0]?.args.verificationHash
      if (hash) setVerificationHash(hash as string)
    },
  })
  useWatchContractEvent({
    address: escrowAddress,
    abi: WELLNESS_ESCROW_ABI,
    eventName: 'GoalRefunded',
    args: { goalId },
    enabled: isContractsConfigured,
    onLogs: () => setLocalStage('refunded'),
  })

  const { writeContract, data: refundTxHash } = useWriteContract()
  const { isLoading: refundLoading } = useWaitForTransactionReceipt({ hash: refundTxHash })

  // Stage derivation: on-chain status wins when available
  const stage: TimelineStage = useMemo(() => {
    const g = onChainGoal as unknown as GoalTuple | undefined
    if (g) {
      if (g.status === 1) return 'completed'
      if (g.status === 2) return 'refunded'
      return localStage === 'verifying' || localStage === 'completed' || localStage === 'refunded'
        ? localStage
        : 'escrow_pending'
    }
    return localStage
  }, [onChainGoal, localStage])

  const goalAmount = onChainGoal ? (onChainGoal as unknown as GoalTuple).amount.toString() : meta?.price ?? ''
  const priceFormatted = meta?.price ?? (goalAmount ? `${goalAmount} wei` : undefined)

  const emitFulfillmentWebhook = async () => {
    setIsWebhookPending(true)
    setErrorMessage(null)
    try {
      const providerAddress = (onChainGoal as unknown as GoalTuple | undefined)?.provider ?? meta?.providerAddress
      if (!providerAddress) throw new Error('Provider address unknown — connect and deploy contracts, or the goal was created in demo mode.')

      const artifactType = ARTIFACT_BY_CATEGORY[meta?.category ?? ''] ?? 'DELIVERY_CONFIRMED'
      const res = await fetch('/api/mock/provider-fulfillment', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ goalId: params.id, providerAddress, artifactType }),
      })
      const data = await res.json()
      if (!res.ok) throw new Error(data.error || 'Webhook emission failed')
      setArtifact(data.artifact)
      setLocalStage('verifying')
    } catch (err: any) {
      setErrorMessage(err.message || 'Webhook emission failed')
    } finally {
      setIsWebhookPending(false)
    }
  }

  const runIndependentVerification = async () => {
    if (!artifact) return
    setIsVerifying(true)
    setErrorMessage(null)
    setLocalStage('verifying')
    try {
      const res = await fetch('/api/agent/verify', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ goalId: params.id, artifact }),
      })
      const data = await res.json()
      if (!res.ok) throw new Error(data.error || 'Verification failed')
      setVerificationHash(data.verificationHash)
      setVerifyTxHash(data.txHash)
      setAgentAddress(data.agentAddress)
      if (data.txHash) {
        setLocalStage('completed')
      } else if (!data.txHash && data.verified) {
        setLocalStage('completed')
      }
    } catch (err: any) {
      setErrorMessage(err.message || 'Verification failed')
    } finally {
      setIsVerifying(false)
    }
  }

  const requestRefund = () => {
    setErrorMessage(null)
    writeContract({
      address: escrowAddress,
      abi: WELLNESS_ESCROW_ABI,
      functionName: 'refund',
      args: [goalId],
    })
  }

  const timeoutAt = onChainGoal ? Number((onChainGoal as unknown as GoalTuple).timeoutAt) : null
  const countdown = timeoutAt && timeoutAt > now ? Math.max(0, timeoutAt - now) : 0
  const days = Math.floor(countdown / 86400)
  const hours = Math.floor((countdown % 86400) / 3600)

  return (
    <section className="max-w-5xl mx-auto px-6 py-10">
      <div className="flex flex-wrap items-center justify-between gap-3">
        <div>
          <span className="badge-clinical px-3 py-1 rounded-full text-clinical-red font-bold text-xs uppercase tracking-wider">
            Goal #{params.id}
          </span>
          <h1 className="text-2xl sm:text-3xl font-extrabold text-clinical-text mt-2 tracking-tight">
            {meta?.goalText ?? 'Wellness Procurement Goal'}
          </h1>
          <p className="text-sm text-clinical-muted mt-1">
            {providerName ?? `Provider: ${(onChainGoal as unknown as GoalTuple | undefined)?.provider ?? 'unknown'}`}
          </p>
        </div>
        <Link href="/dashboard" className="text-xs font-bold text-clinical-red hover:underline">
          Back to Dashboard
        </Link>
      </div>

      <AgentTimeline
        currentStage={stage}
        goalText={meta?.goalText}
        providerName={providerName ?? undefined}
        priceFormatted={priceFormatted}
        verificationHash={verificationHash ?? undefined}
        refundReason={meta ? 'Verification failed or timed out — funds returned, dispute recorded.' : undefined}
      />

      {errorMessage && (
        <div className="flex items-start gap-3 bg-red-50 border border-clinical-red/20 rounded-xl p-4 my-6">
          <AlertCircle className="w-4 h-4 text-clinical-red shrink-0 mt-0.5" />
          <p className="text-xs text-gray-800 font-medium leading-relaxed">{errorMessage}</p>
        </div>
      )}

      {!isContractsConfigured && stage !== 'completed' && stage !== 'refunded' && (
        <div className="bg-amber-50 border border-amber-200 rounded-xl p-4 my-6 flex items-start gap-3">
          <AlertCircle className="w-4 h-4 text-amber-600 shrink-0 mt-0.5" />
          <p className="text-xs text-amber-800 font-medium leading-relaxed">
            Demo mode: contracts not deployed (NEXT_PUBLIC_ESCROW_ADDRESS / NEXT_PUBLIC_REGISTRY_ADDRESS unset).
            The full webhook → verification flow still works, but the on-chain settlement step is skipped.
          </p>
        </div>
      )}

      {(stage === 'escrow_pending' || stage === 'verifying') && (
        <div className="clinical-card p-6 my-6 border-l-4 border-l-clinical-red space-y-4">
          <div>
            <h4 className="text-base font-bold text-clinical-text">Independent Verification Boundary</h4>
            <p className="text-xs text-clinical-muted mt-1 leading-relaxed">
              Funds are locked in escrow. The provider's own “delivered” flag is never accepted as proof — the agent
              requires a real fulfillment record (courier scan, lab report reference, appointment id) tied to this
              goal before settling.
            </p>
          </div>

          <div className="flex flex-wrap items-center gap-3">
            <button
              onClick={emitFulfillmentWebhook}
              disabled={isWebhookPending || isVerifying}
              className="text-xs font-bold border border-clinical-border rounded-full px-5 py-2.5 hover:border-clinical-text transition-colors disabled:opacity-50"
            >
              {isWebhookPending ? (
                <>
                  <RefreshCw className="w-3.5 h-3.5 inline mr-1.5 animate-spin" />
                  Emitting provider webhook...
                </>
              ) : (
                '1. Simulate Provider Fulfillment Webhook'
              )}
            </button>

            <button
              onClick={runIndependentVerification}
              disabled={!artifact || isWebhookPending || isVerifying}
              className="btn-clinical-red px-5 py-2.5 text-xs font-extrabold flex items-center gap-2 disabled:opacity-50"
            >
              {isVerifying ? (
                <>
                  <RefreshCw className="w-4 h-4 animate-spin" />
                  Verifying artifact on-chain...
                </>
              ) : (
                <>
                  <ShieldCheck className="w-4 h-4" />
                  2. Run Independent Verification
                </>
              )}
            </button>
          </div>

          {artifact && (
            <div className="bg-red-50/60 border border-clinical-red/20 rounded-xl p-4">
              <div className="flex items-center gap-2 text-clinical-red font-bold text-xs uppercase tracking-wider mb-2">
                <FileCheck2 className="w-4 h-4" />
                <span>Fulfillment Record Received</span>
              </div>
              <dl className="grid grid-cols-2 sm:grid-cols-4 gap-3 text-xs">
                <div>
                  <dt className="text-clinical-muted font-semibold">Type</dt>
                  <dd className="font-bold text-clinical-text mt-0.5">{artifact.type}</dd>
                </div>
                <div>
                  <dt className="text-clinical-muted font-semibold">Evidence Ref</dt>
                  <dd className="font-bold text-clinical-text mt-0.5 font-mono">{artifact.evidenceReference}</dd>
                </div>
                <div>
                  <dt className="text-clinical-muted font-semibold">Artifact ID</dt>
                  <dd className="font-bold text-clinical-text mt-0.5 font-mono">{artifact.artifactId}</dd>
                </div>
                <div>
                  <dt className="text-clinical-muted font-semibold">Signed At</dt>
                  <dd className="font-bold text-clinical-text mt-0.5">
                    {new Date(artifact.signedAt * 1000).toLocaleString()}
                  </dd>
                </div>
              </dl>
            </div>
          )}
        </div>
      )}

      {verificationHash && (
        <div className="clinical-card p-6 my-6 border-l-4 border-l-emerald-500">
          <div className="flex items-center gap-2 text-emerald-700 font-bold text-xs uppercase tracking-wider mb-3">
            <CheckCircle2 className="w-4 h-4" />
            <span>Verified — Fulfillment Committed On-Chain</span>
          </div>
          <dl className="grid grid-cols-1 sm:grid-cols-2 gap-4 text-xs">
            <div>
              <dt className="text-clinical-muted font-semibold">Verification Hash</dt>
              <dd className="font-mono font-bold text-clinical-text mt-0.5 break-all">{verificationHash}</dd>
            </div>
            {verifyTxHash && (
              <div>
                <dt className="text-clinical-muted font-semibold">Verification Transaction</dt>
                <dd className="mt-0.5">
                  <a
                    href={`${EXPLORER_BASE}/tx/${verifyTxHash}`}
                    target="_blank"
                    rel="noreferrer"
                    className="font-mono font-bold text-clinical-red hover:underline flex items-center gap-1"
                  >
                    {verifyTxHash.slice(0, 12)}...{verifyTxHash.slice(-8)}
                    <ExternalLink className="w-3 h-3" />
                  </a>
                </dd>
              </div>
            )}
            {agentAddress && (
              <div>
                <dt className="text-clinical-muted font-semibold">Agent Signer</dt>
                <dd className="font-mono font-bold text-clinical-text mt-0.5">{agentAddress}</dd>
              </div>
            )}
            <div>
              <dt className="text-clinical-muted font-semibold">Funds Released To</dt>
              <dd className="font-mono font-bold text-clinical-text mt-0.5">
                {(onChainGoal as unknown as GoalTuple | undefined)?.provider ?? meta?.providerAddress}
              </dd>
            </div>
          </dl>
        </div>
      )}

      {stage === 'escrow_pending' && isContractsConfigured && (
        <div className="clinical-card p-6 my-6 flex flex-wrap items-center justify-between gap-4">
          <div className="flex items-center gap-3">
            <Clock className="w-5 h-5 text-clinical-red shrink-0" />
            <div>
              <h4 className="text-sm font-bold text-clinical-text">Refund window</h4>
              <p className="text-xs text-clinical-muted">
                {isRefundable
                  ? 'Timeout reached — funds can be refunded if no verification was submitted.'
                  : `Verification deadline in ${days}d ${hours}h. After that, you can refund the full escrowed amount.`}
              </p>
            </div>
          </div>
          <button
            onClick={requestRefund}
            disabled={!isRefundable || refundLoading}
            className="text-xs font-bold border border-clinical-red/40 text-clinical-red rounded-full px-5 py-2.5 hover:bg-red-50 transition-colors disabled:opacity-40 disabled:cursor-not-allowed"
          >
            {refundLoading ? (
              <>
                <RefreshCw className="w-3.5 h-3.5 inline mr-1.5 animate-spin" />
                Refunding...
              </>
            ) : (
              <>
                <Undo2 className="w-3.5 h-3.5 inline mr-1.5" />
                Request Refund
              </>
            )}
          </button>
        </div>
      )}

      {goalLoading && (
        <p className="text-xs text-clinical-muted py-6 animate-pulse">Reading goal state from WellnessEscrow on X Layer...</p>
      )}
    </section>
  )
}
