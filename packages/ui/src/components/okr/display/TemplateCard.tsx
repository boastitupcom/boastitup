"use client";

import React from 'react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '../../ui/card';
import { Badge } from '../../ui/badge';
import { Button } from '../../ui/button';
import { Checkbox } from '../../ui/checkbox';
import { 
  Target, 
  TrendingUp, 
  Clock, 
  Layers, 
  Lightbulb,
  Settings,
  CheckCircle2
} from 'lucide-react';
import type { OKRTemplate } from '../../../types/okr';

interface TemplateCardProps {
  template: OKRTemplate;
  isSelected: boolean;
  onSelect: (templateId: string) => void;
  onDeselect: (templateId: string) => void;
  onCustomize: (template: OKRTemplate) => void;
  disabled?: boolean;
}

export function TemplateCard({
  template,
  isSelected,
  onSelect,
  onDeselect,
  onCustomize,
  disabled = false
}: TemplateCardProps) {
  
  const handleSelectionChange = (checked: boolean) => {
    if (checked) {
      onSelect(template.id);
    } else {
      onDeselect(template.id);
    }
  };

  const getPriorityConfig = (priority: number) => {
    switch (priority) {
      case 1: return { 
        label: 'High', 
        color: 'bg-red-100 text-red-800 border-red-200',
        icon: '🔥' 
      };
      case 2: return { 
        label: 'Medium', 
        color: 'bg-yellow-100 text-yellow-800 border-yellow-200',
        icon: '⚡' 
      };
      case 3: return { 
        label: 'Low', 
        color: 'bg-green-100 text-green-800 border-green-200',
        icon: '🌱' 
      };
      default: return { 
        label: 'Medium', 
        color: 'bg-gray-100 text-gray-800 border-gray-200',
        icon: '⚡' 
      };
    }
  };

  const getTimeframeIcon = (timeframe: string) => {
    switch (timeframe) {
      case 'daily': return '📅';
      case 'weekly': return '📊';
      case 'monthly': return '📈';
      case 'quarterly': return '🎯';
      default: return '⏱️';
    }
  };

  const confidencePercentage = Math.round((template.confidenceScore || 0.5) * 100);
  const priorityConfig = getPriorityConfig(template.priority || 2);

  return (
    <Card 
      className={`
        relative transition-all duration-200 hover:shadow-md
        ${isSelected ? 'ring-2 ring-primary bg-primary/5' : 'hover:border-primary/50'}
        ${disabled ? 'opacity-50 cursor-not-allowed' : 'cursor-pointer'}
      `}
      onClick={() => !disabled && handleSelectionChange(!isSelected)}
    >
      {/* Selection Checkbox */}
      <div className="absolute top-4 left-4 z-10">
        <Checkbox
          checked={isSelected}
          onCheckedChange={handleSelectionChange}
          disabled={disabled}
          className="data-[state=checked]:bg-primary"
        />
      </div>

      {/* Selected Indicator */}
      {isSelected && (
        <div className="absolute top-4 right-4 text-primary">
          <CheckCircle2 className="h-5 w-5" />
        </div>
      )}

      <CardHeader className="pl-12 pr-12">
        <div className="flex flex-wrap items-start gap-2 mb-2">
          <Badge variant="secondary" className="text-xs">
            {template.category}
          </Badge>
          <Badge className={`text-xs ${priorityConfig.color}`}>
            {priorityConfig.icon} {priorityConfig.label}
          </Badge>
          <Badge variant="outline" className="text-xs">
            {confidencePercentage}% Match
          </Badge>
        </div>

        <CardTitle className="text-lg leading-tight line-clamp-2">
          {template.title}
        </CardTitle>

        <CardDescription className="line-clamp-3">
          {template.description}
        </CardDescription>
      </CardHeader>

      <CardContent className="pl-12 pr-6">
        <div className="space-y-3">
          {/* Key Metrics */}
          <div className="flex flex-wrap items-center gap-4 text-sm text-muted-foreground">
            <div className="flex items-center gap-1">
              <Target className="h-4 w-4" />
              <span>{template.suggestedTargetValue || 'Custom'}</span>
            </div>
            
            <div className="flex items-center gap-1">
              <Clock className="h-4 w-4" />
              <span className="capitalize">
                {getTimeframeIcon(template.suggestedTimeframe)} {template.suggestedTimeframe}
              </span>
            </div>

            {template.applicablePlatforms && template.applicablePlatforms.length > 0 && (
              <div className="flex items-center gap-1">
                <Layers className="h-4 w-4" />
                <span>{template.applicablePlatforms.length} platform{template.applicablePlatforms.length > 1 ? 's' : ''}</span>
              </div>
            )}
          </div>

          {/* AI Reasoning Preview */}
          {template.reasoning && (
            <div className="bg-muted/50 rounded-md p-3">
              <div className="flex items-start gap-2">
                <Lightbulb className="h-4 w-4 mt-0.5 text-yellow-600 flex-shrink-0" />
                <p className="text-sm text-muted-foreground line-clamp-2">
                  {template.reasoning}
                </p>
              </div>
            </div>
          )}

          {/* Actions */}
          <div className="flex gap-2 pt-2">
            <Button
              variant={isSelected ? "default" : "outline"}
              size="sm"
              className="flex-1"
              onClick={(e) => {
                e.stopPropagation();
                handleSelectionChange(!isSelected);
              }}
              disabled={disabled}
            >
              {isSelected ? 'Selected' : 'Select'}
            </Button>
            
            <Button
              variant="ghost"
              size="sm"
              onClick={(e) => {
                e.stopPropagation();
                onCustomize(template);
              }}
              disabled={disabled}
              className="flex items-center gap-1"
            >
              <Settings className="h-3 w-3" />
              Customize
            </Button>
          </div>
        </div>
      </CardContent>
    </Card>
  );
}