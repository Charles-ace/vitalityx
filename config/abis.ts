export const PROVIDER_REGISTRY_ABI = [
  {
    type: 'function',
    name: 'registerProvider',
    inputs: [
      { name: 'serviceName', type: 'string' },
      { name: 'price', type: 'uint256' },
      { name: 'category', type: 'string' },
    ],
    outputs: [],
    stateMutability: 'nonpayable',
  },
  {
    type: 'function',
    name: 'updateProviderDetails',
    inputs: [
      { name: 'price', type: 'uint256' },
      { name: 'isActive', type: 'bool' },
    ],
    outputs: [],
    stateMutability: 'nonpayable',
  },
  {
    type: 'function',
    name: 'updateReputation',
    inputs: [
      { name: 'providerAddress', type: 'address' },
      { name: 'success', type: 'bool' },
    ],
    outputs: [],
    stateMutability: 'nonpayable',
  },
  {
    type: 'function',
    name: 'setAuthorizedUpdater',
    inputs: [
      { name: 'updater', type: 'address' },
      { name: 'isAuthorized', type: 'bool' },
    ],
    outputs: [],
    stateMutability: 'nonpayable',
  },
  {
    type: 'function',
    name: 'getAllProviders',
    inputs: [],
    outputs: [
      {
        type: 'tuple[]',
        components: [
          { name: 'providerAddress', type: 'address' },
          { name: 'serviceName', type: 'string' },
          { name: 'price', type: 'uint256' },
          { name: 'category', type: 'string' },
          { name: 'completedOrders', type: 'uint32' },
          { name: 'disputes', type: 'uint32' },
          { name: 'isActive', type: 'bool' },
        ],
      },
    ],
    stateMutability: 'view',
  },
  {
    type: 'function',
    name: 'getProvidersByCategory',
    inputs: [{ name: 'category', type: 'string' }],
    outputs: [
      {
        type: 'tuple[]',
        components: [
          { name: 'providerAddress', type: 'address' },
          { name: 'serviceName', type: 'string' },
          { name: 'price', type: 'uint256' },
          { name: 'category', type: 'string' },
          { name: 'completedOrders', type: 'uint32' },
          { name: 'disputes', type: 'uint32' },
          { name: 'isActive', type: 'bool' },
        ],
      },
    ],
    stateMutability: 'view',
  },
  {
    type: 'function',
    name: 'providers',
    inputs: [{ name: '', type: 'address' }],
    outputs: [
      { name: 'providerAddress', type: 'address' },
      { name: 'serviceName', type: 'string' },
      { name: 'price', type: 'uint256' },
      { name: 'category', type: 'string' },
      { name: 'completedOrders', type: 'uint32' },
      { name: 'disputes', type: 'uint32' },
      { name: 'isActive', type: 'bool' },
    ],
    stateMutability: 'view',
  },
  {
    type: 'function',
    name: 'providerAddresses',
    inputs: [{ name: '', type: 'uint256' }],
    outputs: [{ name: '', type: 'address' }],
    stateMutability: 'view',
  },
] as const

export const WELLNESS_ESCROW_ABI = [
  {
    type: 'function',
    name: 'createGoal',
    inputs: [
      { name: 'provider', type: 'address' },
      { name: 'goalHash', type: 'bytes32' },
    ],
    outputs: [{ name: '', type: 'uint256' }],
    stateMutability: 'payable',
  },
  {
    type: 'function',
    name: 'submitVerificationProof',
    inputs: [
      { name: 'goalId', type: 'uint256' },
      { name: 'verificationHash', type: 'bytes32' },
      { name: 'signature', type: 'bytes' },
    ],
    outputs: [],
    stateMutability: 'nonpayable',
  },
  {
    type: 'function',
    name: 'refund',
    inputs: [{ name: 'goalId', type: 'uint256' }],
    outputs: [],
    stateMutability: 'nonpayable',
  },
  {
    type: 'function',
    name: 'goals',
    inputs: [{ name: 'goalId', type: 'uint256' }],
    outputs: [
      { name: 'goalId', type: 'uint256' },
      { name: 'user', type: 'address' },
      { name: 'provider', type: 'address' },
      { name: 'amount', type: 'uint256' },
      { name: 'goalHash', type: 'bytes32' },
      { name: 'verificationHash', type: 'bytes32' },
      { name: 'createdAt', type: 'uint256' },
      { name: 'timeoutAt', type: 'uint256' },
      { name: 'status', type: 'uint8' },
    ],
    stateMutability: 'view',
  },
  {
    type: 'function',
    name: 'getUserGoalIds',
    inputs: [{ name: 'user', type: 'address' }],
    outputs: [{ name: '', type: 'uint256[]' }],
    stateMutability: 'view',
  },
  {
    type: 'function',
    name: 'nextGoalId',
    inputs: [],
    outputs: [{ name: '', type: 'uint256' }],
    stateMutability: 'view',
  },
  {
    type: 'function',
    name: 'agentSigner',
    inputs: [],
    outputs: [{ name: '', type: 'address' }],
    stateMutability: 'view',
  },
  {
    type: 'function',
    name: 'TIMEOUT_DURATION',
    inputs: [],
    outputs: [{ name: '', type: 'uint256' }],
    stateMutability: 'view',
  },
  {
    type: 'event',
    name: 'GoalCreated',
    inputs: [
      { name: 'goalId', type: 'uint256', indexed: true },
      { name: 'user', type: 'address', indexed: true },
      { name: 'provider', type: 'address', indexed: true },
      { name: 'amount', type: 'uint256' },
      { name: 'goalHash', type: 'bytes32' },
      { name: 'timeoutAt', type: 'uint256' },
    ],
  },
  {
    type: 'event',
    name: 'GoalVerified',
    inputs: [
      { name: 'goalId', type: 'uint256', indexed: true },
      { name: 'provider', type: 'address', indexed: true },
      { name: 'amount', type: 'uint256' },
      { name: 'verificationHash', type: 'bytes32' },
    ],
  },
  {
    type: 'event',
    name: 'GoalRefunded',
    inputs: [
      { name: 'goalId', type: 'uint256', indexed: true },
      { name: 'user', type: 'address', indexed: true },
      { name: 'amount', type: 'uint256' },
    ],
  },
] as const

export type ProviderTuple = {
  providerAddress: `0x${string}`
  serviceName: string
  price: bigint
  category: string
  completedOrders: number
  disputes: number
  isActive: boolean
}

export type GoalTuple = {
  goalId: bigint
  user: `0x${string}`
  provider: `0x${string}`
  amount: bigint
  goalHash: `0x${string}`
  verificationHash: `0x${string}`
  createdAt: bigint
  timeoutAt: bigint
  status: number
}

export const GOAL_STATUS = ['Active', 'Verified', 'Refunded'] as const
