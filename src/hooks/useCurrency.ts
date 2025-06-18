import { useFxRatesData, useGetFxRates } from '@/store/fxRatesStore'
import { Numberish, bn, fNum } from '../lib/numbers'
import { SupportedCurrency, symbolForCurrency } from '@/lib/swap'
import { useCallback } from 'react'

export type CurrencyOpts = {
  withSymbol?: boolean
  abbreviated?: boolean
  noDecimals?: boolean
  forceThreeDecimals?: boolean
}

export const useCurrency = (currency: SupportedCurrency) => {
  const hasFxRates = !!useFxRatesData()
  const getFxRates = useGetFxRates()

  // Converts a USD value to the user's currency value.
  const toUserCurrency = useCallback(
    (usdVal: Numberish): string => {
      const amount = usdVal.toString()
      const fxRate = getFxRates(currency)

      return bn(amount).times(fxRate).toString()
    },
    [currency, getFxRates],
  )

  const formatCurrency = useCallback(
    (value: string | undefined) => {
      const symbol = hasFxRates ? symbolForCurrency(currency) : '$'
      return `${symbol}${value ?? '0'}`
    },
    [currency, hasFxRates],
  )

  const parseCurrency = useCallback((value: string) => {
    return value.replace(/^\$/, '')
  }, [])

  // Converts a USD value to the user's currency and formats in fiat style.
  const toCurrency = useCallback(
    (usdVal: Numberish, { withSymbol = true, abbreviated = true, noDecimals = false, forceThreeDecimals = false }: CurrencyOpts = {}): string => {
      const symbol = hasFxRates ? symbolForCurrency(currency) : '$'
      const convertedAmount = toUserCurrency(usdVal)

      const formattedAmount = fNum(noDecimals ? 'integer' : 'fiat', convertedAmount, {
        abbreviated,
        forceThreeDecimals,
      })

      if (formattedAmount.startsWith('<')) {
        return withSymbol ? '<' + symbol + formattedAmount.substring(1) : formattedAmount
      }

      return withSymbol ? symbol + formattedAmount : formattedAmount
    },
    [currency, hasFxRates, toUserCurrency],
  )

  return { toCurrency, formatCurrency, parseCurrency }
}
