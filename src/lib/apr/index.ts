import { PoolCore } from "../details/types";
import { GqlPoolAprItem, GqlPoolAprItemType } from "../generated/graphql";
import { bn, fNum } from "../numbers";

// Types that must be added to the total base
const TOTAL_BASE_APR_TYPES = [
  GqlPoolAprItemType.SwapFee_24H,
  GqlPoolAprItemType.IbYield,
  GqlPoolAprItemType.Staking,
  GqlPoolAprItemType.Merkl,
  GqlPoolAprItemType.Surplus_24H,
  GqlPoolAprItemType.VebalEmissions,
  GqlPoolAprItemType.MabeetsEmissions,
];

// Types that must be added to the total APR
export const TOTAL_APR_TYPES = [
  ...TOTAL_BASE_APR_TYPES,
  GqlPoolAprItemType.Voting,
  GqlPoolAprItemType.Locking,
  GqlPoolAprItemType.StakingBoost,
];

export function getTotalApr(
  aprItems: GqlPoolAprItem[],
  vebalBoost?: string
): string {
  let minTotal = bn(0);
  let maxTotal = bn(0);
  const boost = vebalBoost || 1;
  aprItems
    .filter((item) => TOTAL_APR_TYPES.includes(item.type))
    .forEach((item) => {
      if (item.type === GqlPoolAprItemType.StakingBoost) {
        maxTotal = bn(item.apr).times(boost).plus(maxTotal);
        return;
      }

      if (item.type === GqlPoolAprItemType.VebalEmissions) {
        minTotal = bn(item.apr).plus(minTotal);
        maxTotal = bn(item.apr).plus(maxTotal);
        return;
      }

      if (item.type === GqlPoolAprItemType.MabeetsEmissions) {
        minTotal = bn(item.apr).plus(minTotal);
        maxTotal = bn(item.apr).plus(maxTotal);
        return;
      }

      minTotal = bn(item.apr).plus(minTotal);
      maxTotal = bn(item.apr).plus(maxTotal);
    });
  if (minTotal.eq(maxTotal) || vebalBoost) {
    return fNum("apr", minTotal.toString());
  } else {
    return `${fNum("apr", minTotal.toString())} - ${fNum(
      "apr",
      maxTotal.toString()
    )}`;
  }
}

export function checkPoints(pool: Pick<PoolCore, "tags">) {
  return pool.tags?.includes("POINTS");
}
