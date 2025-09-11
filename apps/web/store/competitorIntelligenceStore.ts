// apps/web/store/competitorIntelligenceStore.ts
import { create } from 'zustand';
import { devtools, persist } from 'zustand/middleware';
import type { TrendingTopic, CompetitorIntelligence } from '@boastitup/types';

interface CompetitorIntelligenceStore {
  // UI State
  intelligencePanelVisible: boolean;
  selectedTrendingTopic: TrendingTopic | null;
  selectedCompetitors: CompetitorIntelligence[];
  activeInsightFilter: 'all' | 'trend' | 'competitor' | 'opportunity';
  
  // Data State
  lastRefreshed: Date | null;
  refreshInProgress: boolean;
  
  // Preferences
  preferences: {
    autoRefreshEnabled: boolean;
    defaultPanelVisibility: boolean;
    preferredInsightTypes: string[];
  };
  
  // Actions
  setIntelligencePanelVisible: (visible: boolean) => void;
  setSelectedTrendingTopic: (topic: TrendingTopic | null) => void;
  toggleCompetitorSelection: (competitor: CompetitorIntelligence) => void;
  clearSelectedCompetitors: () => void;
  setActiveInsightFilter: (filter: CompetitorIntelligenceStore['activeInsightFilter']) => void;
  setRefreshInProgress: (inProgress: boolean) => void;
  updateLastRefreshed: () => void;
  updatePreferences: (preferences: Partial<CompetitorIntelligenceStore['preferences']>) => void;
  reset: () => void;
}

const initialState = {
  intelligencePanelVisible: true,
  selectedTrendingTopic: null,
  selectedCompetitors: [],
  activeInsightFilter: 'all' as const,
  lastRefreshed: null,
  refreshInProgress: false,
  preferences: {
    autoRefreshEnabled: true,
    defaultPanelVisibility: true,
    preferredInsightTypes: ['trend', 'competitor', 'opportunity']
  }
};

export const useCompetitorIntelligenceStore = create<CompetitorIntelligenceStore>()(
  devtools(
    persist(
      (set, get) => ({
        ...initialState,
        
        setIntelligencePanelVisible: (visible) => 
          set({ intelligencePanelVisible: visible }, false, 'setIntelligencePanelVisible'),
        
        setSelectedTrendingTopic: (topic) => 
          set({ selectedTrendingTopic: topic }, false, 'setSelectedTrendingTopic'),
        
        toggleCompetitorSelection: (competitor) => {
          const { selectedCompetitors } = get();
          const isSelected = selectedCompetitors.find(c => c.id === competitor.id);
          set({
            selectedCompetitors: isSelected
              ? selectedCompetitors.filter(c => c.id !== competitor.id)
              : [...selectedCompetitors, competitor]
          }, false, 'toggleCompetitorSelection');
        },
        
        clearSelectedCompetitors: () => 
          set({ selectedCompetitors: [] }, false, 'clearSelectedCompetitors'),
        
        setActiveInsightFilter: (filter) => 
          set({ activeInsightFilter: filter }, false, 'setActiveInsightFilter'),
        
        setRefreshInProgress: (inProgress) => 
          set({ refreshInProgress: inProgress }, false, 'setRefreshInProgress'),
        
        updateLastRefreshed: () => 
          set({ lastRefreshed: new Date() }, false, 'updateLastRefreshed'),
        
        updatePreferences: (newPreferences) => 
          set(state => ({
            preferences: { ...state.preferences, ...newPreferences }
          }), false, 'updatePreferences'),
        
        reset: () => 
          set(initialState, false, 'reset')
      }),
      { 
        name: 'competitor-intelligence-storage',
        partialize: (state) => ({
          intelligencePanelVisible: state.intelligencePanelVisible,
          preferences: state.preferences
        })
      }
    )
  )
);