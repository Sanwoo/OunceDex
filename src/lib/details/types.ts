import {
  GetPoolQuery,
  GetPoolsQuery,
  GetTokensQuery,
  GqlNestedPool,
  GqlPoolType,
} from "../generated/graphql";

export type ApiToken = Omit<GetTokensQuery["tokens"][0], "__typename"> & {
  index?: number; // Only used in add/remove to have access to the wrapped token from the underlying token
  wrappedToken?: ApiToken; // Only used in add/remove to have access to the wrapped token from the underlying token
  underlyingToken?: ApiToken;
  useWrappedForAddRemove?: boolean;
  useUnderlyingForAddRemove?: boolean;
  weight?: string;
};

export type Pool = GetPoolQuery["pool"];

export type PoolList = GetPoolsQuery["pools"];

export type PoolListItem = PoolList[0];

type ApiTokenWithNestedPool = ApiToken & { nestedPool?: GqlNestedPool };

export type VotingPool = Pick<
  PoolListItem,
  | "id"
  | "address"
  | "chain"
  | "type"
  | "symbol"
  // We need these fields to display boosted underlying tokens in pool token pills (shared by voting, portfolio and standard pool list)
  | "protocolVersion"
  | "hasErc4626"
  // We need tags to display erc4626Metadata in PoolListTableDetailsCell
  | "tags"
  // We need hook to show when the pool has hooks in the voting list
  | "hook"
> & { poolTokens: ApiTokenWithNestedPool[] };

export type PoolCore = VotingPool | Pool | PoolListItem;

export type PoolWithProtocolVersion = Pick<PoolCore, "protocolVersion">;

export const poolTypeLabelMap: { [key in GqlPoolType]: string } = {
  [GqlPoolType.Weighted]: "Weighted",
  [GqlPoolType.Element]: "Element",
  [GqlPoolType.Gyro]: "Gyro 2-CLP",
  [GqlPoolType.Gyro3]: "Gyro 3-CLP",
  [GqlPoolType.Gyroe]: "Gyro E-CLP",
  [GqlPoolType.Investment]: "Managed",
  [GqlPoolType.LiquidityBootstrapping]: "LBP",
  [GqlPoolType.MetaStable]: "Stable",
  [GqlPoolType.PhantomStable]: "Stable",
  [GqlPoolType.Stable]: "Stable",
  [GqlPoolType.Unknown]: "Unknown",
  [GqlPoolType.Fx]: "FX",
  [GqlPoolType.ComposableStable]: "Stable",
  [GqlPoolType.CowAmm]: "Weighted",
  [GqlPoolType.QuantAmmWeighted]: "BTF",
  [GqlPoolType.Reclamm]: "ReClamm",
};
