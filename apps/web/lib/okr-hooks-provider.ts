// apps/web/lib/okr-hooks-provider.ts
// Bridge/adapter to provide service implementations for packages/hooks

import { createClient } from '@boastitup/supabase/client';
import {
  createOKRDataHooks,
  createBrandContextHooks,
  createDimensionHooks,
  createOKRCrudHooks,
  createBulkOperationsHooks,
  type OKRServiceInterface,
  type BrandContextService,
  type DimensionsService,
  type OKRCrudService,
  type BulkOperationsService,
} from '@boastitup/hooks';
import { OKRService } from '../services/okrService';
import { 
  validateOKRBusinessRules, 
  validateBulkOperationSize,
} from '../utils/databaseConstraints';

// OKR Data Service Implementation
const okrServiceImpl: OKRServiceInterface = {
  fetchCurrentPerformanceOKRs: (brandId: string) => OKRService.fetchCurrentPerformanceOKRs(brandId),
  fetchProgressSummary: (brandId: string) => OKRService.fetchProgressSummary(brandId),
  fetchBrandDashboardOverview: (brandId: string) => OKRService.fetchBrandDashboardOverview(brandId),
  fetchOKRTrendAnalysis: (okrId: string) => OKRService.fetchOKRTrendAnalysis(okrId),
  fetchAttentionMetrics: (brandId: string) => OKRService.fetchAttentionMetrics(brandId),
  fetchAIInsights: (brandId: string) => OKRService.fetchAIInsights(brandId),
  fetchOKRPerformance: (params) => OKRService.fetchOKRPerformance(params),
  fetchOKRTemplates: (industrySlug?: string) => OKRService.fetchOKRTemplates(industrySlug),
};

// Brand Context Service Implementation
const brandContextServiceImpl: BrandContextService = {
  getCurrentUser: async () => {
    const supabase = createClient();
    const { data: { user }, error } = await supabase.auth.getUser();
    if (error || !user) return null;
    return { id: user.id };
  },
  
  getBrandWithDetails: async (brandId: string) => {
    const supabase = createClient();
    
    const { data: brandData, error } = await supabase
      .from('brands')
      .select(`
        id, tenant_id, name, slug, description, logo_url, brand_colors,
        is_active, created_at, updated_at, primary_domain, industry_id,
        tenants!inner (id, name, slug, description, settings, is_active),
        industries (id, name, slug, description)
      `)
      .eq('id', brandId)
      .eq('is_active', true)
      .single();

    if (error || !brandData) {
      throw new Error(`Failed to load brand: ${error?.message}`);
    }

    return {
      brand: {
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
        industry_id: brandData.industry_id,
      },
      tenant: brandData.tenants,
      industry: brandData.industries,
    };
  },

  getUserPermissions: async (userId: string, brandId: string, tenantId: string) => {
    const supabase = createClient();
    
    const [tenantRoleResponse, brandRoleResponse] = await Promise.all([
      supabase
        .from('user_tenant_roles')
        .select('role, permissions, is_active')
        .eq('user_id', userId)
        .eq('tenant_id', tenantId)
        .eq('is_active', true)
        .single(),
      
      supabase
        .from('user_brand_roles')
        .select('role, permissions, is_active')
        .eq('user_id', userId)
        .eq('brand_id', brandId)
        .eq('is_active', true)
        .single()
    ]);

    const tenantRole = tenantRoleResponse.data?.role || 'member';
    const brandRole = brandRoleResponse.data?.role || 'contributor';

    return {
      canCreateOKRs: tenantRole === 'contributor' || brandRole === 'contributor',
      canEditOKRs: tenantRole === 'contributor' || brandRole === 'contributor',
      canDeleteOKRs: tenantRole === 'contributor' || brandRole === 'contributor',
      canViewAnalytics: true,
      tenantRole,
      brandRole,
    };
  },

  getUserBrands: async (userId: string) => {
    const supabase = createClient();
    
    const { data, error } = await supabase
      .from('user_brand_roles')
      .select(`
        brand_id, role, is_active,
        brands!inner (id, tenant_id, name, slug, description, logo_url, is_active,
          industries (name, slug))
      `)
      .eq('user_id', userId)
      .eq('is_active', true)
      .eq('brands.is_active', true);

    if (error) throw new Error(error.message);

    return data?.map(item => ({
      ...item.brands,
      userRole: item.role
    })) || [];
  },
};

// Dimensions Service Implementation
const dimensionsServiceImpl: DimensionsService = {
  getIndustries: async () => {
    const supabase = createClient();
    const { data, error } = await supabase
      .from('industries')
      .select('id, name, slug, description, created_at, updated_at')
      .order('name', { ascending: true });
    
    if (error) throw new Error(error.message);
    return data || [];
  },

  getPlatforms: async () => {
    const supabase = createClient();
    const { data, error } = await supabase
      .from('dim_platform')
      .select('id, name, category, display_name, is_active, created_at')
      .eq('is_active', true)
      .order('category', { ascending: true })
      .order('display_name', { ascending: true });
    
    if (error) throw new Error(error.message);
    return data || [];
  },

  getMetricTypes: async () => {
    const supabase = createClient();
    const { data, error } = await supabase
      .from('dim_metric_type')
      .select('id, code, description, unit, category, created_at')
      .order('category', { ascending: true })
      .order('code', { ascending: true });
    
    if (error) throw new Error(error.message);
    return data || [];
  },

  getFutureDates: async (maxMonths = 12) => {
    const supabase = createClient();
    const startDate = new Date();
    const endDate = new Date();
    endDate.setMonth(endDate.getMonth() + maxMonths);

    const { data, error } = await supabase
      .from('dim_date')
      .select('id, date, week_start, month, quarter, year, is_business_day, day_of_week, month_name, quarter_name, created_at')
      .gte('date', startDate.toISOString().split('T')[0])
      .lte('date', endDate.toISOString().split('T')[0])
      .order('date', { ascending: true })
      .limit(365);
    
    if (error) throw new Error(error.message);
    return data || [];
  },

  getBusinessDaysOnly: async (maxMonths = 12) => {
    const supabase = createClient();
    const startDate = new Date();
    const endDate = new Date();
    endDate.setMonth(endDate.getMonth() + maxMonths);

    const { data, error } = await supabase
      .from('dim_date')
      .select('id, date, month_name, quarter_name, year, quarter, is_business_day')
      .gte('date', startDate.toISOString().split('T')[0])
      .lte('date', endDate.toISOString().split('T')[0])
      .eq('is_business_day', true)
      .order('date', { ascending: true });
    
    if (error) throw new Error(error.message);
    return data || [];
  },
};

// OKR CRUD Service Implementation
const okrCrudServiceImpl: OKRCrudService = {
  createOKRs: async (input) => {
    const supabase = createClient();
    const okrData = input.objectives.map(objective => ({
      tenant_id: input.tenantId,
      brand_id: input.brandId,
      title: objective.title,
      description: objective.description,
      target_value: objective.targetValue,
      target_date_id: objective.targetDateId,
      metric_type_id: objective.metricTypeId,
      platform_id: objective.platformId || null,
      granularity: objective.granularity,
      master_template_id: objective.templateId || null,
      is_active: true
    }));

    const { data, error } = await supabase
      .from('okr_objectives')
      .insert(okrData)
      .select();

    if (error) throw new Error(`Failed to create OKRs: ${error.message}`);
    return data || [];
  },

  updateOKR: async (input) => {
    const supabase = createClient();
    const updateData = {
      ...input.updates,
      updated_at: new Date().toISOString()
    };

    const { data, error } = await supabase
      .from('okr_objectives')
      .update(updateData)
      .eq('id', input.id)
      .select();

    if (error) throw new Error(`Failed to update OKR: ${error.message}`);
    return data?.[0];
  },

  bulkOperation: async (input) => {
    const supabase = createClient();
    let updateData: any = {
      updated_at: new Date().toISOString()
    };

    switch (input.operation) {
      case 'archive':
      case 'deactivate':
        updateData.is_active = false;
        break;
      case 'activate':
        updateData.is_active = true;
        break;
    }

    if (input.updates) {
      updateData = { ...updateData, ...input.updates };
    }

    const { data, error } = await supabase
      .from('okr_objectives')
      .update(updateData)
      .in('id', input.ids)
      .select();

    if (error) throw new Error(`Bulk operation failed: ${error.message}`);
    return data || [];
  },

  getOKRList: async (tenantId: string, brandId: string) => {
    const supabase = createClient();
    const { data, error } = await supabase
      .from('okr_objectives')
      .select(`
        id, title, description, target_value, target_date_id, granularity,
        is_active, created_at, updated_at, master_template_id,
        dim_metric_type!inner (id, code, description, unit, category),
        dim_platform (id, name, display_name),
        dim_date!inner (id, date, month_name, quarter_name, year)
      `)
      .eq('tenant_id', tenantId)
      .eq('brand_id', brandId)
      .order('created_at', { ascending: false });

    if (error) throw new Error(error.message);
    return data || [];
  },

  validateOKRBusinessRules: validateOKRBusinessRules,
  validateBulkOperationSize: validateBulkOperationSize,
};

// Bulk Operations Service Implementation
const bulkOperationsServiceImpl: BulkOperationsService = {
  updateOKR: async (id: string, brandId: string, input) => {
    const supabase = createClient();
    const { error } = await supabase
      .from('okr_objectives')
      .update({
        ...input,
        updated_at: new Date().toISOString()
      })
      .eq('id', id)
      .eq('brand_id', brandId);

    if (error) throw error;
  },

  bulkUpdateOKRs: async (brandId: string, operation) => {
    const supabase = createClient();
    let updateData: any = { 
      ...operation.data,
      updated_at: new Date().toISOString()
    };

    switch (operation.operation) {
      case 'archive':
        updateData.status = 'archived';
        break;
      case 'activate':
        updateData.status = 'active';
        break;
      case 'pause':
        updateData.status = 'paused';
        break;
      case 'delete':
        updateData.status = 'archived';
        break;
    }

    const { error } = await supabase
      .from('okr_objectives')
      .update(updateData)
      .in('id', operation.okrIds)
      .eq('brand_id', brandId);

    if (error) throw error;
  },

  deleteOKR: async (id: string, brandId: string) => {
    const supabase = createClient();
    const { error } = await supabase
      .from('okr_objectives')
      .update({ 
        status: 'archived',
        updated_at: new Date().toISOString()
      })
      .eq('id', id)
      .eq('brand_id', brandId);

    if (error) throw error;
  },

  getOKRList: async (brandId: string) => {
    const supabase = createClient();
    const { data, error } = await supabase
      .from('okr_objectives')
      .select(`
        id, title, description, target_value, current_value, status,
        priority, granularity, created_at, target_date_id, platform_id,
        metric_type_id, master_template_id,
        dim_date!okr_objectives_target_date_id_fkey(id, date, month_name, year, quarter_name),
        dim_platform(id, name, display_name, category),
        dim_metric_type(id, name, display_name, category, unit),
        okr_master(id, title, description, category)
      `)
      .eq('brand_id', brandId)
      .neq('status', 'archived')
      .order('created_at', { ascending: false });

    if (error) throw error;
    return data || [];
  },
};

// Create hooks with service implementations
export const okrDataHooks = createOKRDataHooks(okrServiceImpl);
export const brandContextHooks = createBrandContextHooks(brandContextServiceImpl);
export const dimensionHooks = createDimensionHooks(dimensionsServiceImpl);
export const okrCrudHooks = createOKRCrudHooks(okrCrudServiceImpl);
export const bulkOperationsHooks = createBulkOperationsHooks(bulkOperationsServiceImpl);

// Export individual hooks for easy import
export const useCurrentPerformanceOKRs = okrDataHooks.useCurrentPerformanceOKRs;
export const useProgressSummary = okrDataHooks.useProgressSummary;
export const useBrandDashboardOverview = okrDataHooks.useBrandDashboardOverview;
export const useOKRTrendAnalysis = okrDataHooks.useOKRTrendAnalysis;
export const useAttentionMetrics = okrDataHooks.useAttentionMetrics;
export const useAIInsights = okrDataHooks.useAIInsights;
export const useOKRPerformance = okrDataHooks.useOKRPerformance;
export const useOKRSearch = okrDataHooks.useOKRSearch;
export const useOKRById = okrDataHooks.useOKRById;
export const useOKRTemplates = okrDataHooks.useOKRTemplates;

export const useBrandContext = brandContextHooks.useBrandContext;
export const useUserBrands = brandContextHooks.useUserBrands;

export const useDimensions = dimensionHooks.useDimensions;
export const useIndustries = dimensionHooks.useIndustries;
export const useFutureDates = dimensionHooks.useFutureDates;

export const useCreateOKR = okrCrudHooks.useCreateOKR;
export const useOKRList = okrCrudHooks.useOKRList;

export const useOKRManagement = bulkOperationsHooks.useOKRManagement;