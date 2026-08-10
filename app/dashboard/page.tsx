import type { Metadata } from 'next'
import { Dashboard } from '@/components/Dashboard'

export const metadata: Metadata = {
  title: 'Dashboard | VitalityX',
  description:
    'Your autonomous wellness procurement history on X Layer — goals, verified spend, and the portable on-chain trail.',
}

export default function DashboardPage() {
  return <Dashboard />
}
