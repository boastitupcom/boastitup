import { create } from 'zustand';
import { devtools, persist } from 'zustand/middleware';
import type { OKRTemplate } from '@boastitup/ui';

// Types from story.txt lines 382-399
interface CustomizationData {
  title?: string;
  description?: string;
  targetValue?: number;
  targetDateId?: number;
  priority?: number;
  granularity?: 'daily' | 'weekly' | 'monthly';
  platformId?: string;
  metricTypeId?: string;
}

interface ValidationError {
  field: string;
  message: string;
  templateId?: string;
}

interface OKRCreationState {
  // Selection state
  selectedTemplates: Map<string, OKRTemplate>;
  customizations: Map<string, CustomizationData>;
  
  // UI state
  isLoading: boolean;
  isSaving: boolean;
  errors: ValidationError[];
  
  // Brand context
  currentIndustry?: string;
  brandContext?: {
    keyProduct?: string;
    productCategory?: string;
    keyCompetition?: string[];
    majorKeywords?: string[];
    objective?: string;
    historicalOKRs?: string[];
  };
  
  // Progress tracking
  currentStep: 'brand-context' | 'template-selection' | 'customization' | 'review' | 'complete';
  completedSteps: string[];
  
  // Actions
  selectTemplate: (template: OKRTemplate) => void;
  deselectTemplate: (templateId: string) => void;
  selectAllTemplates: (templates: OKRTemplate[]) => void;
  deselectAllTemplates: () => void;
  updateCustomization: (templateId: string, data: Partial<CustomizationData>) => void;
  setBrandContext: (context: NonNullable<OKRCreationState['brandContext']>) => void;
  setCurrentStep: (step: OKRCreationState['currentStep']) => void;
  markStepCompleted: (step: string) => void;
  setLoading: (loading: boolean) => void;
  setSaving: (saving: boolean) => void;
  setErrors: (errors: ValidationError[]) => void;
  addError: (error: ValidationError) => void;
  clearErrors: () => void;
  reset: () => void;
  
  // Computed getters
  getSelectedTemplatesArray: () => OKRTemplate[];
  getCustomizationsArray: () => Array<{ templateId: string; customization: CustomizationData }>;
  getSelectedCount: () => number;
  hasCustomizations: () => boolean;
  canProceedToNext: () => boolean;
  getProgress: () => number;
}

const initialState = {
  selectedTemplates: new Map(),
  customizations: new Map(),
  isLoading: false,
  isSaving: false,
  errors: [],
  currentStep: 'brand-context' as const,
  completedSteps: [],
  currentIndustry: undefined,
  brandContext: undefined,
};

export const useOKRCreationStore = create<OKRCreationState>()(
  devtools(
    persist(
      (set, get) => ({
        ...initialState,

        // Template selection actions
        selectTemplate: (template: OKRTemplate) => {
          set((state) => {
            const newSelected = new Map(state.selectedTemplates);
            newSelected.set(template.id, template);
            
            // Initialize with template defaults if no customization exists
            const newCustomizations = new Map(state.customizations);
            if (!newCustomizations.has(template.id)) {
              newCustomizations.set(template.id, {
                title: template.title,
                description: template.description,
                targetValue: template.suggestedTargetValue,
                priority: template.priority,
                granularity: template.suggestedTimeframe === 'quarterly' ? 'monthly' : template.suggestedTimeframe as any,
                metricTypeId: template.metricTypeId,
                platformId: template.applicablePlatforms?.[0]
              });
            }
            
            return {
              selectedTemplates: newSelected,
              customizations: newCustomizations
            };
          });
        },

        deselectTemplate: (templateId: string) => {
          set((state) => {
            const newSelected = new Map(state.selectedTemplates);
            const newCustomizations = new Map(state.customizations);
            
            newSelected.delete(templateId);
            newCustomizations.delete(templateId);
            
            return {
              selectedTemplates: newSelected,
              customizations: newCustomizations
            };
          });
        },

        selectAllTemplates: (templates: OKRTemplate[]) => {
          set((state) => {
            const newSelected = new Map(state.selectedTemplates);
            const newCustomizations = new Map(state.customizations);
            
            templates.forEach(template => {
              newSelected.set(template.id, template);
              if (!newCustomizations.has(template.id)) {
                newCustomizations.set(template.id, {
                  title: template.title,
                  description: template.description,
                  targetValue: template.suggestedTargetValue,
                  priority: template.priority,
                  granularity: template.suggestedTimeframe === 'quarterly' ? 'monthly' : template.suggestedTimeframe as any,
                  metricTypeId: template.metricTypeId,
                  platformId: template.applicablePlatforms?.[0]
                });
              }
            });
            
            return {
              selectedTemplates: newSelected,
              customizations: newCustomizations
            };
          });
        },

        deselectAllTemplates: () => {
          set({
            selectedTemplates: new Map(),
            customizations: new Map()
          });
        },

        // Customization actions
        updateCustomization: (templateId: string, data: Partial<CustomizationData>) => {
          set((state) => {
            const newCustomizations = new Map(state.customizations);
            const existing = newCustomizations.get(templateId) || {};
            newCustomizations.set(templateId, { ...existing, ...data });
            
            return { customizations: newCustomizations };
          });
        },

        // Brand context actions
        setBrandContext: (context) => {
          set({ brandContext: context });
        },

        // Step management
        setCurrentStep: (step) => {
          set({ currentStep: step });
        },

        markStepCompleted: (step) => {
          set((state) => ({
            completedSteps: state.completedSteps.includes(step) 
              ? state.completedSteps 
              : [...state.completedSteps, step]
          }));
        },

        // Loading states
        setLoading: (loading) => {
          set({ isLoading: loading });
        },

        setSaving: (saving) => {
          set({ isSaving: saving });
        },

        // Error management
        setErrors: (errors) => {
          set({ errors });
        },

        addError: (error) => {
          set((state) => ({
            errors: [...state.errors, error]
          }));
        },

        clearErrors: () => {
          set({ errors: [] });
        },

        // Reset
        reset: () => {
          set(initialState);
        },

        // Computed getters
        getSelectedTemplatesArray: () => {
          return Array.from(get().selectedTemplates.values());
        },

        getCustomizationsArray: () => {
          const customizations = get().customizations;
          return Array.from(customizations.entries()).map(([templateId, customization]) => ({
            templateId,
            customization
          }));
        },

        getSelectedCount: () => {
          return get().selectedTemplates.size;
        },

        hasCustomizations: () => {
          return get().customizations.size > 0;
        },

        canProceedToNext: () => {
          const state = get();
          switch (state.currentStep) {
            case 'brand-context':
              return !!state.currentIndustry;
            case 'template-selection':
              return state.selectedTemplates.size > 0;
            case 'customization':
              return state.errors.length === 0;
            case 'review':
              return state.selectedTemplates.size > 0 && state.errors.length === 0;
            default:
              return true;
          }
        },

        getProgress: () => {
          const state = get();
          const totalSteps = 4; // brand-context, template-selection, customization, review
          const completedCount = state.completedSteps.length;
          return Math.round((completedCount / totalSteps) * 100);
        }
      }),
      {
        name: 'okr-creation-store',
        // Only persist essential data, not UI state
        partialize: (state) => ({
          selectedTemplates: state.selectedTemplates,
          customizations: state.customizations,
          currentIndustry: state.currentIndustry,
          brandContext: state.brandContext,
          currentStep: state.currentStep,
          completedSteps: state.completedSteps
        }),
        // Convert Map to plain objects for serialization
        storage: {
          getItem: (name) => {
            const str = localStorage.getItem(name);
            if (!str) return null;
            const parsed = JSON.parse(str);
            
            // Convert serialized Maps back to Maps
            if (parsed.state.selectedTemplates) {
              parsed.state.selectedTemplates = new Map(Object.entries(parsed.state.selectedTemplates));
            }
            if (parsed.state.customizations) {
              parsed.state.customizations = new Map(Object.entries(parsed.state.customizations));
            }
            
            return parsed;
          },
          setItem: (name, value) => {
            const toStore = {
              ...value,
              state: {
                ...value.state,
                // Convert Maps to plain objects for serialization
                selectedTemplates: Object.fromEntries(value.state.selectedTemplates || new Map()),
                customizations: Object.fromEntries(value.state.customizations || new Map())
              }
            };
            localStorage.setItem(name, JSON.stringify(toStore));
          },
          removeItem: (name) => localStorage.removeItem(name)
        }
      }
    ),
    { name: 'okr-creation-store' }
  )
);

// Selector hooks for better performance
export const useSelectedTemplates = () => useOKRCreationStore((state) => state.getSelectedTemplatesArray());
export const useSelectedCount = () => useOKRCreationStore((state) => state.getSelectedCount());
export const useCurrentStep = () => useOKRCreationStore((state) => state.currentStep);
export const useCanProceed = () => useOKRCreationStore((state) => state.canProceedToNext());
export const useCreationProgress = () => useOKRCreationStore((state) => state.getProgress());