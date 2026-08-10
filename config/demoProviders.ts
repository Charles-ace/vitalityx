export interface DemoProvider {
  providerAddress: string
  serviceName: string
  price: string
  priceFormatted: string
  category: string
  completedOrders: number
  disputes: number
  isActive: boolean
}

export const CATEGORY_IMAGES: Record<string, string> = {
  sleep:
    'https://images.unsplash.com/photo-1512069772995-ec65ed45afd6?auto=format&fit=crop&w=800&q=80',
  'lab-tests':
    'https://images.unsplash.com/photo-1579165466741-7f35e4755660?auto=format&fit=crop&w=800&q=80',
  recovery:
    'https://images.unsplash.com/photo-1571019613454-1cb2f99b2d8b?auto=format&fit=crop&w=800&q=80',
  telehealth:
    'https://images.unsplash.com/photo-1576091160399-112ba8d25d1d?auto=format&fit=crop&w=800&q=80',
  general:
    'https://images.unsplash.com/photo-1546069901-ba9599a7e63c?auto=format&fit=crop&w=800&q=80',
}

export const CATEGORY_ALT: Record<string, string> = {
  sleep: 'Supplement capsules arranged on a kitchen counter for a sleep optimization routine',
  'lab-tests': 'Blood sample collection tubes standing in a laboratory rack',
  recovery: 'Person stretching during a recovery and physiotherapy workout',
  telehealth: 'Clinician conducting a telehealth consultation on a tablet',
  general: 'Fresh, healthy meal in a bowl representing general wellness',
}

export const DEMO_PROVIDERS: DemoProvider[] = [
  {
    providerAddress: '0x70997970C51812dc3A010C7d01b50e0d17dc79C8',
    serviceName: 'SleepMax Bio-Hacking Protocol & Oura Sync',
    price: '10000000000000000',
    priceFormatted: '0.01 OKB',
    category: 'sleep',
    completedOrders: 42,
    disputes: 0,
    isActive: true,
  },
  {
    providerAddress: '0x3C44CdDDB6a900fa2b585dd299e03d12FA4293BC',
    serviceName: 'At-Home Longevity Biomarker Blood Panel Kit',
    price: '25000000000000000',
    priceFormatted: '0.025 OKB',
    category: 'lab-tests',
    completedOrders: 128,
    disputes: 1,
    isActive: true,
  },
  {
    providerAddress: '0x90F79bf6EB2c4f80B086689C7b18e697E0c0a87a',
    serviceName: 'Post-Injury Joint & Knee Physio Rehabilitation',
    price: '15000000000000000',
    priceFormatted: '0.015 OKB',
    category: 'recovery',
    completedOrders: 65,
    disputes: 0,
    isActive: true,
  },
  {
    providerAddress: '0x15d34AA5453488E06562906310D723362b41E460',
    serviceName: 'DeSci Longevity & Hormone Telehealth Consult',
    price: '20000000000000000',
    priceFormatted: '0.02 OKB',
    category: 'telehealth',
    completedOrders: 89,
    disputes: 2,
    isActive: true,
  },
]
