import { useState, useCallback } from 'react';

// Type definitions - should be imported from shared types
export interface ManagedOKR {
  id: string;
  title: string;
  description?: string;
  target_value: number;
  current_value?: number;
  status: string;
  priority?: number;
  granularity: string;
  created_at: string;
  target_date_id: number;
  platform_id?: string;
  metric_type_id: string;
  master_template_id?: string;
  // Related data
  dim_date?: any;
  dim_platform?: any;
  dim_metric_type?: any;
  okr_master?: any;
}

export interface OKRUpdateInput {
  title?: string;
  description?: string;
  target_value?: number;
  priority?: number;
  status?: string;
  target_date_id?: number;
  platform_id?: string;
}

export interface BulkOKRManagementOperation {
  operation: 'archive' | 'activate' | 'pause' | 'delete' | 'update_priority';
  okrIds: string[];
  data?: Partial<OKRUpdateInput>;
}

// Service interface for dependency injection
export interface BulkOperationsService {
  updateOKR: (id: string, brandId: string, input: OKRUpdateInput) => Promise<void>;
  bulkUpdateOKRs: (brandId: string, operation: BulkOKRManagementOperation) => Promise<void>;
  deleteOKR: (id: string, brandId: string) => Promise<void>;
  getOKRList: (brandId: string) => Promise<ManagedOKR[]>;
}

/**
 * Factory function to create bulk operations hooks with service dependency injection
 * Based on story.txt specifications for OKR management operations
 */
export const createBulkOperationsHooks = (service: BulkOperationsService) => {
  /**
   * Hook for OKR management operations including bulk actions
   * Based on story.txt business logic requirements
   */
  const useOKRManagement = (brandId: string) => {
    const [isLoading, setIsLoading] = useState(false);
    const [error, setError] = useState<Error | null>(null);

    const updateOKR = useCallback(async (id: string, input: OKRUpdateInput) => {
      setIsLoading(true);
      setError(null);

      try {
        await service.updateOKR(id, brandId, input);
      } catch (err) {
        const errorMsg = err instanceof Error ? err : new Error('Failed to update OKR');
        setError(errorMsg);
        throw errorMsg;
      } finally {
        setIsLoading(false);
      }
    }, [brandId, service]);

    const bulkOperation = useCallback(async (operation: BulkOKRManagementOperation) => {
      // Validation based on story.txt bulk limits (line 1185)
      if (operation.okrIds.length === 0) {
        throw new Error('No OKRs selected for bulk operation');
      }

      if (operation.okrIds.length > 50) {
        throw new Error('Cannot perform bulk operations on more than 50 OKRs at once');
      }

      setIsLoading(true);
      setError(null);

      try {
        await service.bulkUpdateOKRs(brandId, operation);
      } catch (err) {
        const errorMsg = err instanceof Error ? err : new Error(`Failed to perform bulk ${operation.operation}`);
        setError(errorMsg);
        throw errorMsg;
      } finally {
        setIsLoading(false);
      }
    }, [brandId, service]);

    const deleteOKR = useCallback(async (id: string) => {
      setIsLoading(true);
      setError(null);

      try {
        await service.deleteOKR(id, brandId);
      } catch (err) {
        const errorMsg = err instanceof Error ? err : new Error('Failed to delete OKR');
        setError(errorMsg);
        throw errorMsg;
      } finally {
        setIsLoading(false);
      }
    }, [brandId, service]);

    const refreshOKRs = useCallback(async (): Promise<ManagedOKR[]> => {
      setIsLoading(true);
      setError(null);

      try {
        const data = await service.getOKRList(brandId);
        return data;
      } catch (err) {
        const errorMsg = err instanceof Error ? err : new Error('Failed to refresh OKRs');
        setError(errorMsg);
        throw errorMsg;
      } finally {
        setIsLoading(false);
      }
    }, [brandId, service]);

    return {
      updateOKR,
      bulkOperation,
      deleteOKR,
      refreshOKRs,
      isLoading,
      error
    };
  };

  return {
    useOKRManagement,
  };
};

// Default export that throws error to encourage service injection
export const useOKRManagement = (brandId: string) => {
  throw new Error('useOKRManagement must be created via createBulkOperationsHooks factory with service injection');
};