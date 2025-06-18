import { useState, useEffect, useCallback } from "react";
import { useSearchParams, useRouter } from "next/navigation";
import { GqlChain, GqlPoolType } from "@/lib/generated/graphql";
import { SortingState } from "@tanstack/react-table";

export interface FilterState {
  networks: GqlChain[];
  protocolVersions: number[];
  poolTypes: GqlPoolType[];
  poolCategories: string[];
  hooks: string[];
  minTvl: number;
  currentPage: number;
  pageSize: number;
  orderBy: string;
  orderDirection: string;
}

const DEFAULT_FILTERS: FilterState = {
  networks: [],
  protocolVersions: [],
  poolTypes: [],
  poolCategories: [],
  hooks: [],
  minTvl: 0,
  currentPage: 1,
  pageSize: 20,
  orderBy: "TotalLiquidity",
  orderDirection: "desc",
};

const usePoolFilters = () => {
  const searchParams = useSearchParams();
  const router = useRouter();
  const [searchInput, setSearchInput] = useState("");
  const [isFilterOpen, setIsFilterOpen] = useState(false);
  const [filters, setFilters] = useState<FilterState>(DEFAULT_FILTERS);

  useEffect(() => {
    const urlFilters: Partial<FilterState> = {
      networks:
        (searchParams
          .get("networks")
          ?.split(",")
          .filter(Boolean) as GqlChain[]) || [],
      protocolVersions: searchParams
        .get("protocolVersions")
        ?.split(",")
        .map(Number)
        .filter(Boolean) || [0],
      poolTypes:
        (searchParams
          .get("poolTypes")
          ?.split(",")
          .filter(Boolean) as GqlPoolType[]) || [],
      poolCategories:
        searchParams.get("poolCategories")?.split(",").filter(Boolean) || [],
      hooks: searchParams.get("hooks")?.split(",").filter(Boolean) || [],
      minTvl: Number(searchParams.get("minTvl")) || 0,
      currentPage: Number(searchParams.get("currentPage")) || 1,
      pageSize: Number(searchParams.get("pageSize")) || 20,
      orderBy: searchParams.get("orderBy") || "totalLiquidity",
      orderDirection: searchParams.get("orderDirection") || "desc",
    };

    const searchQuery = searchParams.get("search") || "";
    setSearchInput(searchQuery);
    setFilters((prev) => ({ ...prev, ...urlFilters }));
  }, [searchParams]);

  // change url
  const updateURL = useCallback(
    (newFilters: FilterState, search?: string) => {
      const params = new URLSearchParams();

      if (newFilters.networks.length > 0) {
        params.set("networks", newFilters.networks.join(","));
      }
      if (
        newFilters.protocolVersions.length > 0 &&
        newFilters.protocolVersions[0] !== 0
      ) {
        params.set("protocolVersions", newFilters.protocolVersions.join(","));
      }
      if (newFilters.poolTypes.length > 0) {
        params.set("poolTypes", newFilters.poolTypes.join(","));
      }
      if (newFilters.poolCategories.length > 0) {
        params.set("poolCategories", newFilters.poolCategories.join(","));
      }
      if (newFilters.hooks.length > 0) {
        params.set("hooks", newFilters.hooks.join(","));
      }
      if (newFilters.minTvl > 0) {
        params.set("minTvl", newFilters.minTvl.toString());
      }
      if (newFilters.currentPage > 1) {
        params.set("currentPage", newFilters.currentPage.toString());
      }
      if (newFilters.pageSize !== 20) {
        params.set("pageSize", newFilters.pageSize.toString());
      }
      if (newFilters.orderBy !== "totalLiquidity") {
        params.set("orderBy", newFilters.orderBy);
      }
      if (newFilters.orderDirection !== "desc") {
        params.set("orderDirection", newFilters.orderDirection);
      }
      if (search && search.trim()) {
        params.set("textSearch", search.trim());
      }

      const queryString = params.toString();
      const newURL = queryString ? `?${queryString}` : window.location.pathname;

      router.push(newURL, { scroll: false });
    },
    [router]
  );

  const updateFilters = useCallback(
    (updates: Partial<FilterState>) => {
      const newFilters = { ...filters, ...updates };
      setFilters(newFilters);
      updateURL(newFilters, searchInput);
    },
    [filters, searchInput, updateURL]
  );

  const updateSearch = useCallback(
    (search: string) => {
      setSearchInput(search);
      const newFilters = { ...filters, currentPage: 1 };
      setFilters(newFilters);
      updateURL(newFilters, search);
    },
    [filters, updateURL]
  );

  const clearSearch = useCallback(() => {
    setSearchInput("");
    const newFilters = { ...filters, currentPage: 1 };
    setFilters(newFilters);
    updateURL(newFilters, "");
  }, [filters, updateURL]);

  const resetFilters = useCallback(() => {
    setFilters(DEFAULT_FILTERS);
    setSearchInput("");
    updateURL(DEFAULT_FILTERS, "");
  }, [updateURL]);

  const updateSorting = useCallback(
    (newSorting: SortingState) => {
      const newFilters = {
        ...filters,
        orderBy: newSorting[0].id,
        orderDirection: newSorting[0].desc ? "desc" : "asc",
        currentPage: 1,
      };
      setFilters(newFilters);
      updateURL(newFilters, searchInput);
    },
    [filters, updateURL, searchInput]
  );

  const sorting = [
    { id: filters.orderBy, desc: filters.orderDirection === "desc" },
  ];

  return {
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
  };
};

export default usePoolFilters;
