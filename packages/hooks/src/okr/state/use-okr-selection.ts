import { useState, useCallback } from 'react';

// Types that should be imported from shared types
export interface OKRTemplate {
  id: string;
  okrMasterId: string;
  title: string;
  description: string;
  category: string;
  priority: number;
  suggestedTargetValue: number;
  suggestedTimeframe: 'daily' | 'weekly' | 'monthly' | 'quarterly';
  applicablePlatforms: string[];
  metricTypeId: string;
  confidenceScore: number;
  reasoning?: string;
}

export interface SelectionState {
  selectedTemplates: Map<string, OKRTemplate>;
  selectedCount: number;
  allSelected: boolean;
  partiallySelected: boolean;
}

/**
 * Hook for managing OKR template selection state
 * Based on story.txt specifications for selection state management
 */
export const useOKRSelection = (templates: OKRTemplate[] = []) => {
  const [selectedTemplates, setSelectedTemplates] = useState<Map<string, OKRTemplate>>(new Map());

  // Computed values
  const selectedCount = selectedTemplates.size;
  const allSelected = templates.length > 0 && selectedCount === templates.length;
  const partiallySelected = selectedCount > 0 && selectedCount < templates.length;

  // Get array of selected templates
  const getSelectedTemplates = useCallback(() => {
    return Array.from(selectedTemplates.values());
  }, [selectedTemplates]);

  // Get array of selected template IDs
  const getSelectedIds = useCallback(() => {
    return Array.from(selectedTemplates.keys());
  }, [selectedTemplates]);

  // Check if template is selected
  const isSelected = useCallback((templateId: string) => {
    return selectedTemplates.has(templateId);
  }, [selectedTemplates]);

  // Select a single template
  const selectTemplate = useCallback((template: OKRTemplate) => {
    setSelectedTemplates(prev => {
      const newMap = new Map(prev);
      newMap.set(template.id, template);
      return newMap;
    });
  }, []);

  // Deselect a single template
  const deselectTemplate = useCallback((templateId: string) => {
    setSelectedTemplates(prev => {
      const newMap = new Map(prev);
      newMap.delete(templateId);
      return newMap;
    });
  }, []);

  // Toggle template selection
  const toggleTemplate = useCallback((template: OKRTemplate) => {
    if (selectedTemplates.has(template.id)) {
      deselectTemplate(template.id);
    } else {
      selectTemplate(template);
    }
  }, [selectedTemplates, selectTemplate, deselectTemplate]);

  // Select all templates
  const selectAll = useCallback(() => {
    const newMap = new Map();
    templates.forEach(template => {
      newMap.set(template.id, template);
    });
    setSelectedTemplates(newMap);
  }, [templates]);

  // Clear all selections
  const clearAll = useCallback(() => {
    setSelectedTemplates(new Map());
  }, []);

  // Toggle all selection (select all if none/partial selected, clear all if all selected)
  const toggleAll = useCallback(() => {
    if (allSelected) {
      clearAll();
    } else {
      selectAll();
    }
  }, [allSelected, selectAll, clearAll]);

  // Select templates by category
  const selectByCategory = useCallback((category: string) => {
    const categoryTemplates = templates.filter(t => t.category === category);
    setSelectedTemplates(prev => {
      const newMap = new Map(prev);
      categoryTemplates.forEach(template => {
        newMap.set(template.id, template);
      });
      return newMap;
    });
  }, [templates]);

  // Deselect templates by category
  const deselectByCategory = useCallback((category: string) => {
    const categoryTemplateIds = templates
      .filter(t => t.category === category)
      .map(t => t.id);
    
    setSelectedTemplates(prev => {
      const newMap = new Map(prev);
      categoryTemplateIds.forEach(id => {
        newMap.delete(id);
      });
      return newMap;
    });
  }, [templates]);

  // Select templates by priority level
  const selectByPriority = useCallback((priority: number) => {
    const priorityTemplates = templates.filter(t => t.priority === priority);
    setSelectedTemplates(prev => {
      const newMap = new Map(prev);
      priorityTemplates.forEach(template => {
        newMap.set(template.id, template);
      });
      return newMap;
    });
  }, [templates]);

  // Replace current selection with new templates
  const replaceSelection = useCallback((newTemplates: OKRTemplate[]) => {
    const newMap = new Map();
    newTemplates.forEach(template => {
      newMap.set(template.id, template);
    });
    setSelectedTemplates(newMap);
  }, []);

  // Get selection state summary
  const getSelectionState = useCallback((): SelectionState => {
    return {
      selectedTemplates,
      selectedCount,
      allSelected,
      partiallySelected,
    };
  }, [selectedTemplates, selectedCount, allSelected, partiallySelected]);

  // Reset selection state
  const reset = useCallback(() => {
    setSelectedTemplates(new Map());
  }, []);

  return {
    // State
    selectedTemplates,
    selectedCount,
    allSelected,
    partiallySelected,
    
    // Getters
    getSelectedTemplates,
    getSelectedIds,
    getSelectionState,
    isSelected,
    
    // Single template actions
    selectTemplate,
    deselectTemplate,
    toggleTemplate,
    
    // Bulk actions
    selectAll,
    clearAll,
    toggleAll,
    selectByCategory,
    deselectByCategory,
    selectByPriority,
    replaceSelection,
    
    // Utility
    reset,
  };
};