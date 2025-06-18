import { SupportedCurrency } from '@/lib/swap'
import { create } from 'zustand'
import { CurrencyApiResponse } from '@/types/api'

export type FxRates = Record<SupportedCurrency, { code: string; value: number }>

interface FxRatesState {
  data: FxRates | undefined
  isLoading: boolean
  error: Error | null
  fetchFxRates: () => Promise<void>
  getFxRates: (currency: SupportedCurrency) => number
}

export const useFxRatesStore = create<FxRatesState>((set, get) => ({
  data: undefined,
  isLoading: true,
  error: null,
  fetchFxRates: async () => {
    try {
      const res = await fetch('/api/fx-rates', {
        next: { revalidate: 300 },
      })

      if (!res.ok) {
        throw new Error('Failed to fetch currency rates')
      }

      const apiResponse = (await res.json()) as CurrencyApiResponse
      set({ data: apiResponse.data as FxRates, isLoading: false })
    } catch (error) {
      console.error('Error in fetchFxRates:', error)
      set({ error: error as Error, isLoading: false })
    }
  },
  getFxRates: (currency: SupportedCurrency): number => {
    const { data } = get()
    return data?.[currency]?.value || 1
  },
}))

export const useFxRatesData = () => useFxRatesStore((state: FxRatesState) => state.data)
export const useFxRatesLoading = () => useFxRatesStore((state: FxRatesState) => state.isLoading)
export const useFxRatesError = () => useFxRatesStore((state: FxRatesState) => state.error)
export const useGetFxRates = () => useFxRatesStore((state: FxRatesState) => state.getFxRates)

if (typeof window !== 'undefined') {
  useFxRatesStore.getState().fetchFxRates()
}
