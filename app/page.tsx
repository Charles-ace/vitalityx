'use client'

import React, { useRef } from 'react'
import Link from 'next/link'
import {
  Search,
  Award,
  Lock,
  ShieldCheck,
  ArrowRight,
  Check,
  X,
  FileCheck2,
  Sparkles,
} from 'lucide-react'
import { useScrollReveal } from '@/hooks/useScrollReveal'
import { WellnessVideos } from '@/components/WellnessVideos'
import { TextReveal } from '@/components/TextReveal'
import { TypewriterReveal } from '@/components/TypewriterReveal'

const steps = [
  {
    icon: Search,
    title: '1. Search',
    body: 'State a wellness goal in plain language. The agent queries on-chain providers registered in ProviderRegistry.',
    delay: '100',
  },
  {
    icon: Award,
    title: '2. Evaluate',
    body: 'Candidates are scored on price and ERC-8004 reputation signals — verified completions, disputes, and fulfillment history.',
    delay: '200',
  },
  {
    icon: Lock,
    title: '3. Pay',
    body: 'Payment is authorized via x402 and locked in WellnessEscrow contract on X Layer. Funds remain protected.',
    delay: '300',
  },
  {
    icon: ShieldCheck,
    title: '4. Verify',
    body: 'The agent independently checks fulfillment proof (courier scan, lab report hash, appointment ID) before releasing funds.',
    delay: '400',
  },
]

const stats = [
  { value: '14', label: 'Goals completed', sub: 'Independently verified on-chain', delay: '100' },
  { value: '0.35 OKB', label: 'Total verified spend', sub: 'Every payment escrow-settled', delay: '200' },
  { value: '48', label: 'Providers on network', sub: 'Live marketplace registry', delay: '300' },
  { value: '1.2h', label: 'Avg. time to verification', sub: 'From escrow lock to proof', delay: '400' },
]

const compare = [
  {
    title: 'VitalityX — Serenity & Verification Standard',
    accent: true,
    delay: '100',
    points: [
      'Proof is a real fulfillment record: courier tracking scan, lab report hash, appointment completion receipt',
      'Funds remain safely in escrow until an authorized agent submits a valid ECDSA proof signature on-chain',
      'If verification fails or times out (7 days), funds are fully refunded — never marked done on trust alone',
      'Leaves a permanent, portable on-chain record: goal → provider → price → verification hash → outcome',
    ],
  },
  {
    title: 'Typical apps — trust-me verification',
    accent: false,
    delay: '200',
    points: [
      'Proof is a selfie or text log judged subjectively by a centralized AI or single judge',
      'Funds are released the moment a provider flips a self-reported "delivered" flag',
      'Failed claims feed a zero-sum slash pool — economics read like gambling',
      'Data lives in a walled-off database you cannot audit, port, or verify',
    ],
  },
]

const dailyWorkouts = [
  {
    embedUrl: 'https://www.youtube.com/embed/v7AYKMP6rOE',
    title: 'Yoga for Serenity',
    desc: 'A gentle flow to start your day with intention, posture alignment, and deep peace.',
  },
  {
    embedUrl: 'https://www.youtube.com/embed/sTANio_2E0Q',
    title: '15-minute Mindful Flow',
    desc: 'Quick mobility and mindfulness break designed for busy afternoons and recovery.',
  },
  {
    embedUrl: 'https://www.youtube.com/embed/inpok4MKVLM',
    title: 'Morning Energy Workout',
    desc: 'Invigorating movements to boost circulation, metabolic vitality, and mental clarity.',
  },
]

export default function Home() {
  useScrollReveal()

  // 3D Card Tilt Interaction state refs
  const wrapperRef = useRef<HTMLDivElement>(null)
  const cardRef = useRef<HTMLDivElement>(null)

  const handleMouseMove = (e: React.MouseEvent<HTMLDivElement>) => {
    const wrapper = wrapperRef.current
    const card = cardRef.current
    if (!wrapper || !card) return

    const rect = wrapper.getBoundingClientRect()
    const x = e.clientX - rect.left
    const y = e.clientY - rect.top
    const centerX = rect.width / 2
    const centerY = rect.height / 2

    const rotateX = ((y - centerY) / centerY) * -10
    const rotateY = ((x - centerX) / centerX) * 10

    card.style.transition = 'none'
    card.style.transform = `rotateX(${rotateX}deg) rotateY(${rotateY}deg) scale3d(1.02, 1.02, 1.02)`
  }

  const handleMouseLeave = () => {
    const card = cardRef.current
    if (!card) return
    card.style.transition = 'transform 0.4s ease-out'
    card.style.transform = 'rotateX(0deg) rotateY(0deg) scale3d(1, 1, 1)'
  }

  const handleMouseEnter = () => {
    const card = cardRef.current
    if (!card) return
    card.style.transition = 'transform 0.1s ease-out'
  }

  return (
    <div className="serenity-theme min-h-screen bg-[#f6faff] text-[#001e2e] antialiased">
      {/* Load Google Fonts & Material Symbols */}
      <link rel="preconnect" href="https://fonts.googleapis.com" />
      <link rel="preconnect" href="https://fonts.gstatic.com" crossOrigin="" />
      <link
        href="https://fonts.googleapis.com/css2?family=Inter:wght@400;500;600&family=Manrope:wght@500;600;700;800&display=swap"
        rel="stylesheet"
      />
      <link
        href="https://fonts.googleapis.com/css2?family=Material+Symbols+Outlined:wght,FILL@100..700,0..1&display=swap"
        rel="stylesheet"
      />

      <style jsx global>{`
        .serenity-theme {
          font-family: 'Inter', sans-serif;
        }
        .serenity-theme h1,
        .serenity-theme h2,
        .serenity-theme h3,
        .serenity-theme h4,
        .serenity-theme h5,
        .serenity-theme h6,
        .serenity-font-headline {
          font-family: 'Manrope', sans-serif;
        }
        .serenity-theme .material-symbols-outlined {
          font-variation-settings: 'FILL' 0, 'wght' 400, 'GRAD' 0, 'opsz' 24;
        }
        .serenity-theme .ambient-shadow {
          box-shadow: 0 4px 20px rgba(45, 106, 79, 0.06);
        }
      `}</style>

      {/* HERO SECTION */}
      <section className="relative pt-12 md:pt-20 pb-16 md:pb-24 overflow-hidden bg-[#eaf5ff]">
        <div className="max-w-[1200px] mx-auto px-5 md:px-[40px] relative z-10 flex flex-col md:flex-row items-center gap-8 md:gap-12">
          <div className="md:w-1/2 flex flex-col items-start space-y-6">
            <h1 className="serenity-font-headline text-[32px] sm:text-[44px] md:text-[52px] leading-[1.15] font-extrabold text-[#0f5238] tracking-tight">
              <span className="block">
                Reclaim Your{' '}
                <TypewriterReveal words={['Vitality.', 'Strength.', 'Health.']} typingSpeed={85} pauseDuration={2200} />
              </span>
              <span className="text-[#001e2e] text-[24px] sm:text-[32px] md:text-[36px] font-bold block mt-2">
                Procured by AI, Verified On-Chain.
              </span>
            </h1>

            <p className="text-[17px] sm:text-[18px] leading-[28px] text-[#404943] max-w-xl hero-animate hero-animate-delay-2">
              A holistic, agentic approach to wellness procurement. Tell VitalityX what you need — better sleep, lab panels, recovery routines. The agent shops X Layer providers, locks x402 escrow, and verifies fulfillment on-chain.
            </p>

            <div className="pt-2 flex flex-wrap items-center gap-4 hero-animate hero-animate-delay-3">
              <Link
                href="/goal"
                className="bg-[#0f5238] text-white font-extrabold text-[15px] px-8 py-4 rounded-full hover:bg-[#2d6a4f] transition-all active:scale-95 duration-200 shadow-md flex items-center gap-2"
              >
                Connect Wallet &amp; Start Goal
                <ArrowRight className="w-4 h-4" />
              </Link>
              <Link
                href="/providers"
                className="text-[15px] font-bold text-[#001e2e] bg-white border border-[#dff0ff] rounded-full px-6 py-3.5 hover:border-[#0f5238] hover:text-[#0f5238] transition-colors shadow-sm"
              >
                Browse Provider Directory
              </Link>
            </div>

            {/* Credibility badges */}
            <div className="flex flex-wrap items-center gap-2 pt-3" data-animate="fade-up">
              <span className="text-xs font-semibold px-3 py-1 rounded-full bg-white text-[#356668] border border-[#dff0ff]">
                Chain ID 195 (OKB)
              </span>
              <span className="text-xs font-semibold px-3 py-1 rounded-full bg-white text-[#356668] border border-[#dff0ff]">
                ERC-8004 Reputation
              </span>
              <span className="text-xs font-semibold px-3 py-1 rounded-full bg-white text-[#356668] border border-[#dff0ff]">
                x402 Intent Escrow
              </span>
            </div>
          </div>

          {/* Hero Serenity Image Container */}
          <div className="md:w-1/2 mt-8 md:mt-0 w-full aspect-[4/3] rounded-2xl overflow-hidden ambient-shadow relative border border-white/60" data-animate="scale-up">
            <Image
              src={HERO_IMAGE}
              alt="Serenity health and vitality embodiment"
              fill
              priority
              className="object-cover rounded-2xl"
            />
          </div>
        </div>
      </section>

      {/* STAT CALLOUTS */}
      <section className="py-14 max-w-[1200px] mx-auto px-5 md:px-[40px]">
        <div className="grid grid-cols-2 lg:grid-cols-4 gap-4 md:gap-6">
          {stats.map((s) => (
            <div
              key={s.label}
              className="bg-white rounded-2xl p-6 ambient-shadow border border-[#dff0ff] transition-all hover:-translate-y-1"
              data-animate="stat"
              data-animate-delay={s.delay}
            >
              <span className="text-xs font-bold text-[#356668] uppercase tracking-wider">{s.label}</span>
              <p className="serenity-font-headline text-3xl md:text-4xl font-extrabold text-[#0f5238] mt-2">{s.value}</p>
              <p className="text-[12px] text-[#404943] mt-1.5">{s.sub}</p>
            </div>
          ))}
        </div>
      </section>

      {/* CULTIVATE WELLNESS — BENTO GRID */}
      <section className="py-16 md:py-20 max-w-[1200px] mx-auto px-5 md:px-[40px]" id="features">
        <div className="text-center mb-14" data-animate="fade-up">
          <span className="text-xs font-extrabold text-[#0f5238] uppercase tracking-wider">
            Holistic Procurement Framework
          </span>
          <h2 className="serenity-font-headline text-[30px] md:text-[38px] font-bold text-[#0f5238] mt-2">
            Cultivate Wellness &amp; Vitality
          </h2>
          <p className="text-[16px] leading-[24px] text-[#404943] max-w-2xl mx-auto mt-2">
            Tools and agentic protocols designed to support your health journey without friction or unverified promises.
          </p>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-3 gap-6 md:gap-8">
          {/* Feature 1 */}
          <div
            className="bg-white rounded-2xl p-8 ambient-shadow hover:shadow-lg transition-all duration-300 border border-[#dff0ff] flex flex-col h-full"
            data-animate="fade-up"
            data-animate-delay="100"
          >
            <div className="w-12 h-12 rounded-full bg-[#b9ecee] text-[#356668] flex items-center justify-center mb-6">
              <span className="material-symbols-outlined" style={{ fontVariationSettings: "'FILL' 1" }}>
                spa
              </span>
            </div>
            <h3 className="serenity-font-headline text-[22px] font-semibold text-[#0f5238] mb-3">
              Mindful Goal Intake
            </h3>
            <p className="text-[15px] leading-[24px] text-[#404943] flex-grow">
              State your wellness intentions in natural language. Our agent maps your goals to verified provider categories with zero guesswork.
            </p>
          </div>

          {/* Feature 2 */}
          <div
            className="bg-white rounded-2xl p-8 ambient-shadow hover:shadow-lg transition-all duration-300 border border-[#dff0ff] flex flex-col h-full"
            data-animate="fade-up"
            data-animate-delay="200"
          >
            <div className="w-12 h-12 rounded-full bg-[#b9ecee] text-[#356668] flex items-center justify-center mb-6">
              <span className="material-symbols-outlined" style={{ fontVariationSettings: "'FILL' 1" }}>
                restaurant_menu
              </span>
            </div>
            <h3 className="serenity-font-headline text-[22px] font-semibold text-[#0f5238] mb-3">
              Nutritional &amp; Lab Insights
            </h3>
            <p className="text-[15px] leading-[24px] text-[#404943] flex-grow">
              Access certified lab testing, nutritional consultations, and recovery subscriptions with pricing transparently locked in OKB.
            </p>
          </div>

          {/* Feature 3 */}
          <div
            className="bg-white rounded-2xl p-8 ambient-shadow hover:shadow-lg transition-all duration-300 border border-[#dff0ff] flex flex-col h-full"
            data-animate="fade-up"
            data-animate-delay="300"
          >
            <div className="w-12 h-12 rounded-full bg-[#b9ecee] text-[#356668] flex items-center justify-center mb-6">
              <span className="material-symbols-outlined" style={{ fontVariationSettings: "'FILL' 1" }}>
                bedtime
              </span>
            </div>
            <h3 className="serenity-font-headline text-[22px] font-semibold text-[#0f5238] mb-3">
              Proactive Recovery &amp; Sleep
            </h3>
            <p className="text-[15px] leading-[24px] text-[#404943] flex-grow">
              Optimize rest and recovery routines. Funds release only when independent courier scans or appointment IDs are cryptographically signed.
            </p>
          </div>
        </div>
      </section>

      {/* DASHBOARD PREVIEW SECTION WITH INTERACTIVE 3D TILT */}
      <section className="py-20 bg-[#dce5d9]/30 overflow-hidden relative" id="how-it-works">
        <div className="max-w-[1200px] mx-auto px-5 md:px-[40px] flex flex-col md:flex-row items-center gap-12 md:gap-16 relative z-10">
          <div className="md:w-1/2 w-full order-2 md:order-1 relative" data-animate="scale-up">
            <div
              ref={wrapperRef}
              onMouseMove={handleMouseMove}
              onMouseLeave={handleMouseLeave}
              onMouseEnter={handleMouseEnter}
              className="relative w-full aspect-square md:aspect-[4/5] max-w-md mx-auto cursor-pointer"
              style={{ perspective: '1000px' }}
            >
              <div
                ref={cardRef}
                className="absolute inset-0 bg-white rounded-[2rem] ambient-shadow p-6 flex flex-col gap-4 border border-white/60 backdrop-blur-md z-10 tilt-card-transition"
              >
                <div className="flex justify-between items-center mb-2">
                  <div>
                    <h4 className="serenity-font-headline text-[22px] font-semibold text-[#0f5238]">
                      Today's Balance
                    </h4>
                    <p className="text-[14px] text-[#356668]">X Layer Escrow Status</p>
                  </div>
                  <div className="w-10 h-10 rounded-full bg-[#0f5238] text-white flex items-center justify-center">
                    <span className="material-symbols-outlined">person</span>
                  </div>
                </div>

                {/* Balance ring with pulse text */}
                <div className="flex-grow flex items-center justify-center relative my-4">
                  <div className="w-48 h-48 rounded-full border-[16px] border-[#b1f0ce] relative flex items-center justify-center">
                    <div className="absolute inset-[-16px] rounded-full border-[16px] border-[#0f5238] border-t-transparent border-r-transparent transform rotate-45 opacity-80" />
                    <div className="w-32 h-32 rounded-full border-[12px] border-[#b9ecee] relative flex items-center justify-center">
                      <div className="absolute inset-[-12px] rounded-full border-[12px] border-[#356668] border-b-transparent transform -rotate-12 opacity-80" />
                      <div className="text-center">
                        <span className="block serenity-font-headline text-[26px] font-extrabold text-[#0f5238] pulse-text">
                          85%
                        </span>
                        <span className="block text-[11px] font-semibold text-[#356668] uppercase tracking-wider">
                          Recovery
                        </span>
                      </div>
                    </div>
                  </div>
                </div>

                <div className="flex gap-4 mt-auto">
                  <div className="flex-1 bg-[#eaf5ff] rounded-xl p-4">
                    <span className="material-symbols-outlined text-[#356668] mb-2 block">
                      bedtime
                    </span>
                    <span className="block text-[13px] text-[#356668]">Sleep</span>
                    <span className="block serenity-font-headline text-[20px] font-bold text-[#0f5238]">
                      7h 20m
                    </span>
                  </div>
                  <div className="flex-1 bg-[#eaf5ff] rounded-xl p-4">
                    <span className="material-symbols-outlined text-[#0f5238] mb-2 block">
                      mood
                    </span>
                    <span className="block text-[13px] text-[#356668]">Mood</span>
                    <span className="block serenity-font-headline text-[20px] font-bold text-[#0f5238]">
                      Calm
                    </span>
                  </div>
                </div>
              </div>

              <div className="absolute -top-10 -left-10 w-40 h-40 bg-[#b9ecee] rounded-full blur-3xl opacity-50 z-0" />
              <div className="absolute -bottom-10 -right-10 w-64 h-64 bg-[#b1f0ce] rounded-full blur-3xl opacity-40 z-0" />
            </div>
          </div>

          <div className="md:w-1/2 flex flex-col items-start space-y-6 order-1 md:order-2" data-animate="fade-up">
            <span className="text-xs font-extrabold text-[#0f5238] uppercase tracking-wider">
              Intuitive Interface &amp; Security
            </span>
            <h2 className="serenity-font-headline text-[30px] md:text-[40px] leading-[1.15] font-bold text-[#0f5238]">
              Your Well-being, Visualized
            </h2>
            <p className="text-[17px] leading-[27px] text-[#404943]">
              VitalityX distills smart contract escrows and ERC-8004 reputation signals into clear, calming visual insights. Know exact goal statuses, courier proof hashes, and escrow lock parameters at a glance.
            </p>

            <ul className="space-y-4 mt-2 w-full">
              <li className="flex items-start gap-4">
                <div className="mt-1 w-6 h-6 rounded-full bg-[#b1f0ce] flex items-center justify-center text-[#0f5238] shrink-0">
                  <span className="material-symbols-outlined text-[16px]" style={{ fontVariationSettings: "'wght' 600" }}>
                    check
                  </span>
                </div>
                <span className="text-[16px] text-[#001e2e]">Autonomous ERC-8004 provider reputation scoring.</span>
              </li>
              <li className="flex items-start gap-4">
                <div className="mt-1 w-6 h-6 rounded-full bg-[#b1f0ce] flex items-center justify-center text-[#0f5238] shrink-0">
                  <span className="material-symbols-outlined text-[16px]" style={{ fontVariationSettings: "'wght' 600" }}>
                    check
                  </span>
                </div>
                <span className="text-[16px] text-[#001e2e]">Reentrancy-guarded escrow with automated 7-day timeout refund.</span>
              </li>
              <li className="flex items-start gap-4">
                <div className="mt-1 w-6 h-6 rounded-full bg-[#b1f0ce] flex items-center justify-center text-[#0f5238] shrink-0">
                  <span className="material-symbols-outlined text-[16px]" style={{ fontVariationSettings: "'wght' 600" }}>
                    check
                  </span>
                </div>
                <span className="text-[16px] text-[#001e2e]">Cryptographically verified proof of fulfillment before settlement.</span>
              </li>
            </ul>
          </div>
        </div>
      </section>

      {/* DAILY WORKOUTS SECTION */}
      <section className="py-20 max-w-[1200px] mx-auto px-5 md:px-[40px]" id="workouts">
        <div className="text-center mb-14" data-animate="fade-up">
          <span className="text-xs font-extrabold text-[#0f5238] uppercase tracking-wider">
            Daily Movement Routines
          </span>
          <h2 className="serenity-font-headline text-[30px] md:text-[38px] font-bold text-[#0f5238] mt-2">
            Daily Workouts &amp; Flow
          </h2>
          <p className="text-[16px] text-[#404943] max-w-2xl mx-auto mt-2">
            Curated wellness routines to keep your body moving smoothly and your mind serene.
          </p>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-3 gap-6 md:gap-8">
          {dailyWorkouts.map((item, idx) => (
            <div
              key={item.title}
              className="bg-white rounded-2xl overflow-hidden ambient-shadow hover:shadow-lg transition-all duration-300 border border-[#dff0ff]"
              data-animate="fade-up"
              data-animate-delay={`${(idx + 1) * 100}`}
            >
              <div className="aspect-video w-full">
                <iframe
                  className="w-full h-full"
                  src={item.embedUrl}
                  title={item.title}
                  allow="accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture"
                  allowFullScreen
                />
              </div>
              <div className="p-6">
                <h3 className="serenity-font-headline text-lg font-bold text-[#001e2e] mb-2">
                  {item.title}
                </h3>
                <p className="text-sm text-[#404943] leading-relaxed">{item.desc}</p>
              </div>
            </div>
          ))}
        </div>
      </section>

      {/* HOW VERIFICATION WORKS */}
      <section className="py-20 max-w-[1200px] mx-auto px-5 md:px-[40px]">
        <div className="max-w-2xl mx-auto text-center mb-14" data-animate="fade-up">
          <span className="text-xs font-extrabold text-[#0f5238] uppercase tracking-wider">
            Independent Verification Standard
          </span>
          <h2 className="serenity-font-headline text-[30px] md:text-[38px] font-bold text-[#0f5238] mt-2">
            How Verification Works
          </h2>
          <p className="text-[16px] text-[#404943] mt-2 leading-relaxed">
            VitalityX never marks a goal complete on trust alone. Every settlement requires an independently verifiable fulfillment record, committed on-chain.
          </p>
        </div>

        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6">
          {steps.map((step) => (
            <div
              key={step.title}
              className="bg-white rounded-2xl p-6 ambient-shadow hover:shadow-lg transition-all duration-300 border border-[#dff0ff]"
              data-animate="fade-up"
              data-animate-delay={step.delay}
            >
              <div className="w-11 h-11 rounded-xl bg-[#eaf5ff] text-[#0f5238] flex items-center justify-center mb-4 font-bold">
                <step.icon className="w-5 h-5" />
              </div>
              <h3 className="serenity-font-headline text-base font-bold text-[#001e2e] mb-2">{step.title}</h3>
              <p className="text-xs text-[#404943] leading-relaxed">{step.body}</p>
            </div>
          ))}
        </div>
      </section>

      {/* WHY THIS IS DIFFERENT */}
      <section className="py-16 max-w-[1200px] mx-auto px-5 md:px-[40px]">
        <div className="max-w-2xl mb-10" data-animate="fade-up">
          <span className="text-xs font-extrabold text-[#0f5238] uppercase tracking-wider">Why It Matters</span>
          <h2 className="serenity-font-headline text-[28px] sm:text-[34px] font-bold text-[#0f5238] mt-1">
            The Serenity Verification Advantage
          </h2>
        </div>
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
          {compare.map((col) => (
            <div
              key={col.title}
              className={`bg-white rounded-2xl p-8 ambient-shadow border ${col.accent ? 'border-[#0f5238]' : 'border-[#dff0ff]'}`}
              data-animate="fade-up"
              data-animate-delay={col.delay}
            >
              <h3 className="serenity-font-headline text-lg font-extrabold text-[#001e2e] mb-5">{col.title}</h3>
              <ul className="space-y-4">
                {col.points.map((point) => (
                  <li key={point} className="flex items-start gap-3">
                    {col.accent ? (
                      <Check className="w-4 h-4 shrink-0 mt-1 text-[#0f5238]" />
                    ) : (
                      <X className="w-4 h-4 shrink-0 mt-1 text-gray-400" />
                    )}
                    <span className={`text-sm leading-relaxed ${col.accent ? 'text-[#001e2e]' : 'text-[#404943]'}`}>
                      {point}
                    </span>
                  </li>
                ))}
              </ul>
            </div>
          ))}
        </div>
      </section>

      {/* WELLNESS VIDEOS */}
      <WellnessVideos />

      {/* FINAL CTA */}
      <section className="py-20 bg-[#0f5238] text-white text-center">
        <div className="max-w-3xl mx-auto px-5 md:px-[40px] space-y-8" data-animate="scale-up">
          <div className="inline-flex items-center gap-2 text-[#b1f0ce]">
            <FileCheck2 className="w-5 h-5" />
            <span className="text-xs font-extrabold uppercase tracking-wider">Your Evidence, On-Chain</span>
          </div>
          <h2 className="serenity-font-headline text-[32px] md:text-[44px] leading-[1.12] font-bold text-white">
            Ready to prioritize your well-being?
          </h2>
          <p className="text-[18px] text-[#b1f0ce] max-w-xl mx-auto">
            Join thousands of users who procure authentic wellness solutions with VitalityX on OKX X Layer.
          </p>
          <Link
            href="/goal"
            className="bg-white text-[#0f5238] font-extrabold text-[17px] px-10 py-4 rounded-full hover:bg-[#eaf5ff] transition-all active:scale-95 duration-200 shadow-lg mt-4 inline-flex items-center gap-2"
          >
            Start Your Goal Now
            <ArrowRight className="w-4 h-4" />
          </Link>
        </div>
      </section>
    </div>
  )
}
