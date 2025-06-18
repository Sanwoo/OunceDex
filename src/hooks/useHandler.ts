import { apolloClient } from '@/components/Providers'
import { GqlChain, GqlSorSwapType, SorGetSwapPathsDocument } from '@/lib/generated/graphql'
import { getNetworkConfig, rpcUrl } from '@/lib/networks'
import { bn } from '@/lib/numbers'
import { ProtocolVersion } from '@/lib/pool-type'
import { Path, Slippage, Swap, SwapKind, TokenAmount } from '@balancer/sdk'
import { Address, encodeFunctionData, formatUnits, Hex } from 'viem'
import {
  getWrapConfig,
  getWrapType,
  isSupportedWrap,
  OWrapType,
  SdkSimulationResponseWithRouter,
  SimulateSwapResponse,
  SupportedWrapHandler,
  WrapType,
  type SdkBuildSwapInputs,
  type SimulateSwapInputs,
  type SupportedChainId,
  type TransactionConfig,
} from '@/lib/swap'
import { isNativeWrap } from '@/lib/swap/wrap'
import { getViemClient } from '@/lib/viem'

export interface SimulateSwapQueryProps {
  swapAmount: string
  swapType: GqlSorSwapType
  tokenIn: `0x${string}`
  tokenOut: `0x${string}`
  chain: GqlChain
}

const defaultSwapHandlerSimulate = async ({ swapAmount, swapType, tokenIn, tokenOut, chain }: SimulateSwapQueryProps): Promise<SdkSimulationResponseWithRouter> => {
  // if (!tokenIn || !tokenOut || !swapAmount || bn(swapAmount).lte(0)) return

  const { data } = await apolloClient.query({
    query: SorGetSwapPathsDocument,
    variables: {
      swapAmount,
      swapType,
      tokenIn,
      tokenOut,
      chain,
    },
    fetchPolicy: 'no-cache',
    notifyOnNetworkStatusChange: true,
  })

  const paths = data.swaps.paths.map(
    (path) =>
      ({
        ...path,
        inputAmountRaw: BigInt(path.inputAmountRaw),
        outputAmountRaw: BigInt(path.outputAmountRaw),
        // vaultVersion: path.protocolVersion,
      }) as Path,
  )

  const swap = new Swap({
    chainId: getNetworkConfig(chain).chainId,
    paths: paths,
    swapKind: 0,
  })
  const queryOutput = await swap.query(rpcUrl[getNetworkConfig(chain).chainId])
  let onchainReturnAmount: TokenAmount
  if (queryOutput.swapKind === SwapKind.GivenIn) {
    onchainReturnAmount = queryOutput.expectedAmountOut
  } else {
    onchainReturnAmount = queryOutput.expectedAmountIn
  }

  const returnAmount = formatUnits(onchainReturnAmount.amount, onchainReturnAmount.token.decimals)

  if (!queryOutput.to) throw new Error('No router found in swap query output')
  return {
    protocolVersion: data.swaps.protocolVersion as ProtocolVersion,
    hopCount: data.swaps.routes[0]?.hops?.length || 0,
    swapType,
    returnAmount,
    swap,
    queryOutput,
    effectivePrice: bn(swapAmount).div(returnAmount).toString(),
    effectivePriceReversed: bn(returnAmount).div(swapAmount).toString(),
    router: queryOutput.to,
  }
}

const defaultSwapHandlerBuild = ({ simulateResponse: { swap, queryOutput, protocolVersion }, slippagePercent, account, selectedChain, wethIsEth, permit2 }: SdkBuildSwapInputs): TransactionConfig => {
  const baseBuildCallParams = {
    slippage: Slippage.fromPercentage(slippagePercent as `${number}`),
    deadline: BigInt(Number.MAX_SAFE_INTEGER),
    wethIsEth,
    queryOutput,
  }
  const isV3SwapRoute = protocolVersion === 3

  const buildCallParams = isV3SwapRoute ? baseBuildCallParams : { ...baseBuildCallParams, sender: account, recipient: account }

  const tx = isV3SwapRoute && permit2 ? swap.buildCallWithPermit2(buildCallParams, permit2) : swap.buildCall(buildCallParams)

  return {
    account,
    chainId: getNetworkConfig(selectedChain).chainId as SupportedChainId,
    data: tx.callData,
    value: tx.value,
    to: tx.to,
  }
}

const nativeWrapHandlerSimulate = ({ ...variables }: SimulateSwapInputs): SimulateSwapResponse => {
  return {
    swapType: variables.swapType,
    effectivePrice: '1',
    effectivePriceReversed: '1',
    returnAmount: variables.swapAmount,
  }
}

const buildWrapCallData = () => {
  return encodeFunctionData({
    abi: [
      {
        inputs: [],
        name: 'deposit',
        outputs: [],
        stateMutability: 'payable',
        type: 'function',
      },
    ],
    functionName: 'deposit',
  })
}

const buildUnwrapCallData = (scaledAmount: bigint) => {
  return encodeFunctionData({
    abi: [
      {
        inputs: [{ name: 'amount', type: 'uint256' }],
        name: 'withdraw',
        outputs: [],
        stateMutability: '',
        type: 'function',
      },
    ],
    functionName: 'withdraw',
    args: [scaledAmount],
  })
}

const nativeWrapHandlerBuild = ({ tokenIn, tokenOut, account, selectedChain }: SdkBuildSwapInputs): TransactionConfig => {
  const wrapType = getWrapType(tokenIn.address, tokenOut.address, selectedChain)
  if (!wrapType) throw new Error('Non valid wrap tokens')

  const { tokens } = getNetworkConfig(selectedChain)

  let data: Hex | undefined
  if (wrapType === OWrapType.WRAP) {
    data = buildWrapCallData()
  } else if (wrapType === OWrapType.UNWRAP) {
    data = buildUnwrapCallData(tokenIn.scaledAmount)
  }

  if (!data) throw new Error('Could not build data')

  const value = wrapType === OWrapType.WRAP ? tokenIn.scaledAmount : BigInt(0)

  return {
    account,
    chainId: getNetworkConfig(selectedChain).chainId as SupportedChainId,
    data,
    value,
    to: tokens.addresses.wNativeAsset as `0x${string}`,
  }
}

const lidoRateProviderMap: Partial<Record<GqlChain, Address>> = {
  [GqlChain.Mainnet]: '0x72d07d7dca67b8a406ad1ec34ce969c90bfee768',
}

const applyRate = async (amount: string, wrapType: WrapType | null, chain: GqlChain) => {
  const viemClient = getViemClient(chain)
  const rateProviderAddress = lidoRateProviderMap[chain]

  if (!rateProviderAddress) throw new Error('No rate provider for chain')

  const rateScaled = await viemClient.readContract({
    abi: [
      {
        inputs: [],
        name: 'getRate',
        outputs: [{ name: 'amount', type: 'uint256' }],
        stateMutability: 'view',
        type: 'function',
      },
    ],
    address: rateProviderAddress,
    functionName: 'getRate',
  })

  const rate = formatUnits(rateScaled, 18)

  return wrapType === OWrapType.WRAP ? bn(amount).times(1).div(rate).toString() : bn(amount).times(rate).div(1).toString()
}

const LidoWrapHandlerSimulate = async ({ ...variables }: SimulateSwapInputs): Promise<SimulateSwapResponse> => {
  const wrapType = getWrapType(variables.tokenIn, variables.tokenOut, variables.chain)
  if (!wrapType) throw new Error('LidoWrapHandler called with non valid wrap tokens')

  const returnAmount = await applyRate(variables.swapAmount, wrapType, variables.chain)

  return {
    swapType: variables.swapType,
    effectivePrice: '1',
    effectivePriceReversed: '1',
    returnAmount,
  }
}

const buildLidoWrapCallData = (scaledAmount: bigint) => {
  return encodeFunctionData({
    abi: [
      {
        inputs: [{ name: '_stETHAmount', type: 'uint256' }],
        name: 'wrap',
        outputs: [{ name: 'amount', type: 'uint256' }],
        stateMutability: '',
        type: 'function',
      },
    ],
    functionName: 'wrap',
    args: [scaledAmount],
  })
}

const buildLidoUnwrapCallData = (scaledAmount: bigint) => {
  return encodeFunctionData({
    abi: [
      {
        inputs: [{ name: '_wstETHAmount', type: 'uint256' }],
        name: 'unwrap',
        outputs: [{ name: 'amount', type: 'uint256' }],
        stateMutability: '',
        type: 'function',
      },
    ],
    functionName: 'unwrap',
    args: [scaledAmount],
  })
}

const LidoWrapHandlerBuild = ({ tokenIn, tokenOut, account, selectedChain }: SdkBuildSwapInputs): TransactionConfig => {
  const wrapType = getWrapType(tokenIn.address, tokenOut.address, selectedChain)
  if (!wrapType) throw new Error('Non valid wrap tokens')

  const { wrappedToken } = getWrapConfig(tokenIn.address, tokenOut.address, selectedChain)

  let data: Hex | undefined
  if (wrapType === OWrapType.WRAP) {
    data = buildLidoWrapCallData(tokenIn.scaledAmount)
  } else if (wrapType === OWrapType.UNWRAP) {
    data = buildLidoUnwrapCallData(tokenIn.scaledAmount)
  }

  if (!data) throw new Error('Could not build data')

  return {
    account,
    chainId: getNetworkConfig(selectedChain).chainId as SupportedChainId,
    data,
    to: wrappedToken,
  }
}

const getWrapHandlerClass = (tokenIn: Address, tokenOut: Address, chain: GqlChain) => {
  const wrapper = getWrapConfig(tokenIn, tokenOut, chain)

  switch (wrapper.swapHandler) {
    case SupportedWrapHandler.LIDO:
      return { LidoWrapHandlerSimulate, LidoWrapHandlerBuild }
    default:
      throw new Error('Unsupported wrap handler')
  }
}

export const useHandler = (tokenInAddress: Address, tokenOutAddress: Address, chain: GqlChain) => {
  if (isNativeWrap(tokenInAddress, tokenOutAddress, chain)) {
    return { simulate: nativeWrapHandlerSimulate, build: nativeWrapHandlerBuild }
  } else if (isSupportedWrap(tokenInAddress, tokenOutAddress, chain)) {
    const { LidoWrapHandlerSimulate, LidoWrapHandlerBuild } = getWrapHandlerClass(tokenInAddress, tokenOutAddress, chain)
    return { simulate: LidoWrapHandlerSimulate, build: LidoWrapHandlerBuild }
  }
  return { simulate: defaultSwapHandlerSimulate, build: defaultSwapHandlerBuild }
}
