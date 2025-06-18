import { useQuery } from '@tanstack/react-query'
import { SdkSimulateSwapResponse, SdkSimulationResponseWithRouter, SimulateSwapResponse, swapQueryKeys } from '@/lib/swap'
import { SimulateSwapQueryProps, useHandler } from './useHandler'
import { bn } from '@/lib/numbers'

export const useSimulateSwapQuery = ({ swapAmount, swapType, tokenIn, tokenOut, chain }: SimulateSwapQueryProps) => {
  const { simulate } = useHandler(tokenIn, tokenOut, chain)
  return useQuery<SimulateSwapResponse | SdkSimulateSwapResponse | SdkSimulationResponseWithRouter, Error>({
    queryKey: swapQueryKeys.simulation({ swapAmount, swapType, tokenIn, tokenOut, chain }),
    queryFn: async () => simulate({ swapAmount, swapType, tokenIn, tokenOut, chain }),
    enabled: bn(swapAmount).gt(0) && !!swapType && !!tokenIn && !!tokenOut && !!chain,
    gcTime: 0,
    refetchOnMount: false,
    refetchOnReconnect: false,
    refetchOnWindowFocus: false,
  })
}
