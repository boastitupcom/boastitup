'use client';

import { useState } from 'react';
import { 
  Card, 
  CardContent, 
  CardHeader, 
  Badge, 
  Button, 
  Progress, 
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
  Checkbox 
} from '@boastitup/ui';
import { 
  AlertTriangle,
  Clock,
  Star,
  MoreVertical,
  ChevronDown,
  ChevronUp,
  Eye,
  Play,
  CheckCircle,
  Calendar,
  User,
  Zap
} from 'lucide-react';
import { cn } from '@boastitup/ui';
import type { AIActionCardProps, AIInsight } from '../../types/brand-health';

const getPriorityConfig = (priority: AIInsight['priority_display']) => {
  switch (priority) {
    case 'CRITICAL PRIORITY':
      return {
        color: 'text-red-600',
        bg: 'bg-red-50',
        border: 'border-red-200',
        badge: 'destructive' as const,
        icon: AlertTriangle,
      };
    case 'HIGH PRIORITY':
      return {
        color: 'text-orange-600',
        bg: 'bg-orange-50',
        border: 'border-orange-200',
        badge: 'secondary' as const,
        icon: Star,
      };
    case 'MEDIUM PRIORITY':
      return {
        color: 'text-yellow-600',
        bg: 'bg-yellow-50',
        border: 'border-yellow-200',
        badge: 'outline' as const,
        icon: Clock,
      };
    case 'LOW PRIORITY':
    default:
      return {
        color: 'text-gray-600',
        bg: 'bg-gray-50',
        border: 'border-gray-200',
        badge: 'outline' as const,
        icon: Clock,
      };
  }
};

const getStatusConfig = (status: AIInsight['action_status']) => {
  switch (status) {
    case 'Completed':
      return {
        color: 'text-green-600',
        bg: 'bg-green-50',
        icon: CheckCircle,
        badge: 'default' as const,
      };
    case 'In Progress':
      return {
        color: 'text-blue-600',
        bg: 'bg-blue-50',
        icon: Play,
        badge: 'secondary' as const,
      };
    case 'Selected for Action':
      return {
        color: 'text-purple-600',
        bg: 'bg-purple-50',
        icon: Star,
        badge: 'outline' as const,
      };
    case 'Saved':
      return {
        color: 'text-yellow-600',
        bg: 'bg-yellow-50',
        icon: Star,
        badge: 'outline' as const,
      };
    case 'Viewed':
      return {
        color: 'text-gray-600',
        bg: 'bg-gray-50',
        icon: Eye,
        badge: 'outline' as const,
      };
    case 'Unread':
    default:
      return {
        color: 'text-blue-600',
        bg: 'bg-blue-50',
        icon: Zap,
        badge: 'default' as const,
      };
  }
};

interface ActionItemProps {
  action: { action: string; priority?: string; description?: string };
  completed?: boolean;
  onToggle?: (completed: boolean) => void;
}

const ActionItem = ({ action, completed = false, onToggle }: ActionItemProps) => {
  return (
    <div className="flex items-start space-x-3 py-2">
      <Checkbox
        checked={completed}
        onCheckedChange={onToggle}
        className="mt-1"
      />
      <div className="flex-1">
        <span className={cn(
          "text-sm",
          completed ? "line-through text-gray-500" : "text-gray-700"
        )}>
          {action.action}
        </span>
        {action.description && (
          <p className="text-xs text-gray-500 mt-1">{action.description}</p>
        )}
        {action.priority && (
          <Badge variant="outline" className="text-xs mt-1">
            {action.priority}
          </Badge>
        )}
      </div>
    </div>
  );
};

export default function AIActionCard({ insight, onStatusChange }: AIActionCardProps) {
  const [showActions, setShowActions] = useState(false);
  const [actionStates, setActionStates] = useState<Record<number, boolean>>({});
  
  const priorityConfig = getPriorityConfig(insight.priority_display);
  const statusConfig = getStatusConfig(insight.action_status);
  const PriorityIcon = priorityConfig.icon;
  const StatusIcon = statusConfig.icon;
  
  const confidencePercentage = insight.confidence_score * 100;
  const impactScore = insight.impact_score;
  
  const handleStatusChange = (newStatus: AIInsight['action_status']) => {
    onStatusChange?.(insight.id, newStatus);
  };

  const handleActionToggle = (index: number, completed: boolean) => {
    setActionStates(prev => ({
      ...prev,
      [index]: completed
    }));
  };

  const formatTimeAgo = (dateString: string) => {
    const date = new Date(dateString);
    const now = new Date();
    const diffInHours = Math.floor((now.getTime() - date.getTime()) / (1000 * 60 * 60));
    
    if (diffInHours < 1) return 'Just now';
    if (diffInHours < 24) return `${diffInHours}h ago`;
    
    const diffInDays = Math.floor(diffInHours / 24);
    if (diffInDays < 7) return `${diffInDays}d ago`;
    
    const diffInWeeks = Math.floor(diffInDays / 7);
    return `${diffInWeeks}w ago`;
  };

  const getDaysUntilExpiry = () => {
    if (!insight.expires_at) return null;
    const expiry = new Date(insight.expires_at);
    const now = new Date();
    const diffInDays = Math.ceil((expiry.getTime() - now.getTime()) / (1000 * 60 * 60 * 24));
    return diffInDays;
  };

  const daysUntilExpiry = getDaysUntilExpiry();
  const isExpiringSoon = daysUntilExpiry !== null && daysUntilExpiry <= 7 && daysUntilExpiry > 0;
  const isExpired = insight.expiry_status === 'Expired';

  return (
    <Card className={cn(
      "w-full transition-all duration-200 hover:shadow-md",
      insight.requires_immediate_action && "ring-2 ring-red-200",
      priorityConfig.border
    )}>
      <CardHeader className="pb-3">
        <div className="flex items-start justify-between">
          <div className="flex-1 min-w-0">
            <div className="flex items-center space-x-2 mb-2">
              <PriorityIcon className={cn("h-4 w-4", priorityConfig.color)} />
              <Badge variant={priorityConfig.badge} className="text-xs">
                {insight.priority_display}
              </Badge>
              <Badge variant={statusConfig.badge} className="text-xs">
                {insight.action_status}
              </Badge>
              {insight.platform && (
                <Badge variant="outline" className="text-xs">
                  {insight.platform}
                </Badge>
              )}
              {insight.requires_immediate_action && (
                <Badge variant="destructive" className="text-xs animate-pulse">
                  URGENT
                </Badge>
              )}
            </div>
            
            <h3 className="font-semibold text-gray-900 mb-1 leading-tight">
              {insight.insight_title}
            </h3>
            
            <p className="text-sm text-gray-600 mb-3 leading-relaxed">
              {insight.insight_description}
            </p>
            
            {/* Confidence & Impact Scores */}
            <div className="flex items-center space-x-6 mb-3">
              <div className="flex-1">
                <div className="flex items-center justify-between mb-1">
                  <span className="text-xs font-medium text-gray-600">Confidence</span>
                  <span className="text-xs font-medium text-gray-900">
                    {Math.round(confidencePercentage)}%
                  </span>
                </div>
                <Progress 
                  value={confidencePercentage} 
                  className="h-2"
                />
              </div>
              
              <div className="flex items-center space-x-2">
                <span className="text-xs font-medium text-gray-600">Impact</span>
                <div className="flex items-center">
                  {Array.from({ length: 10 }).map((_, i) => (
                    <div
                      key={i}
                      className={cn(
                        "h-2 w-1 mr-0.5 rounded-sm",
                        i < impactScore ? "bg-orange-400" : "bg-gray-200"
                      )}
                    />
                  ))}
                </div>
                <span className="text-xs font-semibold text-gray-900">
                  {impactScore}/10
                </span>
              </div>
            </div>
          </div>
          
          {/* Actions Menu */}
          <DropdownMenu>
            <DropdownMenuTrigger asChild>
              <Button variant="ghost" size="sm" className="h-8 w-8 p-0">
                <MoreVertical className="h-4 w-4" />
              </Button>
            </DropdownMenuTrigger>
            <DropdownMenuContent align="end">
              <DropdownMenuItem onClick={() => handleStatusChange('Viewed')}>
                <Eye className="h-4 w-4 mr-2" />
                Mark as Viewed
              </DropdownMenuItem>
              <DropdownMenuItem onClick={() => handleStatusChange('Saved')}>
                <Star className="h-4 w-4 mr-2" />
                Save for Later
              </DropdownMenuItem>
              <DropdownMenuItem onClick={() => handleStatusChange('Selected for Action')}>
                <Play className="h-4 w-4 mr-2" />
                Select for Action
              </DropdownMenuItem>
              <DropdownMenuItem onClick={() => handleStatusChange('In Progress')}>
                <Play className="h-4 w-4 mr-2" />
                Mark In Progress
              </DropdownMenuItem>
              <DropdownMenuItem onClick={() => handleStatusChange('Completed')}>
                <CheckCircle className="h-4 w-4 mr-2" />
                Mark Completed
              </DropdownMenuItem>
            </DropdownMenuContent>
          </DropdownMenu>
        </div>
      </CardHeader>
      
      <CardContent className="pt-0">
        {/* Top Action Highlight */}
        {insight.top_action && (
          <div className={cn(
            "p-3 rounded-lg mb-4",
            priorityConfig.bg
          )}>
            <div className="flex items-center space-x-2 mb-1">
              <Zap className={cn("h-4 w-4", priorityConfig.color)} />
              <span className="text-sm font-medium">Recommended Action</span>
            </div>
            <p className="text-sm text-gray-700">
              {typeof insight.top_action === 'object' && insight.top_action?.action 
                ? insight.top_action.action 
                : insight.top_action}
            </p>
          </div>
        )}
        
        {/* Expandable Actions List */}
        {insight.recommended_actions && insight.recommended_actions.length > 0 && (
          <div className="space-y-3">
            <Button
              variant="ghost"
              size="sm"
              onClick={() => setShowActions(!showActions)}
              className="w-full flex items-center justify-between p-0 h-auto text-left"
            >
              <span className="text-sm font-medium text-gray-700">
                All Actions ({insight.action_count})
              </span>
              {showActions ? (
                <ChevronUp className="h-4 w-4" />
              ) : (
                <ChevronDown className="h-4 w-4" />
              )}
            </Button>
            
            {showActions && (
              <div className="space-y-1 pl-4 border-l-2 border-gray-100">
                {Array.isArray(insight.recommended_actions) && insight.recommended_actions.map((action, index) => (
                  <ActionItem
                    key={index}
                    action={action}
                    completed={actionStates[index] || false}
                    onToggle={(completed) => handleActionToggle(index, completed)}
                  />
                ))}
              </div>
            )}
          </div>
        )}
        
        {/* Metadata Footer */}
        <div className="flex items-center justify-between mt-4 pt-3 border-t border-gray-100 text-xs text-gray-500">
          <div className="flex items-center space-x-4">
            <div className="flex items-center space-x-1">
              <Calendar className="h-3 w-3" />
              <span>{formatTimeAgo(insight.created_at)}</span>
            </div>
            
            {insight.actioned_by_email && (
              <div className="flex items-center space-x-1">
                <User className="h-3 w-3" />
                <span>by {insight.actioned_by_email}</span>
              </div>
            )}
          </div>
          
          {/* Expiry Warning */}
          {isExpiringSoon && (
            <div className="flex items-center space-x-1 text-orange-600">
              <AlertTriangle className="h-3 w-3" />
              <span>Expires in {daysUntilExpiry} days</span>
            </div>
          )}
          
          {isExpired && (
            <div className="flex items-center space-x-1 text-red-600">
              <AlertTriangle className="h-3 w-3" />
              <span>Expired</span>
            </div>
          )}
        </div>
      </CardContent>
    </Card>
  );
}