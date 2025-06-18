'use client'
import React, { useState, useEffect, useRef, useMemo, useCallback } from 'react'
import { Card } from '@/components/ui/card'
import { Popover, PopoverContent, PopoverTrigger } from '@/components/ui/popover'
import { Button } from '@/components/ui/button'
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select'
import { Input } from '@/components/ui/input'
import { Settings, Repeat, Percent, Wallet } from 'lucide-react'
import {
  currencyIconMap,
  getToken,
  scaleTokenAmount,
  SupportedCurrency,
  usdValueForToken,
  SwapState,
  getPriceImpactLabel,
  SupportedChainId,
  TransactionConfig,
  getNativeAssetAddress,
  SdkSimulateSwapResponse,
} from '@/lib/swap'
import Image from 'next/image'
import { getNetworkConfig, supportedNetworks } from '@/lib/networks'
import { debounce } from 'lodash'
import SelectToken from '@/components/SelectToken'
import { GqlChain, GqlSorSwapType } from '@/lib/generated/graphql'
import { Address } from 'viem'
import { useTotalTokens } from '@/store/totalTokensStore'
import { useTokenPrices, useTokenPriceLoading } from '@/store/tokenPricesStore'
import { useCurrency } from '@/hooks/useCurrency'
import { useSimulateSwapQuery } from '@/hooks/useSimulateSwapQuery'
import { useAccount, useSwitchChain } from 'wagmi'
import config from '@/wagmi'
import { useConnectModal } from '@rainbow-me/rainbowkit'
import { usePriceImpact } from '@/hooks/usePriceImpact'
import { PriceImpactAccordion } from '@/components/PriceImpactAccordion'
import useCustomBalance from '@/hooks/useCustomBalance'
import SwapSimulationError from '@/components/SwapSimulationError'
import { bn } from '@/lib/numbers'
import { useBuildSwapQuery } from '@/hooks/useBuildSwapQuery'
import { isSameAddress } from '@/lib/utils'
import { useManagedApproveToken } from '@/hooks/useManagedApproveToken'
import { useSpenderAddress, VaultVersion } from '@/hooks/useSpenderAddress'
import { MAX_UINT256 } from '@balancer/sdk'
import { useManagedSendTransaction } from '@/hooks/useManagedSendTransaction'

const Swap = () => {
  const [swapStateVar, setSwapStateVar] = useState<SwapState>({
    tokenIn: {
      address: '0xeeeeeeeeeeeeeeeeeeeeeeeeeeeeeeeeeeeeeeee' as Address,
      amount: '',
      scaledAmount: BigInt(0),
    },
    tokenOut: {
      address: '' as Address,
      amount: '',
      scaledAmount: BigInt(0),
    },
    swapType: GqlSorSwapType.ExactIn,
    selectedChain: supportedNetworks[0],
  })
  const [currency, setCurrency] = useState<keyof typeof SupportedCurrency>(SupportedCurrency.USD)
  const [slippage, setSlippage] = useState<number>(0)
  const [slippageInputValue, setSlippageInputValue] = useState<string>('')

  const { toCurrency } = useCurrency(SupportedCurrency[currency])
  const totalTokens = useTotalTokens()
  const tokenPrices = useTokenPrices(swapStateVar.selectedChain)
  const isLoadingPrices = useTokenPriceLoading(swapStateVar.selectedChain)
  const account = useAccount({ config })

  const { switchChain } = useSwitchChain()
  const { openConnectModal } = useConnectModal()
  const tokenInBalanceData = useCustomBalance(account.address, swapStateVar.tokenIn.address, getNetworkConfig(swapStateVar.selectedChain).chainId)
  const tokenOutBalanceData = useCustomBalance(account.address, swapStateVar.tokenOut.address, getNetworkConfig(swapStateVar.selectedChain).chainId)

  const {
    data: simulateSwapResult,
    isLoading: simulateSwapIsLoading,
    error: simulateSwapError,
    isError: simulateSwapIsError,
  } = useSimulateSwapQuery({
    swapAmount: swapStateVar.tokenIn.amount,
    swapType: swapStateVar.swapType,
    tokenIn: swapStateVar.tokenIn.address,
    tokenOut: swapStateVar.tokenOut.address,
    chain: swapStateVar.selectedChain,
  })

  const buildSwapResult = useBuildSwapQuery({
    simulateResponse: (simulateSwapResult as SdkSimulateSwapResponse) || ({} as SdkSimulateSwapResponse),
    slippagePercent: slippage.toString(),
    account: account.address || '0x',
    selectedChain: swapStateVar.selectedChain,
    wethIsEth:
      isSameAddress(swapStateVar.tokenIn.address, getNativeAssetAddress(swapStateVar.selectedChain)) || isSameAddress(swapStateVar.tokenOut.address, getNativeAssetAddress(swapStateVar.selectedChain)),
    permit2: undefined,
    tokenIn: swapStateVar.tokenIn,
    tokenOut: swapStateVar.tokenOut,
    swapType: swapStateVar.swapType,
  })
  console.log(simulateSwapResult, 'simulateSwapResult')
  console.log(buildSwapResult, 'buildSwapResult')

  const { priceImpactLevel, calcPriceImpact, priceImpactColor, priceImpact } = usePriceImpact()

  const tokenInInfo = useMemo(() => {
    if (!totalTokens) {
      return
    } else {
      return getToken(swapStateVar.tokenIn.address, swapStateVar.selectedChain, totalTokens)
    }
  }, [swapStateVar.tokenIn.address, swapStateVar.selectedChain, totalTokens])

  const tokenOutInfo = useMemo(() => {
    if (!totalTokens) {
      return
    } else {
      return getToken(swapStateVar.tokenOut.address, swapStateVar.selectedChain, totalTokens)
    }
  }, [swapStateVar.tokenOut.address, swapStateVar.selectedChain, totalTokens])

  const usdValueForTokenIn = useMemo(() => {
    if (!tokenInInfo) {
      return '0'
    } else {
      return usdValueForToken(tokenInInfo, swapStateVar.tokenIn.amount, tokenPrices)
    }
  }, [tokenInInfo, swapStateVar.tokenIn.amount, tokenPrices])

  const usdValueForTokenOut = useMemo(() => {
    if (!tokenOutInfo) {
      return '0'
    } else {
      return usdValueForToken(tokenOutInfo, swapStateVar.tokenOut.amount, tokenPrices)
    }
  }, [tokenOutInfo, swapStateVar.tokenOut.amount, tokenPrices])

  const isDisabled = useMemo(
    () =>
      !swapStateVar.tokenIn.address || !swapStateVar.tokenOut.address || !swapStateVar.tokenIn.amount || swapStateVar.tokenIn.amount === '0' || account.status !== 'connected' || !!simulateSwapIsError,
    [account.status, simulateSwapIsError, swapStateVar.tokenIn.address, swapStateVar.tokenIn.amount, swapStateVar.tokenOut.address],
  )

  const spenderAddress = useSpenderAddress(simulateSwapResult ? ('protocolVersion' in simulateSwapResult ? (simulateSwapResult.protocolVersion as VaultVersion) : 2) : 2, swapStateVar.selectedChain)
  const requestedRawAmount = useMemo(() => BigInt(MAX_UINT256), [])

  const { managedApproveAsync } = useManagedApproveToken({
    tokenInAddress: swapStateVar.tokenIn.address,
    args: [spenderAddress, requestedRawAmount],
    chainId: getNetworkConfig(swapStateVar.selectedChain).chainId as SupportedChainId,
    enabled: !!tokenInInfo, // TODO: add isAllowancesLoading
  })

  const { managedSendAsync } = useManagedSendTransaction({
    txConfig: !!buildSwapResult.data ? buildSwapResult.data : ({} as TransactionConfig),
  })

  const debouncedSetSlippage = useRef(
    debounce((value) => {
      setSlippage(value)
    }, 500),
  ).current

  useEffect(() => {
    return () => {
      debouncedSetSlippage.cancel()
    }
  }, [debouncedSetSlippage])

  useEffect(() => {
    setSwapStateVar((prev) => ({
      ...prev,
      tokenIn: {
        ...prev.tokenIn,
        address: getNetworkConfig(swapStateVar.selectedChain).tokens.defaultSwapTokens.tokenIn as Address,
        amount: '',
        scaledAmount: BigInt(0),
      },
      tokenOut: {
        ...prev.tokenOut,
        address: '' as Address,
        amount: '',
        scaledAmount: BigInt(0),
      },
    }))
  }, [swapStateVar.selectedChain])

  useEffect(() => {
    switchChain({ chainId: getNetworkConfig(swapStateVar.selectedChain).chainId })
  }, [swapStateVar.selectedChain, switchChain])

  useEffect(() => {
    const returnAmount = simulateSwapResult?.returnAmount
    if (returnAmount) {
      setSwapStateVar((prev) => ({
        ...prev,
        tokenOut: {
          ...prev.tokenOut,
          amount: returnAmount,
        },
      }))
    }
  }, [simulateSwapResult?.returnAmount])

  useEffect(() => {
    calcPriceImpact(usdValueForTokenIn, usdValueForTokenOut, simulateSwapResult)
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [usdValueForTokenOut, calcPriceImpact])

  useEffect(() => {
    setSwapStateVar((prev) => ({ ...prev, selectedChain: getNetworkConfig(account.chain?.id).chain }))
  }, [account.chain?.id])

  useEffect(() => {
    if (swapStateVar.tokenIn.amount === '' || bn(swapStateVar.tokenIn.amount).lte(0)) {
      setSwapStateVar((prev) => ({ ...prev, tokenOut: { ...prev.tokenOut, amount: '' } }))
    }
  }, [swapStateVar.tokenIn.amount])

  const handleSlippageChange = useCallback(
    (e: React.ChangeEvent<HTMLInputElement>) => {
      const inputVal = e.target.value
      if (inputVal === '') {
        setSlippageInputValue(inputVal)
        debouncedSetSlippage(0)
      } else if (/^(?!-)\d*\.?\d{0,2}$/.test(inputVal)) {
        const temp = parseFloat(inputVal) > 50 ? slippageInputValue : inputVal
        setSlippageInputValue(temp)
        debouncedSetSlippage(parseFloat(temp))
      }
    },
    [debouncedSetSlippage, slippageInputValue],
  )

  const handleTokenAmountChange = useCallback(
    (e: React.ChangeEvent<HTMLInputElement>) => {
      const value = e.target.value
      if (value === '' || /^(?!-)\d*\.?\d{0,8}$/.test(value)) {
        if (!!tokenInInfo) {
          setSwapStateVar((prev) => ({ ...prev, tokenIn: { ...prev.tokenIn, amount: value, scaledAmount: scaleTokenAmount(value, tokenInInfo) } }))
        } else {
          setSwapStateVar((prev) => ({ ...prev, tokenIn: { ...prev.tokenIn, amount: value } }))
        }
      }
    },
    [tokenInInfo],
  )

  const handleSwitchTokens = useCallback(() => {
    setSwapStateVar((prev) => ({
      ...prev,
      tokenIn: { address: prev.tokenOut.address, amount: '', scaledAmount: BigInt(0) },
      tokenOut: { address: prev.tokenIn.address, amount: '', scaledAmount: BigInt(0) },
    }))
  }, [])

  const handleSwap = useCallback(async () => {
    if (!!managedApproveAsync) {
      await managedApproveAsync()
    }
    if (!!managedSendAsync) {
      await managedSendAsync()
    }
  }, [managedApproveAsync, managedSendAsync])

  const handleConnectWalletOrSwap = useCallback(() => {
    if (account.status !== 'connected' && !!openConnectModal) {
      openConnectModal()
    } else {
      handleSwap()
    }
  }, [account.status, openConnectModal, handleSwap])

  const isZero = (balance: string | undefined) => {
    if (!!balance) {
      return Number(balance) === 0
    } else {
      return true
    }
  }

  const isExceeds = (balance: string | undefined, symbol: string | undefined) => {
    if (symbol === tokenInBalanceData.data?.symbol && Number(swapStateVar.tokenIn.amount) > Number(balance)) {
      return true
    }
  }

  const formatBalance = (balanceStr: string | undefined): string => {
    if (!balanceStr) return '0'
    const balance = parseFloat(balanceStr)
    if (balance === 0) return '0'
    if (balance > 0 && balance < 0.0001) {
      return '<0.0001'
    }
    return balance.toFixed(4).replace(/\.?0+$/, '')
  }

  return (
    <div className="flex justify-center">
      <Card className="w-140 mt-8 bg-white/10 backdrop-blur-md rounded-2xl p-6 border border-white/20 flex flex-col gap-4">
        <div className="flex flex-row justify-between">
          <h4 className="text-white/95">Swap</h4>
          <Popover>
            <PopoverTrigger asChild>
              <div className="flex flex-row gap-2 items-center">
                <span className="text-purple-100">Slippage: {slippage}%</span>
                <Settings className="text-purple-100 rounded-full hover:text-gray-800 hover:cursor-pointer hover:rotate-90 duration-300" />
              </div>
            </PopoverTrigger>
            <PopoverContent align="end" sideOffset={10} className="w-70 backdrop-blur-md bg-white/5 flex flex-col gap-5 border-purple-300/50">
              <h5 className="text-purple-100">Transaction settings</h5>
              <div className="flex flex-col gap-2">
                <h6 className="text-purple-100">Currency</h6>
                <Select value={currency} onValueChange={(value: SupportedCurrency) => setCurrency(value)}>
                  <SelectTrigger
                    className="w-full border-purple-300/50 text-purple-100 data-[placeholder]:text-purple-100 focus-visible:border-purple-400/50 focus-visible:ring-purple-400/20 focus-visible:ring-[1px] hover:cursor-pointer"
                    iconClassName="text-purple-100"
                  >
                    <SelectValue placeholder={SupportedCurrency.USD} />
                  </SelectTrigger>
                  <SelectContent className="bg-white/5 backdrop-blur-md text-purple-100 border-purple-300/50">
                    {Object.values(SupportedCurrency).map((cur) => (
                      <SelectItem value={cur} className="hover:cursor-pointer" key={cur}>
                        <Image src={currencyIconMap[cur]} width={20} height={20} alt={currencyIconMap[cur]} />
                        {cur}
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>
              <div className="flex flex-col gap-2">
                <h5 className="text-purple-100">Slippage</h5>
                <div className="relative">
                  <Input
                    value={slippageInputValue}
                    onChange={handleSlippageChange}
                    className="w-full pr-10 border-purple-300/20 backdrop-blur-md text-purple-100 focus-visible:border-purple-400/50 focus-visible:ring-purple-400/20 focus-visible:ring-[1px]"
                  />
                  <Percent className="absolute right-3 top-1/2 transform -translate-y-1/2 text-purple-300 w-5 h-5" />
                </div>
                <div className="flex flex-row gap-2">
                  <Button
                    className="backdrop-blur-md bg-white/5 hover:bg-white/10 hover:cursor-pointer"
                    onClick={() => {
                      setSlippage(0.5)
                      setSlippageInputValue('0.5')
                    }}
                  >
                    0.5%
                  </Button>
                  <Button
                    className="backdrop-blur-md bg-white/5 hover:bg-white/10 hover:cursor-pointer"
                    onClick={() => {
                      setSlippage(1)
                      setSlippageInputValue('1')
                    }}
                  >
                    1%
                  </Button>
                  <Button
                    className="backdrop-blur-md bg-white/5 hover:bg-white/10 hover:cursor-pointer"
                    onClick={() => {
                      setSlippage(2)
                      setSlippageInputValue('2')
                    }}
                  >
                    2%
                  </Button>
                </div>
              </div>
            </PopoverContent>
          </Popover>
        </div>
        <Select
          value={swapStateVar.selectedChain}
          onValueChange={(value: GqlChain) => {
            setSwapStateVar((prev) => ({ ...prev, selectedChain: value }))
          }}
        >
          <SelectTrigger
            iconClassName="text-purple-100"
            className="w-full border-purple-300/50 text-purple-100 data-[placeholder]:text-purple-100 focus-visible:border-purple-400/50 focus-visible:ring-purple-400/20 focus-visible:ring-[1px] hover:cursor-pointer"
          >
            <SelectValue placeholder={supportedNetworks[0]} />
          </SelectTrigger>
          <SelectContent className="bg-white/5 backdrop-blur-md text-purple-100 border-purple-300/50">
            {supportedNetworks.map((net) => (
              <SelectItem key={net} className="hover:cursor-pointer hover:bg-white/10" value={net}>
                <Image src={getNetworkConfig(net).iconPath} width={20} height={20} alt={getNetworkConfig(net).iconPath} />
                {getNetworkConfig(net).shortName}
              </SelectItem>
            ))}
          </SelectContent>
        </Select>
        <div className="flex flex-col items-center">
          <div className="w-full flex flex-col gap-1 pt-2 pb-1 border-purple-300/50 border-1 bg-white/1 rounded-lg">
            <div className="w-full flex flex-row items-center">
              <Input
                className="w-full flex-grow border-0 ring-0 focus-visible:ring-[0px] text-purple-100 text-2xl md:text-2xl placeholder-purple-300/50"
                placeholder="0.0"
                value={swapStateVar.tokenIn.amount}
                onChange={handleTokenAmountChange}
              />
              <SelectToken
                network={swapStateVar.selectedChain}
                tokenAddress={swapStateVar.tokenIn.address}
                userAddress={account.address}
                onTokenSelect={(token) => {
                  if (token.address === swapStateVar.tokenOut.address) {
                    setSwapStateVar((prev) => ({ ...prev, tokenIn: { ...prev.tokenIn, address: token.address as Address }, tokenOut: { address: '' as Address, amount: '', scaledAmount: BigInt(0) } }))
                  } else {
                    setSwapStateVar((prev) => ({ ...prev, tokenIn: { ...prev.tokenIn, address: token.address as Address } }))
                  }
                }}
              />
            </div>
            <span className="w-full text-sm text-purple-300/70 flex flex-row justify-between">
              <span className="ml-3">
                {isLoadingPrices
                  ? 'Loading price...'
                  : swapStateVar.tokenIn.amount && swapStateVar.tokenIn.amount !== '0'
                    ? `${toCurrency(usdValueForTokenIn, { abbreviated: false })}`
                    : `${toCurrency(0, { abbreviated: false })}`}
              </span>
              <span
                className={`${isZero(tokenInBalanceData.data?.formatted) || isExceeds(tokenInBalanceData.data?.formatted, tokenInBalanceData.data?.symbol) ? 'text-red-400/80' : ''} mr-4 flex flex-row gap-1 items-center`}
              >
                {isExceeds(tokenInBalanceData.data?.formatted, tokenInBalanceData.data?.symbol) ? 'Exceeds balance' : ''} {formatBalance(tokenInBalanceData.data?.formatted)} <Wallet size={16} />
              </span>
            </span>
          </div>

          <Repeat className="text-white/90 rounded-full p-1.25 hover:bg-white/20 hover:cursor-pointer" onClick={handleSwitchTokens} />

          <div className="w-full flex flex-col gap-1 pt-2 pb-1 border-purple-300/50 border-1 bg-white/5 rounded-lg">
            <div className="w-full flex flex-row items-center">
              <Input
                className="w-full flex-grow border-0 ring-0 focus-visible:ring-[0px] text-purple-100 text-2xl md:text-2xl placeholder-purple-300/50"
                placeholder="0.0"
                value={swapStateVar.tokenOut.amount}
                disabled
              />
              <SelectToken
                network={swapStateVar.selectedChain}
                tokenAddress={swapStateVar.tokenOut.address}
                userAddress={account.address}
                onTokenSelect={(token) => {
                  if (token.address === swapStateVar.tokenIn.address) {
                    setSwapStateVar((prev) => ({
                      ...prev,
                      tokenOut: { ...prev.tokenOut, address: token.address as Address },
                      tokenIn: { address: '' as Address, amount: '', scaledAmount: BigInt(0) },
                    }))
                  } else {
                    setSwapStateVar((prev) => ({ ...prev, tokenOut: { ...prev.tokenOut, address: token.address as Address } }))
                  }
                }}
              />
            </div>
            <span className="w-full text-sm text-purple-300/70 flex flex-row justify-between">
              <span className={`${priceImpactColor} ml-3`}>
                {isLoadingPrices || simulateSwapIsLoading
                  ? 'Calculating...'
                  : swapStateVar.tokenOut.amount && swapStateVar.tokenOut.amount !== '0'
                    ? `${toCurrency(usdValueForTokenOut, { abbreviated: false })}${getPriceImpactLabel(priceImpact)}`
                    : `${toCurrency(0, { abbreviated: false })}`}
              </span>
              <span className={`${isZero(tokenOutBalanceData.data?.formatted) ? 'text-red-400/80' : ''}  mr-4 flex flex-row gap-1 items-center`}>
                {formatBalance(tokenOutBalanceData.data?.formatted)} <Wallet size={16} />
              </span>
            </span>
          </div>
        </div>
        {!!simulateSwapResult && !!swapStateVar.tokenIn.amount && (
          <PriceImpactAccordion
            priceImpactLevel={priceImpactLevel}
            priceImpactColor={priceImpactColor}
            tokenInInfo={tokenInInfo}
            tokenOutInfo={tokenOutInfo}
            simulateSwapResult={simulateSwapResult}
            tokenPrices={tokenPrices}
            toCurrency={toCurrency}
            priceImpact={priceImpact}
            usdValueForTokenOut={usdValueForTokenOut}
            slippage={slippage}
            tokenOutAmount={swapStateVar.tokenOut.amount}
          />
        )}
        {simulateSwapIsError ? <SwapSimulationError errorMessage={simulateSwapError.message} /> : null}
        <Button
          className="bg-purple-600 hover:bg-purple-700 text-white font-medium py-6 hover:cursor-pointer disabled:!pointer-events-auto disabled:cursor-not-allowed"
          onClick={handleConnectWalletOrSwap}
          disabled={isDisabled}
        >
          {account.status !== 'connected' ? 'Connect Wallet' : !swapStateVar.tokenIn.address || !swapStateVar.tokenOut.address ? 'Select tokens' : 'Swap'}
        </Button>
      </Card>
    </div>
  )
}

export default Swap
