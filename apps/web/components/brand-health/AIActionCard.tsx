'use client';

import { useState } from 'react';
import { Badge, Button } from '@boastitup/ui';
import { MoreVertical, Eye, Bookmark, Play, CheckCircle, X, ExternalLink, AlertTriangle, Clock } from 'lucide-react';
import { cn } from '@/lib/utils';
import type { AIActionCardProps, ActionStage } from '../../types/brand-health';

import { 
  getStageBadgeColor, 
  getStageDisplayName, 
  getValidTransitions,
  getImpactLevel,
  getImpactColor,
  getExpirationWarningText,
  getExpirationStatus,
  getExpirationColor
} from '../../types/brand-health';
import ActionContextMenu from './ActionContextMenu';

export default function AIActionCard({
  action,
  insightTitle,
  onStageChange,
  onLinkToOKR,
  onAssignToCampaign
}: AIActionCardProps) {
  
  const impactLevel = getImpactLevel(action.action_impact_score);
  const impactColor = getImpactColor(impactLevel);
  const stageBadgeColor = getStageBadgeColor(action.stage);
  const stageDisplayName = getStageDisplayName(action.stage);
  const validTransitions = getValidTransitions(action.stage);
  
  const isUrgent = action.action_impact_score && action.action_impact_score >= 8;
  const isAssignedToOKR = !!action.okr_objective_id;
  const isAssignedToCampaign = !!action.assigned_to_campaign_id;

  const handleStageChange = (newStage: ActionStage) => {
    onStageChange(action.id, newStage);
  };

  const handleLinkToOKR = () => {
    if (onLinkToOKR) {
      onLinkToOKR(action.id);
    }
  };

  const handleAssignToCampaign = () => {
    if (onAssignToCampaign) {
      onAssignToCampaign(action.id);
    }
  };

  const getQuickActionButton = () => {
    switch (action.stage) {
      case 'new':
        return (
          <Button
            size="sm"
            variant="outline"
            onClick={() => handleStageChange('viewed')}
            className="text-xs"
          >
            <Eye className="h-3 w-3 mr-1" />
            Mark as Viewed
          </Button>
        );
      case 'viewed':
        return (
          <Button
            size="sm"
            variant="outline"
            onClick={() => handleStageChange('saved')}
            className="text-xs"
          >
            <Bookmark className="h-3 w-3 mr-1" />
            Save for Later
          </Button>
        );
      case 'saved':
        return (
          <Button
            size="sm"
            variant="default"
            onClick={() => handleStageChange('selected_for_action')}
            className="text-xs"
          >
            <Play className="h-3 w-3 mr-1" />
            Select for Action
          </Button>
        );
      case 'selected_for_action':
        return (
          <Button
            size="sm"
            variant="default"
            onClick={() => handleStageChange('in_progress')}
            className="text-xs"
          >
            <Play className="h-3 w-3 mr-1" />
            Start Progress
          </Button>
        );
      case 'in_progress':
        return (
          <Button
            size="sm"
            variant="default"
            onClick={() => handleStageChange('actioned')}
            className="text-xs bg-green-600 hover:bg-green-700"
          >
            <CheckCircle className="h-3 w-3 mr-1" />
            Mark Complete
          </Button>
        );
      case 'actioned':
        return (
          <Badge variant="default" className="bg-green-100 text-green-800 border-green-200">
            <CheckCircle className="h-3 w-3 mr-1" />
            Completed
          </Badge>
        );
      case 'dismissed':
        return (
          <Button
            size="sm"
            variant="outline"
            onClick={() => handleStageChange('new')}
            className="text-xs"
          >
            Reactivate
          </Button>
        );
      default:
        return null;
    }
  };

  return (
    <div className={cn(
      "relative bg-white border rounded-lg p-4 transition-all hover:shadow-sm",
      isUrgent && "ring-2 ring-red-200 bg-red-50/30",
      action.stage === 'dismissed' && "opacity-60"
    )}>
      {/* Urgent indicator */}
      {isUrgent && (
        <div className="absolute -top-1 -right-1 w-3 h-3 bg-red-500 rounded-full animate-pulse" />
      )}

      <div className="space-y-3">
        {/* Action Header */}
        <div className="flex items-start justify-between gap-2">
          <div className="flex-1">
            <h5 className="font-medium text-gray-900 leading-tight">
              {action.action_text}
            </h5>
            
            {action.action_description && (
              <p className="text-sm text-gray-600 mt-1 leading-relaxed">
                {action.action_description}
              </p>
            )}
          </div>
          
          <div className="flex items-center gap-2 shrink-0">
            {/* Stage Badge */}
            <Badge className={cn("text-xs", stageBadgeColor)}>
              {stageDisplayName}
            </Badge>
            
            {/* Context Menu */}
            <ActionContextMenu
              actionId={action.id}
              currentStage={action.stage}
              isAssignedToOKR={isAssignedToOKR}
              isAssignedToCampaign={isAssignedToCampaign}
              onStageChange={handleStageChange}
              onLinkToOKR={handleLinkToOKR}
              onAssignToCampaign={handleAssignToCampaign}
              onRemoveAssignments={() => {
                // TODO: Implement remove assignments
              }}
            >
              <Button
                size="sm"
                variant="ghost"
                className="h-6 w-6 p-0"
              >
                <MoreVertical className="h-3 w-3" />
              </Button>
            </ActionContextMenu>
          </div>
        </div>

        {/* Action Metadata */}
        <div className="flex items-center gap-4 text-xs text-gray-500">
          <span className="flex items-center gap-1">
            Priority: 
            <Badge variant="outline" className="ml-1 text-xs">
              {action.action_priority}
            </Badge>
          </span>
          
          {action.action_impact_score && (
            <span className={cn("flex items-center gap-1", impactColor)}>
              Impact: {action.action_impact_score}/10
            </span>
          )}
          
          {action.action_confidence_score && (
            <span className="flex items-center gap-2">
              <span>Confidence:</span>
              <div className="flex items-center gap-1">
                <div className="w-12 h-2 bg-gray-200 rounded-full overflow-hidden">
                  <div 
                    className="h-full bg-blue-500 rounded-full transition-all duration-300"
                    style={{ width: `${Math.round(action.action_confidence_score * 100)}%` }}
                  />
                </div>
                <span className="text-xs font-medium">
                  {Math.round(action.action_confidence_score * 100)}%
                </span>
              </div>
            </span>
          )}
        </div>

        {/* Expiration Warning - Add this before assignments */}
        {action.created_at && getExpirationWarningText(action.created_at) && (
          <div className={cn(
            "text-xs px-3 py-2 rounded-lg border-2 inline-flex items-center gap-2 font-medium shadow-sm",
            getExpirationColor(getExpirationStatus(action.created_at)),
            getExpirationStatus(action.created_at) === 'expired' && "animate-pulse"
          )}>
            <Clock className="h-3 w-3" />
            <span>{getExpirationWarningText(action.created_at)}</span>
          </div>
        )}

        {/* Assignments */}
        {(isAssignedToOKR || isAssignedToCampaign) && (
          <div className="flex items-center gap-2 text-xs">
            {isAssignedToOKR && (
              <Badge variant="secondary" className="text-xs">
                <ExternalLink className="h-2 w-2 mr-1" />
                Linked to OKR
              </Badge>
            )}
            
            {isAssignedToCampaign && (
              <Badge variant="secondary" className="text-xs">
                <ExternalLink className="h-2 w-2 mr-1" />
                Assigned to Campaign
              </Badge>
            )}
          </div>
        )}

        {/* Action Timestamps */}
        {(action.viewed_at || action.saved_at || action.actioned_at) && (
          <div className="text-xs text-gray-400 space-y-1">
            {action.viewed_at && (
              <div>Viewed: {new Date(action.viewed_at).toLocaleDateString()}</div>
            )}
            {action.saved_at && (
              <div>Saved: {new Date(action.saved_at).toLocaleDateString()}</div>
            )}
            {action.actioned_at && (
              <div>Completed: {new Date(action.actioned_at).toLocaleDateString()}</div>
            )}
          </div>
        )}

        {/* Quick Action Button */}
        <div className="flex justify-between items-center">
          <div className="flex-1">
            {getQuickActionButton()}
          </div>
        </div>
      </div>

      {/* Click overlay for quick stage progression */}
      {action.stage !== 'actioned' && action.stage !== 'dismissed' && (
        <div 
          className="absolute inset-0 cursor-pointer opacity-0 hover:bg-gray-50/50 transition-colors rounded-lg"
          onClick={() => {
            const nextStage = validTransitions[0];
            if (nextStage) {
              handleStageChange(nextStage);
            }
          }}
        />
      )}
    </div>
  );
}