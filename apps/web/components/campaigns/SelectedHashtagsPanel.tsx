"use client";

import React from 'react';
import { Button, Badge } from '@boastitup/ui';
import { X, GripVertical } from 'lucide-react';

interface SelectedHashtag {
  id: string;
  hashtag: string;
  position: number;
  selected_at: string;
  status: 'selected' | 'primary' | 'secondary';
}

interface SelectedHashtagsPanelProps {
  hashtags: SelectedHashtag[];
  onRemoveHashtag: (hashtag: string) => void;
  onReorderHashtags?: (hashtags: SelectedHashtag[]) => void;
  maxHashtags?: number;
  className?: string;
}

export const SelectedHashtagsPanel: React.FC<SelectedHashtagsPanelProps> = ({
  hashtags,
  onRemoveHashtag,
  onReorderHashtags,
  maxHashtags = 30,
  className = ""
}) => {
  const handleDragStart = (e: React.DragEvent<HTMLDivElement>, hashtag: SelectedHashtag) => {
    e.dataTransfer.setData('text/plain', hashtag.id);
  };

  const handleDragOver = (e: React.DragEvent<HTMLDivElement>) => {
    e.preventDefault();
  };

  const handleDrop = (e: React.DragEvent<HTMLDivElement>, targetHashtag: SelectedHashtag) => {
    e.preventDefault();
    const draggedId = e.dataTransfer.getData('text/plain');
    const draggedHashtag = hashtags.find(h => h.id === draggedId);

    if (!draggedHashtag || draggedHashtag.id === targetHashtag.id) return;

    const draggedIndex = hashtags.findIndex(h => h.id === draggedId);
    const targetIndex = hashtags.findIndex(h => h.id === targetHashtag.id);

    const newHashtags = [...hashtags];
    newHashtags.splice(draggedIndex, 1);
    newHashtags.splice(targetIndex, 0, draggedHashtag);

    // Update positions
    const reorderedHashtags = newHashtags.map((h, index) => ({
      ...h,
      position: index + 1
    }));

    onReorderHashtags?.(reorderedHashtags);
  };

  const remainingSlots = maxHashtags - hashtags.length;

  return (
    <div className={`bg-white border border-gray-200 rounded-lg p-6 ${className}`}>
      <div className="space-y-4">
        {/* Header */}
        <div className="flex items-center justify-between">
          <div>
            <h3 className="font-semibold text-gray-900 text-lg">
              Selected Hashtags ({hashtags.length})
            </h3>
            <p className="text-sm text-gray-600">
              {hashtags.length === 0
                ? "Drop hashtags here to add them to your campaign"
                : `${remainingSlots} slots remaining (max ${maxHashtags})`
              }
            </p>
          </div>
          {hashtags.length > 0 && (
            <Badge variant="outline" className="bg-blue-50 text-blue-700 border-blue-200">
              {hashtags.length}/{maxHashtags}
            </Badge>
          )}
        </div>

        {/* Drop Zone */}
        {hashtags.length === 0 ? (
          <div className="border-2 border-dashed border-gray-300 rounded-lg p-16 text-center">
            <p className="text-gray-400 text-sm">Drop hashtags here</p>
          </div>
        ) : (
          <div className="space-y-2 max-h-96 overflow-y-auto">
            {hashtags
              .sort((a, b) => a.position - b.position)
              .map((hashtag, index) => (
                <div
                  key={hashtag.id}
                  draggable
                  onDragStart={(e) => handleDragStart(e, hashtag)}
                  onDragOver={handleDragOver}
                  onDrop={(e) => handleDrop(e, hashtag)}
                  className="group flex items-center space-x-3 p-3 bg-gray-50 border border-gray-200 rounded-lg hover:shadow-sm transition-all cursor-move"
                >
                  {/* Drag Handle */}
                  <div className="text-gray-400 group-hover:text-gray-600">
                    <GripVertical className="h-4 w-4" />
                  </div>

                  {/* Position Number */}
                  <div className="flex-shrink-0 w-6 h-6 bg-blue-100 text-blue-700 rounded-full flex items-center justify-center text-xs font-medium">
                    {index + 1}
                  </div>

                  {/* Hashtag Content */}
                  <div className="flex-1 min-w-0">
                    <div className="flex items-center space-x-2">
                      <span className="font-medium text-gray-900 truncate">
                        {hashtag.hashtag}
                      </span>
                      {hashtag.status === 'primary' && (
                        <Badge className="bg-blue-600 text-white text-xs">Primary</Badge>
                      )}
                      {hashtag.status === 'secondary' && (
                        <Badge variant="outline" className="bg-blue-50 text-blue-600 border-blue-200 text-xs">
                          Secondary
                        </Badge>
                      )}
                    </div>
                    <p className="text-xs text-gray-500 mt-1">
                      Added {new Date(hashtag.selected_at).toLocaleDateString()}
                    </p>
                  </div>

                  {/* Remove Button */}
                  <Button
                    size="sm"
                    variant="ghost"
                    onClick={() => onRemoveHashtag(hashtag.hashtag)}
                    className="opacity-0 group-hover:opacity-100 transition-opacity h-8 w-8 p-0 hover:bg-red-50 hover:text-red-600"
                  >
                    <X className="h-4 w-4" />
                  </Button>
                </div>
              ))}
          </div>
        )}

        {/* Instructions */}
        {hashtags.length > 0 && (
          <div className="bg-blue-50 border border-blue-200 rounded-lg p-3">
            <p className="text-blue-700 text-xs">
              💡 Tip: Drag hashtags to reorder them. The order affects their priority in your campaign.
            </p>
          </div>
        )}
      </div>
    </div>
  );
};