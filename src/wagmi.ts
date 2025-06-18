import { getDefaultConfig } from '@rainbow-me/rainbowkit'
import { http, Transport } from 'wagmi'
import { mainnet, optimism, arbitrum, avalanche, base, gnosis, polygon, polygonZkEvm, mode, fraxtal } from 'wagmi/chains'
import { rpcUrl } from './lib/networks'

const walletConnectProjectId = process.env.NEXT_PUBLIC_PROJECT_ID
if (!walletConnectProjectId) {
  throw new Error('Missing NEXT_PUBLIC_WALLET_CONNECT_ID env')
}

const createTransports = (urlMap: Record<number, string>): Record<number, Transport> => {
  const result: Record<number, Transport> = {}

  Object.entries(urlMap).forEach(([chainId, url]) => {
    result[Number(chainId)] = http(url)
  })

  return result
}

const config = getDefaultConfig({
  appName: 'ounce-dex',
  projectId: walletConnectProjectId,
  chains: [
    mainnet,
    optimism,
    arbitrum,
    avalanche,
    base,
    gnosis,
    polygon,
    { ...polygonZkEvm, iconUrl: 'images/chains/ZKEVM.svg' },
    { ...mode, iconUrl: 'images/chains/MODE.svg' },
    { ...fraxtal, iconUrl: 'images/chains/FRAXTAL.svg' },
  ],
  ssr: true,
  transports: createTransports(rpcUrl),
  // transports: {
  //   [mainnet.id]: http('https://eth-mainnet.g.alchemy.com/v2/Q2Y58_UudzYcW1UW9zM2kJ2eo0w4aSe1'),
  //   [arbitrum.id]: http('https://arb-mainnet.g.alchemy.com/v2/Q2Y58_UudzYcW1UW9zM2kJ2eo0w4aSe1'),
  //   [optimism.id]: http('https://opt-mainnet.g.alchemy.com/v2/Q2Y58_UudzYcW1UW9zM2kJ2eo0w4aSe1'),
  //   [polygon.id]: http('https://polygon-mainnet.g.alchemy.com/v2/Q2Y58_UudzYcW1UW9zM2kJ2eo0w4aSe1'),
  //   [base.id]: http('https://base-mainnet.g.alchemy.com/v2/Q2Y58_UudzYcW1UW9zM2kJ2eo0w4aSe1'),
  //   [avalanche.id]: http('https://avax-mainnet.g.alchemy.com/v2/Q2Y58_UudzYcW1UW9zM2kJ2eo0w4aSe1'),
  //   [gnosis.id]: http('https://gnosis-mainnet.g.alchemy.com/v2/Q2Y58_UudzYcW1UW9zM2kJ2eo0w4aSe1'),
  //   [polygonZkEvm.id]: http('https://polygonzkevm-mainnet.g.alchemy.com/v2/Q2Y58_UudzYcW1UW9zM2kJ2eo0w4aSe1'),
  //   [mode.id]: http('https://1rpc.io/mode'),
  //   [fraxtal.id]: http('https://frax-mainnet.g.alchemy.com/v2/Q2Y58_UudzYcW1UW9zM2kJ2eo0w4aSe1'),
  //   [sepolia.id]: http(
  //     "https://eth-sepolia.g.alchemy.com/v2/Q2Y58_UudzYcW1UW9zM2kJ2eo0w4aSe1"
  //   ),
  // },
})

export default config
