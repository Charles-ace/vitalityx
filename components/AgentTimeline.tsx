'use client'

import { CheckCircle2, Clock, ShieldCheck, Undo2 } from 'lucide-react'

export type TimelineStage =
  | 'idle'
  | 'searching'
  | 'evaluating'
  | 'escrow_pending'
  | 'verifying'
  | 'completed'
  | 'refunded'

export interface TimelineStep {
  id: string
  title: string
  description: string
  status: 'completed' | 'current' | 'upcoming'
}

interface AgentTimelineProps {
  currentStage: TimelineStage
  goalText?: string
  providerName?: string
  priceFormatted?: string
  verificationHash?: string
  refundReason?: string
}

const STAGE_ORDER: TimelineStage[] = [
  'searching',
  'evaluating',
  'escrow_pending',
  'verifying',
  'completed',
]
const REFUND_STAGE_ORDER: TimelineStage[] = ['searching', 'evaluating', 'escrow_pending', 'verifying', 'refunded']

export function AgentTimeline({
  currentStage,
  goalText,
  providerName,
  priceFormatted,
  verificationHash,
  refundReason,
}: AgentTimelineProps) {
  if (currentStage === 'idle') return null

  const order = currentStage === 'refunded' ? REFUND_STAGE_ORDER : STAGE_ORDER
  const currentIdx = order.indexOf(currentStage)
  const getStatus = (stepId: string): 'completed' | 'current' | 'upcoming' => {
    const stepIdx = order.indexOf(stepId as TimelineStage)
    if (currentStage === 'refunded' && stepId === 'verifying') return 'upcoming'
    if (stepIdx < currentIdx) return 'completed'
    if (stepIdx === currentIdx) return 'current'
    return 'upcoming'
  }

  const steps: TimelineStep[] = [
    {
      id: 'searching',
      title: 'Goal Received & Intent Classified',
      description: goalText ? `Goal: "${goalText}"` : 'Parsing plain-language wellness requirement...',
      status: getStatus('searching'),
    },
    {
      id: 'evaluating',
      title: 'Search & ERC-8004 Evaluation',
      description: providerName
        ? `Selected: ${providerName} (${priceFormatted})`
        : 'Querying ProviderRegistry on X Layer & scoring reputation...',
      status: getStatus('evaluating'),
    },
    {
      id: 'escrow_pending',
      title: 'x402 Payment & Escrow Lock',
      description: 'Funds locked in WellnessEscrow. Reentrancy-guarded; only verified proof can release them.',
      status: getStatus('escrow_pending'),
    },
    {
      id: 'verifying',
      title: 'Independent Fulfillment Verification',
      description: 'Checking the fulfillment record (courier scan / lab report / appointment) against the on-chain goal...',
      status: getStatus('verifying'),
    },
    {
      id: currentStage === 'refunded' ? 'refunded' : 'completed',
      title: currentStage === 'refunded' ? 'Refunded — No Trust on Claim' : 'On-Chain Verification & Settlement',
      description:
        currentStage === 'refunded'
          ? refundReason ?? 'Verification failed or timed out. Funds returned to you; dispute recorded on the provider.'
          : verificationHash
            ? `Verification Hash: ${verificationHash.slice(0, 18)}...`
            : 'Releasing escrowed funds to provider & recording the permanent proof.',
      status: currentStage === 'refunded' ? 'completed' : getStatus('completed'),
    },
  ]

  const finalStepId = currentStage === 'refunded' ? 'refunded' : 'completed'
  const finalIndex = steps.findIndex((s) => s.id === finalStepId)

  return (
    <div className="clinical-card p-6 md:p-8 my-8 border border-clinical-border">
      <div className="flex items-center justify-between pb-6 border-b border-clinical-border mb-6">
        <div>
          <span className="text-xs font-bold text-clinical-red uppercase tracking-wider">Live Agent Audit Trail</span>
          <h3 className="text-lg font-extrabold text-clinical-text mt-0.5">Procurement Execution Timeline</h3>
        </div>
        <span className="badge-clinical px-3 py-1.5 rounded-full flex items-center gap-1.5">
          <span
            className={`w-2 h-2 rounded-full ${
              currentStage === 'completed'
                ? 'bg-emerald-500'
                : currentStage === 'refunded'
                  ? 'bg-amber-500'
                  : 'bg-clinical-red animate-pulse'
            }`}
          />
          <span>
            {currentStage === 'completed'
              ? 'Verified'
              : currentStage === 'refunded'
                ? 'Refunded'
                : 'Active Lifecycle'}
          </span>
        </span>
      </div>

      <div className="space-y-6">
        {steps.map((step, idx) => {
          const isLast = idx === finalIndex
          return (
            <div key={step.id} className="flex items-start gap-4 relative">
              {!isLast && (
                <div
                  className={`absolute left-4 top-8 bottom-[-8px] w-0.5 -ml-px ${
                    step.status === 'completed' ? 'bg-clinical-red' : 'bg-gray-200'
                  }`}
                />
              )}

              <div
                className={`w-8 h-8 rounded-full flex items-center justify-center shrink-0 z-10 font-bold text-xs ${
                  step.status === 'completed'
                    ? 'bg-clinical-red text-white'
                    : step.status === 'current'
                      ? 'bg-clinical-red/10 border-2 border-clinical-red text-clinical-red animate-pulse'
                      : 'bg-gray-100 text-gray-400 border border-gray-200'
                }`}
              >
                {step.status === 'completed' ? (
                  step.id === 'refunded' ? (
                    <Undo2 className="w-4 h-4" />
                  ) : (
                    <CheckCircle2 className="w-4 h-4" />
                  )
                ) : step.status === 'current' ? (
                  step.id === 'completed' || step.id === 'refunded' ? (
                    <ShieldCheck className="w-4 h-4" />
                  ) : (
                    <Clock className="w-4 h-4 animate-spin" />
                  )
                ) : (
                  idx + 1
                )}
              </div>

              <div className="pt-0.5">
                <h4
                  className={`text-sm font-bold ${
                    step.status === 'completed' || step.status === 'current'
                      ? 'text-clinical-text'
                      : 'text-gray-400'
                  }`}
                >
                  {step.title}
                </h4>
                <p className="text-xs text-clinical-muted mt-1 leading-relaxed">{step.description}</p>
              </div>
            </div>
          )
        })}
      </div>
    </div>
  )
}
