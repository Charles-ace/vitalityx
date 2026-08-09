'use client'

import { useState } from 'react'
import { useAccount, useConnect, useDisconnect, useBalance, useReadContract, useWriteContract, useWaitForTransactionReceipt } from 'wagmi'
import { parseEther } from 'viem'
import { Activity, Droplet, Flame, ArrowRight, ShieldCheck, Dumbbell, Zap } from 'lucide-react'

// ABI for the functions we need
const VITALITY_VAULT_ABI = [
  "function stakeCommitment() external payable",
  "function logDailyHabit(bytes calldata signature, uint256 timestamp) external",
  "function commitments(address) external view returns (address, uint256, uint256, uint256, uint256, bool)",
]

// Replace with your deployed contract address
const CONTRACT_ADDRESS = '0x1234567890123456789012345678901234567890' 

export function Dashboard() {
  const { address, isConnected } = useAccount()
  const { connectors, connect } = useConnect()
  const { disconnect } = useDisconnect()

  const [habitText, setHabitText] = useState('')
  const [isVerifying, setIsVerifying] = useState(false)
  const [verifyStatus, setVerifyStatus] = useState<{success?: boolean, message?: string} | null>(null)

  // Contract interactions
  const { data: balanceData } = useBalance({ address })
  const { writeContract, data: txHash } = useWriteContract()
  const { isLoading: isTxLoading, isSuccess: isTxSuccess } = useWaitForTransactionReceipt({ hash: txHash })

  // Read active commitment
  const { data: commitmentData, refetch: refetchCommitment } = useReadContract({
    address: CONTRACT_ADDRESS,
    abi: VITALITY_VAULT_ABI,
    functionName: 'commitments',
    args: address ? [address] : undefined,
    query: {
        enabled: !!address,
    }
  })

  // Destructure commitment data if available
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
      // 1. Send proof to AI Oracle Backend
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

      setVerifyStatus({ success: true, message: 'AI Verified! Submitting to blockchain...' })

      // 2. Submit on-chain with signature
      writeContract({
        address: CONTRACT_ADDRESS,
        abi: VITALITY_VAULT_ABI,
        functionName: 'logDailyHabit',
        args: [data.signature, data.timestamp],
      })
      
      setHabitText('')
    } catch (err: any) {
      setVerifyStatus({ success: false, message: 'Failed to verify habit.' })
    } finally {
      setIsVerifying(false)
    }
  }

  if (!isConnected) {
    return (
      <div className="flex flex-col items-center justify-center min-h-[60vh] text-center space-y-8 animate-in fade-in duration-1000">
        <div className="relative">
          <div className="absolute inset-0 bg-neon-blue/20 blur-[100px] rounded-full"></div>
          <Zap className="w-24 h-24 text-neon-blue mx-auto relative z-10" />
        </div>
        <h1 className="text-6xl font-black tracking-tighter bg-gradient-to-r from-neon-blue to-neon-green bg-clip-text text-transparent">
          VITALITY<span className="text-white">X</span>
        </h1>
        <p className="text-xl text-gray-400 max-w-md">Connect your OKX Wallet to start earning on X Layer through healthy habits.</p>
        
        <div className="flex flex-col gap-4 mt-8">
          {connectors.map((connector) => (
            <button
              key={connector.uid}
              onClick={() => connect({ connector })}
              className="px-8 py-4 bg-white/5 border border-white/10 hover:border-neon-blue hover:bg-neon-blue/10 rounded-2xl transition-all duration-300 font-bold tracking-wide flex items-center justify-between group"
            >
              <span>Connect {connector.name}</span>
              <ArrowRight className="w-5 h-5 text-gray-500 group-hover:text-neon-blue group-hover:translate-x-1 transition-all" />
            </button>
          ))}
        </div>
      </div>
    )
  }

  return (
    <div className="max-w-4xl mx-auto w-full space-y-8 animate-in fade-in slide-in-from-bottom-4 duration-700">
      
      {/* Header Profile */}
      <div className="flex items-center justify-between p-6 bg-white/5 border border-white/10 rounded-3xl backdrop-blur-md">
        <div className="flex items-center gap-4">
          <div className="w-12 h-12 rounded-full bg-gradient-to-br from-neon-blue to-neon-green flex items-center justify-center font-bold text-black">
            {address?.slice(2, 4).toUpperCase()}
          </div>
          <div>
            <p className="text-sm text-gray-400">Connected Wallet</p>
            <p className="font-mono">{address?.slice(0, 6)}...{address?.slice(-4)}</p>
          </div>
        </div>
        <div className="text-right">
          <p className="text-sm text-gray-400">Balance on X Layer</p>
          <p className="font-bold text-xl text-neon-blue">
            {balanceData ? parseFloat(balanceData.formatted).toFixed(4) : '0.00'} <span className="text-sm">OKB</span>
          </p>
        </div>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
        
        {/* Status Card */}
        <div className="p-8 bg-gradient-to-br from-white/5 to-transparent border border-white/10 rounded-3xl relative overflow-hidden group hover:border-white/20 transition-all">
          <div className="absolute top-0 right-0 w-64 h-64 bg-neon-green/10 blur-[100px] rounded-full group-hover:bg-neon-green/20 transition-all"></div>
          
          <h2 className="text-2xl font-bold mb-2 flex items-center gap-2">
            <Activity className="text-neon-green" /> Current Mission
          </h2>
          
          {isActive ? (
            <div className="space-y-6 mt-6">
              <div>
                <p className="text-gray-400 text-sm mb-1">Streak Progress</p>
                <div className="flex items-end gap-2">
                  <span className="text-5xl font-black text-white">{Number(daysCompleted)}</span>
                  <span className="text-xl text-gray-500 mb-1">/ 7 Days</span>
                </div>
              </div>
              
              <div className="h-3 w-full bg-white/10 rounded-full overflow-hidden">
                <div 
                  className="h-full bg-gradient-to-r from-neon-green to-neon-blue transition-all duration-1000"
                  style={{ width: `${(Number(daysCompleted) / 7) * 100}%` }}
                ></div>
              </div>
              
              <div className="flex justify-between text-sm">
                <span className="text-gray-400">Staked: {parseFloat(amountStaked.toString()) / 1e18} OKB</span>
                <span className="text-neon-green font-bold">Yield Active</span>
              </div>
            </div>
          ) : (
            <div className="mt-8 text-center space-y-6">
              <div className="w-16 h-16 rounded-full bg-white/5 border border-white/10 mx-auto flex items-center justify-center">
                <ShieldCheck className="text-gray-400 w-8 h-8" />
              </div>
              <div>
                <p className="text-gray-300">No active commitment.</p>
                <p className="text-sm text-gray-500 mt-2">Stake OKB to hold yourself accountable.</p>
              </div>
              <button 
                onClick={handleStake}
                className="w-full py-4 bg-white text-black font-bold rounded-2xl hover:bg-neon-blue hover:text-black transition-all shadow-[0_0_20px_rgba(0,243,255,0)] hover:shadow-[0_0_20px_rgba(0,243,255,0.4)]"
              >
                Stake 0.01 OKB & Start
              </button>
            </div>
          )}
        </div>

        {/* Action Card */}
        <div className="p-8 bg-gradient-to-bl from-white/5 to-transparent border border-white/10 rounded-3xl relative overflow-hidden group hover:border-white/20 transition-all">
          <div className="absolute top-0 left-0 w-64 h-64 bg-neon-blue/10 blur-[100px] rounded-full group-hover:bg-neon-blue/20 transition-all"></div>
          
          <h2 className="text-2xl font-bold mb-6 flex items-center gap-2">
            <Flame className="text-neon-blue" /> Log Daily Proof
          </h2>
          
          <form onSubmit={handleSubmitProof} className="space-y-4">
            <div>
              <label className="text-sm text-gray-400 mb-2 block">Describe your habit (AI Verified)</label>
              <textarea
                disabled={!isActive || isVerifying || isTxLoading}
                className="w-full bg-black/50 border border-white/10 rounded-2xl p-4 text-white focus:outline-none focus:border-neon-blue transition-colors resize-none h-32 disabled:opacity-50"
                placeholder="e.g., Ran 5km in 25 minutes and drank 2 liters of water..."
                value={habitText}
                onChange={(e) => setHabitText(e.target.value)}
              />
            </div>
            
            <button
              disabled={!isActive || isVerifying || isTxLoading || !habitText}
              type="submit"
              className="w-full py-4 bg-gradient-to-r from-neon-blue to-neon-green text-black font-bold rounded-2xl disabled:opacity-50 disabled:cursor-not-allowed hover:opacity-90 transition-opacity flex justify-center items-center gap-2"
            >
              {isVerifying ? (
                <>AI is analyzing proof...</>
              ) : isTxLoading ? (
                <>Confirming on X Layer...</>
              ) : (
                <>Submit & Get Signed <Dumbbell className="w-5 h-5" /></>
              )}
            </button>
            
            {verifyStatus && (
              <div className={`p-4 rounded-xl text-sm ${verifyStatus.success ? 'bg-neon-green/10 text-neon-green border border-neon-green/20' : 'bg-red-500/10 text-red-400 border border-red-500/20'}`}>
                {verifyStatus.message}
              </div>
            )}
            
            {isTxSuccess && (
              <div className="p-4 rounded-xl text-sm bg-neon-blue/10 text-neon-blue border border-neon-blue/20">
                Habit logged on-chain successfully!
              </div>
            )}
          </form>
        </div>

      </div>
      
      <div className="text-center">
        <button 
          onClick={() => disconnect()}
          className="text-sm text-gray-500 hover:text-white transition-colors"
        >
          Disconnect Wallet
        </button>
      </div>
    </div>
  )
}
