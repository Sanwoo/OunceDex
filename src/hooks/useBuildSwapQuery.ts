import { useQuery } from '@tanstack/react-query'
import { useHandler } from './useHandler'
import { SdkBuildSwapInputs, SimulateSwapResponse, swapQueryKeys } from '@/lib/swap'
import { useAccount } from 'wagmi'

export const useBuildSwapQuery = ({ simulateResponse, slippagePercent, account, selectedChain, wethIsEth, permit2, tokenIn, tokenOut, swapType }: SdkBuildSwapInputs) => {
  const { build } = useHandler(tokenIn.address, tokenOut.address, selectedChain)
  const { isConnected } = useAccount()

  return useQuery({
    queryKey: swapQueryKeys.build({
      selectedChain,
      account,
      slippagePercent,
      simulateResponse: simulateResponse || ({} as SimulateSwapResponse),
    }),
    queryFn: async () =>
      build({
        simulateResponse,
        slippagePercent,
        account,
        selectedChain,
        wethIsEth,
        permit2,
        tokenIn,
        tokenOut,
        swapType,
      }),
    enabled: isConnected && !!simulateResponse && Object.keys(simulateResponse).length > 0,
    gcTime: 0,
    refetchOnMount: false,
    refetchOnReconnect: false,
    refetchOnWindowFocus: false,
  })
}
