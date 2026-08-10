'use client'

import { useState } from 'react'
import { Sparkles, ShieldCheck, Check, ArrowRight, Activity, AlertCircle, RefreshCw } from 'lucide-react'

interface ProviderCandidate {
  providerAddress: string
  serviceName: string
  price: string
  priceFormatted: string
  category: string
  completedOrders: number
  disputes: number
  reputationScore: number
  matchReason: string
}

interface GoalIntakeProps {
  onGoalPlanned: (data: { goal: string; selectedProvider: ProviderCandidate }) => void
  isProcessing: boolean
}

export function GoalIntake({ onGoalPlanned, isProcessing }: GoalIntakeProps) {
  const [goalInput, setGoalInput] = useState('')
  const [loading, setLoading] = useState(false)
  const [agentReasoning, setAgentReasoning] = useState<string | null>(null)
  const [providers, setProviders] = useState<ProviderCandidate[]>([])
  const [selectedProvider, setSelectedProvider] = useState<ProviderCandidate | null>(null)

  const quickPresets = [
    'I want a baseline biomarker blood test kit',
    'I need an advanced sleep optimization routine',
    'Post-workout knee joint physio rehabilitation',
    'DeSci longevity & hormone telehealth consultation',
  ]

  const handleAnalyzeGoal = async (e?: React.FormEvent) => {
    if (e) e.preventDefault()
    if (!goalInput.trim()) return

    setLoading(true)
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
      if (data.success && data.providers && data.providers.length > 0) {
        setAgentReasoning(data.agentReasoning)
        setProviders(data.providers)
        setSelectedProvider(data.providers[0]) // Default top ranked
      }
    } catch (err) {
      console.error('Failed to plan goal:', err)
    } finally {
      setLoading(false)
    }
  }

  const handleConfirmProcurement = () => {
    if (!selectedProvider || !goalInput) return
    onGoalPlanned({
      goal: goalInput,
      selectedProvider,
    })
  }

  return (
    <div className="clinical-card p-6 md:p-10 mb-10">
      <div className="max-w-3xl">
        <span className="badge-clinical px-3 py-1 rounded-full text-clinical-red font-bold">
          Autonomous Agent Procurement
        </span>
        <h2 className="text-2xl md:text-3xl font-extrabold text-clinical-text mt-3 tracking-tight">
          What is your health or longevity goal?
        </h2>
        <p className="text-sm text-clinical-muted mt-2 leading-relaxed">
          State your goal in plain language. VitalityX searches registered providers on X Layer, evaluates ERC-8004 reputation signals, and handles escrow settlement.
        </p>

        {/* Goal Form */}
        <form onSubmit={handleAnalyzeGoal} className="mt-6 space-y-4">
          <div className="relative">
            <textarea
              rows={3}
              value={goalInput}
              onChange={(e) => setGoalInput(e.target.value)}
              placeholder="e.g. I want to optimize my sleep quality and get a comprehensive biomarker panel..."
              className="w-full bg-white border border-clinical-border rounded-xl p-4 text-sm text-clinical-text placeholder-gray-400 focus:outline-none focus:ring-2 focus:ring-clinical-red focus:border-transparent transition-all resize-none shadow-sm"
            />
          </div>

          {/* Quick Presets */}
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
            disabled={loading || !goalInput.trim()}
            className="btn-clinical-red px-6 py-3.5 text-sm font-bold flex items-center justify-center gap-2 disabled:opacity-50 disabled:cursor-not-allowed shadow-md hover:scale-[1.01] transition-transform"
          >
            {loading ? (
              <>
                <RefreshCw className="w-4 h-4 animate-spin" />
                <span>Evaluating Providers on X Layer...</span>
              </>
            ) : (
              <>
                <Sparkles className="w-4 h-4" />
                <span>Evaluate & Procure with Agent</span>
              </>
            )}
          </button>
        </form>
      </div>

      {/* Agent Analysis & Ranked Providers */}
      {agentReasoning && providers.length > 0 && (
        <div className="mt-8 pt-8 border-t border-clinical-border space-y-6 animate-in fade-in duration-300">
          <div className="bg-red-50/60 border border-clinical-red/20 rounded-xl p-4">
            <div className="flex items-center gap-2 text-clinical-red font-bold text-xs uppercase tracking-wider mb-1">
              <ShieldCheck className="w-4 h-4" />
              <span>ERC-8004 Agent Reasoning Signal</span>
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
                  onClick={() => setSelectedProvider(p)}
                  className={`p-5 rounded-xl border cursor-pointer transition-all ${
                    isSelected
                      ? 'bg-white border-clinical-red ring-2 ring-clinical-red/20 shadow-md'
                      : 'bg-white border-clinical-border hover:border-gray-300'
                  }`}
                >
                  <div className="flex justify-between items-start mb-2">
                    <div>
                      <span className="badge-clinical px-2.5 py-0.5 rounded-md text-[10px] uppercase tracking-wider">
                        {p.category}
                      </span>
                      <h4 className="text-base font-bold text-clinical-text mt-1">{p.serviceName}</h4>
                    </div>
                    <span className="text-sm font-extrabold text-clinical-red bg-red-50 px-2.5 py-1 rounded-lg">
                      {p.priceFormatted}
                    </span>
                  </div>

                  <p className="text-xs text-clinical-muted mb-4">{p.matchReason}</p>

                  <div className="flex items-center justify-between pt-3 border-t border-gray-100 text-xs text-gray-600">
                    <span className="font-semibold text-clinical-text">
                      Score: <strong className="text-clinical-red">{p.reputationScore}/100</strong>
                    </span>
                    <span>{p.completedOrders} Orders • {p.disputes} Disputes</span>
                  </div>
                </div>
              )
            })}
          </div>

          {/* Action Trigger */}
          <div className="flex justify-end pt-4">
            <button
              onClick={handleConfirmProcurement}
              disabled={isProcessing}
              className="btn-clinical-red px-8 py-3.5 text-sm font-extrabold flex items-center gap-2 shadow-lg hover:scale-[1.02] transition-transform"
            >
              <span>Authorize Escrow & Procure via x402</span>
              <ArrowRight className="w-4 h-4" />
            </button>
          </div>
        </div>
      )}
    </div>
  )
}
