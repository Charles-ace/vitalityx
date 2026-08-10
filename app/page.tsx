import Image from "next/image";
import Link from "next/link";
import {
  Search,
  Award,
  Lock,
  ShieldCheck,
  ArrowRight,
  Check,
  X,
  FileCheck2,
} from "lucide-react";

const HERO_IMAGE =
  "https://images.unsplash.com/photo-1544367567-0f2fcb009e0b?auto=format&fit=crop&w=1920&q=80";

const steps = [
  {
    icon: Search,
    title: "1. Search",
    body: "You state a wellness goal in plain language. The agent searches a marketplace of providers registered on X Layer.",
  },
  {
    icon: Award,
    title: "2. Evaluate",
    body: "Candidates are scored on price and ERC-8004 on-chain reputation — completed orders, dispute rate, fulfillment history.",
  },
  {
    icon: Lock,
    title: "3. Pay",
    body: "Payment is authorized via x402 and held in a reentrancy-guarded escrow contract. Nothing is released on trust.",
  },
  {
    icon: ShieldCheck,
    title: "4. Verify",
    body: "The agent independently checks a verifiable fulfillment record — courier scan, lab report hash, appointment receipt — before release.",
  },
];

const stats = [
  { value: "14", label: "Goals completed", sub: "Independently verified on-chain" },
  { value: "0.35 OKB", label: "Total verified spend", sub: "Every payment escrow-settled" },
  { value: "48", label: "Providers on the network", sub: "Live marketplace registry" },
  { value: "1.2h", label: "Avg. time to verification", sub: "From escrow to proof" },
];

const compare = [
  {
    title: "VitalityX — independent verification",
    accent: true,
    points: [
      "Proof is a real fulfillment record: courier tracking scan, lab report reference, appointment completion, subscription receipt",
      "Funds stay in escrow until an authorized agent submits a valid proof signature on-chain",
      "If verification fails or times out, the goal is refunded — it is never marked done on trust alone",
      "Every goal leaves a permanent, portable on-chain trail: goal → provider → payment → verification hash → outcome",
    ],
  },
  {
    title: "Typical wellness apps — trust-me verification",
    accent: false,
    points: [
      "Proof is a selfie or text log judged subjectively by a centralized AI oracle",
      "Funds are released the moment a provider flips a 'delivered' flag",
      "Failed claims feed a zero-sum slash pool — the economics read as gambling",
      "Results live in a walled-off database you cannot audit or port",
    ],
  },
];

export default function Home() {
  return (
    <>
      {/* HERO */}
      <section className="pt-14 pb-10 px-6 max-w-7xl mx-auto">
        <div className="max-w-3xl">
          <span className="badge-clinical px-3.5 py-1 rounded-full text-clinical-red font-bold text-xs uppercase tracking-wider">
            OKX X Layer — Autonomous Agent Track
          </span>
          <h1 className="text-4xl sm:text-5xl lg:text-6xl font-extrabold text-clinical-text mt-5 tracking-tight leading-[1.05]">
            Your wellness, procured and verified by an agent.
          </h1>
          <p className="text-base sm:text-lg text-clinical-muted mt-5 leading-relaxed max-w-2xl">
            Tell VitalityX what you want — better sleep, a baseline blood panel, a recovery routine. The agent shops
            real providers on X Layer, pays via x402 escrow, and only settles once fulfillment is independently
            verified on-chain.
          </p>

          <div className="mt-8 flex flex-wrap items-center gap-4">
            <Link
              href="/goal"
              className="btn-clinical-red px-8 py-4 text-sm font-extrabold flex items-center gap-2 shadow-lg"
            >
              Connect Wallet & Start
              <ArrowRight className="w-4 h-4" />
            </Link>
            <Link
              href="/providers"
              className="text-sm font-bold text-clinical-text border border-clinical-border rounded-full px-6 py-3.5 hover:border-clinical-text transition-colors"
            >
              Browse the Provider Marketplace
            </Link>
          </div>
        </div>

        <div className="mt-12">
          <Image
            src={HERO_IMAGE}
            alt="A person stretching outdoors in natural morning light, embodying the vitality and recovery this agent procures"
            width={1920}
            height={1080}
            priority
            className="w-full h-[420px] object-cover rounded-2xl"
          />
        </div>

        {/* CREDIBILITY STRIP */}
        <div className="flex flex-wrap items-center gap-3 mt-10">
          <span className="badge-clinical px-4 py-2 rounded-full text-gray-700">Built on X Layer</span>
          <span className="badge-clinical px-4 py-2 rounded-full text-gray-700">ERC-8004 Verified Reputation</span>
          <span className="badge-clinical px-4 py-2 rounded-full text-gray-700">x402 Settled</span>
          <span className="badge-clinical px-4 py-2 rounded-full text-gray-700">OKX Wallet</span>
        </div>
      </section>

      {/* STAT CALLOUTS */}
      <section className="py-12 px-6 max-w-7xl mx-auto">
        <div className="grid grid-cols-2 lg:grid-cols-4 gap-4 md:gap-6">
          {stats.map((s) => (
            <div key={s.label} className="clinical-card p-6">
              <span className="text-xs font-bold text-clinical-muted uppercase tracking-wider">{s.label}</span>
              <p className="text-3xl md:text-4xl font-extrabold text-clinical-text mt-2">{s.value}</p>
              <p className="text-[11px] text-clinical-muted mt-1.5">{s.sub}</p>
            </div>
          ))}
        </div>
      </section>

      {/* HOW VERIFICATION WORKS */}
      <section className="py-14 px-6 max-w-7xl mx-auto">
        <div className="max-w-2xl mx-auto text-center mb-12">
          <span className="text-xs font-extrabold text-clinical-red uppercase tracking-wider">
            Independent Proof Standard
          </span>
          <h2 className="text-3xl sm:text-4xl font-extrabold text-clinical-text mt-2 tracking-tight">
            How verification works
          </h2>
          <p className="text-sm text-clinical-muted mt-3 leading-relaxed">
            VitalityX never marks a goal complete on trust alone. Every settlement requires an independently verifiable
            fulfillment record, committed on-chain.
          </p>
        </div>

        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6">
          {steps.map((step) => (
            <div key={step.title} className="clinical-card p-6">
              <div className="w-11 h-11 rounded-xl bg-red-50 text-clinical-red flex items-center justify-center mb-4">
                <step.icon className="w-5 h-5" />
              </div>
              <h3 className="text-base font-bold text-clinical-text mb-2">{step.title}</h3>
              <p className="text-xs text-clinical-muted leading-relaxed">{step.body}</p>
            </div>
          ))}
        </div>
      </section>

      {/* WHY THIS IS DIFFERENT */}
      <section className="py-14 px-6 max-w-7xl mx-auto">
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
          {compare.map((col) => (
            <div
              key={col.title}
              className={`clinical-card p-8 ${col.accent ? "border-l-4 border-l-clinical-red" : ""}`}
            >
              <h3 className="text-lg font-extrabold text-clinical-text mb-5">{col.title}</h3>
              <ul className="space-y-4">
                {col.points.map((point) => (
                  <li key={point} className="flex items-start gap-3">
                    {col.accent ? (
                      <Check className="w-4 h-4 shrink-0 mt-0.5 text-clinical-red" />
                    ) : (
                      <X className="w-4 h-4 shrink-0 mt-0.5 text-gray-400" />
                    )}
                    <span className={`text-sm leading-relaxed ${col.accent ? "text-clinical-text" : "text-clinical-muted"}`}>
                      {point}
                    </span>
                  </li>
                ))}
              </ul>
            </div>
          ))}
        </div>
      </section>

      {/* FINAL CTA */}
      <section className="py-14 px-6 max-w-7xl mx-auto">
        <div className="clinical-card p-10 md:p-14 flex flex-col md:flex-row items-start md:items-center justify-between gap-8 bg-white">
          <div className="max-w-xl">
            <div className="flex items-center gap-2 text-clinical-red mb-3">
              <FileCheck2 className="w-5 h-5" />
              <span className="text-xs font-extrabold uppercase tracking-wider">Your evidence, on-chain</span>
            </div>
            <h2 className="text-2xl sm:text-3xl font-extrabold text-clinical-text tracking-tight">
              Every goal you complete becomes a permanent, portable wellness-procurement record.
            </h2>
            <p className="text-sm text-clinical-muted mt-3 leading-relaxed">
              Goal → provider chosen → price paid → verification hash → outcome. Auditable by anyone, owned by you.
            </p>
          </div>
          <Link
            href="/goal"
            className="btn-clinical-red px-8 py-4 text-sm font-extrabold flex items-center gap-2 shadow-lg shrink-0"
          >
            Tell the Agent Your Goal
            <ArrowRight className="w-4 h-4" />
          </Link>
        </div>
      </section>
    </>
  );
}
