// apps/web/store/brandStore.ts
import { create } from 'zustand';
import { Brand } from '@boastitup/types'; // Adjust the import path if necessary

interface BrandState {
  activeBrand: Brand | null;
  brands: Brand[];
  setActiveBrand: (brand: Brand | null) => void;
  setBrands: (brands: Brand[]) => void;
}

export const useBrandStore = create<BrandState>((set) => ({
  activeBrand: null,
  brands: [],
  setActiveBrand: (brand) => set({ activeBrand: brand }),
  setBrands: (brands) => set({ brands }),
}));