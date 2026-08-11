'use client'

import Link from 'next/link'
import { Logo } from '@/components/Logo'
import { usePathname } from 'next/navigation'
import { useState, useEffect, useRef } from 'react'
import { useAccount, useConnect, useDisconnect } from 'wagmi'
import { Globe, ChevronDown, Check, Wallet } from 'lucide-react'

const NAV_LINKS = [
  { href: '/goal', label: 'Start a Goal' },
  { href: '/dashboard', label: 'Dashboard' },
  { href: '/providers', label: 'Providers' },
]

export function NavBar() {
  const pathname = usePathname()
  const [mounted, setMounted] = useState(false)
  const { address, isConnected } = useAccount()
  const { connect, connectors } = useConnect()
  const { disconnect } = useDisconnect()
  const [walletOpen, setWalletOpen] = useState(false)
  const [showConnectModal, setShowConnectModal] = useState(false)

  useEffect(() => {
    setMounted(true)
  }, [])

  // ── Page-select indicator ──────────────────────────────────────────
  const navRef = useRef<HTMLElement>(null)
  const indicatorRef = useRef<HTMLDivElement>(null)
  const linkRefs = useRef<(HTMLAnchorElement | null)[]>([])

  useEffect(() => {
    const activeIndex = NAV_LINKS.findIndex((l) => pathname?.startsWith(l.href))
    const indicator = indicatorRef.current
    const nav = navRef.current
    if (!indicator || !nav) return

    if (activeIndex === -1) {
      indicator.style.opacity = '0'
      return
    }

    const activeEl = linkRefs.current[activeIndex]
    if (!activeEl) return

    const navRect = nav.getBoundingClientRect()
    const elRect = activeEl.getBoundingClientRect()

    indicator.style.opacity = '1'
    indicator.style.width = `${elRect.width}px`
    indicator.style.transform = `translateX(${elRect.left - navRect.left}px)`
  }, [pathname])

  const isActive = (href: string) => pathname?.startsWith(href)

  const handleConnectWallet = async (connectorToUse?: any) => {
    try {
      setShowConnectModal(false)
      const targetConnector =
        connectorToUse ||
        connectors.find((c) => c.id === 'okxWallet' || c.name?.toLowerCase().includes('okx')) ||
        connectors[0]

      if (targetConnector) {
        connect({ connector: targetConnector })
      } else if (typeof window !== 'undefined' && (window as any).ethereum) {
        await (window as any).ethereum.request({ method: 'eth_requestAccounts' })
      } else {
        alert('No Web3 wallet extension found. Please install OKX Wallet or MetaMask.')
      }
    } catch (err) {
      console.error('Wallet connect error:', err)
    }
  }

  return (
    <header className="sticky top-0 z-50 bg-white/95 backdrop-blur-md border-b border-[#dff0ff]">
      <div className="max-w-7xl mx-auto px-6 h-16 flex items-center justify-between">

        {/* Logo */}
        <Link href="/" aria-label="VitalityX Home">
          <Logo size="md" />
        </Link>

        {/* Nav */}
        <nav ref={navRef} className="hidden md:flex items-center gap-1 relative">
          {/* Sliding active indicator pill */}
          <div
            ref={indicatorRef}
            className="absolute bottom-[-17px] left-0 h-[2px] bg-[#0f5238] rounded-full opacity-0"
            style={{ transition: 'width 0.35s cubic-bezier(0.16,1,0.3,1), transform 0.35s cubic-bezier(0.16,1,0.3,1), opacity 0.2s ease' }}
          />

          {NAV_LINKS.map((link, i) => (
            <Link
              key={link.href}
              href={link.href}
              ref={(el) => { linkRefs.current[i] = el }}
              className={`relative px-4 py-2 text-sm font-semibold rounded-lg transition-all duration-200 ${
                isActive(link.href)
                  ? 'text-[#0f5238] bg-[#eaf5ff]'
                  : 'text-[#404943] hover:text-[#0f5238] hover:bg-[#eaf5ff]/60'
              }`}
            >
              {isActive(link.href) && (
                <span className="absolute top-1.5 right-1.5 w-1.5 h-1.5 rounded-full bg-[#0f5238]" />
              )}
              {link.label}
            </Link>
          ))}
        </nav>

        {/* Right: chain badge + wallet */}
        <div className="flex items-center gap-3">
          <span className="hidden sm:flex items-center gap-2 text-xs font-semibold px-3 py-1.5 rounded-full bg-[#eaf5ff] text-[#356668]">
            <Globe className="w-3.5 h-3.5 text-[#0f5238]" />
            <span>X Layer (195)</span>
          </span>

          <div className="relative">
            {mounted && isConnected && address ? (
              <button
                onClick={() => setWalletOpen((v) => !v)}
                className="flex items-center gap-2 px-4 py-2 rounded-full bg-[#eaf5ff] hover:bg-[#dff0ff] text-xs font-bold text-[#001e2e] transition-colors"
              >
                <span className="w-2 h-2 rounded-full bg-emerald-500" />
                <span>{address.slice(0, 6)}...{address.slice(-4)}</span>
                <ChevronDown className="w-3.5 h-3.5 text-[#404943]" />
              </button>
            ) : (
              <button
                onClick={() => {
                  if (connectors.length > 1) {
                    setShowConnectModal((v) => !v)
                  } else {
                    handleConnectWallet()
                  }
                }}
                className="bg-[#0f5238] text-white hover:bg-[#2d6a4f] px-5 py-2.5 rounded-full text-xs font-extrabold shadow-sm transition-all flex items-center gap-1.5"
              >
                <Wallet className="w-3.5 h-3.5" />
                <span>Connect Wallet</span>
              </button>
            )}

            {/* Wallet Dropdown when connected */}
            {walletOpen && isConnected && (
              <div className="absolute right-0 mt-2 w-64 rounded-xl bg-white border border-[#dff0ff] shadow-lg p-2 z-50">
                <p className="px-3 pt-2 pb-1 text-[10px] font-bold text-[#404943] uppercase tracking-wider">
                  Connected Wallet
                </p>
                <p className="px-3 pb-2 text-xs font-mono text-[#001e2e] break-all">{address}</p>
                <div className="px-3 pb-2 flex items-center gap-1.5 text-[11px] font-semibold text-emerald-700">
                  <Check className="w-3 h-3" />
                  X Layer Testnet (OKB)
                </div>
                <button
                  onClick={() => {
                    disconnect()
                    setWalletOpen(false)
                  }}
                  className="w-full text-left px-3 py-2 text-xs font-bold text-red-600 hover:bg-red-50 rounded-lg transition-colors"
                >
                  Disconnect
                </button>
              </div>
            )}

            {/* Connector Selection Modal */}
            {showConnectModal && !isConnected && (
              <div className="absolute right-0 mt-2 w-64 rounded-xl bg-white border border-[#dff0ff] shadow-xl p-3 z-50 space-y-2">
                <p className="text-xs font-bold text-[#0f5238] px-1 uppercase tracking-wider">
                  Select Wallet Provider
                </p>
                {connectors.map((c) => (
                  <button
                    key={c.uid || c.id}
                    onClick={() => handleConnectWallet(c)}
                    className="w-full flex items-center justify-between px-3 py-2 text-xs font-bold text-[#001e2e] bg-[#f6faff] hover:bg-[#eaf5ff] rounded-lg transition-colors border border-[#dff0ff]"
                  >
                    <span>{c.name || 'Browser Wallet'}</span>
                    <Check className="w-3.5 h-3.5 text-[#0f5238] opacity-60" />
                  </button>
                ))}
              </div>
            )}
          </div>
        </div>
      </div>
    </header>
  )
}
