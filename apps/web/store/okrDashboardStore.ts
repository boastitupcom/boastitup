import { create } from 'zustand';

interface OKRDashboardState {
  activeTab: 'Overview' | 'OKRs' | 'Metrics' | 'Attention' | 'AI Insights';
  filterCategory: 'All' | 'Brand Awareness' | 'Engagement' | 'Growth' | 'Retention' | 'Revenue';
  filterStatus: 'All' | 'Target Achieved' | 'On Track' | 'Behind' | 'At Risk' | 'Not Started';
  searchQuery: string;
  selectedOKRId: string | null;
  setActiveTab: (tab: OKRDashboardState['activeTab']) => void;
  setFilterCategory: (category: OKRDashboardState['filterCategory']) => void;
  setFilterStatus: (status: OKRDashboardState['filterStatus']) => void;
  setSearchQuery: (query: string) => void;
  setSelectedOKRId: (id: string | null) => void;
  resetFilters: () => void;
}

export const useOKRDashboardStore = create<OKRDashboardState>((set) => ({
  activeTab: 'Overview',
  filterCategory: 'All',
  filterStatus: 'All',
  searchQuery: '',
  selectedOKRId: null,
  
  setActiveTab: (tab) => set({ activeTab: tab }),
  setFilterCategory: (category) => set({ filterCategory: category }),
  setFilterStatus: (status) => set({ filterStatus: status }),
  setSearchQuery: (query) => set({ searchQuery: query }),
  setSelectedOKRId: (id) => set({ selectedOKRId: id }),
  
  resetFilters: () => set({ 
    filterCategory: 'All', 
    filterStatus: 'All', 
    searchQuery: '' 
  }),
}));