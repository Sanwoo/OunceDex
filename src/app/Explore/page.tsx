"use client";
import React, { useMemo } from "react";
import usePoolData from "./hooks/usePoolData";
import usePoolFilters from "./hooks/usePoolFilters";
import PoolStatsCards from "./components/PoolStatsCards";
import PoolFilters from "./components/PoolFilters";
import columns from "../../components/Columns";
import SearchBar from "./components/SearchBar";
import { AnimatedNumber } from "@/components/AnimatedNumber";
import { safeToNumber } from "@/lib/numbers";
import { DataTable } from "@/components/DataTable";

const ExplorePage = () => {
  const {
    filters,
    searchInput,
    isFilterOpen,
    sorting,
    updateFilters,
    updateSearch,
    setIsFilterOpen,
    clearSearch,
    resetFilters,
    updateSorting,
  } = usePoolFilters();

  const { poolData, protocolData, totalFees, loading, error, totalCount } =
    usePoolData(filters, searchInput);

  const handlePageChange = (page: number) => {
    updateFilters({ currentPage: page });
  };

  const handlePageSizeChange = (pageSize: number) => {
    updateFilters({ pageSize: pageSize });
  };

  const totalFilterCount = useMemo(() => {
    return (
      filters.networks.length +
      filters.poolTypes.length +
      (filters.minTvl > 0 ? 1 : 0) +
      filters.poolCategories.length +
      (filters.protocolVersions[0] ? 1 : 0) +
      filters.hooks.length
    );
  }, [filters]);

  if (error) {
    return (
      <div className="container mx-auto py-3 px-4">
        <div className="p-4 mb-4 bg-red-900/30 text-red-200 border border-red-500/30 rounded-md backdrop-blur-sm">
          Something went wrong: {error.message}
        </div>
      </div>
    );
  }

  return (
    <div className="container mx-auto py-3 px-4">
      <div className="flex flex-row justify-end mb-4">
        <PoolStatsCards protocolData={protocolData} totalFees={totalFees} />
      </div>
      <div className="flex flex-row justify-between mb-4">
        <h1 className="text-3xl font-bold text-purple-400">
          Liquidity Pools{" "}
          <span className="text-xl font-medium text-[#e9d5ff]">
            (
            <AnimatedNumber
              value={safeToNumber(poolData?.count)}
              needFormatShort={false}
              keepLastValidValue={true}
            />
            )
          </span>
        </h1>

        <div className="flex flex-row gap-2">
          <SearchBar
            searchInput={searchInput}
            onSearchChange={updateSearch}
            onClearSearch={clearSearch}
            isSearching={loading}
          />

          <PoolFilters
            filters={filters}
            isOpen={isFilterOpen}
            onOpenChange={setIsFilterOpen}
            onFiltersChange={updateFilters}
            onResetFilters={resetFilters}
            totalFilterCount={totalFilterCount}
          />
        </div>
      </div>

      <DataTable
        columns={columns}
        data={poolData}
        isLoading={loading}
        pageSize={filters.pageSize}
        currentPage={filters.currentPage}
        totalCount={totalCount}
        onPageChange={handlePageChange}
        onPageSizeChange={handlePageSizeChange}
        onSortingChange={updateSorting}
        sorting={sorting}
      />
    </div>
  );
};

export default ExplorePage;
