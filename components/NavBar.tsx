'use client'

import Link from 'next/link'
import Image from 'next/image'
import { usePathname } from 'next/navigation'
import { useState } from 'react'
import { useAccount, useConnect, useDisconnect } from 'wagmi'
import { Globe, ChevronDown, Check } from 'lucide-react'

export function NavBar() {
  const pathname = usePathname()
  const { address, isConnected } = useAccount()
  const { connect, connectors } = useConnect()
  const { disconnect } = useDisconnect()
  const [walletOpen, setWalletOpen] = useState(false)

  const linkClass = (href: string) =>
    `text-sm font-semibold transition-colors ${
      pathname?.startsWith(href) ? 'text-clinical-text' : 'text-clinical-muted hover:text-clinical-text'
    }`

  return (
    <header className="sticky top-0 z-50 bg-white/90 backdrop-blur-md border-b border-clinical-border">
      <div className="max-w-7xl mx-auto px-6 h-16 flex items-center justify-between">
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

        <nav className="hidden md:flex items-center gap-8">
          <Link href="/goal" className={linkClass('/goal')}>
            Goals
          </Link>
          <Link href="/dashboard" className={linkClass('/dashboard')}>
            Dashboard
          </Link>
          <Link href="/providers" className={linkClass('/providers')}>
            Providers
          </Link>
          <Link href="/goal" className="btn-clinical-red px-5 py-2 text-xs font-extrabold shadow-sm">
            Start a Goal
          </Link>
        </nav>

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
                <span>
                  {address.slice(0, 6)}...{address.slice(-4)}
                </span>
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
