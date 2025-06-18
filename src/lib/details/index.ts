import { GqlPoolType } from '@/lib/generated/graphql'
import { PoolCore, poolTypeLabelMap, PoolWithProtocolVersion } from './types'

export function isWeighted(poolType: GqlPoolType): boolean {
  return poolType === GqlPoolType.Weighted
}

export function isManaged(poolType: GqlPoolType): boolean {
  // Correct terminology is managed pools but subgraph still returns poolType = "Investment"
  return poolType === GqlPoolType.Investment
}

export function isLiquidityBootstrapping(poolType: GqlPoolType): boolean {
  return poolType === GqlPoolType.LiquidityBootstrapping
}

export function isStable(poolType: GqlPoolType): boolean {
  return poolType === GqlPoolType.Stable || poolType === GqlPoolType.MetaStable || poolType === GqlPoolType.ComposableStable
}

export function isMetaStable(poolType: GqlPoolType): boolean {
  return poolType === GqlPoolType.MetaStable
}

export function isComposableStable(poolType: GqlPoolType): boolean {
  return poolType === GqlPoolType.ComposableStable
}

export function isFx(poolType: GqlPoolType | string): boolean {
  return poolType === GqlPoolType.Fx
}

export function isGyro(poolType: GqlPoolType) {
  return [GqlPoolType.Gyro, GqlPoolType.Gyro3, GqlPoolType.Gyroe].includes(poolType)
}

export function isWeightedLike(poolType: GqlPoolType): boolean {
  return isWeighted(poolType) || isManaged(poolType) || isLiquidityBootstrapping(poolType)
}

export function isStableLike(poolType: GqlPoolType): boolean {
  return isStable(poolType) || isMetaStable(poolType) || isComposableStable(poolType) || isFx(poolType) || isGyro(poolType)
}

export function isV3Pool(pool: PoolWithProtocolVersion): boolean {
  return pool.protocolVersion === 3
}

export function isBoosted(pool: Pick<PoolCore, 'protocolVersion' | 'tags'>) {
  return isV3Pool(pool) && pool.tags?.includes('BOOSTED')
}

export function getPoolTypeLabel(type: GqlPoolType): string {
  return poolTypeLabelMap[type] ?? type.replace(/_/g, ' ').toLowerCase()
}
