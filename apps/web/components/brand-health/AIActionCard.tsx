'use client';

import { Badge, Button } from '@boastitup/ui';
import { Star, MoreVertical } from 'lucide-react';
import { cn } from '@/lib/utils';
import type { 
  AIActionCardProps, 
  ActionStage,
  Priority
} from '../../types/brand-health';
import { 
  getPriorityBadgeColor, 
  getStageBadgeColor, 
  getStageDisplayName, 
  getImpactLevel,
  getImpactColor
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
  const priorityColor = getPriorityBadgeColor(`${action.action_priority.toUpperCase()} PRIORITY`);
  
  const handleStageChange = (newStage: ActionStage) => {
    onStageChange(action.id, newStage);
  };

  const getAgeDisplay = (): string => {
    const createdAt = new Date(action.created_at);
    const now = new Date();
    const diffHours = Math.floor((now.getTime() - createdAt.getTime()) / (1000 * 60 * 60));
    
    if (diffHours < 24) return 'Today';
    if (diffHours < 48) return 'Yesterday';
    const diffDays = Math.floor(diffHours / 24);
    return `${diffDays} days ago`;
  };

  const isSelected = ['selected_for_action', 'in_progress', 'actioned'].includes(action.stage);

  return (
    <div className="bg-white border border-gray-200 rounded-lg p-4 space-y-4 shadow-sm hover:shadow-md transition-shadow">
      
      {/* Top Row: Priority and Status Badges | Star + Three Dots Menu */}
      <div className="flex items-start justify-between">
        <div className="flex items-center gap-2">
          <Badge className={cn("text-xs font-medium px-2 py-1", priorityColor)}>
            {action.action_priority.toUpperCase()} PRIORITY
          </Badge>
          
          <Badge className={cn("text-xs font-medium px-2 py-1", stageBadgeColor)}>
            {stageDisplayName.toUpperCase()}
          </Badge>
        </div>
        
        <div className="flex items-center gap-1">
          <Button
            size="sm"
            variant="ghost"
            onClick={() => {
              if (action.stage === 'saved') {
                const previousStage = action.viewed_at ? 'viewed' : 'new';
                handleStageChange(previousStage);
              } else {
                handleStageChange('saved');
              }
            }}
            className={cn(
              "p-1 h-6 w-6 transition-colors",
              action.stage === 'saved' 
                ? "text-yellow-500 hover:text-yellow-600" 
                : "text-gray-400 hover:text-yellow-500"
            )}
            title={action.stage === 'saved' ? 'Remove from saved' : 'Save action'}
          >
            <Star className={cn(
              "h-4 w-4",
              action.stage === 'saved' && "fill-current"
            )} />
          </Button>
          
          <ActionContextMenu
            actionId={action.id}
            currentStage={action.stage}
            onStageChange={handleStageChange}
            onLinkToOKR={onLinkToOKR}
            onAssignToCampaign={onAssignToCampaign}
          >
            <Button
              size="sm"
              variant="ghost"
              className="p-1 h-6 w-6 text-gray-400 hover:text-gray-600"
            >
              <MoreVertical className="h-3 w-3" />
            </Button>
          </ActionContextMenu>
        </div>
      </div>

      {/* Action Description */}
      <div className="text-sm text-gray-900 leading-relaxed">
        {action.action_text || action.action_description}
      </div>

      {/* Confidence Bar */}
      <div className="w-full">
        <div className="bg-gray-200 rounded-full h-2">
          <div 
            className="bg-blue-500 h-full rounded-full transition-all duration-300"
            style={{ width: `${action.action_confidence_score ? Math.round(action.action_confidence_score * 100) : 0}%` }}
          />
        </div>
        <div className="flex justify-between items-center mt-1">
          <span className="text-xs text-blue-600 font-medium">
            {action.action_confidence_score ? Math.round(action.action_confidence_score * 100) : 0}%
          </span>
          <span className={cn("text-xs font-medium", impactColor)}>
            {impactLevel.toUpperCase()} IMPACT
          </span>
        </div>
      </div>

      {/* Bottom Row: Checkbox + Create Campaign Button */}
      <div className="flex items-center justify-between pt-2">
        <div className="flex items-center gap-2">
          <input
            type="checkbox"
            id={`action-${action.id}`}
            className="rounded border-gray-300 text-blue-600 focus:ring-blue-500 h-4 w-4"
            onChange={(e) => {
              if (e.target.checked) {
                handleStageChange('selected_for_action');
              } else {
                handleStageChange('new');
              }
            }}
            checked={isSelected}
          />
          <label htmlFor={`action-${action.id}`} className="text-xs text-gray-600 cursor-pointer">
            Select for Action
          </label>
          <span className="text-xs text-gray-500 ml-4">{getAgeDisplay()}</span>
        </div>
        
        <Button
          size="sm"
          className="bg-blue-600 hover:bg-blue-700 text-white text-xs px-3 py-1 h-7"
          onClick={() => {
            // Placeholder for Create Campaign functionality
            console.log('Create Campaign clicked for action:', action.id);
          }}
        >
          <span className="mr-1">✨</span>
          Create Campaign
        </Button>
      </div>
    </div>
  );
}