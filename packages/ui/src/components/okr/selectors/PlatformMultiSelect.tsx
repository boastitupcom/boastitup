"use client";

import * as React from "react";
import { Check, ChevronsUpDown, Search, X, Globe, Monitor, Smartphone } from "lucide-react";
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
import { Checkbox } from "../../ui/checkbox";

export interface Platform {
  id: string;
  name: string;
  category: string;
  display_name: string;
  is_active?: boolean;
  created_at?: string;
}

export interface PlatformMultiSelectProps {
  platforms: Platform[];
  selectedPlatformIds?: string[];
  onPlatformSelect?: (platformId: string) => void;
  onPlatformDeselect?: (platformId: string) => void;
  onSelectionChange?: (selectedIds: string[]) => void;
  placeholder?: string;
  disabled?: boolean;
  maxSelection?: number;
  showCategories?: boolean;
  allowAllPlatforms?: boolean;
  required?: boolean;
  className?: string;
}

export function PlatformMultiSelect({
  platforms,
  selectedPlatformIds = [],
  onPlatformSelect,
  onPlatformDeselect,
  onSelectionChange,
  placeholder = "Select platforms...",
  disabled = false,
  maxSelection,
  showCategories = true,
  allowAllPlatforms = true,
  required = false,
  className
}: PlatformMultiSelectProps) {
  const [open, setOpen] = React.useState(false);
  const [searchQuery, setSearchQuery] = React.useState("");

  // Filter active platforms
  const activePlatforms = React.useMemo(() => {
    return platforms.filter(platform => platform.is_active !== false);
  }, [platforms]);

  // Filter platforms based on search
  const filteredPlatforms = React.useMemo(() => {
    if (!searchQuery) return activePlatforms;
    
    return activePlatforms.filter(platform => 
      platform.display_name.toLowerCase().includes(searchQuery.toLowerCase()) ||
      platform.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
      platform.category.toLowerCase().includes(searchQuery.toLowerCase())
    );
  }, [activePlatforms, searchQuery]);

  // Group platforms by category
  const groupedPlatforms = React.useMemo(() => {
    const groups: Record<string, Platform[]> = {};
    
    filteredPlatforms.forEach(platform => {
      if (!groups[platform.category]) {
        groups[platform.category] = [];
      }
      groups[platform.category].push(platform);
    });
    
    // Sort platforms within each category
    Object.keys(groups).forEach(category => {
      groups[category].sort((a, b) => a.display_name.localeCompare(b.display_name));
    });
    
    return groups;
  }, [filteredPlatforms]);

  const handlePlatformToggle = (platform: Platform) => {
    const isSelected = selectedPlatformIds.includes(platform.id);
    
    if (isSelected) {
      // Prevent deselecting if required and this is the last selected
      if (required && selectedPlatformIds.length === 1) {
        return;
      }
      
      const newSelection = selectedPlatformIds.filter(id => id !== platform.id);
      onPlatformDeselect?.(platform.id);
      onSelectionChange?.(newSelection);
    } else {
      // Check max selection limit
      if (maxSelection && selectedPlatformIds.length >= maxSelection) {
        return;
      }
      
      const newSelection = [...selectedPlatformIds, platform.id];
      onPlatformSelect?.(platform.id);
      onSelectionChange?.(newSelection);
    }
  };

  const handleSelectAll = () => {
    if (maxSelection && filteredPlatforms.length > maxSelection) {
      return;
    }
    
    const allIds = filteredPlatforms.map(p => p.id);
    onSelectionChange?.(allIds);
    allIds.forEach(id => {
      if (!selectedPlatformIds.includes(id)) {
        onPlatformSelect?.(id);
      }
    });
  };

  const handleClearAll = () => {
    if (required) return;
    
    selectedPlatformIds.forEach(id => onPlatformDeselect?.(id));
    onSelectionChange?.([]);
  };

  const selectedPlatforms = activePlatforms.filter(p => selectedPlatformIds.includes(p.id));

  const getDisplayText = () => {
    if (selectedPlatforms.length === 0) {
      return allowAllPlatforms ? "All platforms" : placeholder;
    }
    
    if (selectedPlatforms.length === 1) {
      return selectedPlatforms[0].display_name;
    }
    
    if (selectedPlatforms.length === activePlatforms.length) {
      return "All platforms";
    }
    
    return `${selectedPlatforms.length} platforms`;
  };

  const getPlatformIcon = (category: string) => {
    const cat = category.toLowerCase();
    
    if (cat.includes('social') || cat.includes('media')) {
      return <Globe className="h-3 w-3" />;
    }
    if (cat.includes('web') || cat.includes('website')) {
      return <Monitor className="h-3 w-3" />;
    }
    if (cat.includes('mobile') || cat.includes('app')) {
      return <Smartphone className="h-3 w-3" />;
    }
    
    return <Globe className="h-3 w-3" />;
  };

  const getCategoryColor = (category: string) => {
    const cat = category.toLowerCase();
    
    if (cat.includes('social')) return 'bg-blue-100 text-blue-800';
    if (cat.includes('web')) return 'bg-green-100 text-green-800';
    if (cat.includes('mobile')) return 'bg-purple-100 text-purple-800';
    if (cat.includes('search')) return 'bg-orange-100 text-orange-800';
    if (cat.includes('video')) return 'bg-red-100 text-red-800';
    
    return 'bg-gray-100 text-gray-800';
  };

  const canSelectAll = !maxSelection || filteredPlatforms.length <= maxSelection;
  const canClearAll = !required;

  return (
    <div className={cn("space-y-2", className)}>
      <Label className="text-sm font-medium">
        Platforms
        {selectedPlatforms.length > 0 && (
          <span className="ml-2 text-muted-foreground">
            ({selectedPlatforms.length} selected)
          </span>
        )}
        {maxSelection && (
          <span className="ml-2 text-xs text-muted-foreground">
            (max {maxSelection})
          </span>
        )}
      </Label>

      {/* Selected platforms display */}
      {selectedPlatforms.length > 0 && (
        <div className="flex flex-wrap gap-1 mb-2">
          {selectedPlatforms.map((platform) => (
            <Badge 
              key={platform.id} 
              variant="secondary" 
              className={cn(
                "text-xs flex items-center gap-1",
                getCategoryColor(platform.category)
              )}
            >
              {getPlatformIcon(platform.category)}
              {platform.display_name}
              <button
                onClick={() => handlePlatformToggle(platform)}
                className="ml-1 hover:bg-muted-foreground/20 rounded-full p-0.5"
                disabled={disabled || (required && selectedPlatforms.length === 1)}
              >
                <X className="h-2.5 w-2.5" />
              </button>
            </Badge>
          ))}
          {canClearAll && selectedPlatforms.length > 0 && (
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
              selectedPlatforms.length === 0 && !allowAllPlatforms && "text-muted-foreground"
            )}
            disabled={disabled}
          >
            <span className="truncate">{getDisplayText()}</span>
            <ChevronsUpDown className="ml-2 h-4 w-4 shrink-0 opacity-50" />
          </Button>
        </PopoverTrigger>
        
        <PopoverContent className="w-full p-0" align="start">
          <Command>
            {/* Search */}
            <div className="p-3 border-b">
              <div className="relative">
                <Search className="absolute left-2 top-1/2 h-4 w-4 -translate-y-1/2 text-muted-foreground" />
                <Input
                  placeholder="Search platforms..."
                  value={searchQuery}
                  onChange={(e) => setSearchQuery(e.target.value)}
                  className="pl-8 h-8"
                />
              </div>
            </div>

            {/* Bulk Actions */}
            {filteredPlatforms.length > 0 && (
              <div className="p-2 border-b">
                <div className="flex items-center justify-between">
                  <span className="text-xs text-muted-foreground">
                    {filteredPlatforms.length} platforms
                    {maxSelection && ` (max ${maxSelection})`}
                  </span>
                  <div className="flex gap-1">
                    {canSelectAll && (
                      <Button
                        variant="ghost"
                        size="sm"
                        onClick={handleSelectAll}
                        className="h-6 px-2 text-xs"
                        disabled={disabled}
                      >
                        Select All
                      </Button>
                    )}
                    {canClearAll && (
                      <Button
                        variant="ghost"
                        size="sm"
                        onClick={handleClearAll}
                        className="h-6 px-2 text-xs"
                        disabled={disabled || selectedPlatformIds.length === 0}
                      >
                        Clear
                      </Button>
                    )}
                  </div>
                </div>
              </div>
            )}

            <CommandList className="max-h-64 overflow-auto">
              {filteredPlatforms.length === 0 && (
                <CommandEmpty>No platforms found.</CommandEmpty>
              )}

              {showCategories && Object.keys(groupedPlatforms).length > 1 ? (
                // Grouped by category
                Object.entries(groupedPlatforms)
                  .sort(([a], [b]) => a.localeCompare(b))
                  .map(([category, platforms]) => (
                    <CommandGroup key={category} heading={category}>
                      {platforms.map((platform) => {
                        const isSelected = selectedPlatformIds.includes(platform.id);
                        const canSelect = !maxSelection || 
                          selectedPlatformIds.length < maxSelection || 
                          isSelected;
                        
                        return (
                          <CommandItem
                            key={platform.id}
                            value={`${platform.name} ${platform.display_name}`}
                            onSelect={() => canSelect && handlePlatformToggle(platform)}
                            className={cn(
                              "flex items-center gap-2",
                              canSelect ? "cursor-pointer" : "cursor-not-allowed opacity-50"
                            )}
                            disabled={!canSelect}
                          >
                            <Checkbox
                              checked={isSelected}
                              className="h-4 w-4"
                              disabled={!canSelect}
                            />
                            
                            <div className="flex items-center gap-2 flex-1 min-w-0">
                              {getPlatformIcon(platform.category)}
                              <span className="font-medium truncate">
                                {platform.display_name}
                              </span>
                            </div>
                          </CommandItem>
                        );
                      })}
                    </CommandGroup>
                  ))
              ) : (
                // Flat list
                filteredPlatforms.map((platform) => {
                  const isSelected = selectedPlatformIds.includes(platform.id);
                  const canSelect = !maxSelection || 
                    selectedPlatformIds.length < maxSelection || 
                    isSelected;
                  
                  return (
                    <CommandItem
                      key={platform.id}
                      value={`${platform.name} ${platform.display_name}`}
                      onSelect={() => canSelect && handlePlatformToggle(platform)}
                      className={cn(
                        "flex items-center gap-2",
                        canSelect ? "cursor-pointer" : "cursor-not-allowed opacity-50"
                      )}
                      disabled={!canSelect}
                    >
                      <Checkbox
                        checked={isSelected}
                        className="h-4 w-4"
                        disabled={!canSelect}
                      />
                      
                      <div className="flex items-center gap-2 flex-1 min-w-0">
                        {getPlatformIcon(platform.category)}
                        <div className="flex-1 min-w-0">
                          <span className="font-medium truncate block">
                            {platform.display_name}
                          </span>
                          <span className="text-xs text-muted-foreground block">
                            {platform.category}
                          </span>
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
      <p className="text-xs text-muted-foreground">
        {allowAllPlatforms && selectedPlatforms.length === 0
          ? "No platforms selected means all platforms will be tracked"
          : "Select the platforms you want to track for this OKR"
        }
        {maxSelection && ` (maximum ${maxSelection} platforms)`}
      </p>
    </div>
  );
}

export function PlatformMultiSelectSkeleton({ className }: { className?: string }) {
  return (
    <div className={cn("space-y-2", className)}>
      <div className="h-4 w-20 bg-gray-200 rounded animate-pulse" />
      <div className="flex flex-wrap gap-1 mb-2">
        <div className="h-5 w-16 bg-gray-200 rounded animate-pulse" />
        <div className="h-5 w-20 bg-gray-200 rounded animate-pulse" />
      </div>
      <div className="h-10 w-full bg-gray-200 rounded border animate-pulse" />
      <div className="h-3 w-48 bg-gray-200 rounded animate-pulse" />
    </div>
  );
}