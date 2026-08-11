'use client'

import React from 'react'
import Link from 'next/link'
import { TextReveal } from '@/components/TextReveal'

export default function SerenityPage() {
  return (
    <div className="serenity-theme min-h-screen flex flex-col font-sans bg-[#f6faff] text-[#001e2e] antialiased">
      {/* Load Google Fonts & Material Symbols for Serenity theme */}
      <link rel="preconnect" href="https://fonts.googleapis.com" />
      <link rel="preconnect" href="https://fonts.gstatic.com" crossOrigin="" />
      <link
        href="https://fonts.googleapis.com/css2?family=Inter:wght@400;500;600&family=Manrope:wght@500;600;700&display=swap"
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
          box-shadow: 0 4px 20px rgba(45, 106, 79, 0.05);
        }
      `}</style>

      {/* Top Navigation Bar */}
      <nav className="w-full sticky top-0 z-50 bg-[#f6faff] dark:bg-[#001e2e] shadow-sm dark:shadow-none transition-colors border-b border-[#eaf5ff]">
        <div className="max-w-[1200px] mx-auto px-5 md:px-[40px] flex justify-between items-center h-20">
          <div className="serenity-font-headline text-[24px] font-bold text-[#0f5238] dark:text-[#b1f0ce] tracking-tight">
            SerenityHealth
          </div>
          <div className="hidden md:flex space-x-8 items-center">
            <a
              href="#features"
              className="text-[16px] text-[#404943] dark:text-[#c7e7ff] hover:text-[#0f5238] dark:hover:text-[#b1f0ce] transition-colors active:scale-95 duration-200"
            >
              Features
            </a>
            <a
              href="#how-it-works"
              className="text-[16px] text-[#404943] dark:text-[#c7e7ff] hover:text-[#0f5238] dark:hover:text-[#b1f0ce] transition-colors active:scale-95 duration-200"
            >
              How it Works
            </a>
            <a
              href="#community"
              className="text-[16px] text-[#404943] dark:text-[#c7e7ff] hover:text-[#0f5238] dark:hover:text-[#b1f0ce] transition-colors active:scale-95 duration-200"
            >
              Community
            </a>
          </div>
          <div>
            <Link
              href="/goal"
              className="bg-[#0f5238] text-white font-medium text-[16px] px-6 py-2.5 rounded-full hover:bg-[#2d6a4f] transition-all active:scale-95 duration-200 inline-block"
            >
              Get Started
            </Link>
          </div>
        </div>
      </nav>

      <main className="flex-grow">
        {/* Hero Section */}
        <section className="relative pt-16 md:pt-24 pb-24 md:pb-32 overflow-hidden bg-[#eaf5ff]">
          <div className="max-w-[1200px] mx-auto px-5 md:px-[40px] relative z-10 flex flex-col md:flex-row items-center gap-6 md:gap-12">
            <div className="md:w-1/2 flex flex-col items-start space-y-6">
              <h1 className="serenity-font-headline text-[32px] sm:text-[40px] md:text-[48px] leading-[1.15] font-semibold text-[#0f5238] tracking-tight">
                <TextReveal text="Reclaim Your Vitality. Procured & Verified." staggerMs={28} delayMs={100} />
              </h1>
              <p className="text-[18px] leading-[28px] text-[#404943] max-w-xl">
                A holistic approach to health tracking. Seamlessly integrate mindful habits, nutritional insights, and proactive recovery into your daily rhythm for a balanced life.
              </p>
              <Link
                href="/goal"
                className="mt-4 bg-[#0f5238] text-white font-medium text-[16px] px-8 py-4 rounded-full hover:bg-[#2d6a4f] transition-all active:scale-95 duration-200 shadow-md inline-block"
              >
                Start Your Journey
              </Link>
            </div>
            <div className="md:w-1/2 mt-8 md:mt-0 w-full aspect-[4/3] rounded-xl overflow-hidden ambient-shadow relative">
              <img
                className="w-full h-full object-cover absolute inset-0 rounded-xl"
                alt="A serene, light-drenched living room with minimalist wellness decor."
                src="https://lh3.googleusercontent.com/aida-public/AB6AXuB0_Q4E4_67FjNoYEBZT9-dQRvVmSkJMvgjabJAzpVFROfTRcjc2ZapuqYiWXzgRbGyqgYFmiitaPAyO4XgQ38FJKYG9H_kqaUHhmcXEWT877405b9QKfIXhaArPx69aUdssey4AO1vQT_fl5r1jN5C24PPtqve4viG4m4c6rv7VwcoK4WuRaj2iRPUXybk53z9WOj-9Mkq5n6doDse_BpQYJukYtN7ggBULscByZwaXl8KnMFJgIf7"
              />
            </div>
          </div>
        </section>

        {/* Features Bento Grid */}
        <section className="py-20 md:py-24 max-w-[1200px] mx-auto px-5 md:px-[40px]" id="features">
          <div className="text-center mb-16">
            <h2 className="serenity-font-headline text-[28px] md:text-[36px] font-semibold text-[#0f5238] mb-4">
              Cultivate Wellness
            </h2>
            <p className="text-[16px] leading-[24px] text-[#404943] max-w-2xl mx-auto">
              Tools designed to quietly support your health journey without overwhelming your daily life.
            </p>
          </div>
          <div className="grid grid-cols-1 md:grid-cols-3 gap-6 md:gap-8">
            {/* Feature 1 */}
            <div className="bg-white rounded-xl p-8 ambient-shadow hover:shadow-lg transition-shadow duration-300 border border-[#dff0ff] flex flex-col h-full">
              <div className="w-12 h-12 rounded-full bg-[#b9ecee] text-[#356668] flex items-center justify-center mb-6">
                <span className="material-symbols-outlined" style={{ fontVariationSettings: "'FILL' 1" }}>
                  spa
                </span>
              </div>
              <h3 className="serenity-font-headline text-[22px] font-semibold text-[#0f5238] mb-3">
                Mindful Tracking
              </h3>
              <p className="text-[16px] leading-[24px] text-[#404943] flex-grow">
                Log your daily intentions and emotional states with gentle prompts. We focus on qualitative well-being rather than rigid metrics.
              </p>
            </div>

            {/* Feature 2 */}
            <div className="bg-white rounded-xl p-8 ambient-shadow hover:shadow-lg transition-shadow duration-300 border border-[#dff0ff] flex flex-col h-full">
              <div className="w-12 h-12 rounded-full bg-[#b9ecee] text-[#356668] flex items-center justify-center mb-6">
                <span className="material-symbols-outlined" style={{ fontVariationSettings: "'FILL' 1" }}>
                  restaurant_menu
                </span>
              </div>
              <h3 className="serenity-font-headline text-[22px] font-semibold text-[#0f5238] mb-3">
                Nutritional Insights
              </h3>
              <p className="text-[16px] leading-[24px] text-[#404943] flex-grow">
                Discover patterns in how your diet impacts your energy levels. Simple, guilt-free tracking designed for nourishment, not restriction.
              </p>
            </div>

            {/* Feature 3 */}
            <div className="bg-white rounded-xl p-8 ambient-shadow hover:shadow-lg transition-shadow duration-300 border border-[#dff0ff] flex flex-col h-full">
              <div className="w-12 h-12 rounded-full bg-[#b9ecee] text-[#356668] flex items-center justify-center mb-6">
                <span className="material-symbols-outlined" style={{ fontVariationSettings: "'FILL' 1" }}>
                  bedtime
                </span>
              </div>
              <h3 className="serenity-font-headline text-[22px] font-semibold text-[#0f5238] mb-3">
                Proactive Recovery
              </h3>
              <p className="text-[16px] leading-[24px] text-[#404943] flex-grow">
                Optimize your rest with personalized sleep hygiene routines and gentle wind-down exercises tailored to your day's activity.
              </p>
            </div>
          </div>
        </section>

        {/* Dashboard Preview Section */}
        <section className="py-20 md:py-24 bg-[#dce5d9]/30 overflow-hidden relative" id="how-it-works">
          <div className="max-w-[1200px] mx-auto px-5 md:px-[40px] flex flex-col md:flex-row items-center gap-12 md:gap-16 relative z-10">
            <div className="md:w-1/2 w-full order-2 md:order-1 relative">
              {/* Abstract Dashboard Glassmorphism UI */}
              <div className="relative w-full aspect-square md:aspect-[4/5] max-w-md mx-auto">
                <div className="absolute inset-0 bg-white rounded-[2rem] ambient-shadow p-6 flex flex-col gap-4 border border-white/40 backdrop-blur-md z-10">
                  {/* Header */}
                  <div className="flex justify-between items-center mb-2">
                    <div>
                      <h4 className="serenity-font-headline text-[22px] font-semibold text-[#0f5238]">
                        Today's Balance
                      </h4>
                      <p className="text-[14px] text-[#707973]">Oct 24, 2024</p>
                    </div>
                    <div className="w-10 h-10 rounded-full bg-[#2d6a4f] text-white flex items-center justify-center">
                      <span className="material-symbols-outlined">person</span>
                    </div>
                  </div>

                  {/* Rings Graphic Placeholder */}
                  <div className="flex-grow flex items-center justify-center relative my-4">
                    <div className="w-48 h-48 rounded-full border-[16px] border-[#b1f0ce] relative flex items-center justify-center">
                      <div className="absolute inset-[-16px] rounded-full border-[16px] border-[#0f5238] border-t-transparent border-r-transparent transform rotate-45 opacity-80" />
                      <div className="w-32 h-32 rounded-full border-[12px] border-[#b9ecee] relative flex items-center justify-center">
                        <div className="absolute inset-[-12px] rounded-full border-[12px] border-[#356668] border-b-transparent transform -rotate-12 opacity-80" />
                        <div className="text-center">
                          <span className="block serenity-font-headline text-[24px] font-bold text-[#0f5238]">
                            85%
                          </span>
                          <span className="block text-[12px] font-semibold text-[#707973] uppercase tracking-wider">
                            Recovery
                          </span>
                        </div>
                      </div>
                    </div>
                  </div>

                  {/* Small Cards */}
                  <div className="flex gap-4 mt-auto">
                    <div className="flex-1 bg-[#eaf5ff] rounded-xl p-4">
                      <span className="material-symbols-outlined text-[#356668] mb-2 block">
                        bedtime
                      </span>
                      <span className="block text-[14px] text-[#707973]">Sleep</span>
                      <span className="block serenity-font-headline text-[20px] font-bold text-[#0f5238]">
                        7h 20m
                      </span>
                    </div>
                    <div className="flex-1 bg-[#eaf5ff] rounded-xl p-4">
                      <span className="material-symbols-outlined text-[#0f5238] mb-2 block">
                        mood
                      </span>
                      <span className="block text-[14px] text-[#707973]">Mood</span>
                      <span className="block serenity-font-headline text-[20px] font-bold text-[#0f5238]">
                        Calm
                      </span>
                    </div>
                  </div>
                </div>

                {/* Decorative background elements */}
                <div className="absolute -top-10 -left-10 w-40 h-40 bg-[#b9ecee] rounded-full blur-3xl opacity-50 z-0" />
                <div className="absolute -bottom-10 -right-10 w-64 h-64 bg-[#b1f0ce] rounded-full blur-3xl opacity-40 z-0" />
              </div>
            </div>

            <div className="md:w-1/2 flex flex-col items-start space-y-6 order-1 md:order-2">
              <h2 className="serenity-font-headline text-[30px] md:text-[40px] leading-[1.15] font-semibold text-[#0f5238]">
                Your Well-being, Visualized
              </h2>
              <p className="text-[18px] leading-[28px] text-[#404943]">
                Our intuitive dashboard distills complex health data into clear, actionable insights. Understand the delicate interplay between your rest, activity, and emotional state at a glance.
              </p>
              <ul className="space-y-4 mt-2 w-full">
                <li className="flex items-start gap-4">
                  <div className="mt-1 w-6 h-6 rounded-full bg-[#b1f0ce] flex items-center justify-center text-[#0f5238] shrink-0">
                    <span className="material-symbols-outlined text-[16px]" style={{ fontVariationSettings: "'wght' 600" }}>
                      check
                    </span>
                  </div>
                  <span className="text-[16px] text-[#001e2e]">Daily balance scores for quick assessment.</span>
                </li>
                <li className="flex items-start gap-4">
                  <div className="mt-1 w-6 h-6 rounded-full bg-[#b1f0ce] flex items-center justify-center text-[#0f5238] shrink-0">
                    <span className="material-symbols-outlined text-[16px]" style={{ fontVariationSettings: "'wght' 600" }}>
                      check
                    </span>
                  </div>
                  <span className="text-[16px] text-[#001e2e]">Trend analysis to identify long-term patterns.</span>
                </li>
                <li className="flex items-start gap-4">
                  <div className="mt-1 w-6 h-6 rounded-full bg-[#b1f0ce] flex items-center justify-center text-[#0f5238] shrink-0">
                    <span className="material-symbols-outlined text-[16px]" style={{ fontVariationSettings: "'wght' 600" }}>
                      check
                    </span>
                  </div>
                  <span className="text-[16px] text-[#001e2e]">Gentle nudges, never disruptive alerts.</span>
                </li>
              </ul>
            </div>
          </div>
        </section>

        {/* Community Section */}
        <section className="py-20 md:py-24 max-w-[1200px] mx-auto px-5 md:px-[40px]" id="community">
          <div className="flex flex-col md:flex-row items-center gap-12 bg-white rounded-3xl p-8 md:p-12 ambient-shadow border border-[#eaf5ff]">
            <div className="md:w-1/2 space-y-6">
              <h2 className="serenity-font-headline text-[30px] md:text-[36px] font-semibold text-[#0f5238]">
                Grow Together
              </h2>
              <p className="text-[18px] leading-[28px] text-[#404943]">
                Wellness is a shared journey. Connect with like-minded individuals in our supportive community spaces and join expert-led workshops on mindfulness, nutrition, and recovery.
              </p>
              <a
                className="inline-flex items-center gap-2 text-[16px] text-[#0f5238] font-semibold hover:text-[#2d6a4f] transition-colors"
                href="#"
              >
                Explore Workshops
                <span className="material-symbols-outlined text-sm">arrow_forward</span>
              </a>
            </div>
            <div className="md:w-1/2 w-full h-64 md:h-auto md:aspect-video rounded-2xl overflow-hidden relative">
              <img
                className="w-full h-full object-cover absolute inset-0"
                alt="A small, diverse group of people sitting in a circle in a sunlit studio."
                src="https://lh3.googleusercontent.com/aida-public/AB6AXuCso29lPAAhcpA-l8D1-1v4qetmax_f3d3gcchqoTd_p0kuBfJVynHK0uAKq0mlXSSSc640wZhAen0BAFJeh9lxcqGneDb3YUngISJm4bUfZOCy_3t4zMh23atkG88tCOX23GPsfAAok82GzF0hvVsgEyX4914_xmkA_511Xp3_9Zo6E_m61ARwzuwTcowxwWQIhxy_COVcwo7PMCkIYxvdIn8F6G6KZI6bnuaH6g1b3jvdmXGHYFWi"
              />
            </div>
          </div>
        </section>

        {/* CTA Banner */}
        <section className="py-20 md:py-24 bg-[#0f5238] text-white text-center">
          <div className="max-w-3xl mx-auto px-5 md:px-[40px] space-y-8">
            <h2 className="serenity-font-headline text-[30px] md:text-[40px] leading-[1.15] font-semibold text-white">
              Ready to prioritize your well-being?
            </h2>
            <p className="text-[18px] text-[#95d4b3]">
              Join thousands of others who have reclaimed their vitality with SerenityHealth.
            </p>
            <Link
              href="/goal"
              className="bg-white text-[#0f5238] font-semibold text-[18px] px-10 py-4 rounded-full hover:bg-[#c7e7ff] transition-all active:scale-95 duration-200 shadow-lg mt-4 inline-block"
            >
              Get Started Now
            </Link>
          </div>
        </section>
      </main>

      {/* Footer */}
      <footer className="w-full bg-[#eaf5ff] dark:bg-[#001e2e] border-t border-[#dff0ff]">
        <div className="max-w-[1200px] mx-auto px-5 md:px-[40px] py-16 flex flex-col md:flex-row justify-between gap-8">
          <div className="flex flex-col space-y-4">
            <span className="serenity-font-headline text-[24px] text-[#0f5238] dark:text-[#b1f0ce] font-bold tracking-tight">
              SerenityHealth
            </span>
            <span className="text-[14px] text-[#356668] dark:text-[#9ecfd1]">
              © 2026 SerenityHealth. All rights reserved.
            </span>
          </div>
          <div className="flex flex-col md:flex-row gap-6 md:gap-12">
            <a
              className="text-[14px] text-[#404943] dark:text-[#707973] hover:text-[#0f5238] dark:hover:text-[#b1f0ce] transition-colors"
              href="#"
            >
              Privacy Policy
            </a>
            <a
              className="text-[14px] text-[#404943] dark:text-[#707973] hover:text-[#0f5238] dark:hover:text-[#b1f0ce] transition-colors"
              href="#"
            >
              Terms of Service
            </a>
            <a
              className="text-[14px] text-[#404943] dark:text-[#707973] hover:text-[#0f5238] dark:hover:text-[#b1f0ce] transition-colors"
              href="#"
            >
              Contact Support
            </a>
            <a
              className="text-[14px] text-[#404943] dark:text-[#707973] hover:text-[#0f5238] dark:hover:text-[#b1f0ce] transition-colors"
              href="#"
            >
              Careers
            </a>
          </div>
        </div>
      </footer>
    </div>
  )
}
