import { useCallback, useEffect, useState } from 'react'
import { bn } from '@/lib/numbers'
import { BigNumber } from 'bignumber.js'

export type PriceImpactLevel = 'low' | 'medium' | 'high' | 'max' | 'unknown'

export const usePriceImpact = () => {
  const [priceImpact, setPriceImpact] = useState<string | number | undefined | null>()
  const [priceImpactLevel, setPriceImpactLevel] = useState<PriceImpactLevel>('low')
  const [priceImpactColor, setPriceImpactColor] = useState('green.400')

  const getPriceImpactLevel = (priceImpact: number): PriceImpactLevel => {
    if (priceImpact === null || priceImpact === undefined) return 'unknown'
    if (priceImpact < 0.01) return 'low' // 1%
    if (priceImpact < 0.05) return 'medium' // 5%
    if (priceImpact < 0.1) return 'high' // 10%
    return 'max'
  }

  const getPriceImpactColor = (priceImpactLevel: PriceImpactLevel) => {
    switch (priceImpactLevel) {
      case 'unknown':
      case 'high':
      case 'max':
        return 'text-red-400'
      case 'medium':
        return 'text-[#fdba74]'
      case 'low':
      default:
        return ''
    }
  }

  const calcMarketPriceImpact = (usdIn: string, usdOut: string) => {
    if (bn(usdIn).isZero() || bn(usdOut).isZero()) return '0'

    // priceImpact = 1 - (usdOut / usdIn)
    const priceImpact = bn(1).minus(bn(usdIn).div(usdOut))

    return BigNumber.min(priceImpact, 0).abs().toString()
  }

  const calcPriceImpact = useCallback((tokenInUsd: string, tokenOutUsd: string, swapData: any) => {
    if (!bn(tokenInUsd).isZero() && !bn(tokenOutUsd).isZero() && !!swapData) {
      setPriceImpact(calcMarketPriceImpact(tokenInUsd, tokenOutUsd))
    } else {
      setPriceImpact(undefined)
      setPriceImpactLevel('low')
    }
  }, [])

  useEffect(() => {
    if (priceImpact) {
      const priceImpactValue = typeof priceImpact === 'string' ? Number(priceImpact) : priceImpact

      setPriceImpactLevel(getPriceImpactLevel(priceImpactValue))
      // reset accept high price impact when price impact changes
      //   setAcceptPriceImpactRisk(false)
    } else {
      setPriceImpactLevel('low')
    }
  }, [priceImpact])

  useEffect(() => {
    setPriceImpactColor(getPriceImpactColor(priceImpactLevel))
  }, [priceImpactLevel])

  //   useEffect(() => {
  //     if (priceImpactLevel === 'high' || priceImpactLevel === 'max' || priceImpactLevel === 'unknown') {
  //       setHasToAcceptHighPriceImpact(true)
  //     } else {
  //       setHasToAcceptHighPriceImpact(false)
  //     }
  //   }, [priceImpactLevel])

  return {
    priceImpact,
    setPriceImpact,
    priceImpactLevel,
    priceImpactColor,
    setPriceImpactLevel,
    calcPriceImpact,
  }
}
