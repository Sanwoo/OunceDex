import { Slider } from "@/components/ui/slider";
import React from "react";

const MinTvlFilter = ({
  minTvl,
  onMinTvlChange,
}: {
  minTvl: number;
  onMinTvlChange: (value: number[]) => void;
}) => {
  return (
    <div className="space-y-1 text-purple-100">
      <h3 className="text-sm font-medium">Minimum TVL</h3>
      <div className="rounded-lg p-3 border border-purple-200/40 space-y-4">
        <div className="flex justify-between items-center">
          <span className="text-sm font-medium">
            ${minTvl.toLocaleString()}
          </span>
          <span className="text-sm">Max: $100m</span>
        </div>
        <Slider
          value={[minTvl]}
          onValueChange={onMinTvlChange}
          max={100000000}
          step={1000}
          className="hover:cursor-pointer w-full [&_[role=slider]]:bg-purple-500 [&_[role=slider]]:border-purple-400 [&_.bg-primary]:bg-gradient-to-r [&_.bg-primary]:from-purple-500 [&_.bg-primary]:to-blue-500"
        />
      </div>
    </div>
  );
};

export default MinTvlFilter;
