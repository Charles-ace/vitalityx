'use client'

import { useEffect } from 'react'

/**
 * useScrollReveal — attaches a single IntersectionObserver to all
 * [data-animate] elements in the document and toggles `.is-visible`
 * when they cross the viewport threshold.
 */
export function useScrollReveal(threshold = 0.12) {
  useEffect(() => {
    const targets = document.querySelectorAll<HTMLElement>('[data-animate]')

    const observer = new IntersectionObserver(
      (entries) => {
        entries.forEach((entry) => {
          if (entry.isIntersecting) {
            entry.target.classList.add('is-visible')
            // Unobserve after first reveal for performance
            observer.unobserve(entry.target)
          }
        })
      },
      { threshold }
    )

    targets.forEach((el) => observer.observe(el))

    return () => observer.disconnect()
  }, [threshold])
}
