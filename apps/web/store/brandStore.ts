// apps/web/store/brandStore.ts
import { create } from 'zustand';
import { Brand, BrandWithTenant, Tenant } from '@boastitup/types';
import { useIndustryStore } from './industryStore';
import { OKRTemplate, OKRCustomization, Industry } from '../types/okr-creation';

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
  
  // OKR Creation State
  okrCreation: {
    selectedIndustry: Industry | null;
    selectedTemplates: Map<string, OKRTemplate>;
    customizations: Map<string, OKRCustomization>;
    isCreating: boolean;
    errors: string[];
  };
  
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
  
  // OKR Creation State Management
  setOKRIndustry: (industry: Industry | null) => void;
  addOKRTemplate: (template: OKRTemplate) => void;
  removeOKRTemplate: (templateId: string) => void;
  updateOKRCustomization: (templateId: string, customization: Partial<OKRCustomization>) => void;
  clearOKRCreation: () => void;
  setOKRCreating: (isCreating: boolean) => void;
  addOKRError: (error: string) => void;
  clearOKRErrors: () => void;
  
  // Debug methods (development only)
  getDebugInfo: () => {
    activeBrand: BrandWithTenant | null;
    activeTenant: TenantWithBrands | null;
    totalBrands: number;
    totalTenants: number;
    brandsByTenant: Record<string, number>;
    activeTenants: string[];
    okrTemplatesSelected: number;
    okrCustomizations: number;
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
  
  // OKR Creation State
  okrCreation: {
    selectedIndustry: null,
    selectedTemplates: new Map(),
    customizations: new Map(),
    isCreating: false,
    errors: []
  },
  
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
  
  // OKR Creation State Management
  setOKRIndustry: (industry) => set((state) => ({
    okrCreation: {
      ...state.okrCreation,
      selectedIndustry: industry,
      // Clear templates when industry changes
      selectedTemplates: new Map(),
      customizations: new Map()
    }
  })),

  addOKRTemplate: (template) => set((state) => {
    const newTemplates = new Map(state.okrCreation.selectedTemplates);
    newTemplates.set(template.id, template);
    
    // Initialize customization for this template
    const newCustomizations = new Map(state.okrCreation.customizations);
    if (!newCustomizations.has(template.id)) {
      newCustomizations.set(template.id, {
        templateId: template.id,
        title: template.title,
        targetValue: template.suggestedTargetValue,
        granularity: template.suggestedTimeframe === 'quarterly' ? 'monthly' : template.suggestedTimeframe
      });
    }
    
    return {
      okrCreation: {
        ...state.okrCreation,
        selectedTemplates: newTemplates,
        customizations: newCustomizations
      }
    };
  }),

  removeOKRTemplate: (templateId) => set((state) => {
    const newTemplates = new Map(state.okrCreation.selectedTemplates);
    newTemplates.delete(templateId);
    
    const newCustomizations = new Map(state.okrCreation.customizations);
    newCustomizations.delete(templateId);
    
    return {
      okrCreation: {
        ...state.okrCreation,
        selectedTemplates: newTemplates,
        customizations: newCustomizations
      }
    };
  }),

  updateOKRCustomization: (templateId, customization) => set((state) => {
    const newCustomizations = new Map(state.okrCreation.customizations);
    const existing = newCustomizations.get(templateId) || { templateId };
    newCustomizations.set(templateId, { ...existing, ...customization });
    
    return {
      okrCreation: {
        ...state.okrCreation,
        customizations: newCustomizations
      }
    };
  }),

  clearOKRCreation: () => set((state) => ({
    okrCreation: {
      selectedIndustry: null,
      selectedTemplates: new Map(),
      customizations: new Map(),
      isCreating: false,
      errors: []
    }
  })),

  setOKRCreating: (isCreating) => set((state) => ({
    okrCreation: {
      ...state.okrCreation,
      isCreating
    }
  })),

  addOKRError: (error) => set((state) => ({
    okrCreation: {
      ...state.okrCreation,
      errors: [...state.okrCreation.errors, error]
    }
  })),

  clearOKRErrors: () => set((state) => ({
    okrCreation: {
      ...state.okrCreation,
      errors: []
    }
  })),

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
      okrTemplatesSelected: state.okrCreation.selectedTemplates.size,
      okrCustomizations: state.okrCreation.customizations.size,
    };
  },
}));