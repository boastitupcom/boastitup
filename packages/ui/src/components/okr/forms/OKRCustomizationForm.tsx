"use client";

import React from 'react';
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { z } from 'zod';
import { Card, CardContent, CardHeader, CardTitle } from '../../ui/card';
import { Button } from '../../ui/button';
import { Input } from '../../ui/input';
import { Label } from '../../ui/label';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '../../ui/select';
import { Textarea } from '../../ui/textarea';
import { Badge } from '../../ui/badge';
import { Calendar, Target, TrendingUp, Clock, Layers } from 'lucide-react';
import type { OKRTemplate, MetricType, Platform, DateDimension } from '../../../types/okr';

// Validation schema from story.txt lines 404-412
const customizationSchema = z.object({
  title: z.string().min(3, 'Title must be at least 3 characters').max(200, 'Title too long'),
  description: z.string().optional(),
  targetValue: z.number().positive('Target value must be positive'),
  targetDateId: z.number().positive('Please select a target date'),
  granularity: z.enum(['daily', 'weekly', 'monthly']),
  platformId: z.string().uuid('Please select a platform').optional(),
  metricTypeId: z.string().uuid('Please select a metric type'),
  priority: z.number().int().min(1).max(3, 'Priority must be between 1-3')
});

type CustomizationForm = z.infer<typeof customizationSchema>;

interface OKRCustomizationFormProps {
  template: OKRTemplate;
  metricTypes: MetricType[];
  platforms: Platform[];
  dates: DateDimension[];
  onSave: (customization: CustomizationForm & { templateId: string }) => void;
  onCancel: () => void;
  isLoading?: boolean;
}

export function OKRCustomizationForm({
  template,
  metricTypes,
  platforms,
  dates,
  onSave,
  onCancel,
  isLoading = false
}: OKRCustomizationFormProps) {
  const {
    register,
    handleSubmit,
    formState: { errors },
    setValue,
    watch
  } = useForm<CustomizationForm>({
    resolver: zodResolver(customizationSchema),
    defaultValues: {
      title: template.title,
      description: template.description,
      targetValue: template.suggestedTargetValue || 100,
      priority: template.priority || 2,
      granularity: template.suggestedTimeframe === 'quarterly' ? 'monthly' : template.suggestedTimeframe as any,
      metricTypeId: template.metricTypeId,
      platformId: template.applicablePlatforms?.[0] || undefined
    }
  });

  const selectedMetricType = metricTypes.find(m => m.id === watch('metricTypeId'));
  const selectedPlatform = platforms.find(p => p.id === watch('platformId'));

  const getPriorityLabel = (priority: number) => {
    switch (priority) {
      case 1: return { label: 'High', color: 'bg-red-100 text-red-800' };
      case 2: return { label: 'Medium', color: 'bg-yellow-100 text-yellow-800' };
      case 3: return { label: 'Low', color: 'bg-green-100 text-green-800' };
      default: return { label: 'Medium', color: 'bg-gray-100 text-gray-800' };
    }
  };

  const onFormSubmit = (data: CustomizationForm) => {
    onSave({
      ...data,
      templateId: template.id
    });
  };

  // Filter dates to show next 90 days of business days
  const upcomingDates = dates
    .filter(date => new Date(date.date) > new Date())
    .slice(0, 90);

  return (
    <Card className="w-full max-w-2xl">
      <CardHeader>
        <CardTitle className="flex items-center gap-2">
          <Target className="h-5 w-5" />
          Customize OKR: {template.title}
        </CardTitle>
        <div className="flex flex-wrap gap-2 mt-2">
          <Badge variant="secondary">{template.category}</Badge>
          <Badge className={getPriorityLabel(template.priority || 2).color}>
            {getPriorityLabel(template.priority || 2).label} Priority
          </Badge>
          <Badge variant="outline">
            {template.confidenceScore ? `${Math.round(template.confidenceScore * 100)}% Confidence` : 'AI Generated'}
          </Badge>
        </div>
      </CardHeader>

      <CardContent>
        <form onSubmit={handleSubmit(onFormSubmit)} className="space-y-6">
          {/* Title */}
          <div className="space-y-2">
            <Label htmlFor="title">OKR Title *</Label>
            <Input
              id="title"
              {...register('title')}
              disabled={isLoading}
            />
            {errors.title && (
              <p className="text-sm text-destructive">{errors.title.message}</p>
            )}
          </div>

          {/* Description */}
          <div className="space-y-2">
            <Label htmlFor="description">Description</Label>
            <Textarea
              id="description"
              {...register('description')}
              rows={3}
              disabled={isLoading}
              placeholder="Describe the business impact and approach for this OKR"
            />
            {errors.description && (
              <p className="text-sm text-destructive">{errors.description.message}</p>
            )}
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            {/* Target Value */}
            <div className="space-y-2">
              <Label htmlFor="targetValue" className="flex items-center gap-2">
                <TrendingUp className="h-4 w-4" />
                Target Value *
              </Label>
              <Input
                id="targetValue"
                type="number"
                {...register('targetValue', { valueAsNumber: true })}
                disabled={isLoading}
              />
              {selectedMetricType && (
                <p className="text-xs text-muted-foreground">
                  Unit: {selectedMetricType.unit || 'count'}
                </p>
              )}
              {errors.targetValue && (
                <p className="text-sm text-destructive">{errors.targetValue.message}</p>
              )}
            </div>

            {/* Priority */}
            <div className="space-y-2">
              <Label htmlFor="priority" className="flex items-center gap-2">
                <Layers className="h-4 w-4" />
                Priority Level *
              </Label>
              <Select
                onValueChange={(value) => setValue('priority', parseInt(value))}
                defaultValue={watch('priority')?.toString()}
                disabled={isLoading}
              >
                <SelectTrigger>
                  <SelectValue placeholder="Select priority" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="1">1 - High Priority</SelectItem>
                  <SelectItem value="2">2 - Medium Priority</SelectItem>
                  <SelectItem value="3">3 - Low Priority</SelectItem>
                </SelectContent>
              </Select>
              {errors.priority && (
                <p className="text-sm text-destructive">{errors.priority.message}</p>
              )}
            </div>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            {/* Granularity */}
            <div className="space-y-2">
              <Label htmlFor="granularity" className="flex items-center gap-2">
                <Clock className="h-4 w-4" />
                Measurement Frequency *
              </Label>
              <Select
                onValueChange={(value) => setValue('granularity', value as any)}
                defaultValue={watch('granularity')}
                disabled={isLoading}
              >
                <SelectTrigger>
                  <SelectValue placeholder="Select frequency" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="daily">Daily Tracking</SelectItem>
                  <SelectItem value="weekly">Weekly Tracking</SelectItem>
                  <SelectItem value="monthly">Monthly Tracking</SelectItem>
                </SelectContent>
              </Select>
              {errors.granularity && (
                <p className="text-sm text-destructive">{errors.granularity.message}</p>
              )}
            </div>

            {/* Target Date */}
            <div className="space-y-2">
              <Label htmlFor="targetDateId" className="flex items-center gap-2">
                <Calendar className="h-4 w-4" />
                Target Date *
              </Label>
              <Select
                onValueChange={(value) => setValue('targetDateId', parseInt(value))}
                disabled={isLoading}
              >
                <SelectTrigger>
                  <SelectValue placeholder="Select target date" />
                </SelectTrigger>
                <SelectContent>
                  {upcomingDates.map((date) => (
                    <SelectItem key={date.id} value={date.id.toString()}>
                      {new Date(date.date).toLocaleDateString()} - {date.quarter_name} {date.year}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
              {errors.targetDateId && (
                <p className="text-sm text-destructive">{errors.targetDateId.message}</p>
              )}
            </div>
          </div>

          {/* Metric Type */}
          <div className="space-y-2">
            <Label htmlFor="metricTypeId">Metric Type *</Label>
            <Select
              onValueChange={(value) => setValue('metricTypeId', value)}
              defaultValue={watch('metricTypeId')}
              disabled={isLoading}
            >
              <SelectTrigger>
                <SelectValue placeholder="Select metric type" />
              </SelectTrigger>
              <SelectContent>
                {metricTypes.map((metric) => (
                  <SelectItem key={metric.id} value={metric.id}>
                    {metric.code} - {metric.description}
                    {metric.unit && ` (${metric.unit})`}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
            {errors.metricTypeId && (
              <p className="text-sm text-destructive">{errors.metricTypeId.message}</p>
            )}
          </div>

          {/* Platform (Optional) */}
          <div className="space-y-2">
            <Label htmlFor="platformId">Platform (Optional)</Label>
            <Select
              onValueChange={(value) => setValue('platformId', value === 'none' ? undefined : value)}
              defaultValue={watch('platformId') || 'none'}
              disabled={isLoading}
            >
              <SelectTrigger>
                <SelectValue placeholder="Select platform" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="none">No specific platform</SelectItem>
                {platforms.map((platform) => (
                  <SelectItem key={platform.id} value={platform.id}>
                    {platform.display_name} ({platform.category})
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
          </div>

          {/* AI Reasoning */}
          {template.reasoning && (
            <div className="p-4 bg-muted rounded-lg">
              <h4 className="font-medium text-sm mb-2">AI Recommendation Reasoning:</h4>
              <p className="text-sm text-muted-foreground">{template.reasoning}</p>
            </div>
          )}

          {/* Actions */}
          <div className="flex flex-col sm:flex-row gap-3 pt-4">
            <Button
              type="submit"
              disabled={isLoading}
              className="flex-1"
            >
              {isLoading ? 'Saving...' : 'Save Customization'}
            </Button>
            
            <Button
              type="button"
              variant="outline"
              onClick={onCancel}
              disabled={isLoading}
              className="flex-1 sm:flex-none"
            >
              Cancel
            </Button>
          </div>
        </form>
      </CardContent>
    </Card>
  );
}