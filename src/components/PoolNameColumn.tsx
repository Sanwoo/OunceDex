import { GqlPoolTokenDetail, GqlPoolType } from '@/lib/generated/graphql'
import React from 'react'
import { Badge } from './ui/badge'
import { fallbackSVG, needFallBackSVG } from '@/lib/utils'
import { fNum } from '@/lib/numbers'
import { isStableLike } from '@/lib/details'
import Image from 'next/image'

const NestedPoolBadge = ({ token, type, isNestedPoolFallBack }: { token: GqlPoolTokenDetail; type: GqlPoolType; isNestedPoolFallBack: boolean }) => {
  if (isNestedPoolFallBack) {
    return (
      <Badge className="bg-purple-900/30 text-purple-100 border border-purple-300/30 rounded-md transition-all duration-200 ">
        {token.nestedPool!.tokens.map((nestedToken, index) => {
          return (
            <Image
              src={nestedToken.logoURI ? nestedToken.logoURI : fallbackSVG(nestedToken.address)}
              alt={nestedToken.symbol}
              width={20}
              height={20}
              className={index === 0 ? '' : '-ml-3'}
              key={nestedToken.id}
              loading="lazy"
              unoptimized
            ></Image>
          )
        })}
        {token.nestedPool!.tokens.length < 5 && <span>{token.name}</span>}
        {isStableLike(type) ? <></> : <span>{fNum('weight', token.weight || '')}</span>}
      </Badge>
    )
  } else {
    return (
      <Badge className="bg-purple-900/30 text-purple-100 border border-purple-300/30 rounded-md transition-all duration-200 ">
        {token.nestedPool!.tokens.map((nestedToken, index) => {
          return (
            <div className={`${index === 0 ? '' : '-ml-3'} w-5 h-5`} key={nestedToken.id}>
              {nestedToken.logoURI && <Image src={nestedToken.logoURI} alt={nestedToken.symbol} width={20} height={20} key={nestedToken.id} loading="lazy" unoptimized></Image>}
            </div>
          )
        })}
        {token.nestedPool!.tokens.length < 5 && <span>{token.name}</span>}
        {isStableLike(type) ? <></> : <span>{fNum('weight', token.weight || '')}</span>}
      </Badge>
    )
  }
}

const PoolBadge = ({ tokens, token, type, isTokensFallBack }: { tokens: GqlPoolTokenDetail[]; token: GqlPoolTokenDetail; type: GqlPoolType; isTokensFallBack: boolean }) => {
  if (isTokensFallBack) {
    return (
      <Badge className="bg-purple-900/30 text-purple-100 border border-purple-300/30 rounded-md transition-all duration-200 ">
        <Image src={token.logoURI ? token.logoURI : fallbackSVG(token.address)} alt={token.symbol} width={20} height={20} loading="lazy" unoptimized></Image>
        {tokens.length < 5 && <span>{token.symbol}</span>}
        {isStableLike(type) ? <></> : <span>{fNum('weight', token.weight || '')}</span>}
      </Badge>
    )
  } else {
    return (
      <>
        {token.logoURI && (
          <Badge className="bg-purple-900/30 text-purple-100 border border-purple-300/30 rounded-md transition-all duration-200 ">
            <Image src={token.logoURI} alt={token.symbol} width={20} height={20} loading="lazy" unoptimized></Image>
            {tokens.length < 5 && <span>{token.symbol}</span>}
            {isStableLike(type) ? <></> : <span>{fNum('weight', token.weight || '')}</span>}
          </Badge>
        )}
      </>
    )
  }
}

const PoolNameColumn = ({ tokens, type }: { tokens: GqlPoolTokenDetail[]; type: GqlPoolType }) => {
  const isTokensFallBack = needFallBackSVG(tokens)
  return (
    <div className="flex felx-row gap-1 flex-wrap">
      {tokens.map((token) => {
        const isNestedPoolFallBack = token.nestedPool ? needFallBackSVG(token.nestedPool.tokens) : false
        return token.hasNestedPool ? (
          <NestedPoolBadge type={type} token={token} key={token.id} isNestedPoolFallBack={isNestedPoolFallBack} />
        ) : (
          <PoolBadge tokens={tokens} token={token} type={type} key={token.id} isTokensFallBack={isTokensFallBack} />
        )
      })}
    </div>
  )
}

export default PoolNameColumn
