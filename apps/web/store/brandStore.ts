// apps/web/store/brandStore.ts
import { create } from 'zustand';
import { Brand, BrandWithTenant, Tenant } from '@boastitup/types';
import { useIndustryStore } from './industryStore';

// Multi-tenant support types with enhanced brand grouping
interface TenantWithBrands extends Tenant {
  brands: BrandWithTenant[];
}

interface BrandState {
  // Current state
  activeBrand: BrandWithTenant | null;
  brands: BrandWithTenant[];
  
  // Multi-tenant support
  activeTenant: TenantWithBrands | null;
  tenants: TenantWithBrands[];
  tenantBrands: Map<string, BrandWithTenant[]>;
  activeTenants: string[];
  
  // Basic setters
  setActiveBrand: (brand: BrandWithTenant | null) => void;
  setBrands: (brands: BrandWithTenant[]) => void;
  
  // Multi-tenant methods
  setActiveTenant: (tenant: TenantWithBrands | null) => void;
  setTenants: (tenants: TenantWithBrands[]) => void;
  setTenantBrands: (tenantBrands: Map<string, BrandWithTenant[]>) => void;
  setActiveTenants: (tenantIds: string[]) => void;
  getBrandsByTenant: (tenantId: string) => BrandWithTenant[];
  getAllAccessibleBrands: () => BrandWithTenant[];
  
  // Enhanced method to handle brand change and update industry
  handleBrandChange: (brand: BrandWithTenant | null) => void;
  
  // Debug methods (development only)
  getDebugInfo: () => {
    activeBrand: BrandWithTenant | null;
    activeTenant: TenantWithBrands | null;
    totalBrands: number;
    totalTenants: number;
    brandsByTenant: Record<string, number>;
    activeTenants: string[];
  };
}

export const useBrandStore = create<BrandState>((set, get) => ({
  // Current state
  activeBrand: null,
  brands: [],
  
  // Multi-tenant state
  activeTenant: null,
  tenants: [],
  tenantBrands: new Map(),
  activeTenants: [],
  
  // Basic setters
  setActiveBrand: (brand) => set({ activeBrand: brand }),
  setBrands: (brands) => set({ brands }),
  
  // Multi-tenant methods
  setActiveTenant: (tenant) => {
    set({ activeTenant: tenant });
    if (tenant && tenant.brands.length > 0) {
      // Auto-select first brand when switching tenants
      const firstBrand = tenant.brands[0];
      get().handleBrandChange(firstBrand);
    }
  },
  
  setTenants: (tenants) => {
    // Also update the tenant brands map
    const tenantBrands = new Map<string, BrandWithTenant[]>();
    tenants.forEach(tenant => {
      tenantBrands.set(tenant.id, tenant.brands);
    });
    set({ tenants, tenantBrands });
  },
  
  setTenantBrands: (tenantBrands) => set({ tenantBrands }),
  
  setActiveTenants: (tenantIds) => set({ activeTenants: tenantIds }),
  
  getBrandsByTenant: (tenantId) => {
    const { tenantBrands } = get();
    return tenantBrands.get(tenantId) || [];
  },
  
  getAllAccessibleBrands: () => {
    const { brands } = get();
    return brands;
  },
  
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
  
  // Debug method (development only)
  getDebugInfo: () => {
    const state = get();
    const brandsByTenant: Record<string, number> = {};
    
    state.tenants.forEach(tenant => {
      brandsByTenant[tenant.name] = tenant.brands.length;
    });
    
    return {
      activeBrand: state.activeBrand,
      activeTenant: state.activeTenant,
      totalBrands: state.brands.length,
      totalTenants: state.tenants.length,
      brandsByTenant,
      activeTenants: state.activeTenants,
    };
  },
}));