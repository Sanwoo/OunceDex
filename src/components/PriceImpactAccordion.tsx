import React, { useMemo } from 'react'
import { Accordion, AccordionContent, AccordionItem, AccordionTrigger } from '@/components/ui/accordion'
import { PriceImpactLevel } from '@/hooks/usePriceImpact'
import { InfoIcon, OctagonX, TriangleAlert } from 'lucide-react'
import { ApiToken } from '@/lib/details/types'
import { bn, fNum, Numberish } from '@/lib/numbers'
import { GqlTokenPrice } from '@/lib/generated/graphql'
import { getFullPriceImpactLabel, getMaxSlippageLabel, getPriceImpactExceedsLabel, SdkSimulateSwapResponse, SdkSimulationResponseWithRouter, SimulateSwapResponse, usdValueForToken } from '@/lib/swap'
import { HoverCard, HoverCardContent, HoverCardTrigger } from '@/components/ui/hover-card'
import { motion } from 'framer-motion'
import { Alert, AlertDescription, AlertTitle } from '@/components/ui/alert'

const OrderRoute = ({ simulateSwapResult }: { simulateSwapResult: SdkSimulationResponseWithRouter }) => {
  const orderRouteVersion = useMemo(() => {
    return simulateSwapResult ? ('protocolVersion' in simulateSwapResult ? simulateSwapResult.protocolVersion : 2) : 2
  }, [simulateSwapResult])

  const getRouteHopsLabel = useMemo(() => {
    if (simulateSwapResult.hopCount === 0) return 'Unknown'
    return `Bv${orderRouteVersion}: ${simulateSwapResult.hopCount} ${simulateSwapResult.hopCount > 1 ? 'hops' : 'hop'}`
  }, [simulateSwapResult, orderRouteVersion])

  return (
    <div className="flex flex-row items-center justify-between">
      <span className="pl-2">Order route</span>
      <div className="flex flex-row gap-2 items-center">
        <span>{getRouteHopsLabel}</span>
        <HoverCard>
          <HoverCardTrigger>
            <div className="cursor-pointer">
              <InfoIcon size={16} />
            </div>
          </HoverCardTrigger>
          <HoverCardContent className="backdrop-blur-md bg-white/5 text-purple-100/85 text-sm border-purple-300/50">
            <span> Balancer Vault version and number of swap hops</span>
          </HoverCardContent>
        </HoverCard>
      </div>
    </div>
  )
}

interface PriceImpactIconProps {
  priceImpactLevel: PriceImpactLevel
  size?: number
}

const PriceImpactIcon = ({ priceImpactLevel, size = 16 }: PriceImpactIconProps) => {
  switch (priceImpactLevel) {
    case 'unknown':
    case 'high':
    case 'max':
      return <OctagonX size={size} />
    case 'medium':
      return <TriangleAlert size={size} />
    case 'low':
    default:
      return null
  }
}

interface PriceImpactAccordionProps {
  priceImpactLevel: PriceImpactLevel
  priceImpactColor: string
  tokenInInfo: ApiToken | undefined
  tokenOutInfo: ApiToken | undefined
  simulateSwapResult: SimulateSwapResponse | SdkSimulateSwapResponse | SdkSimulationResponseWithRouter
  tokenPrices: GqlTokenPrice[]
  toCurrency: (
    usdVal: Numberish,
    options?: {
      withSymbol?: boolean
      abbreviated?: boolean
      noDecimals?: boolean
      forceThreeDecimals?: boolean
    },
  ) => string
  priceImpact: string | number | undefined | null
  usdValueForTokenOut: string
  slippage: number
  tokenOutAmount: string
  handlerName: string
}

export const PriceImpactAccordion = ({
  priceImpactLevel,
  priceImpactColor,
  tokenInInfo,
  tokenOutInfo,
  simulateSwapResult,
  tokenPrices,
  toCurrency,
  priceImpact,
  usdValueForTokenOut,
  slippage,
  tokenOutAmount,
  handlerName,
}: PriceImpactAccordionProps) => {
  const isDefaultSwapHandler = handlerName === 'defaultSwapHandler'

  const tokenInUsdValue = useMemo(() => usdValueForToken(tokenInInfo, '1', tokenPrices), [tokenInInfo, tokenPrices])

  const effectivePriceReversed = useMemo(() => fNum('token', simulateSwapResult?.effectivePriceReversed || '0', { abbreviated: false }), [simulateSwapResult?.effectivePriceReversed])

  const fullPriceImpactLabel = useMemo(() => {
    const impactUsd = bn(priceImpact || 0).times(usdValueForTokenOut)
    return getFullPriceImpactLabel(priceImpact, toCurrency(impactUsd, { abbreviated: false }))
  }, [priceImpact, usdValueForTokenOut, toCurrency])

  const fullMaxSlippageLabel = useMemo(() => {
    const slippageUsd = bn(slippage).div(100).times(usdValueForTokenOut)
    return getMaxSlippageLabel(slippage.toString(), toCurrency(slippageUsd, { abbreviated: false }))
  }, [slippage, usdValueForTokenOut, toCurrency])

  const atLeastValue = useMemo(
    () =>
      bn(tokenOutAmount)
        .minus(bn(tokenOutAmount).times(bn(slippage).div(100).toString()))
        .toString(),
    [tokenOutAmount, slippage],
  )

  const atLeastTooltip = useMemo(
    () => 'You will get at least this amount, even if you suffer maximum slippage ' + 'from unfavorable market price movements before your transaction executes on-chain.',
    [],
  )

  const priceImpactTooltip = useMemo(() => {
    if (priceImpactLevel === 'unknown') {
      return "This usually displays the negative price impact of the swap based on the current market prices of the token in vs token out. However, for some reason, the price impact currently can't be calculated. This may be due to the pricing provider being down or not knowing one of the tokens. Only proceed if you know exactly what you are doing."
    } else {
      return 'This is the negative price impact of the swap based on the current market prices of the token in vs token out.'
    }
  }, [priceImpactLevel])

  const slippageLabel = useMemo(
    () =>
      'This is the maximum slippage that the swap will allow. ' +
      'It is based on the quoted amount out minus your slippage tolerance, using current market prices. ' +
      'You can change your slippage tolerance in your settings.',
    [],
  )

  return (
    <>
      <motion.div
        initial={{ opacity: 0, y: 10 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.5 }}
        className="border border-purple-300/30 rounded-lg p-2 bg-white/5 backdrop-blur-sm shadow-lg shadow-purple-900/20"
      >
        <Accordion type="single" collapsible className="w-full">
          <AccordionItem value="item-1" className="border-b-0">
            <AccordionTrigger className="text-purple-100 text-sm py-0 flex flex-row justify-between" iconClassName="text-purple-100">
              <div className="flex flex-row justify-between w-full items-center pl-2">
                {`1 ${tokenInInfo?.symbol} = ${effectivePriceReversed} ${tokenOutInfo?.symbol} (${toCurrency(tokenInUsdValue, { abbreviated: false })})`}
                <div className={`${priceImpactColor} flex flex-row items-center gap-2`}>
                  <PriceImpactIcon priceImpactLevel={priceImpactLevel} />
                  <span>Details</span>
                </div>
              </div>
            </AccordionTrigger>
            <AccordionContent className="text-purple-100/80 text-xs py-0">
              <div className="flex flex-col gap-2 pt-2 text-sm">
                <div className={`${priceImpactColor} flex flex-row items-center justify-between`}>
                  <span className="pl-2">Price Impact</span>
                  <div className="flex flex-row gap-2 items-center">
                    {priceImpactLevel === 'unknown' ? <span>Unknown</span> : <span>{fullPriceImpactLabel}</span>}
                    <HoverCard>
                      <HoverCardTrigger>
                        <div className="cursor-pointer">{priceImpactLevel === 'low' ? <InfoIcon size={16} /> : <PriceImpactIcon priceImpactLevel={priceImpactLevel} />}</div>
                      </HoverCardTrigger>
                      <HoverCardContent className="backdrop-blur-md bg-white/5 text-purple-100/85 text-sm border-purple-300/50 shadow-lg shadow-purple-900/20">{priceImpactTooltip}</HoverCardContent>
                    </HoverCard>
                  </div>
                </div>

                <div className="flex flex-row items-center justify-between">
                  <span className="pl-2">Max Slippage</span>
                  <div className="flex flex-row gap-2 items-center">
                    <span>{fullMaxSlippageLabel}</span>
                    <HoverCard>
                      <HoverCardTrigger>
                        <div className="cursor-pointer">
                          <InfoIcon size={16} />
                        </div>
                      </HoverCardTrigger>
                      <HoverCardContent className="backdrop-blur-md bg-white/5 text-purple-100/85 text-sm border-purple-300/50">{slippageLabel}</HoverCardContent>
                    </HoverCard>
                  </div>
                </div>

                <div className="flex flex-row items-center justify-between">
                  <span className="pl-2">You will get at least</span>
                  <div className="flex flex-row gap-2 items-center">
                    <span>
                      {fNum('token', atLeastValue, { abbreviated: false })} {tokenOutInfo?.symbol}
                    </span>
                    <HoverCard>
                      <HoverCardTrigger>
                        <div className="cursor-pointer">
                          <InfoIcon size={16} />
                        </div>
                      </HoverCardTrigger>
                      <HoverCardContent className="backdrop-blur-md bg-white/5 text-purple-100/85 text-sm border-purple-300/50">{atLeastTooltip}</HoverCardContent>
                    </HoverCard>
                  </div>
                </div>
                {isDefaultSwapHandler ? <OrderRoute simulateSwapResult={simulateSwapResult as SdkSimulationResponseWithRouter} /> : null}
              </div>
            </AccordionContent>
          </AccordionItem>
        </Accordion>
      </motion.div>

      {(priceImpactLevel === 'high' || priceImpactLevel === 'max' || priceImpactLevel === 'unknown') && (
        <motion.div initial={{ opacity: 0, y: 10 }} animate={{ opacity: 1, y: 0 }} transition={{ duration: 0.7 }}>
          <Alert
            variant="default"
            className={`
              bg-white/5 backdrop-blur-md 
              border border-red-400/30 
              shadow-lg shadow-purple-900/20
              rounded-lg py-2
              ${priceImpactLevel === 'max' ? 'animate-pulse-subtle' : ''}
            `}
          >
            <AlertTitle className="flex flex-row gap-2 items-center text-red-400/90 text-sm font-medium">
              <PriceImpactIcon size={16} priceImpactLevel={priceImpactLevel} />
              {priceImpactLevel === 'unknown' ? 'Unknown price impact' : `Price impact is high: Exceeds ${getPriceImpactExceedsLabel(priceImpactLevel)}`}
            </AlertTitle>
            <AlertDescription className="text-purple-100/75 text-xs mt-1.5 pl-6 leading-relaxed flex-wrap flex">
              {priceImpactLevel === 'unknown'
                ? 'The price impact cannot be calculated. Only proceed if you know exactly what you are doing.'
                : 'The higher the price impact, the worse exchange rate you get for this swap.'}
            </AlertDescription>
          </Alert>
        </motion.div>
      )}
    </>
  )
}
