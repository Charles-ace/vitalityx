'use client'

import { CheckCircle2, Clock, ShieldCheck, CreditCard, Search, Sparkles } from 'lucide-react'

export interface TimelineStep {
  id: string
  title: string
  description: string
  status: 'completed' | 'current' | 'upcoming'
  timestamp?: string
  hash?: string
}

interface AgentTimelineProps {
  currentStage: 'idle' | 'searching' | 'evaluating' | 'escrow_pending' | 'verifying' | 'completed'
  goalText?: string
  providerName?: string
  priceFormatted?: string
  verificationHash?: string
}

export function AgentTimeline({
  currentStage,
  goalText,
  providerName,
  priceFormatted,
  verificationHash,
}: AgentTimelineProps) {
  if (currentStage === 'idle') return null

  const getStepStatus = (stepId: string): 'completed' | 'current' | 'upcoming' => {
    const order = ['intake', 'evaluate', 'pay', 'verify', 'complete']
    const stageMap: Record<string, number> = {
      searching: 0,
      evaluating: 1,
      escrow_pending: 2,
      verifying: 3,
      completed: 4,
    }
    const currentIdx = stageMap[currentStage] ?? 0
    const stepIdx = order.indexOf(stepId)

    if (stepIdx < currentIdx) return 'completed'
    if (stepIdx === currentIdx) return 'current'
    return 'upcoming'
  }

  const steps: TimelineStep[] = [
    {
      id: 'intake',
      title: 'Goal Received & Intent Classified',
      description: goalText ? `Goal: "${goalText}"` : 'Parsing plain-language wellness requirement...',
      status: getStepStatus('intake'),
    },
    {
      id: 'evaluate',
      title: 'ERC-8004 Provider Discovery',
      description: providerName
        ? `Selected: ${providerName} (${priceFormatted})`
        : 'Querying ProviderRegistry on X Layer & scoring reputation...',
      status: getStepStatus('evaluate'),
    },
    {
      id: 'pay',
      title: 'x402 Settlement & Escrow Lock',
      description: 'Funds escrowed in WellnessEscrow contract. Reentrancy-guarded.',
      status: getStepStatus('pay'),
    },
    {
      id: 'verify',
      title: 'Independent Artifact Verification',
      description: 'Checking provider delivery webhook & computing keccak256 artifact hash...',
      status: getStepStatus('verify'),
    },
    {
      id: 'complete',
      title: 'On-Chain Execution & Reputation Updated',
      description: verificationHash
        ? `Verification Hash: ${verificationHash.slice(0, 16)}...`
        : 'Releasing escrowed funds to provider & recording portable proof.',
      status: getStepStatus('complete'),
    },
  ]

  return (
    <div className="clinical-card p-6 md:p-8 my-8 border border-clinical-border">
      <div className="flex items-center justify-between pb-6 border-b border-clinical-border mb-6">
        <div>
          <span className="text-xs font-bold text-clinical-red uppercase tracking-wider">Live Agent Audit Trail</span>
          <h3 className="text-lg font-extrabold text-clinical-text mt-0.5">Procurement Execution Timeline</h3>
        </div>
        <span className="badge-clinical px-3 py-1.5 rounded-full flex items-center gap-1.5">
          <span className="w-2 h-2 rounded-full bg-clinical-red animate-pulse" />
          <span>Active Lifecycle</span>
        </span>
      </div>

      <div className="space-y-6">
        {steps.map((step, idx) => (
          <div key={step.id} className="flex items-start gap-4 relative">
            {/* Connecting line */}
            {idx < steps.length - 1 && (
              <div
                className={`absolute left-4 top-8 bottom-0 w-0.5 -ml-px ${
                  step.status === 'completed' ? 'bg-clinical-red' : 'bg-gray-200'
                }`}
              />
            )}

            {/* Step Icon */}
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
                <CheckCircle2 className="w-4 h-4" />
              ) : step.status === 'current' ? (
                <Clock className="w-4 h-4 animate-spin" />
              ) : (
                idx + 1
              )}
            </div>

            {/* Step Content */}
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
        ))}
      </div>
    </div>
  )
}
