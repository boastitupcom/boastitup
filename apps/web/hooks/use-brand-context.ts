import { useState, useEffect, useCallback } from 'react';
import { createClient } from '@boastitup/supabase/client';
import { Brand, Tenant, Industry, UserPermissions } from '../types/okr-creation';

/**
 * Hook for loading brand context needed for OKR creation
 * Based on story.txt data flow (lines 16-31)
 */
export function useBrandContext(brandId?: string) {
  const [brand, setBrand] = useState<Brand | null>(null);
  const [tenant, setTenant] = useState<Tenant | null>(null);
  const [industry, setIndustry] = useState<Industry | null>(null);
  const [permissions, setPermissions] = useState<UserPermissions | null>(null);
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState<Error | null>(null);

  const supabase = createClient();

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
      const { data: { user }, error: userError } = await supabase.auth.getUser();
      if (userError || !user) {
        throw new Error('User not authenticated');
      }

      // Fetch brand with tenant and industry data
      const { data: brandData, error: brandError } = await supabase
        .from('brands')
        .select(`
          id,
          tenant_id,
          name,
          slug,
          description,
          logo_url,
          brand_colors,
          is_active,
          created_at,
          updated_at,
          primary_domain,
          industry_id,
          tenants!inner (
            id,
            name,
            slug,
            description,
            settings,
            is_active
          ),
          industries (
            id,
            name,
            slug,
            description
          )
        `)
        .eq('id', brandId)
        .eq('is_active', true)
        .single();

      if (brandError) {
        throw new Error(`Failed to load brand: ${brandError.message}`);
      }

      if (!brandData) {
        throw new Error('Brand not found or inactive');
      }

      // Fetch user permissions for this brand and tenant
      const [tenantRoleResponse, brandRoleResponse] = await Promise.all([
        supabase
          .from('user_tenant_roles')
          .select('role, permissions, is_active')
          .eq('user_id', user.id)
          .eq('tenant_id', brandData.tenant_id)
          .eq('is_active', true)
          .single(),

        supabase
          .from('user_brand_roles')
          .select('role, permissions, is_active')
          .eq('user_id', user.id)
          .eq('brand_id', brandId)
          .eq('is_active', true)
          .single()
      ]);

      // Extract data
      const brand: Brand = {
        id: brandData.id,
        tenant_id: brandData.tenant_id,
        name: brandData.name,
        slug: brandData.slug,
        description: brandData.description,
        logo_url: brandData.logo_url,
        brand_colors: brandData.brand_colors,
        is_active: brandData.is_active,
        created_at: brandData.created_at,
        updated_at: brandData.updated_at,
        primary_domain: brandData.primary_domain,
        industry_id: brandData.industry_id
      };

      const tenant: Tenant = {
        id: brandData.tenants.id,
        name: brandData.tenants.name,
        slug: brandData.tenants.slug,
        description: brandData.tenants.description,
        settings: brandData.tenants.settings,
        is_active: brandData.tenants.is_active
      };

      const industry: Industry | null = brandData.industries ? {
        id: brandData.industries.id,
        name: brandData.industries.name,
        slug: brandData.industries.slug,
        description: brandData.industries.description
      } : null;

      // Determine permissions based on roles
      const tenantRole = tenantRoleResponse.data?.role || 'member';
      const brandRole = brandRoleResponse.data?.role || 'contributor';

   const permissions: UserPermissions = {
        canCreateOKRs: tenantRole === 'contributor' || brandRole === 'contributor' || brandRole === 'contributor',
        canEditOKRs: tenantRole === 'contributor' || brandRole === 'contributor' || brandRole === 'contributor',
        canDeleteOKRs: tenantRole === 'contributor' || brandRole === 'contributor',
        canViewAnalytics: true, // All users can view analytics
        tenantRole,
        brandRole
      };

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
  }, [supabase, brandId]);

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
}

/**
 * Hook for getting user's accessible brands
 */
export function useUserBrands() {
  const [brands, setBrands] = useState<Brand[] | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<Error | null>(null);

  const supabase = createClient();

  const fetchBrands = useCallback(async () => {
    try {
      setIsLoading(true);
      setError(null);

      // Get current user
      const { data: { user }, error: userError } = await supabase.auth.getUser();
      if (userError || !user) {
        throw new Error('User not authenticated');
      }

      // Get brands user has access to through brand roles
      const { data, error: brandsError } = await supabase
        .from('user_brand_roles')
        .select(`
          brand_id,
          role,
          is_active,
          brands!inner (
            id,
            tenant_id,
            name,
            slug,
            description,
            logo_url,
            is_active,
            industries (
              name,
              slug
            )
          )
        `)
        .eq('user_id', user.id)
        .eq('is_active', true)
        .eq('brands.is_active', true);

      if (brandsError) {
        throw new Error(brandsError.message);
      }

      const userBrands = data?.map(item => ({
        ...item.brands,
        userRole: item.role
      })) || [];

      setBrands(userBrands);

    } catch (err) {
      setError(err instanceof Error ? err : new Error('Failed to fetch user brands'));
    } finally {
      setIsLoading(false);
    }
  }, [supabase]);

  useEffect(() => {
    fetchBrands();
  }, [fetchBrands]);

  return {
    brands,
    isLoading,
    error,
    refetch: fetchBrands,
  };
}