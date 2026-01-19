import { Button } from '@/shared/components/button';
import { Input } from '@/shared/components/input';
import { Search, Filter, X } from 'lucide-react';
import { Sheet, SheetContent, SheetHeader, SheetTitle, SheetTrigger } from '@/shared/components/sheet';

interface FilterOption {
  key: string;
  label: string;
  options: Array<{ value: string; label: string }>;
}

interface PageFiltersProps {
  searchTerm: string;
  onSearchChange: (value: string) => void;
  searchPlaceholder: string;
  filters: FilterOption[];
  filterValues: Record<string, string>;
  onFilterChange: (key: string, value: string) => void;
  onClearFilters: () => void;
  isFilterOpen: boolean;
  onFilterOpenChange: (open: boolean) => void;
  totalCount: number;
  filteredCount: number;
  hasActiveFilters: boolean;
}

export function PageFilters({
  searchTerm,
  onSearchChange,
  searchPlaceholder,
  filters,
  filterValues,
  onFilterChange,
  onClearFilters,
  isFilterOpen,
  onFilterOpenChange,
  totalCount,
  filteredCount,
  hasActiveFilters,
}: PageFiltersProps) {
  const activeFilterCount = Object.values(filterValues).filter(value => value !== 'all').length + (searchTerm ? 1 : 0);

  return (
    <>
      {/* Search and Filters */}
      <div className="flex flex-col lg:flex-row gap-4 mb-6">
        {/* Search */}
        <div className="flex-1">
          <div className="relative">
            <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-muted-foreground h-4 w-4" />
            <Input
              placeholder={searchPlaceholder}
              value={searchTerm}
              onChange={(e) => onSearchChange(e.target.value)}
              className="pl-10"
            />
          </div>
        </div>

        {/* Filter Sheet Trigger */}
        <Sheet open={isFilterOpen} onOpenChange={(open) => onFilterOpenChange(open)}>
          <SheetTrigger asChild>
            <Button variant="outline" className="lg:w-auto">
              <Filter className="h-4 w-4 mr-2" />
              Filters
              {activeFilterCount > 0 && (
                <span className="ml-2 bg-primary text-primary-foreground rounded-full px-2 py-0.5 text-xs">
                  {activeFilterCount}
                </span>
              )}
            </Button>
          </SheetTrigger>
          {isFilterOpen && (
            <SheetContent side="right" className="w-80">
              <SheetHeader>
                <SheetTitle>Filters</SheetTitle>
              </SheetHeader>

              <div className="space-y-6 mt-6">
                {filters.map((filter) => (
                  <div key={filter.key}>
                    <label className="text-sm font-medium mb-3 block">{filter.label}</label>
                    <select
                      value={filterValues[filter.key] || 'all'}
                      onChange={(e) => onFilterChange(filter.key, e.target.value)}
                      className="w-full px-3 py-2 border border-input bg-background rounded-md text-sm focus:outline-none focus:ring-2 focus:ring-ring focus:border-transparent"
                    >
                      {filter.options.map((option) => (
                        <option key={option.value} value={option.value}>
                          {option.label}
                        </option>
                      ))}
                    </select>
                  </div>
                ))}

                {/* Clear Filters */}
                {hasActiveFilters && (
                  <Button variant="outline" onClick={onClearFilters} className="w-full">
                    <X className="h-4 w-4 mr-2" />
                    Clear All Filters
                  </Button>
                )}
              </div>
            </SheetContent>
          )}
        </Sheet>

        {/* Clear Filters Button */}
        {hasActiveFilters && (
          <Button variant="ghost" onClick={onClearFilters} size="sm">
            <X className="h-4 w-4 mr-2" />
            Clear
          </Button>
        )}
      </div>

      {/* Results Summary */}
      {hasActiveFilters && (
        <div className="flex items-center justify-between mb-4 text-sm">
          <span className="text-muted-foreground">
            Showing {filteredCount} of {totalCount} items
          </span>
        </div>
      )}
    </>
  );
}
