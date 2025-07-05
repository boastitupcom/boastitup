// apps/web/store/brandStore.ts
import { create } from 'zustand';
import { Brand } from '@boastitup/types';
import { useIndustryStore } from './industryStore';

interface BrandState {
  activeBrand: Brand | null;
  brands: Brand[];
  setActiveBrand: (brand: Brand | null) => void;
  setBrands: (brands: Brand[]) => void;
  // Add method to handle brand change and update industry
  handleBrandChange: (brand: Brand | null) => void;
}

export const useBrandStore = create<BrandState>((set, get) => ({
  activeBrand: null,
  brands: [],
  
  setActiveBrand: (brand) => set({ activeBrand: brand }),
  
  setBrands: (brands) => set({ brands }),
  
  // Enhanced method that also updates industry when brand changes
  handleBrandChange: (brand) => {
    set({ activeBrand: brand });
    
    if (brand) {
      // Get the industry store and update the active industry
      const industryStore = useIndustryStore.getState();
      const brandIndustry = industryStore.getIndustryByBrandId(brand.id);
      
      if (brandIndustry) {
        industryStore.setActiveIndustry(brandIndustry);
      }
    }
  },
}));