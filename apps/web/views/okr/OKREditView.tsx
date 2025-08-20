"use client";

import * as React from "react";
import { useState, useEffect } from "react";
import { toast } from "sonner";
import { useRouter } from "next/navigation";
import { ArrowLeft, Save, X } from "lucide-react";

import {
  Button,
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
  Input,
  Label,
  Textarea,
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
  Badge,
  Separator,
  Alert,
  AlertDescription
} from "@boastitup/ui";

import { useOKRManagement } from "../../hooks/use-okr-management";
import { useBrandContext } from "../../hooks/use-brand-context";
import { 
  ManagedOKR, 
  Platform,
  MetricType,
  DateDimension,
  OKRUpdateInput
} from "../../types/okr-creation";

interface OKREditViewProps {
  okr: ManagedOKR;
  platforms: Platform[];
  metricTypes: MetricType[];
  dates: DateDimension[];
  brandId: string;
}

export function OKREditView({ 
  okr, 
  platforms, 
  metricTypes, 
  dates, 
  brandId 
}: OKREditViewProps) {
  // Form state
  const [formData, setFormData] = useState({
    title: okr.title,
    description: okr.description,
    target_value: okr.target_value,
    current_value: okr.current_value,
    status: okr.status,
    priority: okr.priority,
    granularity: okr.granularity,
    target_date_id: okr.target_date_id,
    platform_id: okr.platform_id || '',
    metric_type_id: okr.metric_type_id
  });

  const [hasChanges, setHasChanges] = useState(false);
  
  const router = useRouter();

  // Hooks
  const { brand, permissions } = useBrandContext(brandId);
  const { 
    updateOKR, 
    isLoading, 
    error 
  } = useOKRManagement(brandId);

  // Check for changes
  useEffect(() => {
    const hasChanged = 
      formData.title !== okr.title ||
      formData.description !== okr.description ||
      formData.target_value !== okr.target_value ||
      formData.current_value !== okr.current_value ||
      formData.status !== okr.status ||
      formData.priority !== okr.priority ||
      formData.granularity !== okr.granularity ||
      formData.target_date_id !== okr.target_date_id ||
      formData.platform_id !== (okr.platform_id || '') ||
      formData.metric_type_id !== okr.metric_type_id;
    
    setHasChanges(hasChanged);
  }, [formData, okr]);

  // Handlers
  const handleInputChange = (field: string, value: any) => {
    setFormData(prev => ({
      ...prev,
      [field]: value
    }));
  };

  const handleSave = async () => {
    try {
      const updateData: OKRUpdateInput = {
        title: formData.title !== okr.title ? formData.title : undefined,
        description: formData.description !== okr.description ? formData.description : undefined,
        target_value: formData.target_value !== okr.target_value ? formData.target_value : undefined,
        current_value: formData.current_value !== okr.current_value ? formData.current_value : undefined,
        status: formData.status !== okr.status ? formData.status : undefined,
        priority: formData.priority !== okr.priority ? formData.priority : undefined,
        target_date_id: formData.target_date_id !== okr.target_date_id ? formData.target_date_id : undefined,
        platform_id: formData.platform_id !== (okr.platform_id || '') ? (formData.platform_id || null) : undefined
      };

      // Remove undefined values
      Object.keys(updateData).forEach(key => {
        if (updateData[key as keyof OKRUpdateInput] === undefined) {
          delete updateData[key as keyof OKRUpdateInput];
        }
      });

      if (Object.keys(updateData).length === 0) {
        toast.info('No changes to save');
        return;
      }

      await updateOKR(okr.id, updateData);
      toast.success('OKR updated successfully');
      router.push('/workspace/okr/manage');
    } catch (error) {
      toast.error('Failed to update OKR');
    }
  };

  const handleCancel = () => {
    if (hasChanges) {
      const confirmLeave = confirm('You have unsaved changes. Are you sure you want to leave?');
      if (!confirmLeave) return;
    }
    router.push('/workspace/okr/manage');
  };

  // Permission check
  if (permissions && !permissions.canEditOKRs) {
    return (
      <div className="container mx-auto px-4 py-8 max-w-4xl">
        <Alert>
          <AlertDescription>
            You don't have permission to edit OKRs for this brand. Please contact your administrator.
          </AlertDescription>
        </Alert>
      </div>
    );
  }

  // Get future dates
  const futureDates = dates.filter(d => new Date(d.date) >= new Date()).slice(0, 60);

  // Calculate progress percentage
  const progressPercentage = formData.target_value > 0 
    ? Math.min(100, (formData.current_value / formData.target_value) * 100) 
    : 0;

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

  return (
    <div className="container mx-auto px-4 py-8 max-w-4xl">
      {/* Header */}
      <div className="mb-8">
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-4">
            <Button
              variant="outline"
              onClick={handleCancel}
            >
              <ArrowLeft className="w-4 h-4 mr-2" />
              Back to Management
            </Button>
            <div>
              <h1 className="text-3xl font-bold text-gray-900">Edit OKR</h1>
              <p className="text-gray-600 mt-2">
                Update your OKR details and progress for {brand?.name}
              </p>
            </div>
          </div>
          <div className="flex items-center gap-3">
            <Button
              variant="outline"
              onClick={handleCancel}
            >
              <X className="w-4 h-4 mr-2" />
              Cancel
            </Button>
            <Button
              onClick={handleSave}
              disabled={!hasChanges || isLoading}
            >
              <Save className="w-4 h-4 mr-2" />
              {isLoading ? 'Saving...' : 'Save Changes'}
            </Button>
          </div>
        </div>
        <Separator className="mt-6" />
      </div>

      {/* Progress Overview */}
      <Card className="mb-6">
        <CardHeader>
          <div className="flex items-center justify-between">
            <CardTitle className="text-lg">Progress Overview</CardTitle>
            {getStatusBadge(formData.status)}
          </div>
        </CardHeader>
        <CardContent>
          <div className="space-y-4">
            <div>
              <div className="flex justify-between text-sm mb-2">
                <span>Progress: {formData.current_value}/{formData.target_value}</span>
                <span>{progressPercentage.toFixed(1)}%</span>
              </div>
              <div className="w-full bg-gray-200 rounded-full h-2">
                <div 
                  className="bg-primary h-2 rounded-full transition-all duration-300"
                  style={{ width: `${progressPercentage}%` }}
                />
              </div>
            </div>
            <div className="grid grid-cols-3 gap-4 text-sm">
              <div>
                <span className="text-muted-foreground">Created:</span>
                <span className="ml-1 font-medium">
                  {new Date(okr.created_at).toLocaleDateString()}
                </span>
              </div>
              <div>
                <span className="text-muted-foreground">Target Date:</span>
                <span className="ml-1 font-medium">
                  {okr.dim_date ? new Date(okr.dim_date.date).toLocaleDateString() : 'No date'}
                </span>
              </div>
              <div>
                <span className="text-muted-foreground">Category:</span>
                <span className="ml-1 font-medium">
                  {okr.okr_master?.category || 'General'}
                </span>
              </div>
            </div>
          </div>
        </CardContent>
      </Card>

      {/* Edit Form */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {/* Basic Information */}
        <Card>
          <CardHeader>
            <CardTitle>Basic Information</CardTitle>
            <CardDescription>
              Update the core details of your OKR
            </CardDescription>
          </CardHeader>
          <CardContent className="space-y-4">
            {/* Title */}
            <div className="space-y-2">
              <Label htmlFor="title">OKR Title</Label>
              <Input
                id="title"
                value={formData.title}
                onChange={(e) => handleInputChange('title', e.target.value)}
                placeholder="Enter OKR title..."
              />
            </div>

            {/* Description */}
            <div className="space-y-2">
              <Label htmlFor="description">Description</Label>
              <Textarea
                id="description"
                value={formData.description}
                onChange={(e) => handleInputChange('description', e.target.value)}
                placeholder="Describe your OKR objective..."
                rows={4}
                className="resize-none"
              />
            </div>

            {/* Status and Priority */}
            <div className="grid grid-cols-2 gap-4">
              <div className="space-y-2">
                <Label htmlFor="status">Status</Label>
                <Select
                  value={formData.status}
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
                <Label htmlFor="priority">Priority</Label>
                <Select
                  value={formData.priority.toString()}
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
              </div>
            </div>
          </CardContent>
        </Card>

        {/* Targets and Tracking */}
        <Card>
          <CardHeader>
            <CardTitle>Targets & Tracking</CardTitle>
            <CardDescription>
              Set your targets and track progress
            </CardDescription>
          </CardHeader>
          <CardContent className="space-y-4">
            {/* Target and Current Values */}
            <div className="grid grid-cols-2 gap-4">
              <div className="space-y-2">
                <Label htmlFor="target-value">Target Value</Label>
                <Input
                  id="target-value"
                  type="number"
                  value={formData.target_value}
                  onChange={(e) => handleInputChange('target_value', parseFloat(e.target.value) || 0)}
                  min="0"
                  step="0.01"
                />
                <p className="text-xs text-muted-foreground">
                  {okr.dim_metric_type?.unit && `Unit: ${okr.dim_metric_type.unit}`}
                </p>
              </div>

              <div className="space-y-2">
                <Label htmlFor="current-value">Current Value</Label>
                <Input
                  id="current-value"
                  type="number"
                  value={formData.current_value}
                  onChange={(e) => handleInputChange('current_value', parseFloat(e.target.value) || 0)}
                  min="0"
                  step="0.01"
                />
                <p className="text-xs text-muted-foreground">
                  Progress: {progressPercentage.toFixed(1)}%
                </p>
              </div>
            </div>

            {/* Granularity */}
            <div className="space-y-2">
              <Label htmlFor="granularity">Granularity</Label>
              <Select
                value={formData.granularity}
                onValueChange={(value) => handleInputChange('granularity', value)}
              >
                <SelectTrigger>
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="daily">Daily</SelectItem>
                  <SelectItem value="weekly">Weekly</SelectItem>
                  <SelectItem value="monthly">Monthly</SelectItem>
                </SelectContent>
              </Select>
            </div>

            {/* Target Date */}
            <div className="space-y-2">
              <Label htmlFor="target-date">Target Date</Label>
              <Select
                value={formData.target_date_id}
                onValueChange={(value) => handleInputChange('target_date_id', value)}
              >
                <SelectTrigger>
                  <SelectValue />
                </SelectTrigger>
                <SelectContent className="max-h-64">
                  {futureDates.map((date) => (
                    <SelectItem key={date.id} value={date.id.toString()}>
                      <div className="flex flex-col">
                        <span>{new Date(date.date).toLocaleDateString()}</span>
                        <span className="text-xs text-muted-foreground">
                          {date.month_name} {date.year} • {date.quarter_name}
                        </span>
                      </div>
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>

            {/* Platform */}
            <div className="space-y-2">
              <Label htmlFor="platform">Platform (Optional)</Label>
              <Select
                value={formData.platform_id}
                onValueChange={(value) => handleInputChange('platform_id', value)}
              >
                <SelectTrigger>
                  <SelectValue placeholder="Select platform..." />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="">All Platforms</SelectItem>
                  {platforms.map((platform) => (
                    <SelectItem key={platform.id} value={platform.id}>
                      <div className="flex flex-col">
                        <span>{platform.display_name}</span>
                        <span className="text-xs text-muted-foreground capitalize">
                          {platform.category}
                        </span>
                      </div>
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>
          </CardContent>
        </Card>
      </div>

      {/* Template Information */}
      {okr.okr_master && (
        <Card className="mt-6">
          <CardHeader>
            <CardTitle className="text-lg">Original Template</CardTitle>
            <CardDescription>
              This OKR was created from the following template
            </CardDescription>
          </CardHeader>
          <CardContent>
            <div className="space-y-2">
              <h4 className="font-medium">{okr.okr_master.title}</h4>
              <p className="text-sm text-muted-foreground">
                {okr.okr_master.description}
              </p>
              <Badge variant="outline">{okr.okr_master.category}</Badge>
            </div>
          </CardContent>
        </Card>
      )}

      {error && (
        <Alert className="mt-4">
          <AlertDescription>
            {error.message}
          </AlertDescription>
        </Alert>
      )}

      {/* Unsaved Changes Warning */}
      {hasChanges && (
        <div className="fixed bottom-4 right-4 z-50">
          <Card className="border-amber-200 bg-amber-50">
            <CardContent className="pt-4">
              <div className="flex items-center gap-3">
                <div className="w-2 h-2 bg-amber-500 rounded-full animate-pulse" />
                <span className="text-sm font-medium text-amber-800">
                  You have unsaved changes
                </span>
                <Button
                  size="sm"
                  onClick={handleSave}
                  disabled={isLoading}
                >
                  {isLoading ? 'Saving...' : 'Save'}
                </Button>
              </div>
            </CardContent>
          </Card>
        </div>
      )}
    </div>
  );
}