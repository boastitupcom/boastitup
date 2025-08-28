"use client";

import { useState, useCallback } from 'react';
import { createClient } from '@boastitup/supabase/client';
import { 
  ManagedOKR, 
  OKRUpdateInput, 
  BulkOKRManagementOperation 
} from '../types/okr-creation';

interface UseOKRManagementReturn {
  updateOKR: (id: string, input: OKRUpdateInput) => Promise<void>;
  bulkOperation: (operation: BulkOKRManagementOperation) => Promise<void>;
  deleteOKR: (id: string) => Promise<void>;
  refreshOKRs: () => Promise<ManagedOKR[]>;
  isLoading: boolean;
  error: Error | null;
}

export function useOKRManagement(brandId: string): UseOKRManagementReturn {
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState<Error | null>(null);
  const supabase = createClient();

  const updateOKR = useCallback(async (id: string, input: OKRUpdateInput) => {
    setIsLoading(true);
    setError(null);

    try {
      const { error } = await supabase
        .from('okr_objectives')
        .update({
          ...input,
          updated_at: new Date().toISOString()
        })
        .eq('id', id)
        .eq('brand_id', brandId);

      if (error) throw error;

    } catch (err) {
      const errorMsg = err instanceof Error ? err : new Error('Failed to update OKR');
      setError(errorMsg);
      throw errorMsg;
    } finally {
      setIsLoading(false);
    }
  }, [brandId, supabase]);

  const bulkOperation = useCallback(async (operation: BulkOKRManagementOperation) => {
    if (operation.okrIds.length === 0) {
      throw new Error('No OKRs selected for bulk operation');
    }

    if (operation.okrIds.length > 50) {
      throw new Error('Cannot perform bulk operations on more than 50 OKRs at once');
    }

    setIsLoading(true);
    setError(null);

    try {
      let updateData: Partial<OKRUpdateInput> = { 
        ...operation.data,
        updated_at: new Date().toISOString() as any
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
          // For delete, we actually archive with a special flag
          updateData.status = 'archived';
          break;
        case 'update_priority':
          // Priority should be in operation.data
          if (!operation.data?.priority) {
            throw new Error('Priority value required for priority update operation');
          }
          break;
      }

      if (operation.operation === 'delete') {
        // For safety, we soft delete by archiving
        const { error } = await supabase
          .from('okr_objectives')
          .update({ 
            status: 'archived',
            updated_at: new Date().toISOString()
          })
          .in('id', operation.okrIds)
          .eq('brand_id', brandId);

        if (error) throw error;
      } else {
        const { error } = await supabase
          .from('okr_objectives')
          .update(updateData)
          .in('id', operation.okrIds)
          .eq('brand_id', brandId);

        if (error) throw error;
      }

    } catch (err) {
      const errorMsg = err instanceof Error ? err : new Error(`Failed to perform bulk ${operation.operation}`);
      setError(errorMsg);
      throw errorMsg;
    } finally {
      setIsLoading(false);
    }
  }, [brandId, supabase]);

  const deleteOKR = useCallback(async (id: string) => {
    setIsLoading(true);
    setError(null);

    try {
      // Soft delete by archiving
      const { error } = await supabase
        .from('okr_objectives')
        .update({ 
          status: 'archived',
          updated_at: new Date().toISOString()
        })
        .eq('id', id)
        .eq('brand_id', brandId);

      if (error) throw error;

    } catch (err) {
      const errorMsg = err instanceof Error ? err : new Error('Failed to delete OKR');
      setError(errorMsg);
      throw errorMsg;
    } finally {
      setIsLoading(false);
    }
  }, [brandId, supabase]);

  const refreshOKRs = useCallback(async (): Promise<ManagedOKR[]> => {
    setIsLoading(true);
    setError(null);

    try {
      const { data, error } = await supabase
        .from('okr_objectives')
        .select(`
          id,
          title,
          description,
          target_value,
          current_value,
          status,
          priority,
          granularity,
          created_at,
          target_date_id,
          platform_id,
          metric_type_id,
          okr_master_id,
          master_template_id,
          dim_date!okr_objectives_target_date_id_fkey(
            id,
            date,
            month_name,
            year,
            quarter_name
          ),
          dim_platform(
            id,
            name,
            display_name,
            category
          ),
          dim_metric_type(
            id,
            name,
            display_name,
            category,
            unit
          ),
          okr_master(
            id,
            title,
            description,
            category
          )
        `)
        .eq('brand_id', brandId)
        .neq('status', 'archived') // Don't show archived OKRs by default
        .order('created_at', { ascending: false });

      if (error) throw error;

      return data as ManagedOKR[] || [];

    } catch (err) {
      const errorMsg = err instanceof Error ? err : new Error('Failed to refresh OKRs');
      setError(errorMsg);
      throw errorMsg;
    } finally {
      setIsLoading(false);
    }
  }, [brandId, supabase]);

  return {
    updateOKR,
    bulkOperation,
    deleteOKR,
    refreshOKRs,
    isLoading,
    error
  };
}