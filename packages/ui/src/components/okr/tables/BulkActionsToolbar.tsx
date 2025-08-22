"use client";

import * as React from "react";
import { Settings, Calendar, Target, MapPin } from "lucide-react";
import { cn } from "../../../lib/utils";
import { Button } from "../../ui/button";
import { Input } from "../../ui/input";
import { Label } from "../../ui/label";
import { 
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "../../ui/select";
import { Card, CardContent, CardHeader, CardTitle } from "../../ui/card";
import { Separator } from "../../ui/separator";
import { 
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from "../../ui/dialog";

export interface OKRCustomization {
  templateId: string;
  title?: string;
  targetValue?: number;
  targetDateId?: number;
  granularity?: 'daily' | 'weekly' | 'monthly';
  platformId?: string;
  priority?: number;
  notes?: string;
}

export interface BulkOKRActionsProps {
  selectedCount: number;
  onSelectAll: () => void;
  onDeselectAll: () => void;
  onBulkCustomize: (data: Partial<OKRCustomization>) => void;
  disabled?: boolean;
}

export function BulkActionsToolbar({
  selectedCount,
  onSelectAll,
  onDeselectAll,
  onBulkCustomize,
  disabled = false
}: BulkOKRActionsProps) {
  const [bulkCustomization, setBulkCustomization] = React.useState<Partial<OKRCustomization>>({});
  const [dialogOpen, setDialogOpen] = React.useState(false);

  const handleBulkApply = () => {
    onBulkCustomize(bulkCustomization);
    setDialogOpen(false);
    setBulkCustomization({});
  };

  const handleInputChange = (field: string, value: any) => {
    setBulkCustomization(prev => ({
      ...prev,
      [field]: value
    }));
  };

  if (selectedCount === 0) {
    return (
      <Card className="bg-gray-50 border-dashed">
        <CardContent className="pt-6">
          <div className="text-center">
            <Settings className="mx-auto h-8 w-8 text-gray-400 mb-2" />
            <p className="text-sm text-muted-foreground">
              Select OKR templates to customize them in bulk
            </p>
          </div>
        </CardContent>
      </Card>
    );
  }

  return (
    <Card>
      <CardHeader>
        <div className="flex items-center justify-between">
          <CardTitle className="text-base">
            Bulk Actions ({selectedCount} selected)
          </CardTitle>
          <div className="flex items-center gap-2">
            <Button
              variant="outline"
              size="sm"
              onClick={onDeselectAll}
              disabled={disabled}
            >
              Clear Selection
            </Button>
            <Button
              variant="outline"
              size="sm"
              onClick={onSelectAll}
              disabled={disabled}
            >
              Select All
            </Button>
          </div>
        </div>
      </CardHeader>

      <CardContent className="space-y-4">
        {/* Quick Actions */}
        <div className="grid grid-cols-2 md:grid-cols-4 gap-3">
          <Dialog open={dialogOpen} onOpenChange={setDialogOpen}>
            <DialogTrigger asChild>
              <Button
                variant="outline"
                size="sm"
                className="h-auto p-3 flex flex-col items-center gap-2"
                disabled={disabled}
              >
                <Target className="h-4 w-4" />
                <span className="text-xs">Set Targets</span>
              </Button>
            </DialogTrigger>
            <DialogContent className="sm:max-w-md">
              <DialogHeader>
                <DialogTitle>Bulk Customize OKRs</DialogTitle>
                <DialogDescription>
                  Apply the same settings to all {selectedCount} selected OKR templates.
                  Leave fields empty to keep individual template defaults.
                </DialogDescription>
              </DialogHeader>

              <div className="space-y-4">
                {/* Target Value */}
                <div className="space-y-2">
                  <Label htmlFor="bulk-target" className="text-sm font-medium">
                    Target Value
                  </Label>
                  <Input
                    id="bulk-target"
                    type="number"
                    value={bulkCustomization.targetValue || ''}
                    onChange={(e) => handleInputChange('targetValue', parseFloat(e.target.value) || undefined)}
                    placeholder="Leave empty to keep individual defaults"
                    min="0"
                    step="0.01"
                  />
                </div>

                {/* Granularity */}
                <div className="space-y-2">
                  <Label htmlFor="bulk-granularity" className="text-sm font-medium">
                    Granularity
                  </Label>
                  <Select
                    value={bulkCustomization.granularity || 'default'}
                    onValueChange={(value) => handleInputChange('granularity', value === 'default' ? undefined : value)}
                  >
                    <SelectTrigger>
                      <SelectValue placeholder="Keep individual defaults" />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="default">Keep individual defaults</SelectItem>
                      <SelectItem value="daily">Daily</SelectItem>
                      <SelectItem value="weekly">Weekly</SelectItem>
                      <SelectItem value="monthly">Monthly</SelectItem>
                    </SelectContent>
                  </Select>
                </div>

                {/* Priority */}
                <div className="space-y-2">
                  <Label htmlFor="bulk-priority" className="text-sm font-medium">
                    Priority Level
                  </Label>
                  <Select
                    value={bulkCustomization.priority?.toString() || 'default'}
                    onValueChange={(value) => handleInputChange('priority', value === 'default' ? undefined : parseInt(value))}
                  >
                    <SelectTrigger>
                      <SelectValue placeholder="Keep individual defaults" />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="default">Keep individual defaults</SelectItem>
                      <SelectItem value="1">🔴 High Priority</SelectItem>
                      <SelectItem value="2">🟡 Medium Priority</SelectItem>
                      <SelectItem value="3">🟢 Low Priority</SelectItem>
                    </SelectContent>
                  </Select>
                </div>
              </div>

              <DialogFooter>
                <Button
                  variant="outline"
                  onClick={() => setDialogOpen(false)}
                >
                  Cancel
                </Button>
                <Button onClick={handleBulkApply}>
                  Apply to {selectedCount} OKRs
                </Button>
              </DialogFooter>
            </DialogContent>
          </Dialog>

          <Button
            variant="outline"
            size="sm"
            className="h-auto p-3 flex flex-col items-center gap-2"
            disabled={disabled}
            onClick={() => onBulkCustomize({ granularity: 'monthly' })}
          >
            <Calendar className="h-4 w-4" />
            <span className="text-xs">Set Monthly</span>
          </Button>

          <Button
            variant="outline"
            size="sm"
            className="h-auto p-3 flex flex-col items-center gap-2"
            disabled={disabled}
            onClick={() => onBulkCustomize({ granularity: 'weekly' })}
          >
            <Calendar className="h-4 w-4" />
            <span className="text-xs">Set Weekly</span>
          </Button>

          <Button
            variant="outline"
            size="sm"
            className="h-auto p-3 flex flex-col items-center gap-2"
            disabled={disabled}
            onClick={() => onBulkCustomize({ priority: 1 })}
          >
            <Target className="h-4 w-4" />
            <span className="text-xs">High Priority</span>
          </Button>
        </div>

        <Separator />

        {/* Selection Summary */}
        <div className="text-xs text-muted-foreground space-y-1">
          <p>
            <strong>{selectedCount}</strong> templates selected for OKR creation.
            Customize each individually or use bulk actions above.
          </p>
          <p>
            Templates will be converted to active OKRs when you click "Create OKRs".
          </p>
        </div>
      </CardContent>
    </Card>
  );
}

export function BulkActionsToolbarSkeleton() {
  return (
    <Card>
      <CardHeader>
        <div className="flex items-center justify-between">
          <div className="h-5 w-32 bg-gray-200 rounded animate-pulse" />
          <div className="flex items-center gap-2">
            <div className="h-8 w-24 bg-gray-200 rounded animate-pulse" />
            <div className="h-8 w-20 bg-gray-200 rounded animate-pulse" />
          </div>
        </div>
      </CardHeader>

      <CardContent className="space-y-4">
        <div className="grid grid-cols-2 md:grid-cols-4 gap-3">
          {Array.from({ length: 4 }).map((_, index) => (
            <div key={index} className="h-16 bg-gray-200 rounded animate-pulse" />
          ))}
        </div>
        
        <div className="h-px bg-gray-200" />
        
        <div className="space-y-2">
          <div className="h-3 w-full bg-gray-200 rounded animate-pulse" />
          <div className="h-3 w-3/4 bg-gray-200 rounded animate-pulse" />
        </div>
      </CardContent>
    </Card>
  );
}