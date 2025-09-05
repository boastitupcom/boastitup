'use client';

import { 
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
  DropdownMenuSeparator,
  DropdownMenuLabel
} from '@boastitup/ui';
import { 
  Eye, 
  Bookmark, 
  Play, 
  CheckCircle, 
  X, 
  ExternalLink,
  Trash2,
  ArrowRight 
} from 'lucide-react';
import type { ActionStage } from '../../types/brand-health';
import { getValidTransitions, getStageDisplayName } from '../../types/brand-health';

interface ActionContextMenuProps {
  actionId: string;
  currentStage: ActionStage;
  isAssignedToOKR: boolean;
  isAssignedToCampaign: boolean;
  onStageChange: (stage: ActionStage) => void;
  onLinkToOKR: () => void;
  onAssignToCampaign: () => void;
  onRemoveAssignments: () => void;
}

export default function ActionContextMenu({
  actionId,
  currentStage,
  isAssignedToOKR,
  isAssignedToCampaign,
  onStageChange,
  onLinkToOKR,
  onAssignToCampaign,
  onRemoveAssignments,
  children
}: ActionContextMenuProps & { children: React.ReactNode }) {
  const validTransitions = getValidTransitions(currentStage);

  const getStageIcon = (stage: ActionStage) => {
    switch (stage) {
      case 'new':
        return <ArrowRight className="h-4 w-4" />;
      case 'viewed':
        return <Eye className="h-4 w-4" />;
      case 'saved':
        return <Bookmark className="h-4 w-4" />;
      case 'selected_for_action':
        return <Play className="h-4 w-4" />;
      case 'in_progress':
        return <Play className="h-4 w-4" />;
      case 'actioned':
        return <CheckCircle className="h-4 w-4" />;
      case 'dismissed':
        return <X className="h-4 w-4" />;
    }
  };

  return (
    <DropdownMenu>
      <DropdownMenuTrigger asChild>
        {children}
      </DropdownMenuTrigger>
      <DropdownMenuContent className="w-56" align="end">
        {/* Stage Transitions */}
        {validTransitions.length > 0 && (
          <>
            <DropdownMenuLabel>Change Status</DropdownMenuLabel>
            {validTransitions.map((stage) => (
              <DropdownMenuItem
                key={stage}
                onClick={() => onStageChange(stage)}
                className="flex items-center gap-2"
              >
                {getStageIcon(stage)}
                <span>Mark as {getStageDisplayName(stage)}</span>
              </DropdownMenuItem>
            ))}
            <DropdownMenuSeparator />
          </>
        )}

        {/* Assignments */}
        <DropdownMenuLabel>Assignments</DropdownMenuLabel>
        
        {!isAssignedToOKR && (
          <DropdownMenuItem
            onClick={onLinkToOKR}
            className="flex items-center gap-2"
          >
            <ExternalLink className="h-4 w-4" />
            <span>Link to OKR</span>
          </DropdownMenuItem>
        )}
        
        {!isAssignedToCampaign && (
          <DropdownMenuItem
            onClick={onAssignToCampaign}
            className="flex items-center gap-2"
          >
            <ExternalLink className="h-4 w-4" />
            <span>Assign to Campaign</span>
          </DropdownMenuItem>
        )}

        {(isAssignedToOKR || isAssignedToCampaign) && (
          <DropdownMenuItem
            onClick={onRemoveAssignments}
            className="flex items-center gap-2 text-red-600 focus:text-red-600"
          >
            <Trash2 className="h-4 w-4" />
            <span>Remove Assignments</span>
          </DropdownMenuItem>
        )}

        {/* Current Assignments Display */}
        {(isAssignedToOKR || isAssignedToCampaign) && (
          <>
            <DropdownMenuSeparator />
            <DropdownMenuLabel>Currently Assigned</DropdownMenuLabel>
            
            {isAssignedToOKR && (
              <div className="px-2 py-1 text-xs text-green-600 flex items-center gap-2">
                <ExternalLink className="h-3 w-3" />
                <span>Linked to OKR</span>
              </div>
            )}
            
            {isAssignedToCampaign && (
              <div className="px-2 py-1 text-xs text-blue-600 flex items-center gap-2">
                <ExternalLink className="h-3 w-3" />
                <span>Assigned to Campaign</span>
              </div>
            )}
          </>
        )}

        {/* Dismiss Option */}
        {currentStage !== 'dismissed' && currentStage !== 'actioned' && (
          <>
            <DropdownMenuSeparator />
            <DropdownMenuItem
              onClick={() => onStageChange('dismissed')}
              className="flex items-center gap-2 text-red-600 focus:text-red-600"
            >
              <X className="h-4 w-4" />
              <span>Dismiss Action</span>
            </DropdownMenuItem>
          </>
        )}
      </DropdownMenuContent>
    </DropdownMenu>
  );
}