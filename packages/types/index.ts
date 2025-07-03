// packages/types/index.ts
export interface AnalyticsData {
  kpis: KPI[];
  marketPulse: MarketPulseItem[];
  growthLevers: GrowthLeverItem[];
  opportunityRadar: OpportunityRadarItem[];
  benchmarks: {
    labels: string[];
    current: number[];
    previous: number[];
  };
}

export interface KPI {
  title: string;
  value: string;
  change: string;
}

export interface MarketPulseItem {
  item: string;
  type: 'trend' | 'competitor' | 'market_shift';
  change: string;
}

export interface GrowthLeverItem {
  name: string;
  status: 'active' | 'opportunity' | 'declining';
  change: string;
}

export interface OpportunityRadarItem {
  title: string;
  score: string;
}

export interface Brand {
  id: string;
  name: string;
  tenant_id: string;
  created_at?: string;
  updated_at?: string;
}

export interface Tenant {
  id: string;
  name: string;
  created_at?: string;
  updated_at?: string;
}

export interface UserTenantRole {
  id: string;
  user_id: string;
  tenant_id: string;
  role: 'owner' | 'admin' | 'member';
  is_active: boolean;
  created_at?: string;
}

export interface UserBrandRole {
  id: string;
  user_id: string;
  tenant_id: string;
  brand_id: string;
  role: 'manager' | 'editor' | 'viewer';
  is_active: boolean;
  created_at?: string;
}