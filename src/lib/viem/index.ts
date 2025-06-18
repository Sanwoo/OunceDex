import { createPublicClient } from 'viem'
import { getNetworkConfig, rpcUrl, supportedNetworks } from '../networks'
import { GqlChain } from '../generated/graphql'
import { arbitrum, avalanche, base, fantom, fraxtal, gnosis, mainnet, mode, optimism, polygon, polygonZkEvm, sepolia, sonic } from 'wagmi/chains'
import { Chain } from '@rainbow-me/rainbowkit'
import { fallback, http } from 'wagmi'

const gqlChainToWagmiChainMap = {
  [GqlChain.Mainnet]: { iconUrl: '/images/chains/MAINNET.svg', ...mainnet },
  [GqlChain.Arbitrum]: { iconUrl: '/images/chains/ARBITRUM.svg', ...arbitrum },
  [GqlChain.Base]: { iconUrl: '/images/chains/BASE.svg', ...base },
  [GqlChain.Avalanche]: { iconUrl: '/images/chains/AVALANCHE.svg', ...avalanche },
  [GqlChain.Fantom]: { iconUrl: '/images/chains/FANTOM.svg', ...fantom },
  [GqlChain.Gnosis]: { iconUrl: '/images/chains/GNOSIS.svg', ...gnosis },
  [GqlChain.Optimism]: { iconUrl: '/images/chains/OPTIMISM.svg', ...optimism },
  [GqlChain.Polygon]: { iconUrl: '/images/chains/POLYGON.svg', ...polygon },
  [GqlChain.Zkevm]: { iconUrl: '/images/chains/ZKEVM.svg', ...polygonZkEvm },
  [GqlChain.Mode]: { iconUrl: '/images/chains/MODE.svg', ...mode },
  [GqlChain.Fraxtal]: { iconUrl: '/images/chains/FRAXTAL.svg', ...fraxtal },
  [GqlChain.Sonic]: { iconUrl: '/images/chains/SONIC.svg', ...sonic },
  [GqlChain.Sepolia]: { iconUrl: '/images/chains/SEPOLIA.svg', ...sepolia },
} as const satisfies Record<GqlChain, Chain>

const getViemChain = (chainId: number) => {
  const chain = supportedNetworks.find((chain) => getNetworkConfig(chain).chainId === chainId)
  if (!chain) throw new Error('Chain not supported')
  return gqlChainToWagmiChainMap[chain]
}

export const getViemClient = (chain: GqlChain) => {
  const { chainId } = getNetworkConfig(chain)

  return createPublicClient({
    chain: getViemChain(chainId),
    transport: fallback([http(), http(rpcUrl[chainId])]),
  })
}
