'use client'

import { useState } from 'react'
import Image from 'next/image'
import { useAccount, useConnect, useDisconnect, useBalance, useWriteContract, useWaitForTransactionReceipt } from 'wagmi'
import { parseEther, keccak256, toHex } from 'viem'
import { 
  Sparkles, 
  ShieldCheck, 
  Search, 
  CheckCircle2, 
  ArrowRight, 
  Globe, 
  ExternalLink,
  Activity,
  Layers,
  Lock,
  RefreshCw,
  Award,
  Clock
} from 'lucide-react'

import { GoalIntake } from './GoalIntake'
import { AgentTimeline } from './AgentTimeline'

const ESCROW_ABI = [
  {
    type: 'function',
    name: 'createGoal',
    inputs: [
      { name: 'provider', type: 'address' },
      { name: 'goalHash', type: 'bytes32' },
    ],
    outputs: [{ name: '', type: 'uint256' }],
    stateMutability: 'payable',
  },
] as const

const ESCROW_CONTRACT_ADDRESS = (process.env.NEXT_PUBLIC_ESCROW_ADDRESS || '0x1234567890123456789012345678901234567890') as `0x${string}`

interface ProcurementRecord {
  id: number
  goalText: string
  providerName: string
  amountFormatted: string
  verificationHash: string
  timestamp: string
  status: 'Verified On-Chain' | 'Escrow Pending'
}

export function Dashboard() {
  const { address, isConnected } = useAccount()
  const { connectors, connect } = useConnect()
  const { disconnect } = useDisconnect()

  const { data: balanceData } = useBalance({ address })
  const { writeContract, data: txHash } = useWriteContract()
  const { isLoading: isTxLoading, isSuccess: isTxSuccess } = useWaitForTransactionReceipt({ hash: txHash })

  // Agent State Tracker
  const [stage, setStage] = useState<'idle' | 'searching' | 'evaluating' | 'escrow_pending' | 'verifying' | 'completed'>('idle')
  const [activeGoalText, setActiveGoalText] = useState('')
  const [activeProvider, setActiveProvider] = useState<any>(null)
  const [activeVerificationHash, setActiveVerificationHash] = useState('')
  const [isVerifying, setIsVerifying] = useState(false)

  // Demo History Records
  const [historyRecords, setHistoryRecords] = useState<ProcurementRecord[]>([
    {
      id: 1,
      goalText: 'At-home baseline biomarker blood panel kit',
      providerName: 'At-Home Longevity Biomarker Blood Panel Kit',
      amountFormatted: '0.025 OKB',
      verificationHash: '0x8f2a9d81b4c73e0129a8f4c6b2e1d0938f71c4a5b6d7e8f901a2b3c4d5e6f7a8',
      timestamp: '2 hours ago',
      status: 'Verified On-Chain',
    },
    {
      id: 2,
      goalText: 'Sleep optimization protocol and Oura sync',
      providerName: 'SleepMax Bio-Hacking Protocol & Oura Sync',
      amountFormatted: '0.01 OKB',
      verificationHash: '0x4d3c2b1a0987654321fedcba9876543210abcdef0123456789abcdef01234567',
      timestamp: '1 day ago',
      status: 'Verified On-Chain',
    },
  ])

  // Step 1: User Confirms Procurement Goal from Intake Component
  const handleGoalPlanned = async (data: { goal: string; selectedProvider: any }) => {
    setActiveGoalText(data.goal)
    setActiveProvider(data.selectedProvider)
    setStage('escrow_pending')

    try {
      // 1. Prepare payment via agent API
      const payRes = await fetch('/api/agent/pay', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          providerAddress: data.selectedProvider.providerAddress,
          goalText: data.goal,
          amount: data.selectedProvider.price,
        }),
      })

      const payData = await payRes.json()

      // 2. Trigger on-chain createGoal escrow contract call if connected
      if (isConnected && ESCROW_CONTRACT_ADDRESS !== '0x1234567890123456789012345678901234567890') {
        writeContract({
          address: ESCROW_CONTRACT_ADDRESS,
          abi: ESCROW_ABI,
          functionName: 'createGoal',
          args: [data.selectedProvider.providerAddress as `0x${string}`, payData.goalHash],
          value: BigInt(data.selectedProvider.price),
        })
      }
    } catch (err) {
      console.error('Procurement error:', err)
    }
  }

  // Step 2: Trigger Independent Agent Verification Simulation
  const handleTriggerVerification = async () => {
    if (!activeProvider) return
    setIsVerifying(true)
    setStage('verifying')

    try {
      const verifyRes = await fetch('/api/agent/verify', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          goalId: Date.now() % 10000,
          artifactType: 'PROVIDER_FULFILLMENT_WEBHOOK',
          artifactData: `DELIVERY_CONFIRMED:${activeProvider.providerAddress}`,
        }),
      })

      const verifyData = await verifyRes.json()

      if (verifyData.success) {
        setActiveVerificationHash(verifyData.verificationHash)
        setStage('completed')

        // Add to permanent history
        const newRecord: ProcurementRecord = {
          id: Date.now(),
          goalText: activeGoalText,
          providerName: activeProvider.serviceName,
          amountFormatted: activeProvider.priceFormatted,
          verificationHash: verifyData.verificationHash,
          timestamp: 'Just now',
          status: 'Verified On-Chain',
        }
        setHistoryRecords([newRecord, ...historyRecords])
      }
    } catch (err) {
      console.error('Verification error:', err)
    } finally {
      setIsVerifying(false)
    }
  }

  return (
    <div className="min-h-screen bg-clinical-bg text-clinical-text font-sans antialiased selection:bg-clinical-red selection:text-white">
      
      {/* TOP NAVIGATION BAR */}
      <header className="sticky top-0 z-50 bg-white/90 backdrop-blur-md border-b border-clinical-border px-6 py-4">
        <div className="max-w-7xl mx-auto flex items-center justify-between">
          
          {/* Logo */}
          <a href="#" className="flex items-center gap-3">
            <div className="relative w-8 h-8 rounded-lg overflow-hidden bg-clinical-red text-white flex items-center justify-center font-extrabold text-lg shadow-sm">
              V
            </div>
            <span className="font-extrabold text-xl tracking-tight text-clinical-text">
              Vitality<span className="text-clinical-red">X</span>
            </span>
          </a>

          {/* Navigation Links */}
          <nav className="hidden md:flex items-center gap-8 text-sm font-semibold text-clinical-muted">
            <a href="#intake" className="hover:text-clinical-text transition-colors">Agent Intake</a>
            <a href="#verification" className="hover:text-clinical-text transition-colors">How Verification Works</a>
            <a href="#history" className="hover:text-clinical-text transition-colors">Procurement History</a>
            <a href="#metrics" className="hover:text-clinical-text transition-colors">X Layer Metrics</a>
          </nav>

          {/* Wallet Connect */}
          <div className="flex items-center gap-4">
            <div className="hidden sm:flex items-center gap-2 text-xs font-semibold px-3 py-1.5 rounded-full bg-gray-100 text-clinical-muted">
              <Globe className="w-3.5 h-3.5 text-clinical-red" />
              <span>X Layer Testnet (195)</span>
            </div>

            {isConnected ? (
              <button 
                onClick={() => disconnect()}
                className="btn-clinical-red px-5 py-2 text-xs font-extrabold flex items-center gap-2 shadow-sm"
              >
                <span className="w-2 h-2 rounded-full bg-white animate-pulse" />
                <span>{address?.slice(0, 6)}...{address?.slice(-4)}</span>
              </button>
            ) : (
              <button 
                onClick={() => connectors[0] && connect({ connector: connectors[0] })}
                className="btn-clinical-red px-5 py-2 text-xs font-extrabold shadow-sm"
              >
                Connect OKX Wallet
              </button>
            )}
          </div>
        </div>
      </header>

      {/* HERO SECTION (Prenetics Consumer-Health Aesthetics) */}
      <section className="pt-16 pb-12 px-6 max-w-7xl mx-auto">
        <div className="max-w-3xl">
          <span className="badge-clinical px-3.5 py-1 rounded-full text-clinical-red font-bold text-xs uppercase tracking-wider">
            OKX X Layer Autonomous Agent Track
          </span>
          <h1 className="text-4xl sm:text-5xl lg:text-6xl font-extrabold text-clinical-text mt-4 tracking-tight leading-[1.1]">
            Autonomous Wellness Procurement on X Layer.
          </h1>
          <p className="text-base sm:text-lg text-clinical-muted mt-5 leading-relaxed">
            State your plain-language goal. VitalityX searches registered providers on X Layer, evaluates ERC-8004 reputation signals, settles payment via x402, and independently verifies fulfillment proof on-chain before releasing funds.
          </p>

          {/* Credibility Strip */}
          <div className="flex flex-wrap items-center gap-3 mt-8 pt-6 border-t border-clinical-border">
            <span className="badge-clinical px-3 py-1 rounded-full text-gray-700">Built on X Layer (L2)</span>
            <span className="badge-clinical px-3 py-1 rounded-full text-gray-700">ERC-8004 Reputation Signals</span>
            <span className="badge-clinical px-3 py-1 rounded-full text-gray-700">x402 Settled Escrow</span>
            <span className="badge-clinical px-3 py-1 rounded-full text-gray-700">OKX Wallet Integrated</span>
          </div>
        </div>
      </section>

      {/* STAT CALLOUTS */}
      <section id="metrics" className="py-8 px-6 max-w-7xl mx-auto">
        <div className="grid grid-cols-2 lg:grid-cols-4 gap-4 md:gap-6">
          
          <div className="clinical-card p-6">
            <span className="text-xs font-bold text-clinical-muted uppercase tracking-wider">Goals Completed</span>
            <p className="text-3xl md:text-4xl font-extrabold text-clinical-text mt-2">
              14 <span className="text-sm font-semibold text-clinical-red">Verified</span>
            </p>
          </div>

          <div className="clinical-card p-6">
            <span className="text-xs font-bold text-clinical-muted uppercase tracking-wider">Total Verified Spend</span>
            <p className="text-3xl md:text-4xl font-extrabold text-clinical-text mt-2">
              0.35 <span className="text-sm font-semibold text-clinical-muted">OKB</span>
            </p>
          </div>

          <div className="clinical-card p-6">
            <span className="text-xs font-bold text-clinical-muted uppercase tracking-wider">Avg Fulfillment Time</span>
            <p className="text-3xl md:text-4xl font-extrabold text-clinical-text mt-2">
              1.2 <span className="text-sm font-semibold text-clinical-muted">Hours</span>
            </p>
          </div>

          <div className="clinical-card p-6">
            <span className="text-xs font-bold text-clinical-muted uppercase tracking-wider">Providers Evaluated</span>
            <p className="text-3xl md:text-4xl font-extrabold text-clinical-text mt-2">
              48 <span className="text-sm font-semibold text-clinical-muted">On-Chain</span>
            </p>
          </div>

        </div>
      </section>

      {/* AGENT INTAKE SECTION */}
      <section id="intake" className="py-8 px-6 max-w-7xl mx-auto">
        <GoalIntake onGoalPlanned={handleGoalPlanned} isProcessing={stage !== 'idle' && stage !== 'completed'} />

        {/* Live Timeline & Verification Action */}
        <AgentTimeline
          currentStage={stage}
          goalText={activeGoalText}
          providerName={activeProvider?.serviceName}
          priceFormatted={activeProvider?.priceFormatted}
          verificationHash={activeVerificationHash}
        />

        {stage === 'escrow_pending' && (
          <div className="clinical-card p-6 my-6 border-l-4 border-l-clinical-red flex flex-wrap items-center justify-between gap-4">
            <div>
              <h4 className="text-base font-bold text-clinical-text">Escrow Locked & Order Transmitted</h4>
              <p className="text-xs text-clinical-muted">
                Funds are locked in WellnessEscrow contract. Click below to simulate the provider webhook & independent agent verification.
              </p>
            </div>
            <button
              onClick={handleTriggerVerification}
              disabled={isVerifying}
              className="btn-clinical-red px-6 py-3 text-xs font-extrabold flex items-center gap-2"
            >
              {isVerifying ? (
                <>
                  <RefreshCw className="w-4 h-4 animate-spin" />
                  <span>Verifying Artifact Hash...</span>
                </>
              ) : (
                <>
                  <ShieldCheck className="w-4 h-4" />
                  <span>Simulate Independent Agent Verification</span>
                </>
              )}
            </button>
          </div>
        )}
      </section>

      {/* HOW VERIFICATION WORKS GRID (Prenetics Card Style) */}
      <section id="verification" className="py-12 px-6 max-w-7xl mx-auto">
        <div className="text-center max-w-2xl mx-auto mb-12">
          <span className="text-xs font-extrabold text-clinical-red uppercase tracking-wider">Independent Proof Standard</span>
          <h2 className="text-3xl font-extrabold text-clinical-text mt-2">How Independent Verification Works</h2>
          <p className="text-sm text-clinical-muted mt-2">
            VitalityX never marks a goal "complete" on trust alone. Funds remain in escrow until independent proof is validated.
          </p>
        </div>

        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6">
          
          <div className="clinical-card p-6">
            <div className="w-10 h-10 rounded-xl bg-red-50 text-clinical-red flex items-center justify-center mb-4">
              <Search className="w-5 h-5" />
            </div>
            <h3 className="text-base font-bold text-clinical-text mb-2">1. Plain Goal Search</h3>
            <p className="text-xs text-clinical-muted leading-relaxed">
              Users state wellness intent in natural language. The agent searches registered providers on X Layer.
            </p>
          </div>

          <div className="clinical-card p-6">
            <div className="w-10 h-10 rounded-xl bg-red-50 text-clinical-red flex items-center justify-center mb-4">
              <Award className="w-5 h-5" />
            </div>
            <h3 className="text-base font-bold text-clinical-text mb-2">2. ERC-8004 Scoring</h3>
            <p className="text-xs text-clinical-muted leading-relaxed">
              Candidates are evaluated on price, completed orders, disputes, and average fulfillment velocity.
            </p>
          </div>

          <div className="clinical-card p-6">
            <div className="w-10 h-10 rounded-xl bg-red-50 text-clinical-red flex items-center justify-center mb-4">
              <Lock className="w-5 h-5" />
            </div>
            <h3 className="text-base font-bold text-clinical-text mb-2">3. x402 Escrow Lock</h3>
            <p className="text-xs text-clinical-muted leading-relaxed">
              Payment is held securely in WellnessEscrow contract. Reentrancy-guarded with automatic refund timeout.
            </p>
          </div>

          <div className="clinical-card p-6">
            <div className="w-10 h-10 rounded-xl bg-red-50 text-clinical-red flex items-center justify-center mb-4">
              <ShieldCheck className="w-5 h-5" />
            </div>
            <h3 className="text-base font-bold text-clinical-text mb-2">4. Independent Proof</h3>
            <p className="text-xs text-clinical-muted leading-relaxed">
              Delivery tracking, lab report hash, or consultation receipts are validated via ECDSA oracle before release.
            </p>
          </div>

        </div>
      </section>

      {/* PORTABLE PROCUREMENT HISTORY TABLE */}
      <section id="history" className="py-12 px-6 max-w-7xl mx-auto">
        <div className="clinical-card p-6 md:p-8">
          <div className="flex flex-wrap items-center justify-between gap-4 pb-6 border-b border-clinical-border">
            <div>
              <span className="text-xs font-bold text-clinical-red uppercase tracking-wider">Permanent On-Chain History</span>
              <h3 className="text-xl font-extrabold text-clinical-text mt-1">Portable Procurement Trail</h3>
            </div>
            <span className="badge-clinical px-3 py-1 rounded-full text-xs font-semibold">
              X Layer Testnet (Chain ID 195)
            </span>
          </div>

          <div className="overflow-x-auto mt-6">
            <table className="w-full text-left border-collapse">
              <thead>
                <tr className="border-b border-clinical-border text-xs font-bold text-clinical-muted uppercase">
                  <th className="py-3 px-4">Goal / Service</th>
                  <th className="py-3 px-4">Provider</th>
                  <th className="py-3 px-4">Amount Paid</th>
                  <th className="py-3 px-4">Verification Hash</th>
                  <th className="py-3 px-4 text-right">Status</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-gray-100 text-xs">
                {historyRecords.map((record) => (
                  <tr key={record.id} className="hover:bg-gray-50/50 transition-colors">
                    <td className="py-4 px-4 font-bold text-clinical-text">{record.goalText}</td>
                    <td className="py-4 px-4 text-clinical-muted">{record.providerName}</td>
                    <td className="py-4 px-4 font-extrabold text-clinical-red">{record.amountFormatted}</td>
                    <td className="py-4 px-4 font-mono text-gray-500">
                      <a
                        href={`https://www.oklink.com/xlayer-test`}
                        target="_blank"
                        rel="noreferrer"
                        className="flex items-center gap-1 text-clinical-red hover:underline"
                      >
                        <span>{record.verificationHash.slice(0, 10)}...{record.verificationHash.slice(-8)}</span>
                        <ExternalLink className="w-3 h-3" />
                      </a>
                    </td>
                    <td className="py-4 px-4 text-right">
                      <span className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full bg-emerald-50 text-emerald-700 font-bold">
                        <CheckCircle2 className="w-3.5 h-3.5" />
                        <span>{record.status}</span>
                      </span>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>
      </section>

      {/* FOOTER */}
      <footer className="py-12 px-6 border-t border-clinical-border bg-white text-center text-xs text-clinical-muted">
        <div className="max-w-7xl mx-auto space-y-3">
          <div className="flex items-center justify-center gap-2">
            <div className="w-5 h-5 rounded bg-clinical-red text-white flex items-center justify-center font-bold text-xs">
              V
            </div>
            <span className="font-extrabold text-clinical-text text-sm">VitalityX Protocol</span>
          </div>
          <p>© 2026 VitalityX • Autonomous Wellness Procurement Agent on OKX X Layer</p>
        </div>
      </footer>

    </div>
  )
}
