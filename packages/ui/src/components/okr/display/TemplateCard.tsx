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
  onCustomize?: (template: OKRTemplate) => void;
  disabled?: boolean;
  className?: string;
}

export function TemplateCard({
  template,
  isSelected,
  onSelect,
  onDeselect,
  onCustomize,
  disabled = false,
  className
}: TemplateCardProps) {
  const [isExpanded, setIsExpanded] = React.useState(false);
  
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
        relative transition-all duration-200 hover:shadow-lg border-2 flex flex-col
        min-h-[360px] h-full w-full
        ${isSelected ? 'ring-2 ring-primary bg-primary/5 border-primary' : 'hover:border-primary/50'}
        ${disabled ? 'opacity-50 cursor-not-allowed' : 'cursor-pointer'}
        ${className || ''}
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

      <CardHeader className="pl-12 pr-12 flex-shrink-0">
        <div className="flex flex-wrap items-start gap-2 mb-3">
          <Badge variant="secondary" className="text-xs px-2 py-1">
            {template.category}
          </Badge>
          <Badge className={`text-xs px-2 py-1 font-medium border-2 ${priorityConfig.color}`}>
            {priorityConfig.icon} {priorityConfig.label}
          </Badge>
          <Badge variant="outline" className="text-xs px-2 py-1">
            {confidencePercentage}% Match
          </Badge>
        </div>

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

        <CardDescription 
          className={`cursor-pointer transition-all leading-relaxed ${
            !isExpanded ? 'line-clamp-2' : ''
          }`}
          onClick={(e) => {
            e.stopPropagation();
            setIsExpanded(!isExpanded);
          }}
          title={!isExpanded ? "Click to expand" : "Click to collapse"}
        >
          {template.description}
          {!isExpanded && template.description && template.description.length > 100 && (
            <span className="text-primary font-medium ml-1">...more</span>
          )}
        </CardDescription>
      </CardHeader>

      <CardContent className="pl-12 pr-6 flex-1 flex flex-col justify-between">
        <div className="space-y-3 flex-1">
          {/* Key Metrics */}
          <div className="space-y-2">
            <div className="flex items-center justify-between bg-gray-50 px-3 py-2 rounded-md">
              <div className="flex items-center gap-1 text-gray-600 font-medium">
                <Target className="h-4 w-4" />
                <span>Target:</span>
              </div>
              <span className="font-semibold text-gray-900">{template.suggestedTargetValue || 'Custom'}</span>
            </div>
            
            <div className="flex items-center justify-between bg-gray-50 px-3 py-2 rounded-md">
              <div className="flex items-center gap-1 text-gray-600 font-medium">
                <Clock className="h-4 w-4" />
                <span>Timeframe:</span>
              </div>
              <span className="font-semibold text-gray-900 capitalize">
                {getTimeframeIcon(template.suggestedTimeframe)} {template.suggestedTimeframe}
              </span>
            </div>

            {template.applicablePlatforms && template.applicablePlatforms.length > 0 && (
              <div className="flex items-center justify-between bg-gray-50 px-3 py-2 rounded-md">
                <div className="flex items-center gap-1 text-gray-600 font-medium">
                  <Layers className="h-4 w-4" />
                  <span>Platforms:</span>
                </div>
                <span className="font-semibold text-gray-900">
                  {template.applicablePlatforms.length} platform{template.applicablePlatforms.length > 1 ? 's' : ''}
                </span>
              </div>
            )}
          </div>

          {/* AI Reasoning Preview */}
          {template.reasoning && (
            <div className="bg-blue-50 border border-blue-200 rounded-md p-3">
              <div className="flex items-start gap-2">
                <Lightbulb className="h-4 w-4 mt-0.5 text-yellow-600 flex-shrink-0" />
                <p 
                  className={`text-sm text-blue-700 leading-relaxed cursor-pointer ${
                    !isExpanded ? 'line-clamp-2' : ''
                  }`}
                  onClick={(e) => {
                    e.stopPropagation();
                    setIsExpanded(!isExpanded);
                  }}
                  title="AI reasoning - click to expand"
                >
                  {template.reasoning}
                </p>
              </div>
            </div>
          )}
        </div>

        {/* Actions */}
        <div className="space-y-2 mt-4">
          <Button
            variant={isSelected ? "default" : "outline"}
            size="sm"
            className="w-full"
            onClick={(e) => {
              e.stopPropagation();
              handleSelectionChange(!isSelected);
            }}
            disabled={disabled}
          >
            {isSelected ? 'Selected' : 'Select'}
          </Button>
          
          <div className="flex gap-2">
            {onCustomize && (
              <Button
                variant="ghost"
                size="sm"
                onClick={(e) => {
                  e.stopPropagation();
                  onCustomize(template);
                }}
                disabled={disabled}
                className="flex items-center gap-1 flex-1"
              >
                <Settings className="h-3 w-3" />
                Customize
              </Button>
            )}
            
            <Button
              variant="ghost"
              size="sm"
              className="flex-1 text-primary hover:bg-primary/10"
              onClick={(e) => {
                e.stopPropagation();
                setIsExpanded(!isExpanded);
              }}
            >
              {isExpanded ? 'Show Less' : 'View Details'}
            </Button>
          </div>
        </div>
      </CardContent>
    </Card>
  );
}