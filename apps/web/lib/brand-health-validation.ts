import { z } from 'zod';

// Action update validation schema as per spec
export const actionUpdateSchema = z.object({
  actionId: z.string().uuid(),
  stage: z.enum(['new', 'viewed', 'saved', 'selected_for_action', 'in_progress', 'actioned', 'dismissed']),
  userId: z.string().uuid()
});

// Insight filter validation schema as per spec
export const insightFilterSchema = z.object({
  category: z.enum(['awareness', 'consideration', 'trust', 'sentiment']).optional(),
  minImpactScore: z.number().min(0).max(10).optional(),
  isActive: z.boolean().optional(),
  platform: z.string().optional(),
  priorityLevels: z.array(z.string()).optional(),
  stages: z.array(z.string()).optional()
});

// Brand health data validation
export const brandHealthScoreSchema = z.object({
  brand_id: z.string().uuid(),
  tenant_id: z.string().uuid(),
  brand_health_score: z.number().min(0).max(100),
  calculation_date: z.string(),
  sentiment_score: z.number().min(0).max(100),
  engagement_rate_score: z.number().min(0).max(100),
  reach_score: z.number().min(0).max(100),
  mentions_velocity_score: z.number().min(0).max(100),
  engagement_volume_score: z.number().min(0).max(100),
});

// Insight validation
export const insightSchema = z.object({
  id: z.string().uuid(),
  tenant_id: z.string().uuid(),
  brand_id: z.string().uuid(),
  insight_category: z.string().min(1),
  insight_title: z.string().min(1),
  insight_description: z.string().min(1),
  confidence_score: z.number().min(0).max(1).optional(),
  impact_score: z.number().min(1).max(10).optional(),
  is_active: z.boolean(),
  created_at: z.string(),
  expires_at: z.string().optional().nullable(),
  sort_order: z.number().optional().nullable()
});

// Action validation
export const actionSchema = z.object({
  id: z.string().uuid(),
  insight_id: z.string().uuid(),
  action_text: z.string().min(1),
  action_priority: z.enum(['high', 'medium', 'low']),
  action_description: z.string().optional().nullable(),
  stage: z.enum(['new', 'viewed', 'saved', 'selected_for_action', 'in_progress', 'actioned', 'dismissed']),
  action_confidence_score: z.number().min(0).max(1).optional().nullable(),
  action_impact_score: z.number().min(1).max(10).optional().nullable(),
  created_at: z.string(),
  okr_objective_id: z.string().uuid().optional().nullable(),
  assigned_to_campaign_id: z.string().uuid().optional().nullable()
});

export type ActionUpdateInput = z.infer<typeof actionUpdateSchema>;
export type InsightFilterInput = z.infer<typeof insightFilterSchema>;
export type BrandHealthScoreInput = z.infer<typeof brandHealthScoreSchema>;
export type InsightInput = z.infer<typeof insightSchema>;
export type ActionInput = z.infer<typeof actionSchema>;