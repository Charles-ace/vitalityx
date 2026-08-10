export const ZERO_ADDRESS = '0x0000000000000000000000000000000000000000' as `0x${string}`

export const registryAddress = (process.env.NEXT_PUBLIC_REGISTRY_ADDRESS || ZERO_ADDRESS) as `0x${string}`
export const escrowAddress = (process.env.NEXT_PUBLIC_ESCROW_ADDRESS || ZERO_ADDRESS) as `0x${string}`

export const isContractsConfigured = registryAddress !== ZERO_ADDRESS && escrowAddress !== ZERO_ADDRESS

export const AGENT_SIGNER_ADDRESS = process.env.NEXT_PUBLIC_AGENT_SIGNER_ADDRESS || ZERO_ADDRESS

export const EXPLORER_BASE = 'https://www.oklink.com/xlayer-test'

export const GOAL_STORAGE_PREFIX = 'vitalityx:goal:'

export interface GoalMeta {
  goalText: string
  providerAddress: string
  providerName: string
  price: string
  category: string
  createdAt: number
}

export function readGoalMeta(goalId: string | number): GoalMeta | null {
  if (typeof window === 'undefined') return null
  try {
    const raw = window.localStorage.getItem(`${GOAL_STORAGE_PREFIX}${goalId}`)
    return raw ? (JSON.parse(raw) as GoalMeta) : null
  } catch {
    return null
  }
}

export function writeGoalMeta(goalId: string | number, meta: GoalMeta) {
  if (typeof window === 'undefined') return
  try {
    window.localStorage.setItem(`${GOAL_STORAGE_PREFIX}${goalId}`, JSON.stringify(meta))
  } catch {
    /* storage unavailable */
  }
}
