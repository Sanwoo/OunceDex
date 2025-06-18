import { GqlPoolType } from '../generated/graphql'

export const filtersPoolTypesWithLabel = [
  { type: GqlPoolType.Weighted, label: 'Weighted' },
  { type: GqlPoolType.Stable, label: 'Stable' },
  { type: GqlPoolType.Gyro, label: 'Gyro CLP' },
  { type: GqlPoolType.CowAmm, label: 'CoW AMM' },
  {
    type: GqlPoolType.QuantAmmWeighted,
    label: 'QuantAMM BTF',
  },
]

export const poolTypeFilters = [
  GqlPoolType.Weighted,
  GqlPoolType.Stable,
  GqlPoolType.LiquidityBootstrapping,
  GqlPoolType.Gyro,
  GqlPoolType.CowAmm,
  GqlPoolType.Fx,
  GqlPoolType.QuantAmmWeighted,
] as const

export type PoolFilterType = (typeof poolTypeFilters)[number]

export const POOL_TYPE_MAP: { [key in PoolFilterType]: GqlPoolType[] } = {
  [GqlPoolType.Weighted]: [GqlPoolType.Weighted],
  [GqlPoolType.Stable]: [GqlPoolType.Stable, GqlPoolType.ComposableStable, GqlPoolType.MetaStable],
  [GqlPoolType.LiquidityBootstrapping]: [GqlPoolType.LiquidityBootstrapping],
  [GqlPoolType.Gyro]: [GqlPoolType.Gyro, GqlPoolType.Gyro3, GqlPoolType.Gyroe],
  [GqlPoolType.CowAmm]: [GqlPoolType.CowAmm],
  [GqlPoolType.Fx]: [GqlPoolType.Fx],
  [GqlPoolType.QuantAmmWeighted]: [GqlPoolType.QuantAmmWeighted],
}

export type ProtocolVersion = 1 | 2 | 3
