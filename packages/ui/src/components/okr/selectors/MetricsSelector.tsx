"use client";

import * as React from "react";
import { Check, ChevronsUpDown, Search, Filter, X } from "lucide-react";
import { cn } from "../../../lib/utils";
import { Button } from "../../ui/button";
import { Input } from "../../ui/input";
import { Label } from "../../ui/label";
import { Badge } from "../../ui/badge";
import {
  Command,
  CommandEmpty,
  CommandGroup,
  CommandInput,
  CommandItem,
  CommandList,
} from "../../ui/command";
import {
  Popover,
  PopoverContent,
  PopoverTrigger,
} from "../../ui/popover";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "../../ui/select";
import { Separator } from "../../ui/separator";
import { Checkbox } from "../../ui/checkbox";

export interface MetricType {
  id: string;
  code: string;
  description: string;
  unit?: string;
  category: string;
  created_at?: string;
}

export interface MetricsSelectorProps {
  metricTypes: MetricType[];
  selectedMetricIds?: string[];
  onMetricSelect?: (metricId: string) => void;
  onMetricDeselect?: (metricId: string) => void;
  onSelectionChange?: (selectedIds: string[]) => void;
  multiple?: boolean;
  placeholder?: string;
  disabled?: boolean;
  showCategories?: boolean;
  showSearch?: boolean;
  maxHeight?: number;
  className?: string;
}

export function MetricsSelector({
  metricTypes,
  selectedMetricIds = [],
  onMetricSelect,
  onMetricDeselect,
  onSelectionChange,
  multiple = false,
  placeholder = "Select metrics...",
  disabled = false,
  showCategories = true,
  showSearch = true,
  maxHeight = 300,
  className
}: MetricsSelectorProps) {
  const [open, setOpen] = React.useState(false);
  const [searchQuery, setSearchQuery] = React.useState("");
  const [categoryFilter, setCategoryFilter] = React.useState<string>("");

  // Get unique categories
  const categories = React.useMemo(() => {
    const cats = Array.from(new Set(metricTypes.map(m => m.category))).sort();
    return cats;
  }, [metricTypes]);

  // Filter metrics based on search and category
  const filteredMetrics = React.useMemo(() => {
    return metricTypes.filter(metric => {
      const matchesSearch = !searchQuery || 
        metric.description.toLowerCase().includes(searchQuery.toLowerCase()) ||
        metric.code.toLowerCase().includes(searchQuery.toLowerCase());
      
      const matchesCategory = !categoryFilter || metric.category === categoryFilter;
      
      return matchesSearch && matchesCategory;
    });
  }, [metricTypes, searchQuery, categoryFilter]);

  // Group metrics by category
  const groupedMetrics = React.useMemo(() => {
    const groups: Record<string, MetricType[]> = {};
    
    filteredMetrics.forEach(metric => {
      if (!groups[metric.category]) {
        groups[metric.category] = [];
      }
      groups[metric.category].push(metric);
    });
    
    return groups;
  }, [filteredMetrics]);

  const handleMetricToggle = (metric: MetricType) => {
    const isSelected = selectedMetricIds.includes(metric.id);
    
    if (multiple) {
      let newSelection: string[];
      
      if (isSelected) {
        newSelection = selectedMetricIds.filter(id => id !== metric.id);
        onMetricDeselect?.(metric.id);
      } else {
        newSelection = [...selectedMetricIds, metric.id];
        onMetricSelect?.(metric.id);
      }
      
      onSelectionChange?.(newSelection);
    } else {
      if (isSelected) {
        onMetricDeselect?.(metric.id);
        onSelectionChange?.([]);
      } else {
        onMetricSelect?.(metric.id);
        onSelectionChange?.([metric.id]);
        setOpen(false);
      }
    }
  };

  const handleSelectAll = () => {
    const allFilteredIds = filteredMetrics.map(m => m.id);
    onSelectionChange?.(allFilteredIds);
    allFilteredIds.forEach(id => onMetricSelect?.(id));
  };

  const handleClearAll = () => {
    selectedMetricIds.forEach(id => onMetricDeselect?.(id));
    onSelectionChange?.([]);
  };

  const selectedMetrics = metricTypes.filter(m => selectedMetricIds.includes(m.id));

  const getDisplayText = () => {
    if (selectedMetrics.length === 0) {
      return placeholder;
    }
    
    if (selectedMetrics.length === 1) {
      return selectedMetrics[0].description;
    }
    
    return `${selectedMetrics.length} metrics selected`;
  };

  return (
    <div className={cn("space-y-2", className)}>
      <Label className="text-sm font-medium">
        Metric Types
        {multiple && selectedMetrics.length > 0 && (
          <span className="ml-2 text-muted-foreground">
            ({selectedMetrics.length} selected)
          </span>
        )}
      </Label>

      {/* Selected metrics display */}
      {selectedMetrics.length > 0 && (
        <div className="flex flex-wrap gap-1 mb-2">
          {selectedMetrics.map((metric) => (
            <Badge 
              key={metric.id} 
              variant="secondary" 
              className="text-xs flex items-center gap-1"
            >
              {metric.code}
              {multiple && (
                <button
                  onClick={() => handleMetricToggle(metric)}
                  className="ml-1 hover:bg-muted-foreground/20 rounded-full p-0.5"
                  disabled={disabled}
                >
                  <X className="h-2.5 w-2.5" />
                </button>
              )}
            </Badge>
          ))}
          {multiple && selectedMetrics.length > 0 && (
            <Button
              variant="ghost"
              size="sm"
              onClick={handleClearAll}
              className="h-5 px-2 text-xs text-muted-foreground hover:text-foreground"
              disabled={disabled}
            >
              Clear All
            </Button>
          )}
        </div>
      )}

      <Popover open={open} onOpenChange={setOpen}>
        <PopoverTrigger asChild>
          <Button
            variant="outline"
            role="combobox"
            aria-expanded={open}
            className={cn(
              "w-full justify-between",
              !selectedMetrics.length && "text-muted-foreground"
            )}
            disabled={disabled}
          >
            <span className="truncate">{getDisplayText()}</span>
            <ChevronsUpDown className="ml-2 h-4 w-4 shrink-0 opacity-50" />
          </Button>
        </PopoverTrigger>
        
        <PopoverContent 
          className="w-full p-0" 
          align="start"
          style={{ maxHeight: `${maxHeight}px` }}
        >
          <Command>
            {/* Search */}
            {showSearch && (
              <div className="p-3 border-b">
                <div className="relative">
                  <Search className="absolute left-2 top-1/2 h-4 w-4 -translate-y-1/2 text-muted-foreground" />
                  <Input
                    placeholder="Search metrics..."
                    value={searchQuery}
                    onChange={(e) => setSearchQuery(e.target.value)}
                    className="pl-8 h-8"
                  />
                </div>
              </div>
            )}

            {/* Category Filter */}
            {showCategories && categories.length > 1 && (
              <div className="p-3 border-b">
                <div className="flex items-center gap-2">
                  <Filter className="h-4 w-4 text-muted-foreground" />
                  <Select
                    value={categoryFilter}
                    onValueChange={setCategoryFilter}
                  >
                    <SelectTrigger className="h-8 text-xs">
                      <SelectValue placeholder="All categories" />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="all">All categories</SelectItem>
                      {categories.map((category) => (
                        <SelectItem key={category} value={category}>
                          {category}
                        </SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                </div>
              </div>
            )}

            {/* Bulk Actions */}
            {multiple && filteredMetrics.length > 0 && (
              <div className="p-2 border-b">
                <div className="flex items-center justify-between">
                  <span className="text-xs text-muted-foreground">
                    {filteredMetrics.length} metrics
                  </span>
                  <div className="flex gap-1">
                    <Button
                      variant="ghost"
                      size="sm"
                      onClick={handleSelectAll}
                      className="h-6 px-2 text-xs"
                      disabled={disabled}
                    >
                      Select All
                    </Button>
                    <Button
                      variant="ghost"
                      size="sm"
                      onClick={handleClearAll}
                      className="h-6 px-2 text-xs"
                      disabled={disabled || selectedMetricIds.length === 0}
                    >
                      Clear
                    </Button>
                  </div>
                </div>
              </div>
            )}

            <CommandList className="max-h-none overflow-auto">
              {filteredMetrics.length === 0 && (
                <CommandEmpty>No metrics found.</CommandEmpty>
              )}

              {showCategories && Object.keys(groupedMetrics).length > 1 ? (
                // Grouped by category
                Object.entries(groupedMetrics).map(([category, metrics]) => (
                  <CommandGroup key={category} heading={category}>
                    {metrics.map((metric) => {
                      const isSelected = selectedMetricIds.includes(metric.id);
                      
                      return (
                        <CommandItem
                          key={metric.id}
                          value={`${metric.code} ${metric.description}`}
                          onSelect={() => handleMetricToggle(metric)}
                          className="flex items-center gap-2 cursor-pointer"
                        >
                          {multiple ? (
                            <Checkbox
                              checked={isSelected}
                              className="h-4 w-4"
                            />
                          ) : (
                            <Check
                              className={cn(
                                "h-4 w-4",
                                isSelected ? "opacity-100" : "opacity-0"
                              )}
                            />
                          )}
                          
                          <div className="flex-1 min-w-0">
                            <div className="flex items-center gap-2">
                              <span className="font-mono text-xs bg-muted px-1.5 py-0.5 rounded">
                                {metric.code}
                              </span>
                              <span className="font-medium truncate">
                                {metric.description}
                              </span>
                            </div>
                            
                            {metric.unit && (
                              <div className="text-xs text-muted-foreground mt-0.5">
                                Unit: {metric.unit}
                              </div>
                            )}
                          </div>
                        </CommandItem>
                      );
                    })}
                  </CommandGroup>
                ))
              ) : (
                // Flat list
                filteredMetrics.map((metric) => {
                  const isSelected = selectedMetricIds.includes(metric.id);
                  
                  return (
                    <CommandItem
                      key={metric.id}
                      value={`${metric.code} ${metric.description}`}
                      onSelect={() => handleMetricToggle(metric)}
                      className="flex items-center gap-2 cursor-pointer"
                    >
                      {multiple ? (
                        <Checkbox
                          checked={isSelected}
                          className="h-4 w-4"
                        />
                      ) : (
                        <Check
                          className={cn(
                            "h-4 w-4",
                            isSelected ? "opacity-100" : "opacity-0"
                          )}
                        />
                      )}
                      
                      <div className="flex-1 min-w-0">
                        <div className="flex items-center gap-2">
                          <span className="font-mono text-xs bg-muted px-1.5 py-0.5 rounded">
                            {metric.code}
                          </span>
                          <span className="font-medium truncate">
                            {metric.description}
                          </span>
                        </div>
                        
                        <div className="flex items-center gap-3 text-xs text-muted-foreground mt-0.5">
                          <span>Category: {metric.category}</span>
                          {metric.unit && <span>Unit: {metric.unit}</span>}
                        </div>
                      </div>
                    </CommandItem>
                  );
                })
              )}
            </CommandList>
          </Command>
        </PopoverContent>
      </Popover>

      {/* Help text */}
      {selectedMetrics.length === 0 && (
        <p className="text-xs text-muted-foreground">
          {multiple 
            ? "Select one or more metric types to track" 
            : "Select a metric type to track"
          }
        </p>
      )}
    </div>
  );
}

export function MetricsSelectorSkeleton({ 
  showCategories = true,
  className 
}: { 
  showCategories?: boolean;
  className?: string;
}) {
  return (
    <div className={cn("space-y-2", className)}>
      <div className="h-4 w-24 bg-gray-200 rounded animate-pulse" />
      <div className="h-10 w-full bg-gray-200 rounded border animate-pulse" />
      {showCategories && (
        <div className="h-3 w-48 bg-gray-200 rounded animate-pulse" />
      )}
    </div>
  );
}