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
  
  setActiveIndustry: (industry) => set({ activeIndustry: industry }),
  
  setIndustries: (industries) => set({ industries }),
  
  // Helper function to get industry by brand ID
  // This would typically query the database, but for now returns default
  getIndustryByBrandId: (brandId: string) => {
    // In a real implementation, you would:
    // 1. Query the brands table to get the industry_id for this brand
    // 2. Return the corresponding industry
    // For now, return the active industry or default to fitness
    const { activeIndustry } = get();
    return activeIndustry || defaultIndustries[0];
  },
}));