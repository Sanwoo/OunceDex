import { GqlChain } from '../generated/graphql'
import { keyBy } from 'lodash'
import arbitrum from './arbitrum'
import avalanche from './avalanche'
import gnosis from './gnosis'
import mainnet from './mainnet'
import polygon from './polygon'
import zkevm from './zkevm'
import fantom from './fantom'
import optimism from './optimism'
import base from './base'
import sepolia from './sepolia'
import mode from './mode'
import fraxtal from './fraxtal'
import sonic from './sonic'
import { SupportedChainId, SupportedWrapHandler } from '../swap'
import { Address } from 'viem'
import { PoolIssue } from './csp-issue'

export const networkConfigs = {
  [GqlChain.Arbitrum]: arbitrum,
  [GqlChain.Avalanche]: avalanche,
  [GqlChain.Base]: base,
  [GqlChain.Gnosis]: gnosis,
  [GqlChain.Mainnet]: mainnet,
  [GqlChain.Polygon]: polygon,
  [GqlChain.Zkevm]: zkevm,
  [GqlChain.Optimism]: optimism,
  [GqlChain.Sepolia]: sepolia,
  [GqlChain.Mode]: mode,
  [GqlChain.Fraxtal]: fraxtal,
  [GqlChain.Fantom]: fantom,
  [GqlChain.Sonic]: sonic,
}

export function getNetworkConfig(chain?: GqlChain | number, defaultNetwork?: GqlChain) {
  if (!chain) return networkConfigs[defaultNetwork || GqlChain.Mainnet]
  if (typeof chain === 'number') {
    return networksByChainId[chain] || networkConfigs.MAINNET
  }

  return networkConfigs[chain]
}

const networksByChainId = keyBy(networkConfigs, 'chainId')

export const supportedNetworks = [
  GqlChain.Mainnet,
  GqlChain.Arbitrum,
  GqlChain.Avalanche,
  GqlChain.Base,
  GqlChain.Gnosis,
  GqlChain.Polygon,
  GqlChain.Zkevm,
  GqlChain.Optimism,
  GqlChain.Mode,
  GqlChain.Fraxtal,
  // ...(process.env.NEXT_PUBLIC_APP_ENV === 'prod' ? [] : [GqlChain.Sepolia]),
]

export const supportedNetworksWithLabels = supportedNetworks.map((item) => {
  return { type: item, label: networkConfigs[item].shortName }
})

export const rpcUrl = {
  [mainnet.chainId]: 'https://eth-mainnet.g.alchemy.com/v2/Q2Y58_UudzYcW1UW9zM2kJ2eo0w4aSe1',
  [arbitrum.chainId]: 'https://arb-mainnet.g.alchemy.com/v2/Q2Y58_UudzYcW1UW9zM2kJ2eo0w4aSe1',
  [polygon.chainId]: 'https://polygon-mainnet.g.alchemy.com/v2/Q2Y58_UudzYcW1UW9zM2kJ2eo0w4aSe1',
  [base.chainId]: 'https://base-mainnet.g.alchemy.com/v2/Q2Y58_UudzYcW1UW9zM2kJ2eo0w4aSe1',
  [avalanche.chainId]: 'https://avax-mainnet.g.alchemy.com/v2/Q2Y58_UudzYcW1UW9zM2kJ2eo0w4aSe1',
  [gnosis.chainId]: 'https://gnosis-mainnet.g.alchemy.com/v2/Q2Y58_UudzYcW1UW9zM2kJ2eo0w4aSe1',
  [zkevm.chainId]: 'https://polygonzkevm-mainnet.g.alchemy.com/v2/Q2Y58_UudzYcW1UW9zM2kJ2eo0w4aSe1',
  [optimism.chainId]: 'https://opt-mainnet.g.alchemy.com/v2/Q2Y58_UudzYcW1UW9zM2kJ2eo0w4aSe1',
  [mode.chainId]: 'https://1rpc.io/mode',
  [fraxtal.chainId]: 'https://frax-mainnet.g.alchemy.com/v2/Q2Y58_UudzYcW1UW9zM2kJ2eo0w4aSe1',
}

export interface BlockExplorerConfig {
  baseUrl: string
  name: string
}

export interface TokensConfig {
  addresses: {
    bal: Address
    wNativeAsset: Address
    auraBal?: Address
    veBalBpt?: Address
    beets?: Address
  }
  nativeAsset: {
    name: string
    address: Address
    symbol: string
    decimals: number
  }
  stakedAsset?: {
    name: string
    address: Address
    symbol: string
    decimals: number
  }
  supportedWrappers?: {
    baseToken: Address
    wrappedToken: Address
    swapHandler: SupportedWrapHandler
  }[]
  doubleApprovalRequired?: string[]
  defaultSwapTokens?: {
    tokenIn?: Address
    tokenOut?: Address
  }
  popularTokens?: Record<Address, string>
}

export interface ContractsConfig {
  multicall2: Address
  multicall3?: Address
  balancer: {
    vaultV2: Address
    // TODO: make it required when v3 is deployed in all networks
    vaultV3?: Address
    vaultAdminV3?: Address
    /*
      TODO: make it required when v3 is deployed in all networks
      IDEAL: remove this config completely and use the SDK build "to" to get the required router
      */
    router?: Address
    batchRouter?: Address
    compositeLiquidityRouterBoosted?: Address
    compositeLiquidityRouterNested?: Address
    relayerV6: Address
    minter: Address
    WeightedPool2TokensFactory?: Address
  }
  beets?: {
    lstStaking: Address
    lstStakingProxy: Address
    // TODO: make it required when fantom is removed
    sfcProxy?: Address
    sfc?: Address
    lstWithdrawRequestHelper?: Address
    reliquary?: Address
  }
  feeDistributor?: Address
  veDelegationProxy?: Address
  veBAL?: Address
  permit2?: Address
  omniVotingEscrow?: Address
  gaugeWorkingBalanceHelper?: Address
  gaugeController?: Address
}

export interface PoolsConfig {
  issues: Partial<Record<PoolIssue, string[]>>
  disallowNestedActions?: string[] // pool ids
}

export interface NetworkConfig {
  chainId: SupportedChainId
  name: string
  shortName: string
  chain: GqlChain
  iconPath: string
  rpcUrl?: string
  blockExplorer: BlockExplorerConfig
  tokens: TokensConfig
  contracts: ContractsConfig
  minConfirmations?: number
  pools: PoolsConfig
  layerZeroChainId?: number
  supportsVeBalSync?: boolean
  lbps?: {
    collateralTokens: string[]
  }
}
