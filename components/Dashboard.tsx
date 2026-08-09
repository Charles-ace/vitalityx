'use client'

import { useState } from 'react'
import Image from 'next/image'
import { useAccount, useConnect, useDisconnect, useBalance, useReadContract, useWriteContract, useWaitForTransactionReceipt } from 'wagmi'
import { parseEther } from 'viem'
import { 
  Sparkles, 
  Globe, 
  User, 
  ArrowRight, 
  ShieldCheck, 
  Dumbbell, 
  Zap, 
  Activity, 
  Flame, 
  Lock, 
  CheckCircle2, 
  Sparkle,
  Link as LinkIcon,
  ChevronDown,
  Layers,
  Cpu,
  Coins,
  BrainCircuit,
  Settings
} from 'lucide-react'

const VITALITY_VAULT_ABI = [
  "function stakeCommitment() external payable",
  "function logDailyHabit(bytes calldata signature, uint256 timestamp) external",
  "function commitments(address) external view returns (address, uint256, uint256, uint256, uint256, bool)",
]

const CONTRACT_ADDRESS = '0x1234567890123456789012345678901234567890'

export function Dashboard() {
  const { address, isConnected } = useAccount()
  const { connectors, connect } = useConnect()
  const { disconnect } = useDisconnect()

  const [activeTab, setActiveTab] = useState<'overview' | 'log' | 'stake' | 'pillars'>('overview')
  const [habitText, setHabitText] = useState('')
  const [isVerifying, setIsVerifying] = useState(false)
  const [verifyStatus, setVerifyStatus] = useState<{ success?: boolean; message?: string } | null>(null)

  const { data: balanceData } = useBalance({ address })
  const { writeContract, data: txHash } = useWriteContract()
  const { isLoading: isTxLoading, isSuccess: isTxSuccess } = useWaitForTransactionReceipt({ hash: txHash })

  const { data: commitmentData } = useReadContract({
    address: CONTRACT_ADDRESS,
    abi: VITALITY_VAULT_ABI,
    functionName: 'commitments',
    args: address ? [address] : undefined,
    query: { enabled: !!address }
  })

  const [
    userAddr, amountStaked, startTime, lastLogTime, daysCompleted, isActive
  ] = (commitmentData as any[]) || []

  const handleStake = () => {
    writeContract({
      address: CONTRACT_ADDRESS,
      abi: VITALITY_VAULT_ABI,
      functionName: 'stakeCommitment',
      value: parseEther('0.01'),
    })
  }

  const handleSubmitProof = async (e: React.FormEvent) => {
    e.preventDefault()
    if (!habitText || !address) return

    setIsVerifying(true)
    setVerifyStatus(null)

    try {
      const res = await fetch('/api/verify-habit', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ address, habitProof: habitText })
      })

      const data = await res.json()

      if (!res.ok) {
        setVerifyStatus({ success: false, message: data.error })
        setIsVerifying(false)
        return
      }

      setVerifyStatus({ success: true, message: 'AI Verified! Submitting cryptographic proof to X Layer...' })

      writeContract({
        address: CONTRACT_ADDRESS,
        abi: VITALITY_VAULT_ABI,
        functionName: 'logDailyHabit',
        args: [data.signature, data.timestamp],
      })

      setHabitText('')
    } catch (err: any) {
      setVerifyStatus({ success: false, message: 'Failed to verify habit proof.' })
    } finally {
      setIsVerifying(false)
    }
  }

  return (
    <div className="min-h-screen bg-black text-white selection:bg-nanovita-green selection:text-black font-sans relative overflow-x-hidden bg-nanovita-wave">
      

      {/* TOP NAVIGATION BAR */}
      <header className="sticky top-0 z-50 bg-black/80 backdrop-blur-2xl border-b border-nanovita-border/60 px-6 py-3.5">
        <div className="max-w-7xl mx-auto flex items-center justify-between">
          
          {/* Logo */}
          <a href="#" className="flex items-center gap-3 group">
            <div className="relative w-9 h-9 rounded-xl overflow-hidden border border-nanovita-green/40 group-hover:border-nanovita-green shadow-[0_0_15px_rgba(130,236,6,0.4)] transition-all">
              <Image 
                src="/logo.png" 
                alt="VitalityX Logo" 
                fill 
                className="object-cover group-hover:scale-110 transition-transform duration-300"
              />
            </div>
            <span className="font-extrabold text-xl tracking-tight text-white flex items-center gap-1.5">
              Vitality<span className="text-nanovita-green">X</span>
            </span>
          </a>

          {/* Smooth Scroll Navigation Links */}
          <nav className="hidden md:flex items-center gap-8 text-sm font-semibold text-gray-300">
            <a href="#hero" className="hover:text-nanovita-green transition-colors">Home</a>
            <a href="#pillars" className="hover:text-nanovita-green transition-colors">Four Pillars</a>
            <a href="#workspace" className="hover:text-nanovita-green transition-colors">Habit Vault</a>
            <a href="#stats" className="hover:text-nanovita-green transition-colors">DeSci Metrics</a>
          </nav>

          {/* Right Controls */}
          <div className="flex items-center gap-4">
            <div className="hidden sm:flex items-center gap-2 text-xs font-semibold px-3 py-1.5 rounded-full bg-white/5 border border-white/10 text-gray-300 cursor-pointer">
              <Globe className="w-4 h-4 text-nanovita-green" />
              <span>English</span>
              <ChevronDown className="w-3 h-3 text-gray-400" />
            </div>

            <div className="w-9 h-9 rounded-full bg-white/5 border border-white/10 flex items-center justify-center text-gray-300 hover:border-nanovita-green transition-colors cursor-pointer">
              <User className="w-4 h-4" />
            </div>

            {isConnected ? (
              <button 
                onClick={() => disconnect()}
                className="flex items-center gap-2 px-5 py-2.5 rounded-full bg-nanovita-green text-black font-extrabold text-xs tracking-wide shadow-[0_0_20px_rgba(130,236,6,0.5)] hover:shadow-[0_0_30px_rgba(130,236,6,0.8)] transition-all"
              >
                <span className="w-2 h-2 rounded-full bg-black animate-pulse" />
                <span>{address?.slice(0, 6)}...{address?.slice(-4)}</span>
              </button>
            ) : (
              <button 
                onClick={() => connectors[0] && connect({ connector: connectors[0] })}
                className="flex items-center gap-2 px-5 py-2.5 rounded-full bg-nanovita-green text-black font-extrabold text-xs tracking-wide shadow-[0_0_20px_rgba(130,236,6,0.5)] hover:scale-105 transition-all"
              >
                <Settings className="w-4 h-4" />
                <span>Connect Wallet</span>
              </button>
            )}
          </div>
        </div>
      </header>

      {/* HERO SECTION (Exact NanoVita Center Layout) */}
      <section id="hero" className="pt-24 pb-20 px-6 max-w-7xl mx-auto text-center relative z-20">
        
        {/* Dual Hero Pill Buttons */}
        <div className="flex flex-wrap items-center justify-center gap-4 sm:gap-6 mt-4">
          
          {/* Explore Research Pill */}
          <a 
            href="#pillars"
            className="flex items-center gap-3 px-8 py-3.5 rounded-full bg-black border-2 border-nanovita-green text-nanovita-green font-extrabold text-sm hover:bg-nanovita-green/10 transition-all group shadow-xl"
          >
            <span>Explore Research</span>
            <div className="w-8 h-8 rounded-full bg-nanovita-green/20 flex items-center justify-center text-nanovita-green group-hover:bg-nanovita-green group-hover:text-black transition-all">
              <Sparkles className="w-4 h-4" />
            </div>
          </a>

          {/* Connect Wallet Pill */}
          {isConnected ? (
            <a 
              href="#workspace"
              className="flex items-center gap-3 px-8 py-3.5 rounded-full bg-nanovita-green text-black font-extrabold text-sm shadow-[0_0_30px_rgba(130,236,6,0.5)] hover:shadow-[0_0_45px_rgba(130,236,6,0.8)] hover:scale-105 transition-all group"
            >
              <span>Enter Vault Workspace</span>
              <div className="w-8 h-8 rounded-full bg-black flex items-center justify-center text-nanovita-green">
                <LinkIcon className="w-4 h-4" />
              </div>
            </a>
          ) : (
            <button 
              onClick={() => connectors[0] && connect({ connector: connectors[0] })}
              className="flex items-center gap-3 px-8 py-3.5 rounded-full bg-nanovita-green text-black font-extrabold text-sm shadow-[0_0_30px_rgba(130,236,6,0.5)] hover:shadow-[0_0_45px_rgba(130,236,6,0.8)] hover:scale-105 transition-all group"
            >
              <span>Connect Wallet</span>
              <div className="w-8 h-8 rounded-full bg-black flex items-center justify-center text-nanovita-green">
                <LinkIcon className="w-4 h-4" />
              </div>
            </button>
          )}
        </div>
      </section>

      {/* "OUR FOUR PILLARS" SECTION (Exact NanoVita Cards) */}
      <section id="pillars" className="py-16 px-6 max-w-7xl mx-auto relative z-20">
        <h2 className="text-center text-sm font-extrabold tracking-[0.25em] text-white uppercase mb-12">
          OUR FOUR PILLARS
        </h2>

        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6">
          
          {/* Pillar 1 */}
          <div className="glass-pillar-card p-8 rounded-[32px] flex flex-col justify-between h-[320px] group shadow-2xl">
            <div>
              <div className="w-10 h-10 rounded-2xl bg-nanovita-green/10 border border-nanovita-green/30 flex items-center justify-center text-nanovita-green mb-6 group-hover:bg-nanovita-green group-hover:text-black transition-all">
                <Cpu className="w-5 h-5" />
              </div>
              <h3 className="text-xl font-bold text-white mb-2">Nanotech Data</h3>
              <p className="text-xs text-nanovita-muted font-normal leading-relaxed">
                Real-time molecular interaction logs stored on decentralized storage.
              </p>
            </div>

            <a 
              href="#workspace"
              className="mt-6 w-full py-3 px-5 rounded-full bg-white text-black font-bold text-xs flex items-center justify-between hover:bg-nanovita-green transition-all shadow-md"
            >
              <span>Explore</span>
              <ArrowRight className="w-4 h-4 text-black" />
            </a>
          </div>

          {/* Pillar 2 */}
          <div className="glass-pillar-card p-8 rounded-[32px] flex flex-col justify-between h-[320px] group shadow-2xl">
            <div>
              <div className="w-10 h-10 rounded-2xl bg-nanovita-green/10 border border-nanovita-green/30 flex items-center justify-center text-nanovita-green mb-6 group-hover:bg-nanovita-green group-hover:text-black transition-all">
                <BrainCircuit className="w-5 h-5" />
              </div>
              <h3 className="text-xl font-bold text-white mb-2">AI Models</h3>
              <p className="text-xs text-nanovita-muted font-normal leading-relaxed">
                Simulate biological responses with Gemini 2.5-powered Bio-intelligence.
              </p>
            </div>

            <a 
              href="#workspace"
              className="mt-6 w-full py-3 px-5 rounded-full bg-white text-black font-bold text-xs flex items-center justify-between hover:bg-nanovita-green transition-all shadow-md"
            >
              <span>Explore</span>
              <ArrowRight className="w-4 h-4 text-black" />
            </a>
          </div>

          {/* Pillar 3 */}
          <div className="glass-pillar-card p-8 rounded-[32px] flex flex-col justify-between h-[320px] group shadow-2xl">
            <div>
              <div className="w-10 h-10 rounded-2xl bg-nanovita-green/10 border border-nanovita-green/30 flex items-center justify-center text-nanovita-green mb-6 group-hover:bg-nanovita-green group-hover:text-black transition-all">
                <Coins className="w-5 h-5" />
              </div>
              <h3 className="text-xl font-bold text-white mb-2">RWA Health Assets</h3>
              <p className="text-xs text-nanovita-muted font-normal leading-relaxed">
                Tokenize your verified health data as tradeable, yield-bearing assets.
              </p>
            </div>

            <a 
              href="#workspace"
              className="mt-6 w-full py-3 px-5 rounded-full bg-white text-black font-bold text-xs flex items-center justify-between hover:bg-nanovita-green transition-all shadow-md"
            >
              <span>Explore</span>
              <ArrowRight className="w-4 h-4 text-black" />
            </a>
          </div>

          {/* Pillar 4 */}
          <div className="glass-pillar-card p-8 rounded-[32px] flex flex-col justify-between h-[320px] group shadow-2xl">
            <div>
              <div className="w-10 h-10 rounded-2xl bg-nanovita-green/10 border border-nanovita-green/30 flex items-center justify-center text-nanovita-green mb-6 group-hover:bg-nanovita-green group-hover:text-black transition-all">
                <Layers className="w-5 h-5" />
              </div>
              <h3 className="text-xl font-bold text-white mb-2">DeSci Protocol</h3>
              <p className="text-xs text-nanovita-muted font-normal leading-relaxed">
                Tokenize your verified health data as tradeable, yield-bearing assets.
              </p>
            </div>

            <a 
              href="#workspace"
              className="mt-6 w-full py-3 px-5 rounded-full bg-white text-black font-bold text-xs flex items-center justify-between hover:bg-nanovita-green transition-all shadow-md"
            >
              <span>Explore</span>
              <ArrowRight className="w-4 h-4 text-black" />
            </a>
          </div>

        </div>
      </section>

      {/* METRICS & WORKSPACE */}
      <section id="workspace" className="py-16 px-6 max-w-5xl mx-auto relative z-20">
        <div className="rounded-[36px] bg-[#0a0d0b]/90 border border-nanovita-border p-6 md:p-10 shadow-2xl backdrop-blur-2xl">
          
          <div className="flex flex-wrap items-center justify-between gap-4 pb-6 border-b border-nanovita-border">
            <div className="flex items-center gap-3">
              <div className="w-10 h-10 rounded-full bg-nanovita-green/10 border border-nanovita-green/30 flex items-center justify-center text-nanovita-green">
                <Activity className="w-5 h-5" />
              </div>
              <div>
                <h3 className="text-xl font-bold text-white">Vitality Vault Workspace</h3>
                <p className="text-xs text-nanovita-muted">OKX X Layer Testnet (Chain ID 195)</p>
              </div>
            </div>

            <div className="flex items-center gap-2 bg-black/80 p-1.5 rounded-full border border-nanovita-border">
              <button 
                onClick={() => setActiveTab('overview')}
                className={`px-4 py-1.5 rounded-full text-xs font-bold transition-all ${activeTab === 'overview' ? 'bg-nanovita-green text-black shadow-md' : 'text-gray-400 hover:text-white'}`}
              >
                Overview
              </button>
              <button 
                onClick={() => setActiveTab('log')}
                className={`px-4 py-1.5 rounded-full text-xs font-bold transition-all ${activeTab === 'log' ? 'bg-nanovita-green text-black shadow-md' : 'text-gray-400 hover:text-white'}`}
              >
                Log Habit
              </button>
              <button 
                onClick={() => setActiveTab('stake')}
                className={`px-4 py-1.5 rounded-full text-xs font-bold transition-all ${activeTab === 'stake' ? 'bg-nanovita-green text-black shadow-md' : 'text-gray-400 hover:text-white'}`}
              >
                Stake OKB
              </button>
            </div>
          </div>

          {/* OVERVIEW */}
          {activeTab === 'overview' && (
            <div className="pt-8 space-y-8 animate-in fade-in duration-500">
              <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
                
                <div className="p-6 rounded-3xl bg-black/80 border border-nanovita-border">
                  <p className="text-xs font-semibold text-nanovita-muted mb-1">X Layer OKB Balance</p>
                  <p className="text-3xl font-extrabold text-nanovita-green">
                    {balanceData ? parseFloat(balanceData.formatted).toFixed(4) : '0.0000'} <span className="text-sm text-white">OKB</span>
                  </p>
                </div>

                <div className="p-6 rounded-3xl bg-black/80 border border-nanovita-border">
                  <p className="text-xs font-semibold text-nanovita-muted mb-1">Staked Commitment</p>
                  <p className="text-3xl font-extrabold text-white">
                    {isActive ? (parseFloat(amountStaked.toString()) / 1e18).toFixed(2) : '0.00'} <span className="text-sm text-nanovita-green">OKB</span>
                  </p>
                </div>

                <div className="p-6 rounded-3xl bg-black/80 border border-nanovita-border">
                  <p className="text-xs font-semibold text-nanovita-muted mb-1">Current Streak</p>
                  <p className="text-3xl font-extrabold text-white flex items-center gap-2">
                    <span>{isActive ? Number(daysCompleted) : 0}</span>
                    <span className="text-sm font-normal text-nanovita-muted">/ 7 Days</span>
                    <Flame className="w-6 h-6 text-nanovita-green ml-auto animate-bounce" />
                  </p>
                </div>
              </div>

              <div className="p-6 rounded-3xl bg-black/80 border border-nanovita-border space-y-4">
                <div className="flex justify-between items-center text-sm font-bold">
                  <span>7-Day Streak Progress</span>
                  <span className="text-nanovita-green">{isActive ? Math.round((Number(daysCompleted) / 7) * 100) : 0}%</span>
                </div>
                <div className="h-4 w-full bg-black rounded-full overflow-hidden border border-nanovita-border">
                  <div 
                    className="h-full bg-gradient-to-r from-nanovita-green to-emerald-400 transition-all duration-700 shadow-[0_0_15px_rgba(130,236,6,0.5)]"
                    style={{ width: `${isActive ? (Number(daysCompleted) / 7) * 100 : 0}%` }}
                  />
                </div>
              </div>

              <div className="flex flex-wrap justify-end gap-4">
                {!isActive ? (
                  <button 
                    onClick={handleStake}
                    className="px-8 py-3.5 rounded-full bg-nanovita-green text-black font-extrabold text-xs hover:scale-105 transition-all shadow-[0_0_20px_rgba(130,236,6,0.4)]"
                  >
                    Stake 0.01 OKB to Activate Vault
                  </button>
                ) : (
                  <button 
                    onClick={() => setActiveTab('log')}
                    className="px-8 py-3.5 rounded-full bg-nanovita-green text-black font-extrabold text-xs hover:scale-105 transition-all shadow-[0_0_20px_rgba(130,236,6,0.4)] flex items-center gap-2"
                  >
                    <span>Log Today's Habit Proof</span>
                    <ArrowRight className="w-4 h-4" />
                  </button>
                )}
              </div>
            </div>
          )}

          {/* LOG HABIT */}
          {activeTab === 'log' && (
            <div className="pt-8 space-y-6 animate-in fade-in duration-500">
              <div>
                <h4 className="text-base font-bold text-white mb-1">Submit Biometric / Habit Proof</h4>
                <p className="text-xs text-nanovita-muted">Our AI Oracle verifies your proof text and generates a signed cryptographic signature on-chain.</p>
              </div>

              <form onSubmit={handleSubmitProof} className="space-y-5">
                <textarea
                  disabled={!isActive || isVerifying || isTxLoading}
                  className="w-full bg-black/80 border border-nanovita-border rounded-2xl p-5 text-white placeholder-gray-600 focus:outline-none focus:border-nanovita-green transition-all h-36 text-sm resize-none disabled:opacity-50"
                  placeholder="e.g., Completed 45 minutes of cardio, 10,000 steps recorded, and drank 3L water today..."
                  value={habitText}
                  onChange={(e) => setHabitText(e.target.value)}
                />

                <div className="flex flex-wrap items-center justify-between gap-4">
                  <span className="text-xs text-nanovita-muted flex items-center gap-1.5">
                    <ShieldCheck className="w-4 h-4 text-nanovita-green" />
                    <span>Protected by VitalityX AI ECDSA Oracle</span>
                  </span>

                  <button
                    disabled={!isActive || isVerifying || isTxLoading || !habitText}
                    type="submit"
                    className="px-8 py-3.5 rounded-full bg-nanovita-green text-black font-extrabold text-xs disabled:opacity-40 disabled:cursor-not-allowed hover:scale-105 transition-all shadow-[0_0_20px_rgba(130,236,6,0.4)] flex items-center gap-2"
                  >
                    {isVerifying ? (
                      <>Analyzing Proof via AI...</>
                    ) : isTxLoading ? (
                      <>Confirming on X Layer...</>
                    ) : (
                      <>Verify & Submit On-Chain <Dumbbell className="w-4 h-4" /></>
                    )}
                  </button>
                </div>
              </form>

              {verifyStatus && (
                <div className={`p-4 rounded-2xl text-xs font-semibold flex items-center gap-3 ${verifyStatus.success ? 'bg-nanovita-green/10 text-nanovita-green border border-nanovita-green/30' : 'bg-red-500/10 text-red-400 border border-red-500/30'}`}>
                  <CheckCircle2 className="w-5 h-5 shrink-0" />
                  <span>{verifyStatus.message}</span>
                </div>
              )}

              {isTxSuccess && (
                <div className="p-4 rounded-2xl text-xs font-semibold bg-nanovita-green/20 text-nanovita-green border border-nanovita-green/40 flex items-center gap-3">
                  <CheckCircle2 className="w-5 h-5 shrink-0" />
                  <span>Habit successfully logged on-chain for today! Streak updated.</span>
                </div>
              )}
            </div>
          )}

          {/* STAKE */}
          {activeTab === 'stake' && (
            <div className="pt-8 space-y-6 animate-in fade-in duration-500">
              <div className="p-6 rounded-3xl bg-black/80 border border-nanovita-border space-y-4">
                <div className="flex items-center gap-3">
                  <Lock className="w-6 h-6 text-nanovita-green" />
                  <div>
                    <h4 className="text-base font-bold text-white">7-Day Commitment Vault</h4>
                    <p className="text-xs text-nanovita-muted">Stake minimum 0.01 OKB to participate in the Lifestyle-to-Earn cycle.</p>
                  </div>
                </div>

                <div className="p-4 rounded-2xl bg-black border border-nanovita-border flex justify-between items-center text-sm font-bold">
                  <span className="text-nanovita-muted">Required Stake Amount:</span>
                  <span className="text-nanovita-green">0.01 OKB</span>
                </div>

                <button 
                  disabled={isActive}
                  onClick={handleStake}
                  className="w-full py-4 rounded-full bg-nanovita-green text-black font-extrabold text-xs hover:scale-[1.02] disabled:opacity-50 transition-all shadow-[0_0_20px_rgba(130,236,6,0.4)]"
                >
                  {isActive ? 'Vault Commitment Currently Active' : 'Confirm Stake 0.01 OKB'}
                </button>
              </div>
            </div>
          )}

        </div>
      </section>

      {/* FOOTER */}
      <footer className="py-12 px-6 border-t border-nanovita-border/50 bg-black text-center text-xs text-nanovita-muted space-y-3 relative z-20">
        <div className="flex items-center justify-center gap-2 mb-2">
          <div className="relative w-6 h-6 rounded-lg overflow-hidden border border-nanovita-green/40">
            <Image src="/logo.png" alt="Logo" fill className="object-cover" />
          </div>
          <span className="font-extrabold text-white text-sm">VitalityX</span>
        </div>
        <p>© 2026 VitalityX Protocol • DeSci AI Wellness on OKX X Layer</p>
      </footer>

    </div>
  )
}
