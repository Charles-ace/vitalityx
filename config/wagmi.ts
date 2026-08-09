import { http, createConfig } from 'wagmi'
import { injected } from 'wagmi/connectors'
import { defineChain } from 'viem'

export const xLayerTestnet = defineChain({
  id: 195,
  name: 'X Layer Testnet',
  nativeCurrency: {
    decimals: 18,
    name: 'OKB',
    symbol: 'OKB',
  },
  rpcUrls: {
    default: {
      http: ['https://testnetrpc.xlayer.tech'],
    },
  },
  blockExplorers: {
    default: { name: 'OKLink', url: 'https://www.oklink.com/xlayer-test' },
  },
})

export const config = createConfig({
  chains: [xLayerTestnet],
  connectors: [
    injected({ target: 'okxWallet' }), // Prioritize OKX Wallet
    injected() // Fallback to other injected wallets (MetaMask)
  ],
  transports: {
    [xLayerTestnet.id]: http(),
  },
})
