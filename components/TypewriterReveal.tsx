'use client'

import React, { useState, useEffect } from 'react'

interface TypewriterRevealProps {
  words?: string[]
  typingSpeed?: number
  deletingSpeed?: number
  pauseDuration?: number
  className?: string
}

export function TypewriterReveal({
  words = ['Vitality', 'Strength', 'Health'],
  typingSpeed = 85,
  deletingSpeed = 45,
  pauseDuration = 2200,
  className = '',
}: TypewriterRevealProps) {
  const [wordIndex, setWordIndex] = useState(0)
  const [displayedText, setDisplayedText] = useState('')
  const [isDeleting, setIsDeleting] = useState(false)

  useEffect(() => {
    const currentFullWord = words[wordIndex % words.length]
    let timer: NodeJS.Timeout

    if (isDeleting) {
      timer = setTimeout(() => {
        setDisplayedText((prev) => prev.slice(0, -1))
      }, deletingSpeed)
    } else {
      timer = setTimeout(() => {
        setDisplayedText((prev) => currentFullWord.slice(0, prev.length + 1))
      }, typingSpeed)
    }

    if (!isDeleting && displayedText === currentFullWord) {
      timer = setTimeout(() => {
        setIsDeleting(true)
      }, pauseDuration)
    }

    if (isDeleting && displayedText === '') {
      setIsDeleting(false)
      setWordIndex((prev) => (prev + 1) % words.length)
    }

    return () => clearTimeout(timer)
  }, [displayedText, isDeleting, wordIndex, words, typingSpeed, deletingSpeed, pauseDuration])

  // Calculate max character length to reserve stable min-width
  const maxWordLen = Math.max(...words.map((w) => w.length))

  return (
    <span
      className={`inline-inline-flex items-baseline text-[#0f5238] font-extrabold text-left min-w-[${maxWordLen}ch] ${className}`}
      style={{ minWidth: `${maxWordLen + 0.5}ch` }}
    >
      <span>{displayedText}</span>
      <span className="inline-block w-[3px] h-[0.8em] bg-[#0f5238] ml-0.5 animate-pulse rounded-sm align-middle" />
    </span>
  )
}
