import { useState, useCallback } from 'react';

// Type definitions - should be imported from shared types
export interface CreateOKRObjective {
  title: string;
  description?: string;
  targetValue: number;
  targetDateId: number;
  priority?: number;
  granularity: 'daily' | 'weekly' | 'monthly';
  metricTypeId: string;
  platformId?: string;
  templateId?: string;
}

export interface CreateOKRInput {
  tenantId: string;
  brandId: string;
  objectives: CreateOKRObjective[];
}

export interface UpdateOKRInput {
  id: string;
  updates: Partial<{
    title: string;
    targetValue: number;
    targetDateId: number;
    isActive: boolean;
    priority: number;
    platformId: string;
  }>;
}

export interface BulkOperationInput {
  ids: string[];
  operation: 'archive' | 'activate' | 'deactivate';
  updates?: Partial<UpdateOKRInput['updates']>;
}

export interface UseCreateOKRReturn {
  createOKRs: (input: CreateOKRInput) => Promise<void>;
  updateOKR: (input: UpdateOKRInput) => Promise<void>;
  bulkOperation: (input: BulkOperationInput) => Promise<void>;
  isCreating: boolean;
  isUpdating: boolean;
  error: Error | null;
}

// Service interface for dependency injection
export interface OKRCrudService {
  createOKRs: (input: CreateOKRInput) => Promise<any[]>;
  updateOKR: (input: UpdateOKRInput) => Promise<any>;
  bulkOperation: (input: BulkOperationInput) => Promise<any[]>;
  getOKRList: (tenantId: string, brandId: string) => Promise<any[]>;
  validateOKRBusinessRules: (data: any, context: any) => { isValid: boolean; errors: any[] };
  validateBulkOperationSize: (items: any[]) => void;
}

/**
 * Factory function to create OKR CRUD hooks with service dependency injection
 * Based on story.txt specifications for OKR management
 */
export const createOKRCrudHooks = (service: OKRCrudService) => {
  /**
   * Hook for OKR CRUD operations
   * Based on story.txt specifications (lines 333-366)
   */
  const useCreateOKR = (): UseCreateOKRReturn => {
    const [isCreating, setIsCreating] = useState(false);
    const [isUpdating, setIsUpdating] = useState(false);
    const [error, setError] = useState<Error | null>(null);

    const createOKRs = useCallback(async (input: CreateOKRInput) => {
      try {
        setIsCreating(true);
        setError(null);

        // Validate bulk operation size
        service.validateBulkOperationSize(input.objectives);

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

          const validation = service.validateOKRBusinessRules(validationData, {});
          if (!validation.isValid) {
            throw new Error(`Validation failed for OKR ${i + 1}: ${validation.errors[0]?.message}`);
          }
        }

        await service.createOKRs(input);

      } catch (err) {
        const error = err instanceof Error ? err : new Error('Failed to create OKRs');
        setError(error);
        throw error;
      } finally {
        setIsCreating(false);
      }
    }, [service]);

    const updateOKR = useCallback(async (input: UpdateOKRInput) => {
      try {
        setIsUpdating(true);
        setError(null);

        await service.updateOKR(input);

      } catch (err) {
        const error = err instanceof Error ? err : new Error('Failed to update OKR');
        setError(error);
        throw error;
      } finally {
        setIsUpdating(false);
      }
    }, [service]);

    const bulkOperation = useCallback(async (input: BulkOperationInput) => {
      try {
        setIsUpdating(true);
        setError(null);

        // Validate bulk operation size
        service.validateBulkOperationSize(input.ids);

        if (input.ids.length === 0) {
          throw new Error('At least one OKR ID must be provided');
        }

        await service.bulkOperation(input);

      } catch (err) {
        const error = err instanceof Error ? err : new Error('Bulk operation failed');
        setError(error);
        throw error;
      } finally {
        setIsUpdating(false);
      }
    }, [service]);

    return {
      createOKRs,
      updateOKR,
      bulkOperation,
      isCreating,
      isUpdating,
      error,
    };
  };

  /**
   * Hook for fetching existing OKRs for management
   */
  const useOKRList = (tenantId?: string, brandId?: string) => {
    const [okrs, setOkrs] = useState<any[] | null>(null);
    const [isLoading, setIsLoading] = useState(false);
    const [error, setError] = useState<Error | null>(null);

    const fetchOKRs = useCallback(async () => {
      if (!tenantId || !brandId) {
        setOkrs([]);
        return;
      }

      try {
        setIsLoading(true);
        setError(null);

        const data = await service.getOKRList(tenantId, brandId);
        setOkrs(data);

      } catch (err) {
        setError(err instanceof Error ? err : new Error('Failed to fetch OKRs'));
      } finally {
        setIsLoading(false);
      }
    }, [service, tenantId, brandId]);

    return {
      okrs,
      isLoading,
      error,
      refetch: fetchOKRs,
    };
  };

  return {
    useCreateOKR,
    useOKRList,
  };
};

// Default exports that throw errors to encourage service injection
export const useCreateOKR = (): UseCreateOKRReturn => {
  throw new Error('useCreateOKR must be created via createOKRCrudHooks factory with service injection');
};

export const useOKRList = (tenantId?: string, brandId?: string) => {
  throw new Error('useOKRList must be created via createOKRCrudHooks factory with service injection');
};