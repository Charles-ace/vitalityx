import type { Metadata } from 'next'
import { GoalIntake } from '@/components/GoalIntake'

export const metadata: Metadata = {
  title: 'Start a Goal | VitalityX',
  description:
    'State your wellness goal in plain language. The VitalityX agent searches X Layer providers, evaluates ERC-8004 reputation, and prepares an x402 escrow.',
}

export default function GoalPage() {
  return (
    <section className="max-w-5xl mx-auto px-6 py-10">
      <GoalIntake />
    </section>
  )
}
