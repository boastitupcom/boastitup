"use client";

import * as React from "react";
import { 
  Edit, 
  Trash2, 
  Archive, 
  Play, 
  Pause, 
  MoreHorizontal,
  ArrowUpDown,
  ArrowUp,
  ArrowDown,
  Calendar,
  Target,
  TrendingUp,
  CheckCircle
} from "lucide-react";
import { cn } from "../../../lib/utils";
import { Button } from "../../ui/button";
import { Badge } from "../../ui/badge";
import { Checkbox } from "../../ui/checkbox";
import { Progress } from "../../ui/progress";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "../../ui/table";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from "../../ui/dropdown-menu";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "../../ui/select";

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
  created_at: string;
  updated_at: string;
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

export interface UserPermissions {
  canEditOKRs: boolean;
  canDeleteOKRs: boolean;
  canViewAnalytics: boolean;
}

export type SortField = 'title' | 'priority' | 'status' | 'progress' | 'target_date' | 'created_at';
export type SortDirection = 'asc' | 'desc';

export interface OKRManagementTableProps {
  okrs: ManagedOKR[];
  selectedOKRs: Set<string>;
  onSelectOKR: (okrId: string, selected: boolean) => void;
  onSelectAll: (selected: boolean) => void;
  onStatusChange: (okrId: string, status: string) => Promise<void>;
  onEdit: (okrId: string) => void;
  onDelete: (okrId: string) => void;
  onViewDetails?: (okrId: string) => void;
  permissions?: UserPermissions;
  isLoading?: boolean;
  sortField?: SortField;
  sortDirection?: SortDirection;
  onSort?: (field: SortField) => void;
  className?: string;
}

export function OKRManagementTable({
  okrs,
  selectedOKRs,
  onSelectOKR,
  onSelectAll,
  onStatusChange,
  onEdit,
  onDelete,
  onViewDetails,
  permissions = { canEditOKRs: true, canDeleteOKRs: true, canViewAnalytics: true },
  isLoading = false,
  sortField,
  sortDirection,
  onSort,
  className
}: OKRManagementTableProps) {
  const [statusUpdating, setStatusUpdating] = React.useState<Set<string>>(new Set());

  const handleStatusChange = async (okrId: string, newStatus: string) => {
    setStatusUpdating(prev => new Set([...prev, okrId]));
    try {
      await onStatusChange(okrId, newStatus);
    } finally {
      setStatusUpdating(prev => {
        const next = new Set(prev);
        next.delete(okrId);
        return next;
      });
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
        return <Badge variant="destructive" className="text-xs">High</Badge>;
      case 2:
        return <Badge variant="default" className="bg-yellow-100 text-yellow-800 text-xs">Medium</Badge>;
      case 3:
        return <Badge variant="outline" className="text-xs">Low</Badge>;
      default:
        return <Badge variant="outline" className="text-xs">-</Badge>;
    }
  };

  const getProgressPercentage = (okr: ManagedOKR) => {
    if (!okr.current_value || !okr.target_value) return 0;
    return Math.min(Math.round((okr.current_value / okr.target_value) * 100), 100);
  };

  const formatValue = (value: number, unit?: string) => {
    if (value >= 1000000) {
      return `${(value / 1000000).toFixed(1)}M${unit ? ` ${unit}` : ''}`;
    }
    if (value >= 1000) {
      return `${(value / 1000).toFixed(1)}K${unit ? ` ${unit}` : ''}`;
    }
    return `${value.toLocaleString()}${unit ? ` ${unit}` : ''}`;
  };

  const isOverdue = (okr: ManagedOKR) => {
    if (!okr.dim_date || okr.status === 'completed') return false;
    return new Date(okr.dim_date.date) < new Date();
  };

  const getSortIcon = (field: SortField) => {
    if (sortField !== field) return <ArrowUpDown className="h-4 w-4" />;
    return sortDirection === 'asc' ? <ArrowUp className="h-4 w-4" /> : <ArrowDown className="h-4 w-4" />;
  };

  const handleSort = (field: SortField) => {
    onSort?.(field);
  };

  const allSelected = okrs.length > 0 && okrs.every(okr => selectedOKRs.has(okr.id));
  const someSelected = okrs.some(okr => selectedOKRs.has(okr.id));

  return (
    <div className={cn("border rounded-lg overflow-hidden", className)}>
      <Table>
        <TableHeader>
          <TableRow>
            <TableHead className="w-12">
              <Checkbox
                checked={allSelected}
                ref={React.useRef<HTMLButtonElement>(null)}
                onCheckedChange={(checked) => onSelectAll(checked as boolean)}
                aria-label="Select all OKRs"
              />
            </TableHead>
            
            <TableHead className="min-w-[200px]">
              <Button
                variant="ghost"
                size="sm"
                className="h-auto p-0 font-medium"
                onClick={() => handleSort('title')}
              >
                OKR Title
                {getSortIcon('title')}
              </Button>
            </TableHead>
            
            <TableHead className="w-[100px]">
              <Button
                variant="ghost"
                size="sm"
                className="h-auto p-0 font-medium"
                onClick={() => handleSort('priority')}
              >
                Priority
                {getSortIcon('priority')}
              </Button>
            </TableHead>
            
            <TableHead className="w-[120px]">
              <Button
                variant="ghost"
                size="sm"
                className="h-auto p-0 font-medium"
                onClick={() => handleSort('status')}
              >
                Status
                {getSortIcon('status')}
              </Button>
            </TableHead>
            
            <TableHead className="w-[150px]">
              <Button
                variant="ghost"
                size="sm"
                className="h-auto p-0 font-medium"
                onClick={() => handleSort('progress')}
              >
                Progress
                {getSortIcon('progress')}
              </Button>
            </TableHead>
            
            <TableHead className="w-[120px]">
              <Button
                variant="ghost"
                size="sm"
                className="h-auto p-0 font-medium"
                onClick={() => handleSort('target_date')}
              >
                Target Date
                {getSortIcon('target_date')}
              </Button>
            </TableHead>
            
            <TableHead className="w-[100px]">Platform</TableHead>
            <TableHead className="w-[100px]">Metric</TableHead>
            <TableHead className="w-[80px]">Actions</TableHead>
          </TableRow>
        </TableHeader>
        
        <TableBody>
          {isLoading ? (
            // Loading skeleton rows
            Array.from({ length: 5 }).map((_, index) => (
              <TableRow key={index}>
                <TableCell><div className="h-4 w-4 bg-gray-200 rounded animate-pulse" /></TableCell>
                <TableCell><div className="h-4 w-32 bg-gray-200 rounded animate-pulse" /></TableCell>
                <TableCell><div className="h-4 w-16 bg-gray-200 rounded animate-pulse" /></TableCell>
                <TableCell><div className="h-4 w-20 bg-gray-200 rounded animate-pulse" /></TableCell>
                <TableCell><div className="h-4 w-24 bg-gray-200 rounded animate-pulse" /></TableCell>
                <TableCell><div className="h-4 w-20 bg-gray-200 rounded animate-pulse" /></TableCell>
                <TableCell><div className="h-4 w-16 bg-gray-200 rounded animate-pulse" /></TableCell>
                <TableCell><div className="h-4 w-16 bg-gray-200 rounded animate-pulse" /></TableCell>
                <TableCell><div className="h-4 w-8 bg-gray-200 rounded animate-pulse" /></TableCell>
              </TableRow>
            ))
          ) : okrs.length === 0 ? (
            <TableRow>
              <TableCell colSpan={9} className="h-24 text-center">
                <div className="flex flex-col items-center gap-2">
                  <Target className="h-8 w-8 text-muted-foreground" />
                  <p className="text-muted-foreground">No OKRs found</p>
                </div>
              </TableCell>
            </TableRow>
          ) : (
            okrs.map((okr) => {
              const isSelected = selectedOKRs.has(okr.id);
              const progressPercentage = getProgressPercentage(okr);
              const overdue = isOverdue(okr);
              const updating = statusUpdating.has(okr.id);
              
              return (
                <TableRow 
                  key={okr.id}
                  className={cn(
                    "group hover:bg-muted/50",
                    isSelected && "bg-muted/30",
                    overdue && okr.status === 'active' && "bg-red-50/50"
                  )}
                >
                  <TableCell>
                    <Checkbox
                      checked={isSelected}
                      onCheckedChange={(checked) => onSelectOKR(okr.id, checked as boolean)}
                      aria-label={`Select ${okr.title}`}
                    />
                  </TableCell>
                  
                  <TableCell className="max-w-[200px]">
                    <div className="space-y-1">
                      <div className="font-medium text-sm leading-tight line-clamp-2">
                        {okr.title}
                      </div>
                      {okr.description && (
                        <div className="text-xs text-muted-foreground line-clamp-1">
                          {okr.description}
                        </div>
                      )}
                    </div>
                  </TableCell>
                  
                  <TableCell>
                    {getPriorityBadge(okr.priority || 2)}
                  </TableCell>
                  
                  <TableCell>
                    {permissions.canEditOKRs && !updating ? (
                      <Select
                        value={okr.status || 'active'}
                        onValueChange={(value) => handleStatusChange(okr.id, value)}
                        disabled={updating}
                      >
                        <SelectTrigger className="h-7 text-xs">
                          <SelectValue />
                        </SelectTrigger>
                        <SelectContent>
                          <SelectItem value="active">Active</SelectItem>
                          <SelectItem value="paused">Paused</SelectItem>
                          <SelectItem value="completed">Completed</SelectItem>
                          <SelectItem value="archived">Archived</SelectItem>
                        </SelectContent>
                      </Select>
                    ) : (
                      getStatusBadge(okr.status || 'active')
                    )}
                  </TableCell>
                  
                  <TableCell>
                    <div className="space-y-1">
                      <div className="flex items-center justify-between text-xs">
                        <span className="font-medium">{progressPercentage}%</span>
                        <span className="text-muted-foreground">
                          {formatValue(okr.current_value || 0, okr.dim_metric_type?.unit)} / 
                          {formatValue(okr.target_value, okr.dim_metric_type?.unit)}
                        </span>
                      </div>
                      <Progress 
                        value={progressPercentage} 
                        className="h-1.5"
                        indicatorClassName={cn(
                          progressPercentage >= 90 && "bg-green-600",
                          progressPercentage >= 70 && progressPercentage < 90 && "bg-blue-600",
                          progressPercentage >= 50 && progressPercentage < 70 && "bg-yellow-600",
                          progressPercentage < 50 && "bg-red-600"
                        )}
                      />
                    </div>
                  </TableCell>
                  
                  <TableCell>
                    <div className="text-xs">
                      <div className={cn(
                        "font-medium",
                        overdue && "text-red-600"
                      )}>
                        {okr.dim_date ? new Date(okr.dim_date.date).toLocaleDateString() : 'No date'}
                      </div>
                      {overdue && (
                        <div className="text-red-600 font-medium">Overdue</div>
                      )}
                      <div className="text-muted-foreground capitalize">
                        {okr.granularity}
                      </div>
                    </div>
                  </TableCell>
                  
                  <TableCell>
                    <div className="text-xs">
                      {okr.dim_platform ? (
                        <Badge variant="outline" className="text-xs">
                          {okr.dim_platform.display_name}
                        </Badge>
                      ) : (
                        <span className="text-muted-foreground">All</span>
                      )}
                    </div>
                  </TableCell>
                  
                  <TableCell>
                    <div className="text-xs">
                      {okr.dim_metric_type && (
                        <Badge variant="outline" className="text-xs">
                          {okr.dim_metric_type.code}
                        </Badge>
                      )}
                    </div>
                  </TableCell>
                  
                  <TableCell>
                    <DropdownMenu>
                      <DropdownMenuTrigger asChild>
                        <Button
                          variant="ghost"
                          size="sm"
                          className="h-7 w-7 p-0 opacity-0 group-hover:opacity-100 transition-opacity"
                        >
                          <MoreHorizontal className="h-4 w-4" />
                          <span className="sr-only">Open menu</span>
                        </Button>
                      </DropdownMenuTrigger>
                      <DropdownMenuContent align="end">
                        {onViewDetails && (
                          <DropdownMenuItem onClick={() => onViewDetails(okr.id)}>
                            <TrendingUp className="h-4 w-4 mr-2" />
                            View Details
                          </DropdownMenuItem>
                        )}
                        
                        {permissions.canEditOKRs && (
                          <DropdownMenuItem onClick={() => onEdit(okr.id)}>
                            <Edit className="h-4 w-4 mr-2" />
                            Edit
                          </DropdownMenuItem>
                        )}
                        
                        <DropdownMenuSeparator />
                        
                        {permissions.canEditOKRs && (
                          <>
                            <DropdownMenuItem 
                              onClick={() => handleStatusChange(okr.id, 'active')}
                              disabled={okr.status === 'active' || updating}
                            >
                              <Play className="h-4 w-4 mr-2" />
                              Activate
                            </DropdownMenuItem>
                            
                            <DropdownMenuItem 
                              onClick={() => handleStatusChange(okr.id, 'paused')}
                              disabled={okr.status === 'paused' || updating}
                            >
                              <Pause className="h-4 w-4 mr-2" />
                              Pause
                            </DropdownMenuItem>
                            
                            <DropdownMenuItem 
                              onClick={() => handleStatusChange(okr.id, 'completed')}
                              disabled={okr.status === 'completed' || updating}
                            >
                              <CheckCircle className="h-4 w-4 mr-2" />
                              Mark Complete
                            </DropdownMenuItem>
                            
                            <DropdownMenuItem 
                              onClick={() => handleStatusChange(okr.id, 'archived')}
                              disabled={okr.status === 'archived' || updating}
                            >
                              <Archive className="h-4 w-4 mr-2" />
                              Archive
                            </DropdownMenuItem>
                          </>
                        )}
                        
                        {permissions.canDeleteOKRs && (
                          <>
                            <DropdownMenuSeparator />
                            <DropdownMenuItem 
                              onClick={() => onDelete(okr.id)}
                              className="text-red-600 focus:text-red-600"
                            >
                              <Trash2 className="h-4 w-4 mr-2" />
                              Delete
                            </DropdownMenuItem>
                          </>
                        )}
                      </DropdownMenuContent>
                    </DropdownMenu>
                  </TableCell>
                </TableRow>
              );
            })
          )}
        </TableBody>
      </Table>
    </div>
  );
}

export function OKRManagementTableSkeleton({ rows = 5 }: { rows?: number }) {
  return (
    <div className="border rounded-lg overflow-hidden">
      <Table>
        <TableHeader>
          <TableRow>
            <TableHead className="w-12"><div className="h-4 w-4 bg-gray-200 rounded animate-pulse" /></TableHead>
            <TableHead className="min-w-[200px]"><div className="h-4 w-20 bg-gray-200 rounded animate-pulse" /></TableHead>
            <TableHead className="w-[100px]"><div className="h-4 w-16 bg-gray-200 rounded animate-pulse" /></TableHead>
            <TableHead className="w-[120px]"><div className="h-4 w-12 bg-gray-200 rounded animate-pulse" /></TableHead>
            <TableHead className="w-[150px]"><div className="h-4 w-16 bg-gray-200 rounded animate-pulse" /></TableHead>
            <TableHead className="w-[120px]"><div className="h-4 w-20 bg-gray-200 rounded animate-pulse" /></TableHead>
            <TableHead className="w-[100px]"><div className="h-4 w-16 bg-gray-200 rounded animate-pulse" /></TableHead>
            <TableHead className="w-[100px]"><div className="h-4 w-12 bg-gray-200 rounded animate-pulse" /></TableHead>
            <TableHead className="w-[80px]"><div className="h-4 w-8 bg-gray-200 rounded animate-pulse" /></TableHead>
          </TableRow>
        </TableHeader>
        <TableBody>
          {Array.from({ length: rows }).map((_, index) => (
            <TableRow key={index}>
              <TableCell><div className="h-4 w-4 bg-gray-200 rounded animate-pulse" /></TableCell>
              <TableCell><div className="h-4 w-32 bg-gray-200 rounded animate-pulse" /></TableCell>
              <TableCell><div className="h-4 w-16 bg-gray-200 rounded animate-pulse" /></TableCell>
              <TableCell><div className="h-4 w-20 bg-gray-200 rounded animate-pulse" /></TableCell>
              <TableCell><div className="h-4 w-24 bg-gray-200 rounded animate-pulse" /></TableCell>
              <TableCell><div className="h-4 w-20 bg-gray-200 rounded animate-pulse" /></TableCell>
              <TableCell><div className="h-4 w-16 bg-gray-200 rounded animate-pulse" /></TableCell>
              <TableCell><div className="h-4 w-16 bg-gray-200 rounded animate-pulse" /></TableCell>
              <TableCell><div className="h-4 w-8 bg-gray-200 rounded animate-pulse" /></TableCell>
            </TableRow>
          ))}
        </TableBody>
      </Table>
    </div>
  );
}