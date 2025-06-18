import React from 'react'
import { Badge } from './ui/badge'
import Image from 'next/image'
import { getPoolTypeLabel, isBoosted } from '@/lib/details'
import { GqlPoolMinimal, GqlPoolType } from '@/lib/generated/graphql'
import useGetErc4626Metadata from '@/hooks/useGetErc4626Metadata'

const DetailsColumn = ({ pool }: { pool: GqlPoolMinimal }) => {
  const Erc4626Metadata = useGetErc4626Metadata(pool)
  return (
    <div className="flex flex-row items-center gap-2">
      {pool.type === GqlPoolType.CowAmm ? (
        <Badge className="bg-purple-900/30 text-purple-100 border border-purple-300/30 rounded-full flex items-center justify-center h-7 w-7 transition-all duration-200">
          <svg fill="none" height={36} viewBox="0 0 36 24" width={36} xmlns="http://www.w3.org/2000/svg" className="scale-150">
            <path
              clipRule="evenodd"
              d="M13.653 24a4.011 4.011 0 0 1-3.824-2.79l-2.212-6.95a2.285 2.285 0 0 0-2.177-1.593 4.011 4.011 0 0 1-3.825-2.791L.777 7.241A1.873 1.873 0 0 1 2.56 4.8h.614c1.233 0 1.969-1.374 1.285-2.4C3.777 1.374 4.513 0 5.746 0h24.508c1.233 0 1.969 1.374 1.286 2.4-.683 1.026.052 2.4 1.285 2.4h.614a1.873 1.873 0 0 1 1.784 2.44l-.838 2.636a4.011 4.011 0 0 1-3.825 2.79c-.995 0-1.876.645-2.177 1.593l-2.212 6.95A4.011 4.011 0 0 1 22.346 24h-8.693ZM11.6 10.333c0 1.289.965 2.334 2.156 2.334 1.19 0 2.155-1.045 2.155-2.334 0-1.288-.965-2.333-2.155-2.333S11.6 9.045 11.6 10.333Zm12.8 0c0 1.289-.965 2.334-2.156 2.334-1.19 0-2.155-1.045-2.155-2.334 0-1.288.965-2.333 2.155-2.333S24.4 9.045 24.4 10.333Z"
              fill="currentColor"
              fillRule="evenodd"
            />
          </svg>
        </Badge>
      ) : pool.protocolVersion === 2 || 3 ? (
        <Badge className="bg-purple-900/30 text-purple-100 border border-purple-300/30 rounded-full px-2.5 py-1 flex items-center justify-center h-7 w-7 transition-all duration-200">
          v{pool.protocolVersion}
        </Badge>
      ) : (
        <></>
      )}
      <span>{isBoosted(pool) ? 'Boosted' : getPoolTypeLabel(pool.type)}</span>
      {Erc4626Metadata.map((metadata) => (
        <Image key={metadata.id} alt={metadata.name} src={metadata.iconUrl || ''} width={18} height={18} loading="lazy"></Image>
      ))}
      {pool.hook ? (
        <Badge className="bg-purple-900/30 text-purple-100 border border-purple-300/30 rounded-full flex items-center justify-center h-5 w-5 p-0.5 transition-all duration-200">
          <svg fill="none" height="100%" stroke="currentColor" strokeLinecap="round" strokeLinejoin="round" strokeWidth="1.5" viewBox="0 0 24 24" width="100%" xmlns="http://www.w3.org/2000/svg">
            <path d="M16 9v6a5 5 0 0 1-10 0v-4l3 3" />
            <path d="M14 7a2 2 0 1 0 4 0 2 2 0 1 0-4 0M16 5V3" />
          </svg>
        </Badge>
      ) : (
        <></>
      )}
    </div>
  )
}

export default DetailsColumn
