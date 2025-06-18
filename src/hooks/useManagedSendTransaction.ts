import { getNetworkConfig } from '@/lib/networks'
import { bn } from '@/lib/numbers'
import { TransactionConfig } from '@/lib/swap'
import { useEstimateGas, useSendTransaction, useWaitForTransactionReceipt } from 'wagmi'

interface ManagedSendTransactionProps {
  txConfig: TransactionConfig
}

export const useManagedSendTransaction = ({ txConfig }: ManagedSendTransactionProps) => {
  const chainId = txConfig.chainId
  const networkConfig = getNetworkConfig(chainId)
  const minConfirmations = 'minConfirmations' in networkConfig ? networkConfig.minConfirmations : 1

  const estimateGasQueryOriginal = useEstimateGas({
    ...txConfig,
    query: {
      enabled: !!txConfig,
      // meta: gasEstimationMeta,
      // In chains like polygon, we don't want background refetches while waiting for min block confirmations
      refetchOnMount: false,
      refetchOnReconnect: false,
      refetchOnWindowFocus: false,
    },
  })

  // make a copy here so we can adjust the data below
  let estimateGasQuery
  estimateGasQuery = estimateGasQueryOriginal

  // increase gas limit here to make sure v3 boosted pool transactions have enough gas
  if (estimateGasQueryOriginal.data) {
    const originalGas = estimateGasQueryOriginal.data
    const adjustedGas = BigInt(bn(originalGas).times(1.1).toFixed(0))

    estimateGasQuery = {
      ...estimateGasQueryOriginal,
      data: adjustedGas,
    }
  }

  const writeMutation = useSendTransaction()

  const transactionStatusQuery = useWaitForTransactionReceipt({
    chainId,
    hash: writeMutation.data,
    confirmations: minConfirmations,
    timeout: undefined,
    query: {
      refetchOnMount: false,
      refetchOnReconnect: false,
      refetchOnWindowFocus: false,
    },
  })

  //   const bundle = {
  //     chainId,
  //     simulation: estimateGasQuery as TransactionSimulation,
  //     execution: writeMutation as TransactionExecution,
  //     result: transactionStatusQuery,
  //     isSafeTxLoading,
  //   }

  const managedSendAsync = txConfig
    ? async () => {
        if (!estimateGasQuery.data) return
        if (!txConfig?.to) return
        try {
          return writeMutation.sendTransactionAsync({
            chainId,
            to: txConfig.to,
            data: txConfig.data,
            value: txConfig.value,
            gas: estimateGasQuery.data,
          })
        } catch (e: unknown) {
          console.error('Error in Sending Transaction', e)
          throw e
        }
      }
    : undefined

  return { managedSendAsync, transactionStatusQuery }
}
