import { useState, useEffect, useCallback } from 'react';

// Types interfaces that should be imported from a types package
export interface Brand {
  id: string;
  tenant_id: string;
  name: string;
  slug: string;
  description?: string;
  logo_url?: string;
  brand_colors?: Record<string, any>;
  is_active: boolean;
  created_at: string;
  updated_at: string;
  primary_domain?: string;
  industry_id?: string;
}

export interface Tenant {
  id: string;
  name: string;
  slug: string;
  description?: string;
  settings?: Record<string, any>;
  is_active: boolean;
}

export interface Industry {
  id: string;
  name: string;
  slug: string;
  description?: string;
}

export interface UserPermissions {
  canCreateOKRs: boolean;
  canEditOKRs: boolean;
  canDeleteOKRs: boolean;
  canViewAnalytics: boolean;
  tenantRole: string;
  brandRole: string;
}

// Service interface for dependency injection
export interface BrandContextService {
  getCurrentUser: () => Promise<{ id: string } | null>;
  getBrandWithDetails: (brandId: string) => Promise<{
    brand: Brand;
    tenant: Tenant;
    industry: Industry | null;
  }>;
  getUserPermissions: (userId: string, brandId: string, tenantId: string) => Promise<UserPermissions>;
  getUserBrands: (userId: string) => Promise<Brand[]>;
}

/**
 * Factory function to create brand context hooks with service dependency injection
 * Based on story.txt data flow architecture
 */
export const createBrandContextHooks = (service: BrandContextService) => {
  /**
   * Hook for loading brand context needed for OKR creation
   * Based on story.txt data flow (lines 16-31)
   */
  const useBrandContext = (brandId?: string) => {
    const [brand, setBrand] = useState<Brand | null>(null);
    const [tenant, setTenant] = useState<Tenant | null>(null);
    const [industry, setIndustry] = useState<Industry | null>(null);
    const [permissions, setPermissions] = useState<UserPermissions | null>(null);
    const [isLoading, setIsLoading] = useState(false);
    const [error, setError] = useState<Error | null>(null);

    const loadBrandContext = useCallback(async () => {
      if (!brandId) {
        setBrand(null);
        setTenant(null);
        setIndustry(null);
        setPermissions(null);
        return;
      }

      try {
        setIsLoading(true);
        setError(null);

        // Get current user
        const user = await service.getCurrentUser();
        if (!user) {
          throw new Error('User not authenticated');
        }

        // Fetch brand with tenant and industry data
        const { brand, tenant, industry } = await service.getBrandWithDetails(brandId);

        // Fetch user permissions for this brand and tenant
        const permissions = await service.getUserPermissions(user.id, brandId, tenant.id);

        // Set state
        setBrand(brand);
        setTenant(tenant);
        setIndustry(industry);
        setPermissions(permissions);

      } catch (err) {
        setError(err instanceof Error ? err : new Error('Failed to load brand context'));
      } finally {
        setIsLoading(false);
      }
    }, [brandId, service]);

    useEffect(() => {
      loadBrandContext();
    }, [loadBrandContext]);

    return {
      brand,
      tenant,
      industry,
      permissions,
      isLoading,
      error,
      refetch: loadBrandContext,
    };
  };

  /**
   * Hook for getting user's accessible brands
   */
  const useUserBrands = () => {
    const [brands, setBrands] = useState<Brand[] | null>(null);
    const [isLoading, setIsLoading] = useState(true);
    const [error, setError] = useState<Error | null>(null);

    const fetchBrands = useCallback(async () => {
      try {
        setIsLoading(true);
        setError(null);

        // Get current user
        const user = await service.getCurrentUser();
        if (!user) {
          throw new Error('User not authenticated');
        }

        // Get brands user has access to
        const userBrands = await service.getUserBrands(user.id);
        setBrands(userBrands);

      } catch (err) {
        setError(err instanceof Error ? err : new Error('Failed to fetch user brands'));
      } finally {
        setIsLoading(false);
      }
    }, [service]);

    useEffect(() => {
      fetchBrands();
    }, [fetchBrands]);

    return {
      brands,
      isLoading,
      error,
      refetch: fetchBrands,
    };
  };

  return {
    useBrandContext,
    useUserBrands,
  };
};

// Default export throws error to encourage service injection pattern
export const useBrandContext = (brandId?: string) => {
  throw new Error('useBrandContext must be created via createBrandContextHooks factory with service injection');
};

export const useUserBrands = () => {
  throw new Error('useUserBrands must be created via createBrandContextHooks factory with service injection');
};