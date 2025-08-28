import { useState, useCallback } from 'react';

// Types that should be imported from shared types
export interface CustomizationData {
  templateId: string;
  title?: string;
  description?: string;
  targetValue?: number;
  targetDateId?: number;
  priority?: number;
  granularity?: 'daily' | 'weekly' | 'monthly';
  metricTypeId?: string;
  platformId?: string;
  // Custom fields for advanced customization
  tags?: string[];
  notes?: string;
  isModified: boolean;
  modifiedFields: string[];
}

export interface ValidationError {
  field: string;
  message: string;
  templateId?: string;
}

export interface CustomizationState {
  customizations: Map<string, CustomizationData>;
  errors: ValidationError[];
  hasModifications: boolean;
  hasErrors: boolean;
}

/**
 * Hook for managing OKR customization state during creation flow
 * Based on story.txt specifications for temporary state management
 */
export const useCustomizationState = () => {
  const [customizations, setCustomizations] = useState<Map<string, CustomizationData>>(new Map());
  const [errors, setErrors] = useState<ValidationError[]>([]);

  // Computed values
  const hasModifications = Array.from(customizations.values()).some(c => c.isModified);
  const hasErrors = errors.length > 0;

  // Get customization for a specific template
  const getCustomization = useCallback((templateId: string): CustomizationData | null => {
    return customizations.get(templateId) || null;
  }, [customizations]);

  // Get all customizations as array
  const getAllCustomizations = useCallback(() => {
    return Array.from(customizations.values());
  }, [customizations]);

  // Update customization for a template
  const updateCustomization = useCallback((
    templateId: string, 
    updates: Partial<Omit<CustomizationData, 'templateId' | 'isModified' | 'modifiedFields'>>
  ) => {
    setCustomizations(prev => {
      const newMap = new Map(prev);
      const existing = newMap.get(templateId);
      
      // Get fields that are being modified
      const modifiedFields = Object.keys(updates);
      const allModifiedFields = existing ? 
        [...new Set([...existing.modifiedFields, ...modifiedFields])] : 
        modifiedFields;

      const updatedCustomization: CustomizationData = {
        templateId,
        ...existing,
        ...updates,
        isModified: true,
        modifiedFields: allModifiedFields,
      };

      newMap.set(templateId, updatedCustomization);
      return newMap;
    });

    // Clear related errors when updating
    setErrors(prev => prev.filter(error => error.templateId !== templateId));
  }, []);

  // Initialize customization for a template with default values
  const initializeCustomization = useCallback((templateId: string, defaultValues: Partial<CustomizationData> = {}) => {
    setCustomizations(prev => {
      if (prev.has(templateId)) {
        return prev; // Don't overwrite existing customization
      }

      const newMap = new Map(prev);
      const customization: CustomizationData = {
        templateId,
        isModified: false,
        modifiedFields: [],
        ...defaultValues,
      };

      newMap.set(templateId, customization);
      return newMap;
    });
  }, []);

  // Remove customization for a template
  const removeCustomization = useCallback((templateId: string) => {
    setCustomizations(prev => {
      const newMap = new Map(prev);
      newMap.delete(templateId);
      return newMap;
    });

    // Remove related errors
    setErrors(prev => prev.filter(error => error.templateId !== templateId));
  }, []);

  // Batch update multiple customizations
  const batchUpdateCustomizations = useCallback((
    updates: Array<{ templateId: string; data: Partial<CustomizationData> }>
  ) => {
    setCustomizations(prev => {
      const newMap = new Map(prev);
      
      updates.forEach(({ templateId, data }) => {
        const existing = newMap.get(templateId);
        const modifiedFields = Object.keys(data);
        const allModifiedFields = existing ? 
          [...new Set([...existing.modifiedFields, ...modifiedFields])] : 
          modifiedFields;

        const updatedCustomization: CustomizationData = {
          templateId,
          ...existing,
          ...data,
          isModified: true,
          modifiedFields: allModifiedFields,
        };

        newMap.set(templateId, updatedCustomization);
      });

      return newMap;
    });
  }, []);

  // Apply global settings to all customizations
  const applyGlobalSettings = useCallback((globalSettings: Partial<CustomizationData>) => {
    setCustomizations(prev => {
      const newMap = new Map(prev);
      
      for (const [templateId, customization] of newMap) {
        const modifiedFields = Object.keys(globalSettings);
        const allModifiedFields = [...new Set([...customization.modifiedFields, ...modifiedFields])];

        newMap.set(templateId, {
          ...customization,
          ...globalSettings,
          templateId, // Preserve template ID
          isModified: true,
          modifiedFields: allModifiedFields,
        });
      }

      return newMap;
    });
  }, []);

  // Validation functions
  const addError = useCallback((error: ValidationError) => {
    setErrors(prev => [...prev.filter(e => e.field !== error.field || e.templateId !== error.templateId), error]);
  }, []);

  const removeError = useCallback((field: string, templateId?: string) => {
    setErrors(prev => prev.filter(e => e.field !== field || e.templateId !== templateId));
  }, []);

  const clearErrors = useCallback((templateId?: string) => {
    if (templateId) {
      setErrors(prev => prev.filter(e => e.templateId !== templateId));
    } else {
      setErrors([]);
    }
  }, []);

  // Get errors for specific template
  const getTemplateErrors = useCallback((templateId: string) => {
    return errors.filter(error => error.templateId === templateId);
  }, [errors]);

  // Check if template has specific field error
  const hasFieldError = useCallback((templateId: string, field: string) => {
    return errors.some(error => error.templateId === templateId && error.field === field);
  }, [errors]);

  // Reset all customizations
  const reset = useCallback(() => {
    setCustomizations(new Map());
    setErrors([]);
  }, []);

  // Get state summary
  const getState = useCallback((): CustomizationState => {
    return {
      customizations,
      errors,
      hasModifications,
      hasErrors,
    };
  }, [customizations, errors, hasModifications, hasErrors]);

  // Export customizations for saving
  const exportForSave = useCallback(() => {
    return Array.from(customizations.values()).filter(c => c.isModified);
  }, [customizations]);

  return {
    // State
    customizations,
    errors,
    hasModifications,
    hasErrors,

    // Getters
    getCustomization,
    getAllCustomizations,
    getState,
    getTemplateErrors,
    hasFieldError,
    exportForSave,

    // Single template operations
    updateCustomization,
    initializeCustomization,
    removeCustomization,

    // Batch operations
    batchUpdateCustomizations,
    applyGlobalSettings,

    // Error management
    addError,
    removeError,
    clearErrors,

    // Utility
    reset,
  };
};