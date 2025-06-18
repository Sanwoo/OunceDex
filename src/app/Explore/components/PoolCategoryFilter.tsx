import { Checkbox } from "@/components/ui/checkbox";
import { Label } from "@/components/ui/label";
import { poolCategoriesWithLabel } from "@/lib/pool-category";
import React from "react";

const PoolCategoryFilter = ({
  poolCategories,
  onPoolCategoryChange,
}: {
  poolCategories: string[];
  onPoolCategoryChange: (category: string, checked: boolean) => void;
}) => {
  return (
    <div className="space-y-1 text-purple-100">
      <h3 className="text-sm font-medium">Pool categories</h3>
      <div className="grid grid-cols-2 rounded-lg p-1 border border-purple-200/40">
        {poolCategoriesWithLabel.map(({ type, label }) => (
          <div
            key={type}
            className="flex items-center space-x-3 hover:bg-purple-100/50 p-1 rounded-md hover:cursor-pointer"
          >
            <Checkbox
              id={type}
              checked={poolCategories.includes(type)}
              onCheckedChange={(checked) =>
                onPoolCategoryChange(type, !!checked)
              }
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

export default PoolCategoryFilter;
