import Link from 'next/link'

export function Footer() {
  return (
    <footer className="py-12 px-6 border-t border-clinical-border bg-white">
      <div className="max-w-7xl mx-auto">
        <div className="flex flex-col md:flex-row items-start md:items-center justify-between gap-6">
          <div className="space-y-2">
            <div className="flex items-center gap-2">
              <div className="w-6 h-6 rounded bg-clinical-red text-white flex items-center justify-center font-bold text-xs">
                V
              </div>
              <span className="font-extrabold text-sm text-clinical-text">
                Vitality<span className="text-clinical-red">X</span> Protocol
              </span>
            </div>
            <p className="text-xs text-clinical-muted max-w-md leading-relaxed">
              An autonomous wellness procurement agent on X Layer. Search, evaluate, pay and verify — never settle a
              goal on trust alone.
            </p>
          </div>

          <nav className="flex flex-wrap gap-x-8 gap-y-3 text-xs font-semibold text-clinical-muted">
            <Link href="/" className="hover:text-clinical-text transition-colors">
              Home
            </Link>
            <Link href="/goal" className="hover:text-clinical-text transition-colors">
              Start a Goal
            </Link>
            <Link href="/providers" className="hover:text-clinical-text transition-colors">
              Providers
            </Link>
            <Link href="/dashboard" className="hover:text-clinical-text transition-colors">
              Dashboard
            </Link>
          </nav>
        </div>

        <div className="mt-8 pt-6 border-t border-clinical-border flex flex-col sm:flex-row items-start sm:items-center justify-between gap-2 text-[11px] text-clinical-muted">
          <p>© 2026 VitalityX — Autonomous Wellness Procurement Agent on OKX X Layer</p>
          <p>
            Built on X Layer (Chain ID 195) · ERC-8004 reputation signals · x402 payment intent · OKX Wallet
          </p>
        </div>
      </div>
    </footer>
  )
}
