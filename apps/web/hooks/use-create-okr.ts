import { useState, useCallback } from 'react';
import { createClient } from '@boastitup/supabase/client';
import { 
  CreateOKRInput, 
  UpdateOKRInput, 
  BulkOperationInput, 
  UseCreateOKRReturn 
} from '../types/okr-creation';
import { 
  validateOKRBusinessRules, 
  validateBulkOperationSize,
  validateTenantScope 
} from '../utils/databaseConstraints';

/**
 * Hook for OKR CRUD operations
 * Based on story.txt specifications (lines 333-366)
 */
export function useCreateOKR(): UseCreateOKRReturn {
  const [isCreating, setIsCreating] = useState(false);
  const [isUpdating, setIsUpdating] = useState(false);
  const [error, setError] = useState<Error | null>(null);

  const supabase = createClient();

  const createOKRs = useCallback(async (input: CreateOKRInput) => {
    try {
      setIsCreating(true);
      setError(null);

      // Validate bulk operation size using utility function
      validateBulkOperationSize(input.objectives);

      if (input.objectives.length === 0) {
        throw new Error('At least one OKR must be provided');
      }

      // Validate each objective's business rules
      for (let i = 0; i < input.objectives.length; i++) {
        const objective = input.objectives[i];
        const validationData = {
          title: objective.title,
          description: objective.description,
          target_value: objective.targetValue,
          target_date_id: objective.targetDateId,
          granularity: objective.granularity,
          metric_type_id: objective.metricTypeId,
          platform_id: objective.platformId,
          tenant_id: input.tenantId,
          brand_id: input.brandId,
          master_template_id: objective.templateId,
          priority: objective.priority
        };

        const validation = validateOKRBusinessRules(validationData, {});
        if (!validation.isValid) {
          throw new Error(`Validation failed for OKR ${i + 1}: ${validation.errors[0]?.message}`);
        }
      }

      // Prepare data for insertion - match okr_objectives table schema
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
        master_template_id: objective.templateId || null, // Track template origin (story.txt line 666)
        is_active: true
      }));

      // Insert OKRs in bulk transaction
      const { data, error: insertError } = await supabase
        .from('okr_objectives')
        .insert(okrData)
        .select();

      if (insertError) {
        throw new Error(`Failed to create OKRs: ${insertError.message}`);
      }

      if (!data || data.length !== input.objectives.length) {
        throw new Error('Some OKRs failed to create');
      }

      console.log(`Successfully created ${data.length} OKRs`);

    } catch (err) {
      const error = err instanceof Error ? err : new Error('Failed to create OKRs');
      setError(error);
      throw error;
    } finally {
      setIsCreating(false);
    }
  }, [supabase]);

  const updateOKR = useCallback(async (input: UpdateOKRInput) => {
    try {
      setIsUpdating(true);
      setError(null);

      const updateData = {
        ...input.updates,
        updated_at: new Date().toISOString()
      };

      const { data, error: updateError } = await supabase
        .from('okr_objectives')
        .update(updateData)
        .eq('id', input.id)
        .select();

      if (updateError) {
        throw new Error(`Failed to update OKR: ${updateError.message}`);
      }

      if (!data || data.length === 0) {
        throw new Error('OKR not found or could not be updated');
      }

      console.log(`Successfully updated OKR ${input.id}`);

    } catch (err) {
      const error = err instanceof Error ? err : new Error('Failed to update OKR');
      setError(error);
      throw error;
    } finally {
      setIsUpdating(false);
    }
  }, [supabase]);

  const bulkOperation = useCallback(async (input: BulkOperationInput) => {
    try {
      setIsUpdating(true);
      setError(null);

      // Validate bulk operation size using utility function
      validateBulkOperationSize(input.ids);

      if (input.ids.length === 0) {
        throw new Error('At least one OKR ID must be provided');
      }

      let updateData: any = {
        updated_at: new Date().toISOString()
      };

      // Handle different bulk operations
      switch (input.operation) {
        case 'archive':
        case 'deactivate':
          updateData.is_active = false;
          break;
        case 'activate':
          updateData.is_active = true;
          break;
        default:
          throw new Error(`Unsupported bulk operation: ${input.operation}`);
      }

      // Apply additional updates if provided
      if (input.updates) {
        updateData = { ...updateData, ...input.updates };
      }

      const { data, error: bulkError } = await supabase
        .from('okr_objectives')
        .update(updateData)
        .in('id', input.ids)
        .select();

      if (bulkError) {
        throw new Error(`Bulk operation failed: ${bulkError.message}`);
      }

      if (!data || data.length === 0) {
        throw new Error('No OKRs were updated in bulk operation');
      }

      console.log(`Successfully ${input.operation}d ${data.length} OKRs`);

    } catch (err) {
      const error = err instanceof Error ? err : new Error('Bulk operation failed');
      setError(error);
      throw error;
    } finally {
      setIsUpdating(false);
    }
  }, [supabase]);

  return {
    createOKRs,
    updateOKR,
    bulkOperation,
    isCreating,
    isUpdating,
    error,
  };
}

/**
 * Hook for fetching existing OKRs for management
 */
export function useOKRList(tenantId?: string, brandId?: string) {
  const [okrs, setOkrs] = useState<any[] | null>(null);
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState<Error | null>(null);

  const supabase = createClient();

  const fetchOKRs = useCallback(async () => {
    if (!tenantId || !brandId) {
      setOkrs([]);
      return;
    }

    try {
      setIsLoading(true);
      setError(null);

      const { data, error: fetchError } = await supabase
        .from('okr_objectives')
        .select(`
          id,
          title,
          description,
          target_value,
          target_date_id,
          granularity,
          is_active,
          created_at,
          updated_at,
          master_template_id,
          dim_metric_type!inner (
            id,
            code,
            description,
            unit,
            category
          ),
          dim_platform (
            id,
            name,
            display_name
          ),
          dim_date!inner (
            id,
            date,
            month_name,
            quarter_name,
            year
          )
        `)
        .eq('tenant_id', tenantId)
        .eq('brand_id', brandId)
        .order('created_at', { ascending: false });

      if (fetchError) {
        throw new Error(fetchError.message);
      }

      setOkrs(data || []);

    } catch (err) {
      setError(err instanceof Error ? err : new Error('Failed to fetch OKRs'));
    } finally {
      setIsLoading(false);
    }
  }, [supabase, tenantId, brandId]);

  return {
    okrs,
    isLoading,
    error,
    refetch: fetchOKRs,
  };
}