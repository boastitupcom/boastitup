"use client";

import * as React from "react";
import { useState } from "react";
import { Check, X, Save, Loader2 } from "lucide-react";
import { cn } from "../../../lib/utils";
import { Button } from "../../ui/button";
import { Input } from "../../ui/input";
import { Label } from "../../ui/label";
import { Textarea } from "../../ui/textarea";
import { 
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "../../ui/select";
import { Card, CardContent, CardHeader, CardTitle } from "../../ui/card";
import { Badge } from "../../ui/badge";

export interface ManagedOKR {
  id: string;
  title: string;
  description: string;
  target_value: number;
  current_value?: number;
  granularity: 'daily' | 'weekly' | 'monthly';
  is_active: boolean;
  status?: 'active' | 'paused' | 'completed' | 'archived';
  priority?: number;
  target_date_id: string;
  platform_id?: string;
  metric_type_id: string;
  
  // Joined data
  dim_date?: {
    id: string;
    date: string;
    month_name: string;
    year: number;
    quarter_name: string;
  };
  dim_platform?: {
    id: string;
    name: string;
    display_name: string;
    category: string;
  };
  dim_metric_type?: {
    id: string;
    code: string;
    description: string;
    unit?: string;
    category: string;
  };
}

export interface Platform {
  id: string;
  name: string;
  category: string;
  display_name: string;
  is_active?: boolean;
  created_at?: string;
}

export interface MetricType {
  id: string;
  code: string;
  description: string;
  unit?: string;
  category: string;
  created_at?: string;
}

export interface DateDimension {
  id: number;
  date: string;
  week_start: string;
  month: number;
  quarter: number;
  year: number;
  is_business_day: boolean;
  day_of_week: number;
  month_name: string;
  quarter_name: string;
  created_at?: string;
}

export interface OKRUpdateInput {
  title?: string;
  description?: string;
  target_value?: number;
  current_value?: number;
  status?: 'active' | 'paused' | 'completed' | 'archived';
  priority?: number;
  target_date_id?: string;
  platform_id?: string;
}

export interface QuickEditFormProps {
  okr: ManagedOKR;
  platforms?: Platform[];
  metricTypes?: MetricType[];
  dates?: DateDimension[];
  onSave: (okrId: string, updates: OKRUpdateInput) => Promise<void>;
  onCancel: () => void;
  isLoading?: boolean;
}

export function QuickEditForm({
  okr,
  platforms = [],
  metricTypes = [],
  dates = [],
  onSave,
  onCancel,
  isLoading = false
}: QuickEditFormProps) {
  const [formData, setFormData] = useState<OKRUpdateInput>({
    title: okr.title,
    description: okr.description,
    target_value: okr.target_value,
    current_value: okr.current_value || 0,
    status: okr.status || 'active',
    priority: okr.priority || 2,
    target_date_id: okr.target_date_id,
    platform_id: okr.platform_id || undefined
  });

  const [errors, setErrors] = useState<Record<string, string>>({});
  const [isSaving, setIsSaving] = useState(false);

  const handleInputChange = (field: keyof OKRUpdateInput, value: any) => {
    setFormData(prev => ({
      ...prev,
      [field]: value
    }));
    
    // Clear error when field is modified
    if (errors[field]) {
      setErrors(prev => ({
        ...prev,
        [field]: ''
      }));
    }
  };

  const validateForm = (): boolean => {
    const newErrors: Record<string, string> = {};

    if (!formData.title?.trim()) {
      newErrors.title = 'Title is required';
    } else if (formData.title.length < 3) {
      newErrors.title = 'Title must be at least 3 characters';
    } else if (formData.title.length > 200) {
      newErrors.title = 'Title cannot exceed 200 characters';
    }

    if (formData.target_value !== undefined && formData.target_value <= 0) {
      newErrors.target_value = 'Target value must be positive';
    }

    if (formData.current_value !== undefined && formData.current_value < 0) {
      newErrors.current_value = 'Current value cannot be negative';
    }

    if (formData.priority && (formData.priority < 1 || formData.priority > 3)) {
      newErrors.priority = 'Priority must be between 1 (High) and 3 (Low)';
    }

    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  const handleSave = async () => {
    if (!validateForm()) {
      return;
    }

    setIsSaving(true);
    try {
      // Only include changed fields
      const updates: OKRUpdateInput = {};
      
      if (formData.title !== okr.title) updates.title = formData.title;
      if (formData.description !== okr.description) updates.description = formData.description;
      if (formData.target_value !== okr.target_value) updates.target_value = formData.target_value;
      if (formData.current_value !== okr.current_value) updates.current_value = formData.current_value;
      if (formData.status !== okr.status) updates.status = formData.status;
      if (formData.priority !== okr.priority) updates.priority = formData.priority;
      if (formData.target_date_id !== okr.target_date_id) updates.target_date_id = formData.target_date_id;
      if (formData.platform_id !== okr.platform_id) updates.platform_id = formData.platform_id;

      if (Object.keys(updates).length === 0) {
        onCancel(); // No changes to save
        return;
      }

      await onSave(okr.id, updates);
    } catch (error) {
      console.error('Failed to save OKR:', error);
      setErrors({ general: 'Failed to save changes. Please try again.' });
    } finally {
      setIsSaving(false);
    }
  };

  const getStatusBadge = (status: string) => {
    switch (status) {
      case 'active':
        return <Badge variant="default" className="bg-green-100 text-green-800">Active</Badge>;
      case 'paused':
        return <Badge variant="secondary">Paused</Badge>;
      case 'completed':
        return <Badge variant="outline" className="bg-blue-100 text-blue-800">Completed</Badge>;
      case 'archived':
        return <Badge variant="outline">Archived</Badge>;
      default:
        return <Badge variant="outline">{status}</Badge>;
    }
  };

  const getPriorityLabel = (priority: number) => {
    switch (priority) {
      case 1: return '🔴 High Priority';
      case 2: return '🟡 Medium Priority';
      case 3: return '🟢 Low Priority';
      default: return 'Unknown Priority';
    }
  };

  const currentProgress = formData.current_value && formData.target_value 
    ? Math.round((formData.current_value / formData.target_value) * 100)
    : 0;

  return (
    <Card className="w-full max-w-2xl">
      <CardHeader>
        <div className="flex items-center justify-between">
          <CardTitle className="text-lg">Quick Edit OKR</CardTitle>
          <div className="flex items-center gap-2">
            {getStatusBadge(formData.status || 'active')}
            <Badge variant="outline" className="text-xs">
              {currentProgress}% Complete
            </Badge>
          </div>
        </div>
      </CardHeader>

      <CardContent className="space-y-4">
        {errors.general && (
          <div className="p-3 bg-red-50 border border-red-200 rounded-md">
            <p className="text-sm text-red-600">{errors.general}</p>
          </div>
        )}

        {/* Title */}
        <div className="space-y-2">
          <Label htmlFor="title" className="text-sm font-medium">
            Title <span className="text-red-500">*</span>
          </Label>
          <Input
            id="title"
            value={formData.title || ''}
            onChange={(e) => handleInputChange('title', e.target.value)}
            placeholder="Enter OKR title"
            className={cn(errors.title && "border-red-500")}
          />
          {errors.title && (
            <p className="text-xs text-red-600">{errors.title}</p>
          )}
        </div>

        {/* Description */}
        <div className="space-y-2">
          <Label htmlFor="description" className="text-sm font-medium">
            Description
          </Label>
          <Textarea
            id="description"
            value={formData.description || ''}
            onChange={(e) => handleInputChange('description', e.target.value)}
            placeholder="Enter OKR description"
            rows={3}
          />
        </div>

        {/* Values and Progress */}
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          <div className="space-y-2">
            <Label htmlFor="current-value" className="text-sm font-medium">
              Current Value
            </Label>
            <div className="relative">
              <Input
                id="current-value"
                type="number"
                value={formData.current_value || ''}
                onChange={(e) => handleInputChange('current_value', parseFloat(e.target.value) || 0)}
                placeholder="0"
                min="0"
                step="0.01"
                className={cn(errors.current_value && "border-red-500")}
              />
              {okr.dim_metric_type?.unit && (
                <span className="absolute right-3 top-1/2 transform -translate-y-1/2 text-sm text-muted-foreground">
                  {okr.dim_metric_type.unit}
                </span>
              )}
            </div>
            {errors.current_value && (
              <p className="text-xs text-red-600">{errors.current_value}</p>
            )}
          </div>

          <div className="space-y-2">
            <Label htmlFor="target-value" className="text-sm font-medium">
              Target Value <span className="text-red-500">*</span>
            </Label>
            <div className="relative">
              <Input
                id="target-value"
                type="number"
                value={formData.target_value || ''}
                onChange={(e) => handleInputChange('target_value', parseFloat(e.target.value) || 0)}
                placeholder="0"
                min="0"
                step="0.01"
                className={cn(errors.target_value && "border-red-500")}
              />
              {okr.dim_metric_type?.unit && (
                <span className="absolute right-3 top-1/2 transform -translate-y-1/2 text-sm text-muted-foreground">
                  {okr.dim_metric_type.unit}
                </span>
              )}
            </div>
            {errors.target_value && (
              <p className="text-xs text-red-600">{errors.target_value}</p>
            )}
          </div>
        </div>

        {/* Status and Priority */}
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          <div className="space-y-2">
            <Label htmlFor="status" className="text-sm font-medium">
              Status
            </Label>
            <Select
              value={formData.status || 'active'}
              onValueChange={(value) => handleInputChange('status', value)}
            >
              <SelectTrigger>
                <SelectValue />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="active">Active</SelectItem>
                <SelectItem value="paused">Paused</SelectItem>
                <SelectItem value="completed">Completed</SelectItem>
                <SelectItem value="archived">Archived</SelectItem>
              </SelectContent>
            </Select>
          </div>

          <div className="space-y-2">
            <Label htmlFor="priority" className="text-sm font-medium">
              Priority Level
            </Label>
            <Select
              value={formData.priority?.toString() || '2'}
              onValueChange={(value) => handleInputChange('priority', parseInt(value))}
            >
              <SelectTrigger>
                <SelectValue />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="1">🔴 High Priority</SelectItem>
                <SelectItem value="2">🟡 Medium Priority</SelectItem>
                <SelectItem value="3">🟢 Low Priority</SelectItem>
              </SelectContent>
            </Select>
            {errors.priority && (
              <p className="text-xs text-red-600">{errors.priority}</p>
            )}
          </div>
        </div>

        {/* Platform Selection */}
        {platforms.length > 0 && (
          <div className="space-y-2">
            <Label htmlFor="platform" className="text-sm font-medium">
              Platform
            </Label>
            <Select
              value={formData.platform_id || ''}
              onValueChange={(value) => handleInputChange('platform_id', value || undefined)}
            >
              <SelectTrigger>
                <SelectValue placeholder="Select platform (optional)" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="none">All Platforms</SelectItem>
                {platforms.map((platform) => (
                  <SelectItem key={platform.id} value={platform.id}>
                    {platform.display_name}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
          </div>
        )}

        {/* Current Metric Type Info */}
        {okr.dim_metric_type && (
          <div className="p-3 bg-gray-50 rounded-md">
            <div className="text-sm">
              <span className="font-medium">Metric:</span> {okr.dim_metric_type.description}
              {okr.dim_metric_type.unit && (
                <span className="text-muted-foreground"> ({okr.dim_metric_type.unit})</span>
              )}
            </div>
          </div>
        )}

        {/* Action Buttons */}
        <div className="flex items-center justify-end gap-3 pt-4 border-t">
          <Button
            variant="outline"
            onClick={onCancel}
            disabled={isSaving || isLoading}
          >
            <X className="w-4 h-4 mr-2" />
            Cancel
          </Button>
          <Button
            onClick={handleSave}
            disabled={isSaving || isLoading}
            className="min-w-[100px]"
          >
            {isSaving ? (
              <>
                <Loader2 className="w-4 h-4 mr-2 animate-spin" />
                Saving...
              </>
            ) : (
              <>
                <Save className="w-4 h-4 mr-2" />
                Save Changes
              </>
            )}
          </Button>
        </div>
      </CardContent>
    </Card>
  );
}

export function QuickEditFormSkeleton() {
  return (
    <Card className="w-full max-w-2xl">
      <CardHeader>
        <div className="flex items-center justify-between">
          <div className="h-6 w-32 bg-gray-200 rounded animate-pulse" />
          <div className="flex items-center gap-2">
            <div className="h-5 w-16 bg-gray-200 rounded animate-pulse" />
            <div className="h-5 w-20 bg-gray-200 rounded animate-pulse" />
          </div>
        </div>
      </CardHeader>

      <CardContent className="space-y-4">
        <div className="space-y-2">
          <div className="h-4 w-12 bg-gray-200 rounded animate-pulse" />
          <div className="h-10 w-full bg-gray-200 rounded animate-pulse" />
        </div>
        
        <div className="space-y-2">
          <div className="h-4 w-20 bg-gray-200 rounded animate-pulse" />
          <div className="h-20 w-full bg-gray-200 rounded animate-pulse" />
        </div>
        
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          <div className="space-y-2">
            <div className="h-4 w-24 bg-gray-200 rounded animate-pulse" />
            <div className="h-10 w-full bg-gray-200 rounded animate-pulse" />
          </div>
          <div className="space-y-2">
            <div className="h-4 w-20 bg-gray-200 rounded animate-pulse" />
            <div className="h-10 w-full bg-gray-200 rounded animate-pulse" />
          </div>
        </div>
        
        <div className="flex justify-end gap-3 pt-4 border-t">
          <div className="h-9 w-20 bg-gray-200 rounded animate-pulse" />
          <div className="h-9 w-28 bg-gray-200 rounded animate-pulse" />
        </div>
      </CardContent>
    </Card>
  );
}