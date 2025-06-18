import React from 'react'
import { Alert, AlertDescription, AlertTitle } from './ui/alert'

const SwapSimulationError = ({ errorMessage }: { errorMessage: string }) => {
  if (errorMessage?.includes('Must contain at least 1 path')) {
    return (
      <Alert variant="default" className="bg-white/5 backdrop-blur-md border border-red-400/30 shadow-lg shadow-purple-900/20 rounded-lg py-2 animate-pulse-subtle">
        <AlertTitle className="pl-6 text-red-400/90 text-sm font-medium">Not enough liquidity on OunceDex</AlertTitle>
        <AlertDescription className="text-purple-100/75 text-xs mt-1.5 pl-6 leading-relaxed flex-wrap flex">
          Your swap amount is too high to find a route through the available liquidity on OunceDex. Try reducing your swap size or try others.
        </AlertDescription>
      </Alert>
    )
  }

  if (errorMessage === 'Apollo network error in DefaultSwapHandler') {
    return (
      <Alert variant="default" className="bg-white/5 backdrop-blur-md border border-red-400/30 shadow-lg shadow-purple-900/20 rounded-lg py-2 animate-pulse-subtle">
        <AlertTitle className="pl-6 text-red-400/90 text-sm font-medium">Network error happened</AlertTitle>
        <AlertDescription className="text-purple-100/75 text-xs mt-1.5 pl-6 leading-relaxed flex-wrap flex">
          It looks like there was a network error while fetching the swap. Please check your internet connection and try again. You can report the problem in
        </AlertDescription>
      </Alert>
    )
  }

  return (
    <Alert variant="default" className="bg-white/5 backdrop-blur-md border border-red-400/30 shadow-lg shadow-purple-900/20 rounded-lg py-2 animate-pulse-subtle">
      <AlertTitle className="pl-6 text-red-400/90 text-sm font-medium">Error fetching swap</AlertTitle>
      <AlertDescription className="text-purple-100/75 text-xs mt-1.5 pl-6 leading-relaxed flex-wrap flex">
        {errorMessage ? (/WrapAmountTooSmall/.test(errorMessage) ? 'Your input is too small, please try a bigger amount.' : errorMessage) : 'Unknown error'}
      </AlertDescription>
    </Alert>
  )
}

export default SwapSimulationError
