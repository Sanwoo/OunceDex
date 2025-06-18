import { apolloClient } from '@/components/Providers'
import { GetTokensDocument, GqlToken } from '@/lib/generated/graphql'
import { supportedNetworks } from '@/lib/networks'
import { create } from 'zustand'

interface TotalTokensState {
  totalTokens: GqlToken[] | undefined
  isLoading: boolean
  error: Error | null
  fetchTokens: () => Promise<void>
}

export const useTotalTokensStore = create<TotalTokensState>((set) => ({
  totalTokens: undefined,
  isLoading: true,
  error: null,
  fetchTokens: async () => {
    set({ isLoading: true })

    try {
      const { data, error } = await apolloClient.query({
        query: GetTokensDocument,
        variables: { chains: supportedNetworks },
        context: {
          fetchOptions: {
            next: { revalidate: 1200 },
          },
        },
      })

      set({
        totalTokens: data?.tokens || [],
        isLoading: false,
        error: error || null,
      })
    } catch (err) {
      set({
        isLoading: false,
        error: err instanceof Error ? err : new Error(String(err)),
      })
    }
  },
}))

export const useTotalTokens = () => useTotalTokensStore((state) => state.totalTokens)
export const useTotalTokensLoading = () => useTotalTokensStore((state) => state.isLoading)
export const useTotalTokensError = () => useTotalTokensStore((state) => state.error)

if (typeof window !== 'undefined') {
  useTotalTokensStore.getState().fetchTokens()
}
