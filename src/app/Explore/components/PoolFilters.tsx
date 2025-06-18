import React from "react";
import { Button } from "@/components/ui/button";
import {
  Popover,
  PopoverContent,
  PopoverTrigger,
} from "@/components/ui/popover";
import { Filter, X } from "lucide-react";
import { FilterState } from "../hooks/usePoolFilters";
import { GqlChain, GqlPoolType } from "@/lib/generated/graphql";
import NetworkFilter from "./NetworkFilter";
import ProtocolVersionFilter from "./ProtocolVersionFilter";
import PoolTypeFilter from "./PoolTypeFilter";
import PoolCategoryFilter from "./PoolCategoryFilter";
import HookFilter from "./HookFilter";
import MinTvlFilter from "./MinTvlFilter";
import { Badge } from "@/components/ui/badge";

interface PoolFiltersProps {
  filters: FilterState;
  isOpen: boolean;
  totalFilterCount: number;
  onOpenChange: (open: boolean) => void;
  onFiltersChange: (updates: Partial<FilterState>) => void;
  onResetFilters: () => void;
}

const PoolFilters: React.FC<PoolFiltersProps> = ({
  filters,
  isOpen,
  totalFilterCount,
  onOpenChange,
  onFiltersChange,
  onResetFilters,
}) => {
  const handleAllNetworksChange = () => {
    onFiltersChange({ networks: [], currentPage: 1 });
  };

  const handleNetworkChange = (network: GqlChain, checked: boolean) => {
    const networks = checked
      ? [...filters.networks, network]
      : filters.networks.filter((type) => type !== network);
    onFiltersChange({ networks, currentPage: 1 });
  };

  const handleProtocolVersionChange = (version: string, value: number) => {
    onFiltersChange({ protocolVersions: [value], currentPage: 1 });
  };

  const handlePoolTypeChange = (poolType: GqlPoolType, checked: boolean) => {
    const poolTypes = checked
      ? [...filters.poolTypes, poolType]
      : filters.poolTypes.filter((type) => type !== poolType);
    onFiltersChange({ poolTypes, currentPage: 1 });
  };

  const handlePoolCategoryChange = (category: string, checked: boolean) => {
    const poolCategories = checked
      ? [...filters.poolCategories, category]
      : filters.poolCategories.filter((cat) => cat !== category);
    onFiltersChange({ poolCategories, currentPage: 1 });
  };

  const handleHookChange = (hook: string, checked: boolean) => {
    const hooks = checked
      ? [...filters.hooks, hook]
      : filters.hooks.filter((h) => h !== hook);
    onFiltersChange({ hooks, currentPage: 1 });
  };

  const handleMinTvlChange = (value: number[]) => {
    onFiltersChange({ minTvl: value[0], currentPage: 1 });
  };

  return (
    <Popover open={isOpen} onOpenChange={onOpenChange}>
      <PopoverTrigger asChild>
        <Button
          variant="outline"
          className="relative bg-white/5 border-purple-300/20 backdrop-blur-md text-purple-100 hover:bg-white/10 hover:border-purple-400/50 hover:cursor-pointer"
        >
          <Filter className="h-4 w-4 mr-2" />
          Filters
          {totalFilterCount > 0 && (
            <Badge className="bg-sky-300 text-black border-1 border-purple-300/30 w-5 h-5 rounded-full absolute -top-2.5 -right-2.5">
              {totalFilterCount}
            </Badge>
          )}
        </Button>
      </PopoverTrigger>
      <PopoverContent
        className="w-[380px] bg-gradient-to-br from-indigo-900 via-purple-900 to-pink-800 p-0 border-blue-300/30 backdrop-blur-xl shadow-2xl rounded-2xl text-blue-100"
        align="end"
        sideOffset={1}
      >
        <div className="flex items-center justify-between p-3">
          <div className="flex flex-row gap-2 items-center">
            <h2 className="text-medium font-semibold text-blue-50">FILTERS</h2>
            <Button
              className="text-purple-600 hover:text-purple-800 hover:bg-purple-200/30 hover:cursor-pointer"
              variant="ghost"
              size="sm"
              onClick={onResetFilters}
            >
              Reset All
            </Button>
          </div>
          <Button
            variant="ghost"
            size="sm"
            onClick={() => onOpenChange(false)}
            className="h-8 w-8 p-0 text-purple-600 hover:text-purple-800 hover:bg-purple-200/30 hover:cursor-pointer"
          >
            <X className="h-4 w-4" />
          </Button>
        </div>

        <div className="text-purple-100 px-3 mb-3">
          <div className="space-y-1">
            {/* Networks */}
            <NetworkFilter
              networks={filters.networks}
              onNetworkChange={handleNetworkChange}
              onAllNetworksChange={handleAllNetworksChange}
            />

            {/* Protocol version */}
            <ProtocolVersionFilter
              protocolVersions={filters.protocolVersions}
              onProtocolVersionChange={handleProtocolVersionChange}
            />

            {/* Pool types */}
            <PoolTypeFilter
              poolTypes={filters.poolTypes}
              onPoolTypeChange={handlePoolTypeChange}
            />

            {/* Pool categories */}
            <PoolCategoryFilter
              poolCategories={filters.poolCategories}
              onPoolCategoryChange={handlePoolCategoryChange}
            />

            {/* Hooks */}
            <HookFilter hooks={filters.hooks} onHookChange={handleHookChange} />

            {/* Minimum TVL */}
            <MinTvlFilter
              minTvl={filters.minTvl}
              onMinTvlChange={handleMinTvlChange}
            />
          </div>
        </div>
      </PopoverContent>
    </Popover>
  );
};

export default PoolFilters;
