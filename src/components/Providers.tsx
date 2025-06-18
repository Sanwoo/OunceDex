'use client'

import React, { PropsWithChildren } from 'react'
import { QueryClient, QueryClientProvider } from '@tanstack/react-query'
import { WagmiProvider } from 'wagmi'
import { RainbowKitProvider, Theme, lightTheme } from '@rainbow-me/rainbowkit'
import { ApolloClient, InMemoryCache, ApolloProvider } from '@apollo/client'
import config from '../wagmi'
import { merge } from 'lodash'

const myCustomTheme = merge(lightTheme(), {
  colors: {
    accentColor: '#7b3fe4',
    // modalBackground: '#7b3fe4',
    // modalBackdrop: '#7b3fe4',
    connectButtonBackground: '#7b3fe4',
    connectButtonText: '#fff',
  },
} as Theme)

const queryClient = new QueryClient()
export const apolloClient = new ApolloClient({
  uri: process.env.NEXT_PUBLIC_BALANCER_API_URL,
  cache: new InMemoryCache(),
})

export const Providers = ({ children }: PropsWithChildren) => {
  return (
    <WagmiProvider config={config}>
      <QueryClientProvider client={queryClient}>
        <RainbowKitProvider coolMode theme={myCustomTheme} locale="en">
          <ApolloProvider client={apolloClient}>{children}</ApolloProvider>
        </RainbowKitProvider>
      </QueryClientProvider>
    </WagmiProvider>
  )
}
