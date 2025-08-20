"use client";

import * as React from "react";
import { cn } from "../../lib/utils";
import { Button } from "./button";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "./card";
import { Checkbox } from "./checkbox";
import { Badge } from "./badge";
import { 
  OKRTemplate, 
  OKRTemplateGridProps 
} from '../../../../../apps/web/types/okr-creation';

const priorityColors = {
  1: "bg-red-100 text-red-800 border-red-200",
  2: "bg-yellow-100 text-yellow-800 border-yellow-200", 
  3: "bg-green-100 text-green-800 border-green-200"
};

const priorityLabels = {
  1: "High Priority",
  2: "Medium Priority",
  3: "Low Priority"
};

export function OKRTemplateGrid({
  templates,
  selectedTemplateIds,
  onTemplateSelect,
  onTemplateDeselect,
  onBulkSelect,
  isLoading = false
}: OKRTemplateGridProps) {
  const handleTemplateToggle = (templateId: string) => {
    if (selectedTemplateIds.has(templateId)) {
      onTemplateDeselect(templateId);
    } else {
      onTemplateSelect(templateId);
    }
  };

  const handleSelectAll = () => {
    const allTemplateIds = templates.map(t => t.id);
    onBulkSelect(allTemplateIds);
  };

  const handleDeselectAll = () => {
    onBulkSelect([]);
  };

  const allSelected = templates.length > 0 && selectedTemplateIds.size === templates.length;
  const someSelected = selectedTemplateIds.size > 0 && selectedTemplateIds.size < templates.length;

  if (isLoading) {
    return (
      <div className="space-y-4">
        <div className="flex items-center justify-between">
          <h3 className="text-lg font-semibold">Available OKR Templates</h3>
          <div className="h-4 w-24 bg-gray-200 rounded animate-pulse" />
        </div>
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
          {Array.from({ length: 6 }).map((_, index) => (
            <TemplateCardSkeleton key={index} />
          ))}
        </div>
      </div>
    );
  }

  if (!templates || templates.length === 0) {
    return (
      <div className="space-y-4">
        <h3 className="text-lg font-semibold">Available OKR Templates</h3>
        <div className="bg-gray-50 border border-gray-200 rounded-lg p-8 text-center">
          <div className="text-gray-400 text-4xl mb-4">📋</div>
          <h3 className="text-lg font-semibold text-gray-800 mb-2">No templates available</h3>
          <p className="text-gray-600">Select an industry to view available OKR templates.</p>
        </div>
      </div>
    );
  }

  return (
    <div className="space-y-4">
      {/* Header with bulk actions */}
      <div className="flex items-center justify-between">
        <div className="space-y-1">
          <h3 className="text-lg font-semibold">Available OKR Templates</h3>
          <p className="text-sm text-muted-foreground">
            {selectedTemplateIds.size} of {templates.length} templates selected
          </p>
        </div>
        <div className="flex items-center gap-2">
          <Button
            variant="outline"
            size="sm"
            onClick={allSelected ? handleDeselectAll : handleSelectAll}
            className="h-8"
          >
            {allSelected ? "Deselect All" : "Select All"}
          </Button>
        </div>
      </div>

      {/* Templates Grid */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
        {templates.map((template) => (
          <TemplateCard
            key={template.id}
            template={template}
            isSelected={selectedTemplateIds.has(template.id)}
            onToggle={() => handleTemplateToggle(template.id)}
          />
        ))}
      </div>
    </div>
  );
}

interface TemplateCardProps {
  template: OKRTemplate;
  isSelected: boolean;
  onToggle: () => void;
}

function TemplateCard({ template, isSelected, onToggle }: TemplateCardProps) {
  return (
    <Card 
      className={cn(
        "cursor-pointer transition-all duration-200 hover:shadow-md",
        isSelected && "ring-2 ring-primary ring-offset-2 bg-primary/5"
      )}
      onClick={onToggle}
    >
      <CardHeader className="pb-3">
        <div className="flex items-start justify-between">
          <div className="flex items-start gap-3 flex-1">
            <Checkbox
              checked={isSelected}
              onCheckedChange={onToggle}
              onClick={(e) => e.stopPropagation()}
            />
            <div className="flex-1 min-w-0">
              <CardTitle className="text-base line-clamp-2 leading-tight">
                {template.title}
              </CardTitle>
            </div>
          </div>
        </div>
        
        <div className="flex items-center gap-2 mt-2">
          <Badge
            variant="outline"
            className={cn(
              "text-xs",
              priorityColors[template.priority as keyof typeof priorityColors]
            )}
          >
            {priorityLabels[template.priority as keyof typeof priorityLabels]}
          </Badge>
          <Badge variant="secondary" className="text-xs">
            {template.category}
          </Badge>
        </div>
      </CardHeader>

      <CardContent className="pt-0">
        {template.description && (
          <CardDescription className="text-sm line-clamp-3 mb-3">
            {template.description}
          </CardDescription>
        )}
        
        <div className="space-y-2 text-xs text-muted-foreground">
          <div className="flex items-center justify-between">
            <span>Timeframe:</span>
            <span className="font-medium capitalize">{template.suggestedTimeframe}</span>
          </div>
          <div className="flex items-center justify-between">
            <span>Confidence:</span>
            <span className="font-medium">{Math.round(template.confidenceScore * 100)}%</span>
          </div>
        </div>

        {template.reasoning && (
          <div className="mt-3 pt-3 border-t border-gray-100">
            <p className="text-xs text-muted-foreground italic line-clamp-2">
              {template.reasoning}
            </p>
          </div>
        )}
      </CardContent>
    </Card>
  );
}

function TemplateCardSkeleton() {
  return (
    <Card>
      <CardHeader className="pb-3">
        <div className="flex items-start justify-between">
          <div className="flex items-start gap-3 flex-1">
            <div className="h-4 w-4 bg-gray-200 rounded animate-pulse" />
            <div className="flex-1 space-y-2">
              <div className="h-4 w-3/4 bg-gray-200 rounded animate-pulse" />
              <div className="h-3 w-1/2 bg-gray-200 rounded animate-pulse" />
            </div>
          </div>
        </div>
        
        <div className="flex items-center gap-2 mt-2">
          <div className="h-5 w-20 bg-gray-200 rounded animate-pulse" />
          <div className="h-5 w-16 bg-gray-200 rounded animate-pulse" />
        </div>
      </CardHeader>

      <CardContent className="pt-0">
        <div className="space-y-2 mb-3">
          <div className="h-3 w-full bg-gray-200 rounded animate-pulse" />
          <div className="h-3 w-3/4 bg-gray-200 rounded animate-pulse" />
        </div>
        
        <div className="space-y-2">
          <div className="flex items-center justify-between">
            <div className="h-3 w-16 bg-gray-200 rounded animate-pulse" />
            <div className="h-3 w-12 bg-gray-200 rounded animate-pulse" />
          </div>
          <div className="flex items-center justify-between">
            <div className="h-3 w-16 bg-gray-200 rounded animate-pulse" />
            <div className="h-3 w-8 bg-gray-200 rounded animate-pulse" />
          </div>
        </div>
      </CardContent>
    </Card>
  );
}