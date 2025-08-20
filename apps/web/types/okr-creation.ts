// OKR Creation System Types - Based on story.txt specifications

// Core Interfaces from story.txt API specifications (lines 293-329)
export interface OKRSuggestionRequest {
  // Required fields
  industry: string;           // From brands.industry_id
  brandName: string;
  tenantId: string;          // Multi-tenancy support
  // Optional enrichment
  keyProduct?: string;
  productCategory?: string;
  keyCompetition?: string[];
  majorKeywords?: string[];
  objective?: string;
  historicalOKRs?: string[];
}

export interface OKRSuggestionResponse {
  suggestions: OKRTemplate[];
  metadata: {
    industry: string;
    brandContext: string;
    generatedAt: string;
    confidence: number;
  };
}

export interface OKRTemplate {
  id: string;
  okrMasterId: string;      // Reference to okr_master.id
  title: string;
  description: string;
  category: string;
  priority: number;          // 1-3 scale
  suggestedTargetValue: number;
  suggestedTimeframe: 'daily' | 'weekly' | 'monthly' | 'quarterly';
  applicablePlatforms: string[];
  metricTypeId: string;     // Reference to dim_metric_type.id
  confidenceScore: number;
  reasoning?: string;
}

// Database Entity Types (from sample data in story.txt)
export interface Industry {
  id: string;
  name: string;
  slug: string;
  description?: string;
  created_at?: string;
  updated_at?: string;
}

export interface OKRMaster {
  id: string;
  industry: string;
  category: string;
  objective_title: string;
  objective_description?: string;
  suggested_timeframe?: string;
  priority_level: number;
  is_active?: boolean;
  parent_okr_id?: string;
  tags?: any;
  created_at?: string;
  updated_at?: string;
}

export interface Platform {
  id: string;
  name: string;
  category: string;
  display_name: string;
  is_active?: boolean;
  created_at?: string;
}

export interface MetricType {
  id: string;
  code: string;
  description: string;
  unit?: string;
  category: string;
  created_at?: string;
}

export interface DateDimension {
  id: number;
  date: string;
  week_start: string;
  month: number;
  quarter: number;
  year: number;
  is_business_day: boolean;
  day_of_week: number;
  month_name: string;
  quarter_name: string;
  created_at?: string;
}

// Creation Form Types (lines 333-366 in story.txt)
export interface CreateOKRInput {
  tenantId: string;
  brandId: string;
  objectives: Array<{
    title: string;
    description: string;
    targetValue: number;
    targetDateId: number;     // Reference to dim_date.id
    granularity: 'daily' | 'weekly' | 'monthly';
    metricTypeId: string;
    platformId?: string;
    templateId?: string;     // Reference to okr_master.id for tracking origin
  }>;
}

export interface UpdateOKRInput {
  id: string;
  updates: Partial<{
    title: string;
    targetValue: number;
    targetDateId: number;
    isActive: boolean;
    platformId: string;
  }>;
}

export interface BulkOperationInput {
  ids: string[];
  operation: 'archive' | 'activate' | 'deactivate';
  updates?: Partial<UpdateOKRInput['updates']>;
}

// Form State Types
export interface OKRCreationForm {
  selectedIndustryId: string;
  selectedTemplates: Map<string, OKRTemplate>;
  customizations: Map<string, OKRCustomization>;
  globalSettings: {
    defaultTargetDateId?: number;
    defaultGranularity: 'daily' | 'weekly' | 'monthly';
    defaultPlatformIds: string[];
  };
}

export interface OKRCustomization {
  templateId: string;
  title?: string;
  targetValue?: number;
  targetDateId?: number;
  granularity?: 'daily' | 'weekly' | 'monthly';
  platformId?: string;
  priority?: number;
  notes?: string;
}

// Hook Return Types
export interface UseOKRTemplatesReturn {
  templates: OKRTemplate[] | null;
  isLoading: boolean;
  error: Error | null;
  refetch: () => Promise<void>;
}

export interface UseDimensionsReturn {
  industries: Industry[] | null;
  platforms: Platform[] | null;
  metricTypes: MetricType[] | null;
  dates: DateDimension[] | null;
  isLoading: boolean;
  error: Error | null;
}

export interface UseCreateOKRReturn {
  createOKRs: (input: CreateOKRInput) => Promise<void>;
  updateOKR: (input: UpdateOKRInput) => Promise<void>;
  bulkOperation: (input: BulkOperationInput) => Promise<void>;
  isCreating: boolean;
  isUpdating: boolean;
  error: Error | null;
}

// State Management Types (lines 367-399 in story.txt)
export interface BrandStore {
  // State
  currentBrand: Brand | null;
  currentTenant: Tenant | null;
  industry: Industry | null;
  permissions: UserPermissions;
  // Actions
  loadBrandContext: () => Promise<void>;
  switchBrand: (brandId: string) => Promise<void>;
  refreshPermissions: () => Promise<void>;
}

export interface OKRCreationState {
  // Selection state
  selectedTemplates: Map<string, OKRTemplate>;
  customizations: Map<string, OKRCustomization>;
  // UI state
  isLoading: boolean;
  isSaving: boolean;
  errors: ValidationError[];
  // Actions
  selectTemplate: (template: OKRTemplate) => void;
  deselectTemplate: (templateId: string) => void;
  updateCustomization: (templateId: string, data: Partial<OKRCustomization>) => void;
  saveOKRs: () => Promise<void>;
  reset: () => void;
}

// Supporting Types
export interface Brand {
  id: string;
  tenant_id: string;
  name: string;
  slug: string;
  description?: string;
  logo_url?: string;
  brand_colors?: any;
  is_active?: boolean;
  created_at?: string;
  updated_at?: string;
  primary_domain?: string;
  industry_id?: string;
}

export interface Tenant {
  id: string;
  name: string;
  slug: string;
  description?: string;
  settings?: any;
  is_active?: boolean;
  created_at?: string;
  updated_at?: string;
}

export interface UserPermissions {
  canCreateOKRs: boolean;
  canEditOKRs: boolean;
  canDeleteOKRs: boolean;
  canViewAnalytics: boolean;
  tenantRole: string;
  brandRole: string;
}

export interface ValidationError {
  field: string;
  message: string;
  code: string;
}

// Component Props Types
export interface IndustrySelectorProps {
  industries: Industry[];
  selectedIndustryId?: string;
  onIndustryChange: (industryId: string) => void;
  disabled?: boolean;
}

export interface OKRTemplateGridProps {
  templates: OKRTemplate[];
  selectedTemplateIds: Set<string>;
  onTemplateSelect: (templateId: string) => void;
  onTemplateDeselect: (templateId: string) => void;
  onBulkSelect: (templateIds: string[]) => void;
  isLoading?: boolean;
}

export interface OKRCustomizationFormProps {
  template: OKRTemplate;
  customization: OKRCustomization;
  onCustomizationChange: (data: Partial<OKRCustomization>) => void;
  platforms: Platform[];
  metricTypes: MetricType[];
  dates: DateDimension[];
}

export interface BulkOKRActionsProps {
  selectedCount: number;
  onSelectAll: () => void;
  onDeselectAll: () => void;
  onBulkCustomize: (data: Partial<OKRCustomization>) => void;
  disabled?: boolean;
}

// OKR Management Types
export interface ManagedOKR {
  id: string;
  title: string;
  description: string;
  target_value: number;
  granularity: 'daily' | 'weekly' | 'monthly';
  is_active: boolean;
  created_at: string;
  updated_at: string;
  target_date_id: string;
  platform_id?: string;
  metric_type_id: string;
  
  // Joined data
  dim_date?: {
    id: string;
    date: string;
    month_name: string;
    year: number;
    quarter_name: string;
  };
  dim_platform?: {
    id: string;
    name: string;
    display_name: string;
    category: string;
  };
  dim_metric_type?: {
    id: string;
    name: string;
    display_name: string;
    category: string;
    unit: string;
  };
  okr_master?: {
    id: string;
    title: string;
    description: string;
    category: string;
  };
}

export interface OKRSummaryStats {
  total: number;
  active: number;
  completed: number;
  highPriority: number;
}

export interface OKRManagementViewProps {
  initialOKRs: ManagedOKR[];
  summaryStats: OKRSummaryStats;
  brandId: string;
  tenantId: string;
}

export interface OKRUpdateInput {
  title?: string;
  description?: string;
  target_value?: number;
  current_value?: number;
  status?: 'active' | 'paused' | 'completed' | 'archived';
  priority?: number;
  target_date_id?: string;
  platform_id?: string;
}

export interface BulkOKRManagementOperation {
  operation: 'archive' | 'activate' | 'pause' | 'delete' | 'update_priority';
  okrIds: string[];
  data?: Partial<OKRUpdateInput>;
}