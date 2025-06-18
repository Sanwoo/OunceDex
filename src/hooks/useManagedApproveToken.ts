import { usdtAbi } from '@/lib/abi/UsdtAbi'
import { WriteAbiMutability } from '@/lib/contract'
import { getNetworkConfig } from '@/lib/networks'
import { SupportedChainId } from '@/lib/swap'
import { isSameAddress } from '@/lib/utils'
import { useMemo } from 'react'
import { ContractFunctionArgs, ContractFunctionName, erc20Abi } from 'viem'
import { useSimulateContract, useWaitForTransactionReceipt, useWriteContract } from 'wagmi'

type Erc20Abi = typeof erc20Abi

interface ApproveTokenProps {
  tokenInAddress: `0x${string}`
  args: ContractFunctionArgs<Erc20Abi, WriteAbiMutability> | null
  chainId: SupportedChainId
  enabled: boolean
}

export const useManagedApproveToken = ({ tokenInAddress, args, chainId, enabled }: ApproveTokenProps) => {
  const usdtAddress = '0xdac17f958d2ee523a2206206994597c13d831ec7'
  const isUsdt = useMemo(() => isSameAddress(tokenInAddress, usdtAddress), [tokenInAddress, usdtAddress])
  const networkConfig = getNetworkConfig(chainId)
  const minConfirmations = 'minConfirmations' in networkConfig ? networkConfig.minConfirmations : 1

  const simulateQuery = useSimulateContract({
    /*
          USDTs ABI does not exactly follow the erc20ABI so we need its explicit ABI to avoid errors (e.g. calling approve)
          More info: https://github.com/wevm/wagmi/issues/2749#issuecomment-1638200817
        */
    abi: isUsdt ? usdtAbi : erc20Abi,
    address: tokenInAddress,
    functionName: 'approve' as ContractFunctionName<any, WriteAbiMutability>,
    // This any is 'safe'. The type provided to any is the same type for args that is inferred via the functionName
    args: args as any,
    chainId,
    query: {
      enabled: enabled,
      //   meta: simulationMeta,
      // In chains like polygon, we don't want background refetches while waiting for min block confirmations
      refetchOnMount: false,
      refetchOnReconnect: false,
      refetchOnWindowFocus: false,
    },
  })
  const writeQuery = useWriteContract()

  const transactionStatusQuery = useWaitForTransactionReceipt({
    chainId,
    hash: writeQuery.data,
    confirmations: minConfirmations,
    timeout: undefined,
  })

  const managedApproveAsync = async () => {
    if (!simulateQuery.data) return

    try {
      return await writeQuery.writeContractAsync(simulateQuery.data.request)
    } catch (e: unknown) {
      console.error('Error in Approving Token', e)
      throw e
    }
  }

  return { managedApproveAsync, transactionStatusQuery }
}
