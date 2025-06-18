import React from "react";
import { Input } from "@/components/ui/input";
import { Search, X, Loader2 } from "lucide-react";

interface SearchBarProps {
  searchInput: string;
  onSearchChange: (search: string) => void;
  onClearSearch: () => void;
  isSearching: boolean;
}

const SearchBar: React.FC<SearchBarProps> = ({
  searchInput,
  onSearchChange,
  onClearSearch,
  isSearching,
}) => {
  const getSearchIcon = () => {
    if (isSearching) {
      return <Loader2 className="h-4 w-4 animate-spin text-purple-300" />;
    }
    if (searchInput) {
      return (
        <X
          className="h-4 w-4 text-purple-300 cursor-pointer hover:text-purple-100 transition-colors"
          onClick={onClearSearch}
        />
      );
    }
    return <Search className="h-4 w-4 text-purple-300" />;
  };

  return (
    <div className="relative w-80">
      <Input
        type="text"
        placeholder="Search..."
        value={searchInput}
        onChange={(e) => onSearchChange(e.target.value)}
        className="w-full pr-10 bg-white/5 border-purple-300/20 backdrop-blur-md text-purple-100 placeholder:text-purple-300/60 focus-visible:border-purple-400/50 focus-visible:ring-purple-400/20 focus-visible:ring-[1px]"
      />
      <div className="absolute right-3 top-1/2 transform -translate-y-1/2">
        {getSearchIcon()}
      </div>
    </div>
  );
};

export default SearchBar;
