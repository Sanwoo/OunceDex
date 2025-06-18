import { GqlChain } from '../generated/graphql'
import { Address, zeroAddress } from 'viem'
import { convertHexToLowerCase } from '../utils'

const networkConfig = {
  chainId: 250,
  name: 'Fantom Opera',
  shortName: 'Fantom',
  chain: GqlChain.Fantom,
  iconPath: '/images/chains/FANTOM.svg',
  blockExplorer: {
    baseUrl: 'https://ftmscan.com',
    name: 'FTMScan',
  },
  tokens: {
    addresses: {
      bal: '' as Address,
      wNativeAsset: '0x21be370d5312f44cb42ce377bc9b8a0cef1a4c83',
    },
    nativeAsset: {
      name: 'Fantom',
      address: '0xeeeeeeeeeeeeeeeeeeeeeeeeeeeeeeeeeeeeeeee',
      symbol: 'FTM',
      decimals: 18,
    },
    stakedAsset: {
      name: 'sFTMx',
      address: '0xd7028092c830b5c8fce061af2e593413ebbc1fc1',
      symbol: 'sFTMx',
      decimals: 18,
    },
    defaultSwapTokens: {
      tokenIn: '0xeeeeeeeeeeeeeeeeeeeeeeeeeeeeeeeeeeeeeeee',
    },
  },
  contracts: {
    multicall2: '0x66335d7ad8011f6aa3f48aadcb523b62b38ed961',
    balancer: {
      vaultV2: '0x20dd72Ed959b6147912C2e529F0a0C651c33c9ce',
      relayerV6: '0x0faa25293a36241c214f3760c6ff443e1b731981',
      minter: zeroAddress,
    },
    beets: {
      lstStaking: '0x310A1f7bd9dDE18CCFD701A796Ecb83CcbedE21A',
      lstStakingProxy: '0xB458BfC855ab504a8a327720FcEF98886065529b',
      sfc: '0xFC00FACE00000000000000000000000000000000',
    },
  },
  pools: convertHexToLowerCase({ issues: {} }),
}

export default networkConfig
