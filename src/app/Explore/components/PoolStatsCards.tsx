import { AnimatedNumber } from "@/components/AnimatedNumber";
import { Card } from "@/components/ui/card";
import { GetProtocolStatsQuery } from "@/lib/generated/graphql";
import { safeToNumber } from "@/lib/numbers";
import React from "react";

const PoolStatsCards = ({
  protocolData,
  totalFees,
}: {
  protocolData: GetProtocolStatsQuery | undefined;
  totalFees: string;
}) => {
  return (
    <div className="flex flex-row gap-2">
      <Card className="w-30 h-15 flex flex-col items-start p-1.5 gap-1 bg-white/5 border-purple-300/20 backdrop-blur-md shadow-lg">
        <span className="text-purple-200 text-sm">TVL</span>
        <AnimatedNumber
          value={safeToNumber(
            protocolData?.protocolMetricsAggregated.totalLiquidity
          )}
          className="text-emerald-300 font-medium text-lg"
        />
      </Card>
      <Card className="w-30 h-15 flex flex-col items-start p-1.5 gap-1 bg-white/5 border-purple-300/20 backdrop-blur-md shadow-lg">
        <span className="text-purple-200 text-sm">Volume(24h)</span>
        <AnimatedNumber
          value={safeToNumber(
            protocolData?.protocolMetricsAggregated.swapVolume24h
          )}
          className="text-blue-300 font-medium text-lg"
        />
      </Card>
      <Card className="w-30 h-15 flex flex-col items-start p-1.5 gap-1 bg-white/5 border-purple-300/20 backdrop-blur-md shadow-lg">
        <span className="text-purple-200 text-sm">Yield(24h)</span>
        <AnimatedNumber
          value={safeToNumber(totalFees)}
          className="text-amber-300 font-medium text-lg"
        />
      </Card>
    </div>
  );
};

export default PoolStatsCards;
