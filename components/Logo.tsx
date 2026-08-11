'use client'

import Image from 'next/image'

interface LogoProps {
  className?: string
  iconOnly?: boolean
  size?: 'sm' | 'md' | 'lg'
  useImage?: boolean
}

export function Logo({ className = '', iconOnly = false, size = 'md', useImage = true }: LogoProps) {
  const iconSizes = {
    sm: 'w-7 h-7',
    md: 'w-8 h-8',
    lg: 'w-10 h-10',
  }

  const textSizes = {
    sm: 'text-base',
    md: 'text-lg',
    lg: 'text-xl',
  }

  return (
    <div className={`inline-flex items-center gap-2.5 select-none ${className}`}>
      {/* Brand Icon Emblem */}
      <div className={`relative flex items-center justify-center shrink-0 ${iconSizes[size]}`}>
        {useImage ? (
          <Image
            src="/app-logo.png"
            alt="VitalityX Logo"
            width={40}
            height={40}
            className="w-full h-full object-contain rounded-lg drop-shadow-sm transition-transform hover:scale-105"
          />
        ) : (
          <svg
            viewBox="0 0 40 40"
            fill="none"
            xmlns="http://www.w3.org/2000/svg"
            className="w-full h-full drop-shadow-sm transition-transform hover:scale-105"
          >
            <rect width="40" height="40" rx="10" fill="#E8291C" />
            <path
              d="M20 6V34M6 20H34"
              stroke="white"
              strokeOpacity="0.15"
              strokeWidth="1"
              strokeDasharray="2 2"
            />
            <path
              d="M11 13L20 28L29 13"
              stroke="white"
              strokeWidth="3.5"
              strokeLinecap="round"
              strokeLinejoin="round"
            />
            <path
              d="M25 18H33M29 14V22"
              stroke="#FFFFFF"
              strokeWidth="2.5"
              strokeLinecap="round"
            />
            <circle cx="20" cy="28" r="1.5" fill="white" />
          </svg>
        )}
      </div>

      {!iconOnly && (
        <span className={`font-black tracking-tight text-clinical-text flex items-center ${textSizes[size]}`}>
          <span>Vitality</span>
          <span className="text-clinical-red ml-0.5 font-extrabold">X</span>
          <span className="ml-1.5 text-[9px] font-bold uppercase tracking-widest px-1.5 py-0.5 rounded bg-red-50 text-clinical-red border border-red-100/60 leading-none">
            Agent
          </span>
        </span>
      )}
    </div>
  )
}

