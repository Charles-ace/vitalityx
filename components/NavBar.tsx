'use client'

import Link from 'next/link'
import Image from 'next/image'
import { usePathname } from 'next/navigation'
import { useState, useEffect, useRef } from 'react'
import { useAccount, useConnect, useDisconnect } from 'wagmi'
import { Globe, ChevronDown, Check } from 'lucide-react'

const NAV_LINKS = [
  { href: '/goal', label: 'Start a Goal' },
  { href: '/dashboard', label: 'Dashboard' },
  { href: '/providers', label: 'Providers' },
]

export function NavBar() {
  const pathname = usePathname()
  const { address, isConnected } = useAccount()
  const { connect, connectors } = useConnect()
  const { disconnect } = useDisconnect()
  const [walletOpen, setWalletOpen] = useState(false)

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

  return (
    <header className="sticky top-0 z-50 bg-white/90 backdrop-blur-md border-b border-clinical-border">
      <div className="max-w-7xl mx-auto px-6 h-16 flex items-center justify-between">

        {/* Logo */}
        <Link href="/" className="flex items-center gap-2.5">
          <Image
            src="/logo.png"
            alt="VitalityX logo"
            width={120}
            height={32}
            priority
            className="h-8 w-auto object-contain"
          />
        </Link>

        {/* Nav */}
        <nav ref={navRef} className="hidden md:flex items-center gap-1 relative">
          {/* Sliding active indicator pill */}
          <div
            ref={indicatorRef}
            className="absolute bottom-[-17px] left-0 h-[2px] bg-clinical-red rounded-full opacity-0"
            style={{ transition: 'width 0.35s cubic-bezier(0.16,1,0.3,1), transform 0.35s cubic-bezier(0.16,1,0.3,1), opacity 0.2s ease' }}
          />

          {NAV_LINKS.map((link, i) => (
            <Link
              key={link.href}
              href={link.href}
              ref={(el) => { linkRefs.current[i] = el }}
              className={`relative px-4 py-2 text-sm font-semibold rounded-lg transition-all duration-200 ${
                isActive(link.href)
                  ? 'text-clinical-text bg-gray-50'
                  : 'text-clinical-muted hover:text-clinical-text hover:bg-gray-50/70'
              }`}
            >
              {/* Dot indicator on active */}
              {isActive(link.href) && (
                <span className="absolute top-1.5 right-1.5 w-1 h-1 rounded-full bg-clinical-red" />
              )}
              {link.label}
            </Link>
          ))}

          {/* CTA button — separate from the indicator group */}
          <Link
            href="/goal"
            className="btn-clinical-red ml-4 px-5 py-2 text-xs font-extrabold shadow-sm"
          >
            Start a Goal →
          </Link>
        </nav>

        {/* Right: chain badge + wallet */}
        <div className="flex items-center gap-3">
          <span className="hidden sm:flex items-center gap-2 text-xs font-semibold px-3 py-1.5 rounded-full bg-gray-100 text-clinical-muted">
            <Globe className="w-3.5 h-3.5 text-clinical-red" />
            <span>X Layer (195)</span>
          </span>

          <div className="relative">
            {isConnected && address ? (
              <button
                onClick={() => setWalletOpen((v) => !v)}
                className="flex items-center gap-2 px-4 py-2 rounded-full bg-gray-100 hover:bg-gray-200 text-xs font-bold text-clinical-text transition-colors"
              >
                <span className="w-2 h-2 rounded-full bg-emerald-500" />
                <span>{address.slice(0, 6)}...{address.slice(-4)}</span>
                <ChevronDown className="w-3.5 h-3.5 text-clinical-muted" />
              </button>
            ) : (
              <button
                onClick={() => {
                  const okx = connectors.find((c) => c.id === 'okxWallet') ?? connectors[0]
                  connect({ connector: okx })
                }}
                className="btn-clinical-red px-5 py-2 text-xs font-extrabold shadow-sm"
              >
                Connect OKX Wallet
              </button>
            )}

            {walletOpen && isConnected && (
              <div className="absolute right-0 mt-2 w-64 rounded-xl bg-white border border-clinical-border shadow-lg p-2 z-50">
                <p className="px-3 pt-2 pb-1 text-[10px] font-bold text-clinical-muted uppercase tracking-wider">
                  Connected Wallet
                </p>
                <p className="px-3 pb-2 text-xs font-mono text-clinical-text break-all">{address}</p>
                <div className="px-3 pb-2 flex items-center gap-1.5 text-[11px] font-semibold text-emerald-600">
                  <Check className="w-3 h-3" />
                  OKX Wallet / X Layer Testnet
                </div>
                <button
                  onClick={() => {
                    disconnect()
                    setWalletOpen(false)
                  }}
                  className="w-full text-left px-3 py-2 text-xs font-bold text-clinical-red hover:bg-red-50 rounded-lg transition-colors"
                >
                  Disconnect
                </button>
              </div>
            )}
          </div>
        </div>
      </div>
    </header>
  )
}
