"use client";

import * as React from "react";
import { useState, useEffect } from "react";
import { toast } from "sonner";
import { useRouter } from "next/navigation";
import { 
  Edit,
  Trash2,
  Archive,
  Play,
  Pause,
  MoreHorizontal,
  Plus,
  Filter,
  Search,
  Download
} from "lucide-react";

import {
  Button,
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
  Input,
  Badge,
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
  Checkbox,
  Alert,
  AlertDescription,
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
  DialogTrigger
} from "@boastitup/ui";

import { useOKRManagement } from "../../lib/okr-hooks-provider";
import { useBrandContext } from "../../lib/okr-hooks-provider";
import { 
  ManagedOKR, 
  OKRManagementViewProps,
  BulkOKRManagementOperation 
} from "../../types/okr-creation";

export function OKRManagementView({ 
  initialOKRs, 
  summaryStats, 
  brandId, 
  tenantId 
}: OKRManagementViewProps) {
  // State
  const [okrs, setOKRs] = useState<ManagedOKR[]>(initialOKRs);
  const [selectedOKRs, setSelectedOKRs] = useState<Set<string>>(new Set());
  const [searchQuery, setSearchQuery] = useState('');
  const [statusFilter, setStatusFilter] = useState<string>('all');
  const [priorityFilter, setPriorityFilter] = useState<string>('all');
  const [deleteDialogOpen, setDeleteDialogOpen] = useState(false);
  const [bulkActionDialog, setBulkActionDialog] = useState(false);
  const [okrToDelete, setOKRToDelete] = useState<string | null>(null);

  const router = useRouter();

  // Hooks
  const { brand, permissions } = useBrandContext(brandId);
  const { 
    updateOKR, 
    bulkOperation, 
    deleteOKR, 
    refreshOKRs, 
    isLoading, 
    error 
  } = useOKRManagement(brandId);

  // Filtering logic
  const filteredOKRs = okrs.filter(okr => {
    const matchesSearch = okr.title.toLowerCase().includes(searchQuery.toLowerCase()) ||
                         okr.description.toLowerCase().includes(searchQuery.toLowerCase());
    const matchesStatus = statusFilter === 'all' || okr.status === statusFilter;
    const matchesPriority = priorityFilter === 'all' || okr.priority.toString() === priorityFilter;
    
    return matchesSearch && matchesStatus && matchesPriority;
  });

  // Handlers
  const handleSelectOKR = (okrId: string, checked: boolean) => {
    const newSelection = new Set(selectedOKRs);
    if (checked) {
      newSelection.add(okrId);
    } else {
      newSelection.delete(okrId);
    }
    setSelectedOKRs(newSelection);
  };

  const handleSelectAll = (checked: boolean) => {
    if (checked) {
      setSelectedOKRs(new Set(filteredOKRs.map(okr => okr.id)));
    } else {
      setSelectedOKRs(new Set());
    }
  };

  const handleStatusChange = async (okrId: string, newStatus: string) => {
    try {
      await updateOKR(okrId, { status: newStatus as any });
      const refreshedOKRs = await refreshOKRs();
      setOKRs(refreshedOKRs);
      toast.success('OKR status updated successfully');
    } catch (error) {
      toast.error('Failed to update OKR status');
    }
  };

  const handleBulkOperation = async (operation: string, data?: any) => {
    if (selectedOKRs.size === 0) {
      toast.error('No OKRs selected');
      return;
    }

    // Enforce bulk operation limits from story.txt line 424
    const MAX_BULK_SIZE = 50;
    if (selectedOKRs.size > MAX_BULK_SIZE) {
      toast.error(`Maximum ${MAX_BULK_SIZE} OKRs allowed per bulk operation. You have ${selectedOKRs.size} selected.`);
      return;
    }

    // Show confirmation for destructive operations
    if (operation === 'delete' || operation === 'archive') {
      const confirmed = window.confirm(
        `Are you sure you want to ${operation} ${selectedOKRs.size} OKRs? This action cannot be undone.`
      );
      if (!confirmed) return;
    }

    try {
      const bulkOp: BulkOKRManagementOperation = {
        operation: operation as any,
        okrIds: Array.from(selectedOKRs),
        data
      };

      await bulkOperation(bulkOp);
      const refreshedOKRs = await refreshOKRs();
      setOKRs(refreshedOKRs);
      setSelectedOKRs(new Set());
      setBulkActionDialog(false);
      toast.success(`Successfully ${operation}d ${selectedOKRs.size} OKRs`);
    } catch (error) {
      toast.error(`Failed to ${operation} selected OKRs`);
    }
  };

  const handleDeleteOKR = async () => {
    if (!okrToDelete) return;

    try {
      await deleteOKR(okrToDelete);
      const refreshedOKRs = await refreshOKRs();
      setOKRs(refreshedOKRs);
      setDeleteDialogOpen(false);
      setOKRToDelete(null);
      toast.success('OKR deleted successfully');
    } catch (error) {
      toast.error('Failed to delete OKR');
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

  const getPriorityBadge = (priority: number) => {
    switch (priority) {
      case 1:
        return <Badge variant="destructive">High</Badge>;
      case 2:
        return <Badge variant="default" className="bg-yellow-100 text-yellow-800">Medium</Badge>;
      case 3:
        return <Badge variant="outline">Low</Badge>;
      default:
        return <Badge variant="outline">Unknown</Badge>;
    }
  };

  // Permission check
  if (permissions && !permissions.canViewAnalytics) {
    return (
      <div className="container mx-auto px-4 py-8 max-w-4xl">
        <Alert>
          <AlertDescription>
            You don't have permission to view OKRs for this brand. Please contact your administrator.
          </AlertDescription>
        </Alert>
      </div>
    );
  }

  return (
    <div className="container mx-auto px-4 py-8 max-w-7xl">
      {/* Header */}
      <div className="mb-8">
        <div className="flex items-center justify-between">
          <div>
            <h1 className="text-3xl font-bold text-gray-900">Manage OKRs</h1>
            <p className="text-gray-600 mt-2">
              View, edit, and manage your OKRs for {brand?.name}
            </p>
          </div>
          <div className="flex items-center gap-3">
            <Button
              variant="outline"
              onClick={() => router.push('/workspace/okr/dashboard')}
            >
              <Filter className="w-4 h-4 mr-2" />
              View Dashboard
            </Button>
            {permissions?.canCreateOKRs && (
              <Button
                onClick={() => router.push('/workspace/okr/create')}
              >
                <Plus className="w-4 h-4 mr-2" />
                Create OKRs
              </Button>
            )}
          </div>
        </div>
      </div>

      {/* Summary Stats */}
      <div className="grid grid-cols-1 md:grid-cols-4 gap-4 mb-6">
        <Card>
          <CardContent className="pt-6">
            <div className="text-2xl font-bold">{summaryStats.total}</div>
            <p className="text-xs text-muted-foreground">Total OKRs</p>
          </CardContent>
        </Card>
        <Card>
          <CardContent className="pt-6">
            <div className="text-2xl font-bold text-green-600">{summaryStats.active}</div>
            <p className="text-xs text-muted-foreground">Active OKRs</p>
          </CardContent>
        </Card>
        <Card>
          <CardContent className="pt-6">
            <div className="text-2xl font-bold text-blue-600">{summaryStats.completed}</div>
            <p className="text-xs text-muted-foreground">Completed OKRs</p>
          </CardContent>
        </Card>
        <Card>
          <CardContent className="pt-6">
            <div className="text-2xl font-bold text-red-600">{summaryStats.highPriority}</div>
            <p className="text-xs text-muted-foreground">High Priority</p>
          </CardContent>
        </Card>
      </div>

      {/* Filters and Search */}
      <Card className="mb-6">
        <CardHeader>
          <CardTitle className="text-lg">Filters</CardTitle>
        </CardHeader>
        <CardContent>
          <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
            <div className="relative">
              <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 h-4 w-4" />
              <Input
                placeholder="Search OKRs..."
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                className="pl-10"
              />
            </div>
            
            <Select value={statusFilter} onValueChange={setStatusFilter}>
              <SelectTrigger>
                <SelectValue placeholder="Filter by status" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="all">All Statuses</SelectItem>
                <SelectItem value="active">Active</SelectItem>
                <SelectItem value="paused">Paused</SelectItem>
                <SelectItem value="completed">Completed</SelectItem>
              </SelectContent>
            </Select>

            <Select value={priorityFilter} onValueChange={setPriorityFilter}>
              <SelectTrigger>
                <SelectValue placeholder="Filter by priority" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="all">All Priorities</SelectItem>
                <SelectItem value="1">High Priority</SelectItem>
                <SelectItem value="2">Medium Priority</SelectItem>
                <SelectItem value="3">Low Priority</SelectItem>
              </SelectContent>
            </Select>

            <div className="text-sm text-muted-foreground">
              Showing {filteredOKRs.length} of {okrs.length} OKRs
            </div>
          </div>
        </CardContent>
      </Card>

      {/* Bulk Actions */}
      {selectedOKRs.size > 0 && (
        <Card className="mb-6">
          <CardContent className="pt-6">
            <div className="flex items-center justify-between">
              <div className="flex items-center gap-4">
                <span className="text-sm font-medium">
                  {selectedOKRs.size} OKRs selected
                </span>
                {selectedOKRs.size > 50 && (
                  <Badge variant="destructive" className="text-xs">
                    Exceeds bulk limit (max 50)
                  </Badge>
                )}
              </div>
              <div className="flex items-center gap-2">
                <Button
                  variant="outline"
                  size="sm"
                  onClick={() => handleBulkOperation('activate')}
                  disabled={isLoading || selectedOKRs.size > 50}
                >
                  <Play className="w-4 h-4 mr-1" />
                  Activate
                </Button>
                <Button
                  variant="outline"
                  size="sm"
                  onClick={() => handleBulkOperation('pause')}
                  disabled={isLoading || selectedOKRs.size > 50}
                >
                  <Pause className="w-4 h-4 mr-1" />
                  Pause
                </Button>
                <Button
                  variant="outline"
                  size="sm"
                  onClick={() => handleBulkOperation('archive')}
                  disabled={isLoading || selectedOKRs.size > 50}
                >
                  <Archive className="w-4 h-4 mr-1" />
                  Archive
                </Button>
                {permissions?.canDeleteOKRs && (
                  <Button
                    variant="destructive"
                    size="sm"
                    onClick={() => handleBulkOperation('delete')}
                    disabled={isLoading || selectedOKRs.size > 50}
                  >
                    <Trash2 className="w-4 h-4 mr-1" />
                    Delete
                  </Button>
                )}
              </div>
            </div>
          </CardContent>
        </Card>
      )}

      {/* OKRs Table */}
      <Card>
        <CardHeader>
          <div className="flex items-center justify-between">
            <CardTitle>Your OKRs</CardTitle>
            <div className="flex items-center gap-2">
              <Checkbox
                checked={selectedOKRs.size === filteredOKRs.length && filteredOKRs.length > 0}
                onCheckedChange={handleSelectAll}
              />
              <span className="text-sm text-muted-foreground">Select All</span>
            </div>
          </div>
        </CardHeader>
        <CardContent>
          {filteredOKRs.length === 0 ? (
            <div className="text-center py-8">
              <p className="text-muted-foreground">
                {searchQuery || statusFilter !== 'all' || priorityFilter !== 'all'
                  ? 'No OKRs match your current filters'
                  : 'No OKRs found. Create your first OKR to get started!'
                }
              </p>
              {!searchQuery && statusFilter === 'all' && priorityFilter === 'all' && (
                <Button 
                  className="mt-4"
                  onClick={() => router.push('/workspace/okr/create')}
                >
                  <Plus className="w-4 h-4 mr-2" />
                  Create Your First OKR
                </Button>
              )}
            </div>
          ) : (
            <div className="space-y-4">
              {filteredOKRs.map((okr) => (
                <Card key={okr.id} className="border-l-4 border-l-primary">
                  <CardContent className="pt-6">
                    <div className="flex items-start justify-between">
                      <div className="flex items-start gap-4 flex-1">
                        <Checkbox
                          checked={selectedOKRs.has(okr.id)}
                          onCheckedChange={(checked) => handleSelectOKR(okr.id, checked as boolean)}
                        />
                        <div className="flex-1 min-w-0">
                          <div className="flex items-center gap-3 mb-2">
                            <h3 className="font-semibold text-lg truncate">{okr.title}</h3>
                            {getStatusBadge(okr.status)}
                            {getPriorityBadge(okr.priority)}
                          </div>
                          <p className="text-sm text-muted-foreground mb-3 line-clamp-2">
                            {okr.description}
                          </p>
                          <div className="grid grid-cols-2 md:grid-cols-4 gap-4 text-sm">
                            <div>
                              <span className="text-muted-foreground">Progress:</span>
                              <span className="ml-1 font-medium">
                                {okr.current_value}/{okr.target_value}
                                {okr.dim_metric_type?.unit && ` ${okr.dim_metric_type.unit}`}
                              </span>
                            </div>
                            <div>
                              <span className="text-muted-foreground">Target Date:</span>
                              <span className="ml-1 font-medium">
                                {okr.dim_date ? new Date(okr.dim_date.date).toLocaleDateString() : 'No date'}
                              </span>
                            </div>
                            <div>
                              <span className="text-muted-foreground">Platform:</span>
                              <span className="ml-1 font-medium">
                                {okr.dim_platform?.display_name || 'All platforms'}
                              </span>
                            </div>
                            <div>
                              <span className="text-muted-foreground">Granularity:</span>
                              <span className="ml-1 font-medium capitalize">
                                {okr.granularity}
                              </span>
                            </div>
                          </div>
                        </div>
                      </div>
                      
                      <div className="flex items-center gap-2 ml-4">
                        <Select
                          value={okr.status}
                          onValueChange={(value) => handleStatusChange(okr.id, value)}
                          disabled={!permissions?.canEditOKRs || isLoading}
                        >
                          <SelectTrigger className="w-32">
                            <SelectValue />
                          </SelectTrigger>
                          <SelectContent>
                            <SelectItem value="active">Active</SelectItem>
                            <SelectItem value="paused">Paused</SelectItem>
                            <SelectItem value="completed">Completed</SelectItem>
                            <SelectItem value="archived">Archived</SelectItem>
                          </SelectContent>
                        </Select>
                        
                        {permissions?.canEditOKRs && (
                          <Button
                            variant="outline"
                            size="sm"
                            onClick={() => router.push(`/workspace/okr/${okr.id}/edit`)}
                          >
                            <Edit className="w-4 h-4" />
                          </Button>
                        )}
                        
                        {permissions?.canDeleteOKRs && (
                          <Button
                            variant="outline"
                            size="sm"
                            onClick={() => {
                              setOKRToDelete(okr.id);
                              setDeleteDialogOpen(true);
                            }}
                          >
                            <Trash2 className="w-4 h-4" />
                          </Button>
                        )}
                      </div>
                    </div>
                  </CardContent>
                </Card>
              ))}
            </div>
          )}
        </CardContent>
      </Card>

      {/* Delete Confirmation Dialog */}
      <Dialog open={deleteDialogOpen} onOpenChange={setDeleteDialogOpen}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>Delete OKR</DialogTitle>
            <DialogDescription>
              Are you sure you want to delete this OKR? This action cannot be undone.
              The OKR will be archived and removed from your active list.
            </DialogDescription>
          </DialogHeader>
          <DialogFooter>
            <Button
              variant="outline"
              onClick={() => setDeleteDialogOpen(false)}
            >
              Cancel
            </Button>
            <Button
              variant="destructive"
              onClick={handleDeleteOKR}
              disabled={isLoading}
            >
              {isLoading ? 'Deleting...' : 'Delete OKR'}
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>

      {error && (
        <Alert className="mt-4">
          <AlertDescription>
            {error.message}
          </AlertDescription>
        </Alert>
      )}
    </div>
  );
}