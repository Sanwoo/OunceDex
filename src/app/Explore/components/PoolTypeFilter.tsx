import { Checkbox } from "@/components/ui/checkbox";
import { Label } from "@/components/ui/label";
import { GqlPoolType } from "@/lib/generated/graphql";
import { filtersPoolTypesWithLabel } from "@/lib/pool-type";
import React from "react";

const PoolTypeFilter = ({
  poolTypes,
  onPoolTypeChange,
}: {
  poolTypes: GqlPoolType[];
  onPoolTypeChange: (poolType: GqlPoolType, checked: boolean) => void;
}) => {
  return (
    <div className="space-y-1 text-purple-100">
      <h3 className="text-sm font-medium">Pool types</h3>
      <div className="grid grid-cols-2 rounded-lg p-1 border border-purple-200/40">
        {filtersPoolTypesWithLabel.map(({ type, label }) => (
          <div
            key={type}
            className="flex items-center space-x-3 hover:bg-purple-100/50 p-1 rounded-md hover:cursor-pointer"
          >
            <Checkbox
              id={type}
              checked={poolTypes.includes(type)}
              onCheckedChange={(checked) => onPoolTypeChange(type, !!checked)}
              className="border-purple-400/60 data-[state=checked]:bg-purple-500 data-[state=checked]:border-purple-500 rounded-md"
            />
            <Label htmlFor={type} className="cursor-pointer font-medium flex-1">
              {label}
            </Label>
          </div>
        ))}
      </div>
    </div>
  );
};

export default PoolTypeFilter;
