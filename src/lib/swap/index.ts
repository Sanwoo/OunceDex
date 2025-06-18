import { Address, Hex, parseUnits } from 'viem'
import { ApiToken } from '../details/types'
import { GqlChain, GqlSorSwapType, GqlToken, GqlTokenPrice, SorGetSwapPathsQuery } from '../generated/graphql'
import { isSameAddress, sameAddresses } from '../utils'
import { bn, fNum, isNegative, isZero, Numberish } from '../numbers'
import { PriceImpactLevel } from '@/hooks/usePriceImpact'
import { getNetworkConfig } from '../networks'
import { AuraBalSwapQueryOutput, ExactInQueryOutput, ExactOutQueryOutput, Permit2, Swap } from '@balancer/sdk'

export enum SupportedCurrency {
  USD = 'USD',
  EUR = 'EUR',
  GBP = 'GBP',
  JPY = 'JPY',
  CNY = 'CNY',
  BTC = 'BTC',
  ETH = 'ETH',
}

export const symbolForCurrency = (currency: SupportedCurrency): string => {
  switch (currency) {
    case SupportedCurrency.USD:
      return '$'
    case SupportedCurrency.EUR:
      return '€'
    case SupportedCurrency.GBP:
      return '£'
    case SupportedCurrency.JPY:
      return '¥'
    case SupportedCurrency.CNY:
      return '¥'
    case SupportedCurrency.BTC:
      return '₿'
    case SupportedCurrency.ETH:
      return 'Ξ'
    default:
      return '$'
  }
}

export const currencyIconMap: Record<SupportedCurrency, string> = {
  [SupportedCurrency.USD]: '/images/currencies/USD.svg',
  [SupportedCurrency.EUR]: '/images/currencies/EUR.svg',
  [SupportedCurrency.GBP]: '/images/currencies/GBP.svg',
  [SupportedCurrency.JPY]: '/images/currencies/JPY.svg',
  [SupportedCurrency.CNY]: '/images/currencies/CNY.svg',
  [SupportedCurrency.BTC]: '/images/currencies/BTC.svg',
  [SupportedCurrency.ETH]: '/images/currencies/ETH.svg',
}

export type SwapTokenInput = {
  address: Address
  amount: string
  scaledAmount: bigint
}

export type SwapState = {
  tokenIn: SwapTokenInput
  tokenOut: SwapTokenInput
  swapType: GqlSorSwapType
  selectedChain: GqlChain
}

export type SimulateSwapInputs = {
  chain: GqlChain
  tokenIn: Address
  tokenOut: Address
  swapType: GqlSorSwapType
  swapAmount: string
  permit2?: Permit2
  poolIds?: string[]
}

type ApiSwapQuery = SorGetSwapPathsQuery['swaps']

export type SimulateSwapResponse = Pick<ApiSwapQuery, 'effectivePrice' | 'effectivePriceReversed' | 'returnAmount' | 'swapType'>

export interface SdkSimulateSwapResponse extends SimulateSwapResponse {
  swap: Swap
  queryOutput: ExactInQueryOutput | ExactOutQueryOutput
  protocolVersion: number
  hopCount: number
}

export type SdkSimulationResponseWithRouter = SdkSimulateSwapResponse & {
  router: Address
}

export interface SimulateSinglePoolSwapResponse extends SimulateSwapResponse {
  swap: Swap
  queryOutput: ExactInQueryOutput | ExactOutQueryOutput
}

export interface AuraBalSimulateSwapResponse extends SimulateSwapResponse {
  queryOutput: AuraBalSwapQueryOutput
}

export interface BuildSwapInputs extends SwapState {
  account: Address
  slippagePercent: string
  simulateResponse: SimulateSwapResponse
  wethIsEth: boolean
  relayerApprovalSignature?: Hex
  permit2?: Permit2 // only used by v3 swaps
}

export interface SdkBuildSwapInputs extends BuildSwapInputs {
  simulateResponse: SdkSimulateSwapResponse
}

export interface AuraBalBuildSwapInputs extends BuildSwapInputs {
  simulateResponse: AuraBalSimulateSwapResponse
}

export enum SupportedWrapHandler {
  LIDO = 'LIDO',
}

export const OWrapType = {
  WRAP: 'wrap',
  UNWRAP: 'unwrap',
} as const

export type WrapType = (typeof OWrapType)[keyof typeof OWrapType]

export const OSwapAction = {
  ...OWrapType,
  SWAP: 'swap',
} as const

export type SwapAction = (typeof OSwapAction)[keyof typeof OSwapAction]

export type SupportedChainId =
  | 1 // Mainnet
  | 10 // Optimism
  | 100 // Gnosis
  | 137 // Polygon
  | 146 // Sonic
  | 250 // Fantom
  | 252 // Fraxtal
  | 1101 // Zkevm
  | 8453 // Base
  | 11155111 // Sepolia
  | 34443 // Mode
  | 42161 // Arbitrum
  | 43114 // Avalanche

export type TransactionConfig = {
  account: Address
  chainId: SupportedChainId
  data: Address
  to: Address
  value?: bigint
}

type BuildKeyParams = Pick<BuildSwapInputs, 'account' | 'selectedChain' | 'slippagePercent' | 'simulateResponse'>

export const scaleTokenAmount = (amount: string, token: ApiToken): bigint => {
  if (amount === '') return parseUnits('0', 18)
  return parseUnits(amount, token.decimals)
}

export const getToken = (address: string, chain: GqlChain | number, tokens: GqlToken[]): ApiToken | undefined => {
  const chainKey = typeof chain === 'number' ? 'chainId' : 'chain'
  return tokens.find((token) => isSameAddress(token.address, address) && token[chainKey] === chain)
}

export const getTokensByChain = (chain: GqlChain | number, tokens: GqlToken[]): GqlToken[] => {
  const chainKey = typeof chain === 'number' ? 'chainId' : 'chain'
  return tokens.filter((token) => token[chainKey] === chain)
}

export const priceForToken = (token: ApiToken, tokenPrices: GqlTokenPrice[]): number => {
  const price = tokenPrices.find((price) => isSameAddress(price.address, token.address))
  if (!price) return 0

  return price.price
}

export const usdValueForToken = (token: ApiToken | undefined, amount: Numberish, tokenPrices: GqlTokenPrice[]) => {
  if (!token) return '0'
  if (amount === '') return '0'
  return bn(amount).times(priceForToken(token, tokenPrices)).toFixed()
}

export const getPriceImpactLabel = (priceImpact: string | number | null | undefined) => {
  if (!priceImpact) {
    return ''
  }

  if (isZero(priceImpact)) {
    return ' (0.00%)'
  }

  return ` (-${fNum('priceImpact', priceImpact)})`
}

export const getFullPriceImpactLabel = (priceImpact: string | number | null | undefined, currencyPriceImpact: string) => {
  if (!priceImpact) return '-'
  if (isZero(priceImpact) || isNegative(priceImpact)) return `${currencyPriceImpact} (0.00%)`

  return `-${currencyPriceImpact}${getPriceImpactLabel(priceImpact)}`
}

export const getMaxSlippageLabel = (slippage: string | 0, currencyMaxSlippage: string) => {
  if (!slippage) return '-'
  if (isZero(slippage) || isNegative(slippage)) return `${currencyMaxSlippage} (0.00%)`

  const slippageLabel = fNum('slippage', slippage)
  return `-${currencyMaxSlippage} (-${slippageLabel})`
}

export const getPriceImpactExceedsLabel = (priceImpactLevel: PriceImpactLevel) => {
  switch (priceImpactLevel) {
    case 'medium':
      return '1.00%'
    case 'high':
      return '5.00%'
    case 'max':
      return '10.00%'
    default:
      return ''
  }
}

export const isNativeToken = (tokenAddress: Address, chainId: number) => {
  const networkConfig = getNetworkConfig(chainId)
  return isSameAddress(tokenAddress, networkConfig.tokens.nativeAsset.address)
}

const simulateInputKey = ({ swapAmount, swapType, tokenIn, tokenOut, chain, poolIds }: SimulateSwapInputs) => {
  return `${swapAmount}:${swapType}:${tokenIn}:${tokenOut}:${chain}:${JSON.stringify(poolIds)}`
}

const buildInputKey = ({ account, selectedChain, slippagePercent, simulateResponse }: BuildKeyParams) => {
  return `${account}:${selectedChain}:${slippagePercent}:${JSON.stringify(simulateResponse)}`
}

export const swapQueryKeys = {
  simulation: (inputs: SimulateSwapInputs) => ['swap', 'simulation', simulateInputKey(inputs)] as const,
  build: (inputs: BuildKeyParams) => ['swap', 'build', buildInputKey(inputs)] as const,
}

export type TokenBase = Pick<GqlToken, 'address' | 'name' | 'symbol' | 'decimals' | 'chainId'>

export const getNativeAssetAddress = (chainId: GqlChain | SupportedChainId) => {
  return getNetworkConfig(chainId).tokens.nativeAsset.address
}

export const exclNativeAssetFilter = (chain: GqlChain | SupportedChainId) => {
  return (token: TokenBase | string) => {
    const nativeAssetAddress = getNativeAssetAddress(chain)
    if (typeof token === 'string') {
      return !isSameAddress(token, nativeAssetAddress)
    }
    return !isSameAddress(token.address, nativeAssetAddress)
  }
}

export const nativeAssetFilter = (chain: GqlChain | SupportedChainId) => {
  return (token: TokenBase | string) => {
    const nativeAssetAddress = getNativeAssetAddress(chain)
    if (typeof token === 'string') {
      return isSameAddress(token, nativeAssetAddress)
    }
    return isSameAddress(token.address, nativeAssetAddress)
  }
}

export const isNativeAsset = (token: TokenBase | string, chain: GqlChain | SupportedChainId) => {
  return nativeAssetFilter(chain)(token)
}

export const getWrappedNativeAssetAddress = (chainId: GqlChain | SupportedChainId) => {
  return getNetworkConfig(chainId).tokens.addresses.wNativeAsset
}

export const wrappedNativeAssetFilter = (chain: GqlChain | SupportedChainId) => {
  return (token: TokenBase | string) => {
    const wNativeAssetAddress = getWrappedNativeAssetAddress(chain)
    if (typeof token === 'string') {
      return isSameAddress(token, wNativeAssetAddress)
    }
    return isSameAddress(token.address, wNativeAssetAddress)
  }
}

export const isWrappedNativeAsset = (token: TokenBase | string, chain: GqlChain | SupportedChainId) => {
  return wrappedNativeAssetFilter(chain)(token)
}

export const isSupportedWrap = (tokenIn: Address, tokenOut: Address, chain: GqlChain) => {
  const networkConfig = getNetworkConfig(chain)
  const supportedWrappers = 'supportedWrappers' in networkConfig.tokens ? networkConfig.tokens.supportedWrappers : []
  return supportedWrappers.some((wrapper) => sameAddresses([wrapper.baseToken, wrapper.wrappedToken], [tokenIn, tokenOut]))
}

export const getWrapConfig = (tokenIn: Address, tokenOut: Address, chain: GqlChain) => {
  const networkConfig = getNetworkConfig(chain)
  const supportedWrappers = 'supportedWrappers' in networkConfig.tokens ? networkConfig.tokens.supportedWrappers : []
  if (!isSupportedWrap(tokenIn, tokenOut, chain)) throw new Error('Unsupported wrap')

  const wrapper = supportedWrappers.find((wrapper) => sameAddresses([wrapper.baseToken, wrapper.wrappedToken], [tokenIn, tokenOut]))

  if (!wrapper) throw new Error('Wrapper not found')

  return wrapper
}

export const getWrapType = (tokenIn: Address, tokenOut: Address, chain: GqlChain): WrapType | null => {
  if (isNativeAsset(tokenIn, chain) && isWrappedNativeAsset(tokenOut, chain)) {
    return OWrapType.WRAP
  } else if (isWrappedNativeAsset(tokenIn, chain) && isNativeAsset(tokenOut, chain)) {
    return OWrapType.UNWRAP
  } else if (isSupportedWrap(tokenIn, tokenOut, chain)) {
    const wrapper = getWrapConfig(tokenIn, tokenOut, chain)
    return isSameAddress(wrapper.baseToken, tokenIn) ? OWrapType.WRAP : OWrapType.UNWRAP
  }

  return null
}
