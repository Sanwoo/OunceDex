import { get } from 'lodash'
import { Address } from 'viem'
import { getNetworkConfig, NetworkConfig } from '@/lib/networks'
import { GqlChain } from '@/lib/generated/graphql'

type Paths<T, D extends string = '.'> = {
  [K in keyof T]: K extends string ? `${K}${T[K] extends object ? `${D}${Paths<T[K], D>}` : ''}` : never
}[keyof T]

export type ContractPath = Paths<NetworkConfig['contracts']>

export function useContractAddress(contractId: ContractPath, chain: GqlChain): Address {
  const networkConfig = getNetworkConfig(chain)

  const address = get(networkConfig.contracts, contractId as string)
  return address
}

export type VaultVersion = 2 | 3

export const useVault = (version: VaultVersion | number, chain: GqlChain) => {
  const vaultV2Address = useContractAddress('balancer.vaultV2', chain)
  //TODO: uncomment when vault is deployed in all networks
  // const vaultV3Address = useContractAddress('balancer.vaultV3')
  const sepoliaVaultAddress = '0x89aa28a8D2B327cD9dB4aDc0f259D757F000AE66'
  const vaultV3Address = sepoliaVaultAddress
  const vaultAddress = version === 3 ? vaultV3Address : vaultV2Address

  return vaultAddress
}

export const useSpenderAddress = (protocolversion: VaultVersion, chain: GqlChain) => {
  // spenderAddress: isPermit2 ? permit2Address(chain) : vaultAddress,
  return useVault(protocolversion, chain)
}
