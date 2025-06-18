import { create } from 'zustand'
import { apolloClient } from '@/components/Providers'
import { GetTokenPricesDocument, GqlTokenPrice, GqlChain } from '@/lib/generated/graphql'
import { useEffect } from 'react'
import { supportedNetworks } from '@/lib/networks'

interface TokenPricesState {
  tokenPricesByChain: Record<GqlChain, GqlTokenPrice[]>
  loadingStatus: Record<GqlChain, boolean>
  errors: Record<GqlChain, Error | null>
  lastUpdated: Record<GqlChain, number>
  fetchTokenPrices: (chain: GqlChain) => Promise<GqlTokenPrice[]>
  getTokenPrice: (chain: GqlChain, tokenAddress: string) => number | undefined
  clearCache: (chain: GqlChain) => void
  clearAllCache: () => void
  resetError: (chain: GqlChain) => void
}

const CACHE_EXPIRY_TIME = 5 * 60 * 1000

export const useTokenPricesStore = create<TokenPricesState>((set, get) => ({
  tokenPricesByChain: {} as Record<GqlChain, GqlTokenPrice[]>,
  loadingStatus: {} as Record<GqlChain, boolean>,
  errors: {} as Record<GqlChain, Error | null>,
  lastUpdated: {} as Record<GqlChain, number>,

  fetchTokenPrices: async (chain: GqlChain) => {
    const { tokenPricesByChain, lastUpdated, loadingStatus } = get()

    if (loadingStatus[chain]) {
      return tokenPricesByChain[chain] || []
    }

    const now = Date.now()
    if (tokenPricesByChain[chain] && lastUpdated[chain] && now - lastUpdated[chain] < CACHE_EXPIRY_TIME) {
      return tokenPricesByChain[chain]
    }

    set((state) => ({
      loadingStatus: { ...state.loadingStatus, [chain]: true },
      errors: { ...state.errors, [chain]: null },
    }))

    try {
      const { data } = await apolloClient.query({
        query: GetTokenPricesDocument,
        variables: { chains: [chain] },
        fetchPolicy: 'network-only',
      })

      set((state) => ({
        tokenPricesByChain: {
          ...state.tokenPricesByChain,
          [chain]: data.tokenPrices || [],
        },
        loadingStatus: { ...state.loadingStatus, [chain]: false },
        lastUpdated: { ...state.lastUpdated, [chain]: now },
      }))

      return data.tokenPrices || []
    } catch (error) {
      set((state) => ({
        loadingStatus: { ...state.loadingStatus, [chain]: false },
        errors: {
          ...state.errors,
          [chain]: error instanceof Error ? error : new Error('Failed to fetch token prices'),
        },
      }))

      console.error(`Failed to fetch token prices for chain ${chain}:`, error)
      return tokenPricesByChain[chain] || []
    }
  },

  getTokenPrice: (chain: GqlChain, tokenAddress: string) => {
    const { tokenPricesByChain } = get()
    if (!tokenPricesByChain[chain]) return undefined

    const token = tokenPricesByChain[chain].find((tp) => tp.address.toLowerCase() === tokenAddress.toLowerCase())

    return token?.price
  },

  clearCache: (chain: GqlChain) => {
    set((state) => ({
      tokenPricesByChain: { ...state.tokenPricesByChain, [chain]: [] },
      lastUpdated: { ...state.lastUpdated, [chain]: 0 },
    }))
  },

  clearAllCache: () => {
    set({
      tokenPricesByChain: {} as Record<GqlChain, GqlTokenPrice[]>,
      lastUpdated: {} as Record<GqlChain, number>,
    })
  },

  resetError: (chain: GqlChain) => {
    set((state) => ({
      errors: { ...state.errors, [chain]: null },
    }))
  },
}))

export const useTokenPrices = (chain: GqlChain) => {
  const { tokenPricesByChain, fetchTokenPrices } = useTokenPricesStore()

  useEffect(() => {
    fetchTokenPrices(chain)
  }, [chain, fetchTokenPrices])

  return tokenPricesByChain[chain] || []
}

export const useTokenPriceLoading = (chain: GqlChain) => {
  return useTokenPricesStore((state) => state.loadingStatus[chain] || false)
}

export const useTokenPriceError = (chain: GqlChain) => {
  return useTokenPricesStore((state) => state.errors[chain] || null)
}

export const useTokenPrice = (chain: GqlChain, tokenAddress: string) => {
  const { getTokenPrice, fetchTokenPrices } = useTokenPricesStore()

  useEffect(() => {
    fetchTokenPrices(chain)
  }, [chain, fetchTokenPrices])

  return getTokenPrice(chain, tokenAddress)
}

if (typeof window !== 'undefined') {
  useTokenPricesStore.getState().fetchTokenPrices(supportedNetworks[0])
}
