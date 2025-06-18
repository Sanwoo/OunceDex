'use client'

import { ColumnDef } from '@tanstack/react-table'
import Image from 'next/image'
import { GqlPoolMinimal } from '@/lib/generated/graphql'
import { getNetworkConfig } from '@/lib/networks/index'
import { formatShort } from '@/lib/numbers/index'
import { checkPoints, getTotalApr } from '@/lib/apr'
import { ArrowDown, ArrowUp, ArrowUpDown } from 'lucide-react'
import PoolNameColumn from './PoolNameColumn'
import DetailsColumn from './DetailsColumn'
// This type is used to define the shape of our data.
// You can use a Zod schema here if you want.

const columns: ColumnDef<GqlPoolMinimal>[] = [
  {
    accessorKey: 'chain',
    header: () => (
      <div className="flex items-center justify-center">
        <Image src="/globe.svg" alt="Pool" width={16} height={16} loading="lazy" />
      </div>
    ),
    cell: ({ row }) => (
      <div className="flex justify-center items-center">
        <Image src={getNetworkConfig(row.original.chain).iconPath} alt={getNetworkConfig(row.original.chain).shortName} width={20} height={20} loading="lazy" />
      </div>
    ),
    size: 60,
  },
  // pool name
  {
    accessorKey: 'name',
    header: 'Pool name',
    cell: ({ row }) => {
      return <PoolNameColumn type={row.original.type} tokens={row.original.poolTokens} />
    },
    size: 300,
  },
  // details
  {
    accessorKey: 'type',
    header: 'Details',
    cell: ({ row }) => {
      return <DetailsColumn pool={row.original} />
    },
    size: 150,
  },
  // TVL
  {
    accessorKey: 'totalLiquidity',
    header: ({ column }) => {
      return (
        <div
          className="flex items-center justify-center gap-1 cursor-pointer hover:text-purple-50 hover:bg-purple-900/30 p-2 rounded-md transition-all duration-200"
          onClick={() => column.toggleSorting(column.getIsSorted() ? column.getIsSorted() === 'asc' : true)}
        >
          <span className={column.getIsSorted() ? 'text-purple-400 font-semibold' : ''}>TVL</span>
          <div className={column.getIsSorted() ? 'text-purple-400' : ''}>
            {column.getIsSorted() === 'asc' ? <ArrowUp className="h-4 w-4" /> : column.getIsSorted() === 'desc' ? <ArrowDown className="h-4 w-4" /> : <ArrowUpDown className="h-4 w-4" />}
          </div>
        </div>
      )
    },
    cell: ({ row }) => {
      const value = Number(row.original.dynamicData.totalLiquidity)
      const formattedFull = value.toLocaleString()
      return (
        <div className="font-medium text-emerald-300 flex justify-center" title={`$${formattedFull}`}>
          {formatShort(value)}
        </div>
      )
    },
    size: 100,
  },
  // Volume
  {
    accessorKey: 'volume24h',
    header: ({ column }) => {
      return (
        <div
          className="flex items-center justify-center gap-1 cursor-pointer hover:text-purple-50 hover:bg-purple-900/30 p-2 rounded-md transition-all duration-200"
          onClick={() => column.toggleSorting(column.getIsSorted() ? column.getIsSorted() === 'asc' : true)}
        >
          <span className={column.getIsSorted() ? 'text-purple-400 font-semibold' : ''}>Volume(24h)</span>
          <div className={column.getIsSorted() ? 'text-purple-400' : ''}>
            {column.getIsSorted() === 'asc' ? (
              <ArrowUp className="h-4 w-4" />
            ) : column.getIsSorted() === 'desc' ? (
              <ArrowDown className="h-4 w-4" />
            ) : (
              <div className="flex flex-row h-4">
                <ArrowUpDown className="h-4 w-4" />
              </div>
            )}
          </div>
        </div>
      )
    },
    cell: ({ row }) => {
      const value = Number(row.original.dynamicData.volume24h)
      const formattedFull = value.toLocaleString()
      return (
        <div className="font-medium text-blue-300 flex justify-center" title={`$${formattedFull}`}>
          {formatShort(value)}
        </div>
      )
    },
    size: 100,
  },
  // APR
  {
    accessorKey: 'apr',
    header: ({ column }) => {
      return (
        <div
          className="flex items-center justify-center gap-1 cursor-pointer hover:text-purple-50 hover:bg-purple-900/30 p-2 rounded-md transition-all duration-200"
          onClick={() => column.toggleSorting(column.getIsSorted() ? column.getIsSorted() === 'asc' : true)}
        >
          <span className={column.getIsSorted() ? 'text-purple-400 font-semibold' : ''}>APR</span>
          <div className={column.getIsSorted() ? 'text-purple-400' : ''}>
            {column.getIsSorted() === 'asc' ? (
              <ArrowUp className="h-4 w-4" />
            ) : column.getIsSorted() === 'desc' ? (
              <ArrowDown className="h-4 w-4" />
            ) : (
              <div className="flex flex-row h-4">
                <ArrowUpDown className="h-4 w-4" />
              </div>
            )}
          </div>
        </div>
      )
    },
    cell: ({ row }) => {
      const res = getTotalApr(row.original.dynamicData.aprItems)
      return (
        <div className="flex flex-row gap-2 justify-center">
          <span>{res}</span>
          {checkPoints(row.original) && <Image alt="points" src="/images/icons/pool-points.svg" width={12} height={12} loading="lazy" />}
        </div>
      )
    },
    size: 100,
  },
]

export default columns
