'use client';

import React from 'react';
import { Card, CardContent, Button, Input, Select, SelectContent, SelectItem, SelectTrigger, SelectValue, Badge } from '@boastitup/ui';
import { useOKRDashboardStore } from '../../store/okrDashboardStore';
import { Search, Filter, X } from 'lucide-react';

interface OKRFiltersProps {
  className?: string;
}

export function OKRFilters({ className = '' }: OKRFiltersProps) {
  const {
    filterCategory,
    filterStatus,
    searchQuery,
    setFilterCategory,
    setFilterStatus,
    setSearchQuery,
    resetFilters,
  } = useOKRDashboardStore();

  const categories = [
    'All',
    'Brand Awareness',
    'Engagement',
    'Growth',
    'Retention',
    'Revenue'
  ];

  const statuses = [
    'All',
    'Target Achieved',
    'On Track',
    'Behind',
    'At Risk',
    'Not Started'
  ];

  const activeFilterCount = [
    filterCategory !== 'All' ? 1 : 0,
    filterStatus !== 'All' ? 1 : 0,
    searchQuery.trim() ? 1 : 0,
  ].reduce((sum, count) => sum + count, 0);

  return (
    <Card className={className}>
      <CardContent className="p-4">
        <div className="flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
          {/* Search Input */}
          <div className="relative flex-1 max-w-sm">
            <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 h-4 w-4" />
            <Input
              placeholder="Search OKRs..."
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              className="pl-10"
            />
          </div>

          {/* Filter Controls */}
          <div className="flex flex-wrap items-center gap-3">
            {/* Category Filter */}
            <div className="flex items-center gap-2">
              <span className="text-sm font-medium text-gray-700">Category:</span>
              <Select 
                value={filterCategory} 
                onValueChange={(value) => setFilterCategory(value as any)}
              >
                <SelectTrigger className="w-40">
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  {categories.map(category => (
                    <SelectItem key={category} value={category}>
                      {category}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>

            {/* Status Filter */}
            <div className="flex items-center gap-2">
              <span className="text-sm font-medium text-gray-700">Status:</span>
              <Select 
                value={filterStatus} 
                onValueChange={(value) => setFilterStatus(value as any)}
              >
                <SelectTrigger className="w-40">
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  {statuses.map(status => (
                    <SelectItem key={status} value={status}>
                      {status}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>

            {/* Active Filter Indicator */}
            {activeFilterCount > 0 && (
              <div className="flex items-center gap-2">
                <Badge variant="secondary" className="flex items-center gap-1">
                  <Filter className="h-3 w-3" />
                  {activeFilterCount} active
                </Badge>
                <Button
                  size="sm"
                  variant="ghost"
                  onClick={resetFilters}
                  className="h-auto p-1"
                >
                  <X className="h-4 w-4" />
                </Button>
              </div>
            )}
          </div>
        </div>

        {/* Active Filter Tags */}
        {activeFilterCount > 0 && (
          <div className="flex flex-wrap gap-2 mt-3 pt-3 border-t">
            {filterCategory !== 'All' && (
              <Badge variant="outline" className="flex items-center gap-1">
                Category: {filterCategory}
                <button
                  onClick={() => setFilterCategory('All')}
                  className="ml-1 hover:bg-gray-200 rounded-full p-0.5"
                >
                  <X className="h-3 w-3" />
                </button>
              </Badge>
            )}
            {filterStatus !== 'All' && (
              <Badge variant="outline" className="flex items-center gap-1">
                Status: {filterStatus}
                <button
                  onClick={() => setFilterStatus('All')}
                  className="ml-1 hover:bg-gray-200 rounded-full p-0.5"
                >
                  <X className="h-3 w-3" />
                </button>
              </Badge>
            )}
            {searchQuery.trim() && (
              <Badge variant="outline" className="flex items-center gap-1">
                Search: "{searchQuery}"
                <button
                  onClick={() => setSearchQuery('')}
                  className="ml-1 hover:bg-gray-200 rounded-full p-0.5"
                >
                  <X className="h-3 w-3" />
                </button>
              </Badge>
            )}
          </div>
        )}
      </CardContent>
    </Card>
  );
}