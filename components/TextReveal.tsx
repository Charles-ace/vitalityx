'use client'

import React from 'react'

interface TextRevealProps {
  text: string
  className?: string
  staggerMs?: number
  delayMs?: number
  as?: 'h1' | 'h2' | 'h3' | 'span' | 'p'
}

export function TextReveal({
  text,
  className = '',
  staggerMs = 35,
  delayMs = 150,
  as: Component = 'span',
}: TextRevealProps) {
  const words = text.split(' ')
  let globalCharIndex = 0

  return (
    <Component className={`inline-block ${className}`}>
      {words.map((word, wordIndex) => (
        <span key={wordIndex} className="inline-block whitespace-nowrap mr-[0.28em]">
          {word.split('').map((char, charIndex) => {
            const charDelay = delayMs + globalCharIndex * staggerMs
            globalCharIndex++

            return (
              <span
                key={charIndex}
                className="inline-block animate-char-reveal opacity-0"
                style={{
                  animationDelay: `${charDelay}ms`,
                  animationFillMode: 'forwards',
                }}
              >
                {char}
              </span>
            )
          })}
        </span>
      ))}
    </Component>
  )
}
