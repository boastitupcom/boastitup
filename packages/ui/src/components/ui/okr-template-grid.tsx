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
        <div className="grid gap-6" style={{ gridTemplateColumns: 'repeat(auto-fit, minmax(300px, 1fr))', gridTemplateRows: 'repeat(auto-fit, minmax(320px, 1fr))' }}>
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
      <div className="grid gap-6" style={{ 
        gridTemplateColumns: 'repeat(auto-fit, minmax(min(320px, 100%), 1fr))',
        gridAutoRows: 'min-content'
      }}>
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
  const [isExpanded, setIsExpanded] = React.useState(false);
  
  return (
    <Card 
      className={cn(
        "cursor-pointer transition-all duration-200 hover:shadow-lg border-2 flex flex-col",
        "min-h-[360px] h-full w-full", // Ensure consistent height and full width
        isSelected && "ring-2 ring-primary ring-offset-2 bg-primary/5 border-primary",
        "hover:border-primary/50 hover:shadow-lg"
      )}
      onClick={onToggle}
    >
      <CardHeader className="pb-3 flex-shrink-0">
        <div className="flex items-start justify-between">
          <div className="flex items-start gap-3 flex-1">
            <Checkbox
              checked={isSelected}
              onCheckedChange={onToggle}
              onClick={(e) => e.stopPropagation()}
              className="mt-1"
            />
            <div className="flex-1 min-w-0">
              <CardTitle 
                className="text-lg font-semibold leading-tight cursor-pointer hover:text-primary transition-colors"
                title={template.title}
                style={{
                  display: '-webkit-box',
                  WebkitLineClamp: 2,
                  WebkitBoxOrient: 'vertical',
                  overflow: 'hidden',
                  lineHeight: '1.3'
                }}
              >
                {template.title}
              </CardTitle>
            </div>
          </div>
        </div>
        
        <div className="flex items-center gap-2 mt-3">
          <Badge
            variant="outline"
            className={cn(
              "text-xs px-2 py-1 font-medium border-2",
              priorityColors[template.priority as keyof typeof priorityColors]
            )}
          >
            {priorityLabels[template.priority as keyof typeof priorityLabels]}
          </Badge>
          <Badge variant="secondary" className="text-xs px-2 py-1">
            {template.category}
          </Badge>
        </div>
      </CardHeader>

      <CardContent className="pt-0 flex-1 flex flex-col justify-between">
        <div className="flex-1">
          {template.description && (
            <div className="mb-4">
              <CardDescription 
                className={cn(
                  "text-sm text-gray-600 leading-relaxed cursor-pointer transition-all",
                  !isExpanded ? "line-clamp-3" : "line-clamp-none"
                )}
                onClick={(e) => {
                  e.stopPropagation();
                  setIsExpanded(!isExpanded);
                }}
                title={!isExpanded ? "Click to expand description" : "Click to collapse description"}
              >
                {template.description}
                {!isExpanded && template.description && template.description.length > 150 && (
                  <span className="text-primary font-medium ml-1 hover:underline">... read more</span>
                )}
              </CardDescription>
            </div>
          )}

          {template.reasoning && (
            <div className="mb-4 p-3 bg-blue-50 border border-blue-200 rounded-md">
              <p 
                className={cn(
                  "text-xs text-blue-700 leading-relaxed cursor-pointer",
                  !isExpanded && "line-clamp-2"
                )}
                onClick={(e) => {
                  e.stopPropagation();
                  setIsExpanded(!isExpanded);
                }}
                title="AI reasoning - click to expand"
              >
                💡 {template.reasoning}
              </p>
            </div>
          )}
        </div>
        
        <div className="space-y-3 mt-auto">
          <div className="space-y-2 text-sm">
            <div className="flex items-center justify-between bg-gray-50 px-3 py-2 rounded-md">
              <span className="text-gray-600 font-medium">Timeframe:</span>
              <span className="font-semibold text-gray-900 capitalize">{template.suggestedTimeframe}</span>
            </div>
            <div className="flex items-center justify-between bg-gray-50 px-3 py-2 rounded-md">
              <span className="text-gray-600 font-medium">Confidence:</span>
              <span className="font-semibold text-gray-900">{Math.round(template.confidenceScore * 100)}%</span>
            </div>
          </div>

          <Button
            variant="ghost"
            size="sm"
            className="w-full mt-3 text-primary hover:bg-primary/10"
            onClick={(e) => {
              e.stopPropagation();
              setIsExpanded(!isExpanded);
            }}
          >
            {isExpanded ? 'Show Less' : 'View Details'}
          </Button>
        </div>
      </CardContent>
    </Card>
  );
}

function TemplateCardSkeleton() {
  return (
    <Card className="min-h-[360px] h-full w-full flex flex-col">
      <CardHeader className="pb-3 flex-shrink-0">
        <div className="flex items-start justify-between">
          <div className="flex items-start gap-3 flex-1">
            <div className="h-4 w-4 bg-gray-200 rounded animate-pulse mt-1" />
            <div className="flex-1 space-y-2">
              <div className="h-5 w-3/4 bg-gray-200 rounded animate-pulse" />
              <div className="h-4 w-1/2 bg-gray-200 rounded animate-pulse" />
            </div>
          </div>
        </div>
        
        <div className="flex items-center gap-2 mt-3">
          <div className="h-6 w-24 bg-gray-200 rounded animate-pulse" />
          <div className="h-6 w-20 bg-gray-200 rounded animate-pulse" />
        </div>
      </CardHeader>

      <CardContent className="pt-0 flex-1 flex flex-col justify-between">
        <div className="flex-1">
          <div className="space-y-2 mb-4">
            <div className="h-4 w-full bg-gray-200 rounded animate-pulse" />
            <div className="h-4 w-full bg-gray-200 rounded animate-pulse" />
            <div className="h-4 w-3/4 bg-gray-200 rounded animate-pulse" />
          </div>
        </div>
        
        <div className="space-y-3 mt-auto">
          <div className="space-y-2">
            <div className="bg-gray-100 px-3 py-2 rounded-md flex items-center justify-between">
              <div className="h-4 w-20 bg-gray-200 rounded animate-pulse" />
              <div className="h-4 w-16 bg-gray-200 rounded animate-pulse" />
            </div>
            <div className="bg-gray-100 px-3 py-2 rounded-md flex items-center justify-between">
              <div className="h-4 w-20 bg-gray-200 rounded animate-pulse" />
              <div className="h-4 w-12 bg-gray-200 rounded animate-pulse" />
            </div>
          </div>
          <div className="h-9 w-full bg-gray-200 rounded animate-pulse" />
        </div>
      </CardContent>
    </Card>
  );
}