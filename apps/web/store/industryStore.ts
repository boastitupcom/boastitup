// apps/web/store/industryStore.ts
import { create } from 'zustand';

export interface Industry {
  id: string;
  name: string;
  slug: string;
}

interface IndustryState {
  activeIndustry: Industry | null;
  industries: Industry[];
  setActiveIndustry: (industry: Industry | null) => void;
  setIndustries: (industries: Industry[]) => void;
  getIndustryByBrandId: (brandId: string) => Industry | null;
  
  // Multi-tenant support
  brandIndustryMapping: Record<string, string>; // brandId -> industryId
  setBrandIndustryMapping: (brandId: string, industryId: string) => void;
  
  // Debug methods
  getDebugInfo: () => {
    activeIndustry: Industry | null;
    totalIndustries: number;
    mappedBrands: number;
    industryDistribution: Record<string, number>;
  };
}

// Default industries - you can expand this or fetch from database
const defaultIndustries: Industry[] = [
  { id: '1', name: 'Fitness & Nutrition', slug: 'fitness' },
  { id: '2', name: 'Technology', slug: 'technology' },
  { id: '3', name: 'Fashion & Beauty', slug: 'fashion' },
  { id: '4', name: 'Food & Beverage', slug: 'food' },
  { id: '5', name: 'Healthcare', slug: 'healthcare' },
  { id: '6', name: 'Education', slug: 'education' },
  { id: '7', name: 'Finance', slug: 'finance' },
  { id: '8', name: 'Travel & Hospitality', slug: 'travel' },
  { id: '9', name: 'Automotive', slug: 'automotive' },
  { id: '10', name: 'Real Estate', slug: 'realestate' },
];

export const useIndustryStore = create<IndustryState>((set, get) => ({
  activeIndustry: defaultIndustries[0], // Default to fitness
  industries: defaultIndustries,
  brandIndustryMapping: {}, // brandId -> industryId mapping
  
  setActiveIndustry: (industry) => set({ activeIndustry: industry }),
  
  setIndustries: (industries) => set({ industries }),
  
  // Multi-tenant brand-industry mapping
  setBrandIndustryMapping: (brandId: string, industryId: string) => {
    set((state) => ({
      brandIndustryMapping: {
        ...state.brandIndustryMapping,
        [brandId]: industryId,
      },
    }));
  },
  
  // Enhanced helper function to get industry by brand ID
  getIndustryByBrandId: (brandId: string) => {
    const { brandIndustryMapping, industries, activeIndustry } = get();
    
    // First check if we have a mapping for this brand
    const industryId = brandIndustryMapping[brandId];
    if (industryId) {
      const industry = industries.find(ind => ind.id === industryId);
      if (industry) return industry;
    }
    
    // Fallback to active industry or default
    return activeIndustry || defaultIndustries[0];
  },
  
  // Debug method
  getDebugInfo: () => {
    const state = get();
    const industryDistribution: Record<string, number> = {};
    
    // Count brands per industry
    Object.values(state.brandIndustryMapping).forEach(industryId => {
      const industry = state.industries.find(ind => ind.id === industryId);
      const industryName = industry?.name || 'Unknown';
      industryDistribution[industryName] = (industryDistribution[industryName] || 0) + 1;
    });
    
    return {
      activeIndustry: state.activeIndustry,
      totalIndustries: state.industries.length,
      mappedBrands: Object.keys(state.brandIndustryMapping).length,
      industryDistribution,
    };
  },
}));