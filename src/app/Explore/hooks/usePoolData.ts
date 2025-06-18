import { useQuery } from '@apollo/client'
import { useState, useEffect, useMemo } from 'react'
import { uniq } from 'lodash'
import { GetPoolsDocument, GetProtocolStatsDocument, GetProtocolStatsQuery, GqlPoolOrderBy, GqlPoolOrderDirection } from '@/lib/generated/graphql'
import { supportedNetworks } from '@/lib/networks'
import { POOL_TYPE_MAP } from '@/lib/pool-type'
import { FilterState } from './usePoolFilters'
import { bn } from '@/lib/numbers'

const sortingToOrderBy = {
  totalLiquidity: GqlPoolOrderBy.TotalLiquidity,
  volume24h: GqlPoolOrderBy.Volume24h,
  apr: GqlPoolOrderBy.Apr,
}

const usePoolData = (filters: FilterState, searchInput: string) => {
  const [textSearch, setTextSearch] = useState<string | null>(null)

  // Debounce search input
  useEffect(() => {
    const timer = setTimeout(() => {
      setTextSearch(searchInput.trim() || null)
    }, 500)
    return () => clearTimeout(timer)
  }, [searchInput])

  const mappedPoolTypes = useMemo(() => {
    return uniq((filters.poolTypes.length > 0 ? filters.poolTypes : Object.keys(POOL_TYPE_MAP)).map((poolType) => POOL_TYPE_MAP[poolType as keyof typeof POOL_TYPE_MAP]).flat())
  }, [filters.poolTypes])

  const queryVariables = useMemo(() => {
    return {
      first: filters.pageSize,
      orderBy: sortingToOrderBy[filters.orderBy as keyof typeof sortingToOrderBy] || GqlPoolOrderBy.TotalLiquidity,
      orderDirection: filters.orderDirection === 'desc' ? GqlPoolOrderDirection.Desc : GqlPoolOrderDirection.Asc,
      skip: (filters.currentPage - 1) * filters.pageSize,
      textSearch,
      where: {
        chainIn: filters.networks.length > 0 ? filters.networks : supportedNetworks,
        minTvl: filters.minTvl,
        poolTypeIn: mappedPoolTypes,
        protocolVersionIn: filters.protocolVersions[0] ? filters.protocolVersions : undefined,
        tagIn: filters.poolCategories.length > 0 ? (filters.hooks.length > 0 ? filters.poolCategories.concat(filters.hooks) : filters.poolCategories) : filters.hooks.length > 0 ? filters.hooks : null,
        userAddress: null,
        tagNotIn: ['BLACK_LISTED'],
      },
    }
  }, [filters, textSearch, mappedPoolTypes])

  const {
    data: poolData,
    loading,
    error,
  } = useQuery(GetPoolsDocument, {
    variables: queryVariables,
  })

  const { data: protocolData }: { data: GetProtocolStatsQuery | undefined } = useQuery(GetProtocolStatsDocument, {
    variables: { chains: supportedNetworks },
    context: {
      fetchOptions: {
        next: { revalidate: 600 },
      },
    },
  })

  const totalFees = useMemo(() => {
    if (!protocolData?.protocolMetricsAggregated) return '0'

    const surplus24h = protocolData.protocolMetricsAggregated.surplus24h
    const fees = [
      {
        label: 'Swap fees',
        value: protocolData.protocolMetricsAggregated.swapFee24h,
      },
      {
        label: 'Yield-bearing tokens',
        value: protocolData.protocolMetricsAggregated.yieldCapture24h,
      },
    ]

    if (surplus24h && surplus24h !== '0') {
      fees.push({
        label: 'CoW AMM LVR surplus',
        value: surplus24h,
      })
    }

    return fees
      .reduce((sum, fee) => {
        return sum.plus(bn(fee.value || 0))
      }, bn(0))
      .toString()
  }, [protocolData])

  return {
    poolData,
    protocolData,
    totalFees,
    loading,
    error,
    totalCount: poolData?.count || 0,
  }
}

export default usePoolData
