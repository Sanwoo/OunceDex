import React, { memo, useMemo, useState } from 'react'
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger } from '@/components/ui/dialog'
import { Button } from '@/components/ui/button'
import { ChevronDown, Search } from 'lucide-react'
import { GqlChain, GqlToken } from '@/lib/generated/graphql'
import { getNetworkConfig } from '@/lib/networks'
import { exclNativeAssetFilter, getToken, getTokensByChain } from '@/lib/swap'
import { Badge } from '@/components/ui/badge'
import Image from 'next/image'
import { useTotalTokens, useTotalTokensLoading } from '@/store/totalTokensStore'
import { Virtuoso } from 'react-virtuoso'
import { Input } from '@/components/ui/input'
import { cn, fallbackSVG, isSameAddress } from '@/lib/utils'
import { useBalance, useReadContracts } from 'wagmi'
import { Address, erc20Abi } from 'viem'

interface SelectTokenProps {
  network: GqlChain
  tokenAddress?: string
  userAddress?: Address
  onTokenSelect?: (token: GqlToken) => void
}

const SelectToken = memo(function SelectToken({ network, tokenAddress, userAddress, onTokenSelect }: SelectTokenProps) {
  const [searchQuery, setSearchQuery] = useState<string>('')
  const [open, setOpen] = useState<boolean>(false)

  const totalTokens = useTotalTokens()
  const isLoading = useTotalTokensLoading()

  const networkConfig = useMemo(() => getNetworkConfig(network), [network])
  const { shortName, tokens } = networkConfig

  const otherTokens = useMemo(() => {
    if (!totalTokens) {
      return []
    } else {
      const result = getTokensByChain(network, totalTokens)
      return result
    }
  }, [totalTokens, network])

  const tokensExclNativeAsset = otherTokens.filter(exclNativeAssetFilter(network))

  const { data: nativeBalance } = useBalance({
    chainId: networkConfig.chainId,
    address: userAddress,
    query: {
      enabled: !!userAddress,
      /*
        Cache without requests in the background
        More info: https://tkdodo.eu/blog/practical-react-query#the-defaults-explained
      */
      staleTime: 30_000,
    },
  })

  const balanceContractReads = useMemo(() => {
    return tokensExclNativeAsset.map((token) => ({
      chainId: networkConfig.chainId,
      abi: erc20Abi,
      address: token.address as Address,
      functionName: 'balanceOf',
      args: [(userAddress || '') as Address],
    }))
  }, [tokensExclNativeAsset, networkConfig.chainId, userAddress])

  const { data: erc20BalanceData } = useReadContracts({
    query: {
      enabled: !!userAddress,
      gcTime: 30_000,
    },
    multicallAddress: 'multicall3' in networkConfig.contracts ? (networkConfig.contracts.multicall3 as `0x${string}`) : undefined,
    batchSize: 0, // Remove limit
    allowFailure: true,
    contracts: balanceContractReads,
  })

  const tokensWithNativeBalance = useMemo(
    () => (nativeBalance?.value ? otherTokens.filter((token) => isSameAddress(token.address, networkConfig.tokens.nativeAsset.address)) : []),
    [nativeBalance, networkConfig.tokens.nativeAsset.address, otherTokens],
  )
  const tokensWithErc20Balance = useMemo(() => {
    if (!!erc20BalanceData) {
      return erc20BalanceData.map((balance, index) => {
        if (balance.status === 'success' && !!balance.result) {
          const token = tokensExclNativeAsset[index]
          if (!token) return
          return token
        }
      })
    }
    return
  }, [erc20BalanceData, tokensExclNativeAsset])

  const tokensWithBalance = useMemo(() => {
    if (!tokensWithErc20Balance) return tokensWithNativeBalance
    return [...tokensWithNativeBalance, ...tokensWithErc20Balance.filter(Boolean)]
  }, [tokensWithNativeBalance, tokensWithErc20Balance])

  const tokensWithoutBalance = useMemo(() => otherTokens.filter((token) => !tokensWithBalance.includes(token)), [otherTokens, tokensWithBalance])

  const selectedToken = useMemo(() => {
    if (!totalTokens || !tokenAddress) {
      return undefined
    }
    return getToken(tokenAddress, network, totalTokens)
  }, [tokenAddress, network, totalTokens])

  const popularTokens = useMemo(() => {
    if (!totalTokens) {
      return []
    }
    if ('popularTokens' in tokens) {
      const popularTokens = Object.keys(tokens.popularTokens || {})
        .slice(0, 7)
        ?.map((token) => getToken(token, network, totalTokens))
        .filter(Boolean) as GqlToken[]
      return popularTokens
    } else {
      return []
    }
  }, [network, tokens, totalTokens])

  const filteredTokens = useMemo(() => {
    if (!searchQuery.trim()) {
      return [...tokensWithBalance, ...tokensWithoutBalance]
    }
    const query = searchQuery.toLowerCase().trim()
    return otherTokens.filter((token) => token.symbol.toLowerCase().includes(query) || token.name?.toLowerCase().includes(query) || token.address.toLowerCase().includes(query))
  }, [otherTokens, searchQuery, tokensWithBalance, tokensWithoutBalance])

  const handleTokenSelect = (token: GqlToken) => {
    if (token.address !== tokenAddress) {
      if (onTokenSelect) {
        onTokenSelect(token)
      }
      setOpen(false)
    }
  }

  return (
    <Dialog open={open} onOpenChange={setOpen}>
      <DialogTrigger asChild>
        <Button variant="outline" className="flex-shrink-0 mr-4 text-purple-100 bg-white/5 border-1 border-purple-300/50 hover:cursor-pointer hover:bg-white/10">
          {isLoading ? (
            <div className="flex items-center gap-2">
              <div className="w-5 h-5 rounded-full bg-purple-300/20 animate-pulse"></div>
              <div className="w-16 h-4 bg-purple-300/20 animate-pulse rounded"></div>
            </div>
          ) : selectedToken ? (
            <>
              <Image src={selectedToken.logoURI!} alt={selectedToken.symbol} width={20} height={20} loading="lazy" unoptimized></Image>
              {selectedToken.symbol}
            </>
          ) : (
            'Select Token'
          )}
          <ChevronDown />
        </Button>
      </DialogTrigger>
      <DialogContent className="w-full bg-white/5 backdrop-blur-md text-purple-100 border-purple-300/50" XIconClassName="focus:ring-0 focus:ring-offset-0 hover:cursor-pointer">
        <DialogHeader>
          <DialogTitle>Select A Token: {shortName}</DialogTitle>
        </DialogHeader>
        <div className="flex flex-col gap-4">
          <div className="relative w-full">
            <div className="absolute left-3 top-1/2 transform -translate-y-1/2 text-purple-300/70">
              <Search size={16} />
            </div>
            <Input
              type="text"
              placeholder="Search by name、symbol or address..."
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              className="pl-9 pr-4 py-2 w-full bg-purple-900/20 border-purple-300/30 text-purple-100 placeholder-purple-300/50 focus-visible:border-purple-400/50 focus-visible:ring-purple-400/20 focus-visible:ring-[1px] rounded-md"
            />
          </div>

          <div className="w-full flex flex-wrap gap-3">
            {popularTokens.map((token) => (
              <Badge
                key={token.address}
                className={cn(
                  'bg-purple-900/30 text-purple-100 border border-purple-300/30 rounded-md transition-all duration-200',
                  token.address === tokenAddress ? 'bg-purple-500 border-purple-400/60 opacity-90 pointer-events-none' : 'hover:cursor-pointer hover:bg-purple-500/80',
                )}
                onClick={() => handleTokenSelect(token)}
              >
                <Image src={token.logoURI!} alt={token.symbol} width={20} height={20} loading="lazy" unoptimized />
                {token.symbol}
              </Badge>
            ))}
          </div>

          <div className="flex justify-between items-center">
            <span>Other tokens</span>
            <span className="text-xs text-purple-300/70">
              {isLoading ? 'Loading...' : searchQuery.trim() ? `${filteredTokens.length} of ${otherTokens.length} tokens` : otherTokens.length > 0 ? `${otherTokens.length} tokens` : 'No tokens'}
            </span>
          </div>

          {!isLoading && (filteredTokens.length > 0 || otherTokens.length > 0) ? (
            <div className="border border-purple-300/30 rounded-md overflow-hidden">
              <Virtuoso
                className="scrollbar-purple"
                style={{ height: 445 }}
                data={filteredTokens}
                itemContent={(index, token) => {
                  const isSelected = token?.address === tokenAddress
                  const isInWallet = tokensWithBalance.includes(token)
                  return (
                    <div
                      className={cn(
                        'w-full p-2 border-b border-purple-300/20 flex items-center gap-2',
                        isSelected ? 'bg-purple-500/50 opacity-90 pointer-events-none' : 'hover:bg-purple-500/30 hover:cursor-pointer',
                      )}
                      onClick={() => !isSelected && token && handleTokenSelect(token)}
                    >
                      {token?.logoURI ? (
                        <Image src={token?.logoURI || ''} alt={token?.symbol || ''} width={35} height={35} loading="lazy" unoptimized />
                      ) : (
                        <Image src={fallbackSVG(token?.address || '')} alt={token?.symbol || ''} width={35} height={35} loading="lazy" unoptimized />
                      )}
                      <span className="flex flex-col gap-1 flex-1">
                        <span>{token?.symbol}</span>
                        <span className="text-sm">{token?.name}</span>
                      </span>
                      {isInWallet && <span className="text-xs font-light">In your wallet</span>}
                    </div>
                  )
                }}
              />
            </div>
          ) : (
            <div className="text-center p-4">{isLoading ? 'Loading tokens...' : searchQuery.trim() && filteredTokens.length === 0 ? 'No tokens found' : 'No tokens'}</div>
          )}
        </div>
      </DialogContent>
    </Dialog>
  )
})

export default SelectToken
