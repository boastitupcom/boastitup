'use client';

import { useState } from 'react';
import { Card, CardContent, CardHeader, CardTitle, Badge, Skeleton } from '@boastitup/ui';
import { 
  ChevronDown, 
  ChevronUp, 
  AlertTriangle, 
  Clock, 
  CheckCircle,
  Activity,
  Search,
  Globe,
  Mail,
  Music,
  Pin,
  Zap,
  Youtube,
  Linkedin,
  Twitter,
  Facebook,
  Instagram,
  Heart,
  Shield,
  ThumbsUp,
  BarChart3
} from 'lucide-react';
import { cn } from '@/lib/utils';
import type { 
  CategoryCardProps, 
  InsightWithActions, 
  ActionStage, 
  ImpactLevel, 
  ExpirationStatus 
} from '../../types/brand-health';
import { 
  getCategoryTheme, 
  getImpactLevel, 
  getImpactColor, 
  getExpirationWarningText,
  getExpirationStatus,
  getExpirationColor,
  getPlatformIcon
} from '../../types/brand-health';
import AIActionCard from './AIActionCard';

// Platform Icon Component
const PlatformIconComponent = ({ platform }: { platform?: string }) => {
  const platformData = getPlatformIcon(platform);
  const iconMap = {
    'Activity': Activity,
    'Search': Search,
    'Globe': Globe,
    'Mail': Mail,
    'Music': Music,
    'Pin': Pin,
    'Zap': Zap,
    'Youtube': Youtube,
    'Linkedin': Linkedin,
    'Twitter': Twitter,
    'Facebook': Facebook,
    'Instagram': Instagram,
    'Heart': Heart,
    'Shield': Shield,
    'ThumbsUp': ThumbsUp,
    'BarChart3': BarChart3
  };
  
  const IconComponent = iconMap[platformData.icon as keyof typeof iconMap] || Activity;
  
  return <IconComponent className="h-3 w-3" style={{ color: platformData.color }} />;
};

// Category Icon Component
const CategoryIconComponent = ({ icon, color }: { icon: string; color: string }) => {
  const iconMap = {
    'Search': Search,
    'ThumbsUp': ThumbsUp,
    'Shield': Shield,
    'Heart': Heart,
    'BarChart3': BarChart3,
    'Activity': Activity
  };
  
  const IconComponent = iconMap[icon as keyof typeof iconMap] || BarChart3;
  
  return (
    <div 
      className="w-3 h-3 rounded-full flex items-center justify-center" 
      style={{ backgroundColor: color }}
    >
      <IconComponent className="h-2 w-2 text-white" />
    </div>
  );
};

export default function CategoryCard({ 
  category, 
  insights, 
  isLoading = false,
  onActionStageChange 
}: CategoryCardProps) {
  const [isExpanded, setIsExpanded] = useState(false);
  
  // Sort insights by sort_order (nulls last) then by impact_score descending
  const sortedInsights = [...insights].sort((a, b) => {
    if (a.sort_order && b.sort_order) {
      return a.sort_order - b.sort_order;
    }
    if (a.sort_order && !b.sort_order) return -1;
    if (!a.sort_order && b.sort_order) return 1;
    
    // If both have no sort_order, sort by impact_score descending
    return (b.impact_score || 0) - (a.impact_score || 0);
  });
  
  if (isLoading) {
    return (
      <Card className="w-full">
        <CardHeader>
          <div className="flex items-center justify-between">
            <Skeleton className="h-6 w-32" />
            <Skeleton className="h-4 w-16" />
          </div>
        </CardHeader>
        <CardContent>
          <div className="space-y-4">
            <Skeleton className="h-20 w-full" />
            <Skeleton className="h-20 w-full" />
          </div>
        </CardContent>
      </Card>
    );
  }

  const theme = getCategoryTheme(category);
  const totalInsights = sortedInsights.length;
  const allActions = insights.flatMap(insight => insight.ai_recommended_actions_v1);
  const totalActions = allActions.length;
  const newActions = allActions.filter(action => action.stage === 'new').length;
  const urgentActions = allActions.filter(action => 
    action.action_impact_score && action.action_impact_score >= 8
  ).length;
  const completedActions = allActions.filter(action => action.stage === 'actioned').length;

  const getStatsColor = (count: number, total: number) => {
    if (count === 0) return 'text-gray-500';
    const ratio = count / total;
    if (ratio >= 0.7) return 'text-red-600';
    if (ratio >= 0.4) return 'text-orange-600';
    return 'text-green-600';
  };

  return (
    <Card className={cn("w-full transition-all hover:shadow-md", theme.borderColor)}>
      <CardHeader className={cn("pb-4", theme.bgColor)}>
        <div className="flex items-center justify-between">
          <CardTitle className="text-lg font-semibold flex items-center gap-2">
            <div 
              className="w-3 h-3 rounded-full" 
              style={{ backgroundColor: theme.color }}
            />
            {category}
            <Badge variant="secondary" className="ml-2">
              {totalInsights} insight{totalInsights !== 1 ? 's' : ''}
            </Badge>
          </CardTitle>
          
          <button
            onClick={() => setIsExpanded(!isExpanded)}
            className="p-1 hover:bg-white/50 rounded-full transition-colors"
          >
            {isExpanded ? (
              <ChevronUp className="h-4 w-4" />
            ) : (
              <ChevronDown className="h-4 w-4" />
            )}
          </button>
        </div>

        {/* Quick Stats */}
        <div className="flex items-center gap-4 mt-2 text-sm">
          <div className="flex items-center gap-1">
            <AlertTriangle className="h-3 w-3 text-red-500" />
            <span className={getStatsColor(urgentActions, totalActions)}>
              {urgentActions} urgent
            </span>
          </div>
          
          <div className="flex items-center gap-1">
            <Clock className="h-3 w-3 text-orange-500" />
            <span className={getStatsColor(newActions, totalActions)}>
              {newActions} new
            </span>
          </div>
          
          <div className="flex items-center gap-1">
            <CheckCircle className="h-3 w-3 text-green-500" />
            <span className="text-green-600">
              {completedActions} done
            </span>
          </div>
        </div>
      </CardHeader>

      <CardContent className="pt-0">
        {/* Always show first insight */}
        {totalInsights > 0 && (
          <div className="space-y-4">
            <InsightItem 
              insight={sortedInsights[0]} 
              onActionStageChange={onActionStageChange}
              isFirst={true}
            />
            
            {/* Show remaining insights when expanded */}
            {isExpanded && sortedInsights.slice(1).map((insight) => (
              <InsightItem 
                key={insight.id} 
                insight={insight} 
                onActionStageChange={onActionStageChange}
                isFirst={false}
              />
            ))}

            {/* Show expand/collapse for multiple insights */}
            {totalInsights > 1 && (
              <button
                onClick={() => setIsExpanded(!isExpanded)}
                className="w-full text-center py-2 text-sm text-gray-600 hover:text-gray-800 transition-colors border-t"
              >
                {isExpanded 
                  ? `Show less (${totalInsights - 1} hidden)`
                  : `Show ${totalInsights - 1} more insight${totalInsights > 2 ? 's' : ''}`
                }
              </button>
            )}
          </div>
        )}

        {totalInsights === 0 && (
          <div className="text-center py-8 text-gray-500">
            <p>No insights available for this category</p>
          </div>
        )}
      </CardContent>
    </Card>
  );
}

interface InsightItemProps {
  insight: InsightWithActions;
  onActionStageChange: (actionId: string, newStage: ActionStage) => void;
  isFirst: boolean;
}

function InsightItem({ insight, onActionStageChange, isFirst }: InsightItemProps) {
  const [actionsExpanded, setActionsExpanded] = useState(false);
  const impactLevel = getImpactLevel(insight.impact_score);
  const impactColor = getImpactColor(impactLevel);
  const hasActions = (insight.ai_recommended_actions_v1 || []).length > 0;
  const activeActions = (insight.ai_recommended_actions_v1 || []).filter(action => action.stage !== 'actioned');

  return (
    <div className={cn(
      "border-l-4 pl-4 py-3",
      !isFirst && "border-t pt-6",
      insight.impact_score && insight.impact_score >= 8 ? "border-l-red-500 bg-red-50/50" :
      insight.impact_score && insight.impact_score >= 5 ? "border-l-orange-500 bg-orange-50/50" :
      "border-l-green-500 bg-green-50/50"
    )}>
      <div className="space-y-3">
        {/* Insight Header */}
        <div className="flex items-start justify-between">
          <div className="flex-1">
            <h4 className="font-semibold text-gray-900 leading-tight">
              {insight.insight_title}
            </h4>
            <p className="text-sm text-gray-600 mt-1 leading-relaxed">
              {insight.insight_description}
            </p>
          </div>
          
          {insight.impact_score && (
            <Badge 
              variant={insight.impact_score >= 8 ? 'destructive' : insight.impact_score >= 5 ? 'secondary' : 'default'}
              className="ml-2 shrink-0"
            >
              Impact: {insight.impact_score}/10
            </Badge>
          )}
        </div>

        {/* Insight Metadata */}
        <div className="flex items-center gap-4 text-xs text-gray-500">
          {insight.platform && (
            <span className="flex items-center gap-1" style={{ color: getPlatformIcon(insight.platform).color }}>
              <PlatformIconComponent platform={insight.platform} />
              {getPlatformIcon(insight.platform).label}
            </span>
          )}
          
          {insight.confidence_score && (
            <span className="flex items-center gap-2">
              <span>Confidence:</span>
              <div className="flex items-center gap-1">
                <div className="w-12 h-2 bg-gray-200 rounded-full overflow-hidden">
                  <div 
                    className="h-full bg-blue-500 rounded-full transition-all duration-300"
                    style={{ width: `${Math.round(insight.confidence_score * 100)}%` }}
                  />
                </div>
                <span className="text-xs font-medium">
                  {Math.round(insight.confidence_score * 100)}%
                </span>
              </div>
            </span>
          )}
          
          {insight.trend_direction !== undefined && (
            <span className={cn(
              "flex items-center gap-1",
              insight.trend_direction > 0 ? 'text-green-600' :
              insight.trend_direction < 0 ? 'text-red-600' : 'text-gray-500'
            )}>
              Trend: {insight.trend_direction > 0 ? '↑' : insight.trend_direction < 0 ? '↓' : '→'}
              {insight.trend_change_text && ` ${insight.trend_change_text}`}
            </span>
          )}
        </div>

        {/* Expiration Warning */}
        {insight.expires_at && getExpirationWarningText(insight.expires_at) && (
          <div className={cn(
            "text-xs px-3 py-2 rounded-lg border-2 inline-flex items-center gap-2 font-medium shadow-sm",
            getExpirationColor(getExpirationStatus(insight.expires_at)),
            getExpirationStatus(insight.expires_at) === 'expired' && "animate-pulse"
          )}>
            <AlertTriangle className="h-3 w-3" />
            <span>{getExpirationWarningText(insight.expires_at)}</span>
          </div>
        )}

        {/* Actions */}
        {hasActions && (
          <div className="space-y-2 mt-4">
            <h5 className="text-xs font-medium text-gray-700 uppercase tracking-wide">
              Recommended Actions ({insight.ai_recommended_actions_v1.filter(action => action.stage !== 'actioned').length})
            </h5>
            
            <div className="space-y-2">
              {insight.ai_recommended_actions_v1
                .filter(action => action.stage !== 'actioned') // Hide completed actions from individual cards
                .map((action) => (
                  <AIActionCard
                    key={action.id}
                    action={action}
                    insightTitle={insight.insight_title}
                    onStageChange={onActionStageChange}
                  />
                ))}
            </div>
          </div>
        )}
      </div>
    </div>
  );
}