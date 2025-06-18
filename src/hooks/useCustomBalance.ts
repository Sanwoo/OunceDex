import { isNativeToken } from '@/lib/swap'
import { useMemo } from 'react'
import { Address } from 'viem'
import { useBalance } from 'wagmi'

const useCustomBalance = (address: Address | undefined, token: Address, chainId: number) => {
  const isNative = useMemo(() => isNativeToken(token, chainId), [token, chainId])
  const { data, isLoading, isError, error, refetch } = useBalance({
    address,
    token: isNative ? undefined : token,
    chainId,
    query: {
      enabled: !!address && !!token,
    },
  })

  return {
    data,
    isLoading,
    isError,
    error,
    refetch,
  }
}
export default useCustomBalance
