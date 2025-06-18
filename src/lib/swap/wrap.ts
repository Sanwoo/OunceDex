import { Address } from 'viem'
import { isNativeAsset, isWrappedNativeAsset } from './index'
import { GqlChain } from '../generated/graphql'

export function isNativeWrap(tokenIn: Address, tokenOut: Address, chain: GqlChain) {
  const tokenInIsNative = isNativeAsset(tokenIn, chain) || isWrappedNativeAsset(tokenIn, chain)
  const tokenOutIsNative = isNativeAsset(tokenOut, chain) || isWrappedNativeAsset(tokenOut, chain)

  return tokenInIsNative && tokenOutIsNative
}
