'use client'

import React, { useState, useEffect } from 'react'

interface TypewriterRevealProps {
  words: string[]
  typingSpeed?: number
  deletingSpeed?: number
  pauseDuration?: number
  className?: string
}

export function TypewriterReveal({
  words = ['Vitality', 'Strength', 'Health'],
  typingSpeed = 90,
  deletingSpeed = 50,
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
      // Deleting state: remove one character at a time
      timer = setTimeout(() => {
        setDisplayedText((prev) => prev.slice(0, -1))
      }, deletingSpeed)
    } else {
      // Typing state: add one character at a time
      timer = setTimeout(() => {
        setDisplayedText((prev) => currentFullWord.slice(0, prev.length + 1))
      }, typingSpeed)
    }

    // When full word is typed
    if (!isDeleting && displayedText === currentFullWord) {
      timer = setTimeout(() => {
        setIsDeleting(true)
      }, pauseDuration)
    }

    // When word is fully deleted
    if (isDeleting && displayedText === '') {
      setIsDeleting(false)
      setWordIndex((prev) => (prev + 1) % words.length)
    }

    return () => clearTimeout(timer)
  }, [displayedText, isDeleting, wordIndex, words, typingSpeed, deletingSpeed, pauseDuration])

  return (
    <span className={`inline-flex items-center text-[#0f5238] font-extrabold ${className}`}>
      <span>{displayedText}</span>
      <span className="inline-block w-[3px] h-[0.85em] bg-[#0f5238] ml-1 animate-pulse rounded-sm" />
    </span>
  )
}
