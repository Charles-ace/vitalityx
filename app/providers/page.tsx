import type { Metadata } from 'next'
import { ProviderDirectory } from '@/components/ProviderDirectory'

export const metadata: Metadata = {
  title: 'Provider Directory | VitalityX',
  description:
    'Browse wellness providers registered on X Layer with ERC-8004 reputation signals, prices and verified fulfillment history.',
}

export default function ProvidersPage() {
  return <ProviderDirectory />
}
