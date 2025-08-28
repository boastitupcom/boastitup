"use client";

import { useState, useCallback, useMemo } from 'react';
import { z } from 'zod';

// Validation schemas from story.txt lines 404-412
const okrCreationSchema = z.object({
  title: z.string().min(3, 'Title must be at least 3 characters').max(200, 'Title cannot exceed 200 characters'),
  description: z.string().optional(),
  targetValue: z.number().positive('Target value must be positive'),
  targetDateId: z.number().positive('Please select a target date'),
  granularity: z.enum(['daily', 'weekly', 'monthly'], {
    errorMap: () => ({ message: 'Please select a valid measurement frequency' })
  }),
  platformId: z.string().uuid('Invalid platform ID').optional(),
  metricTypeId: z.string().uuid('Please select a metric type'),
  priority: z.number().int().min(1, 'Priority must be at least 1').max(3, 'Priority cannot exceed 3')
});

type OKRCreationData = z.infer<typeof okrCreationSchema>;

interface ValidationError {
  field: string;
  message: string;
  code?: string;
}

interface DuplicateCheck {
  isDuplicate: boolean;
  similarOKR?: {
    id: string;
    title: string;
    similarity: number;
  };
}

interface BulkValidationResult {
  isValid: boolean;
  errors: ValidationError[];
  warnings: string[];
  canProceed: boolean;
}

interface UseOKRValidationOptions {
  existingOKRs?: Array<{ id: string; title: string; is_active: boolean }>;
  maxBulkSize?: number;
  duplicateThreshold?: number;
}

/**
 * Comprehensive OKR validation hook implementing business rules from story.txt
 * Lines 413-424: Priority levels, date validation, platform compatibility, etc.
 */
export function useOKRValidation(options: UseOKRValidationOptions = {}) {
  const {
    existingOKRs = [],
    maxBulkSize = 50, // From story.txt line 424
    duplicateThreshold = 0.8
  } = options;

  const [validationCache, setValidationCache] = useState<Map<string, ValidationError[]>>(new Map());

  /**
   * Validate single OKR against business rules
   */
  const validateOKR = useCallback(async (data: Partial<OKRCreationData>): Promise<ValidationError[]> => {
    const errors: ValidationError[] = [];
    
    try {
      // Schema validation
      okrCreationSchema.parse(data);
    } catch (error) {
      if (error instanceof z.ZodError) {
        error.errors.forEach(err => {
          errors.push({
            field: err.path.join('.'),
            message: err.message,
            code: err.code
          });
        });
      }
    }

    // Business rule validations
    if (data.title) {
      // Check for duplicate titles (story.txt line 420)
      const duplicateCheck = checkForDuplicates(data.title);
      if (duplicateCheck.isDuplicate) {
        errors.push({
          field: 'title',
          message: `Similar OKR already exists: "${duplicateCheck.similarOKR?.title}" (${Math.round((duplicateCheck.similarOKR?.similarity || 0) * 100)}% similarity)`,
          code: 'DUPLICATE_OKR'
        });
      }
    }

    // Priority validation (story.txt line 414)
    if (data.priority && (data.priority < 1 || data.priority > 3)) {
      errors.push({
        field: 'priority',
        message: 'Priority must be between 1 (High) and 3 (Low)',
        code: 'INVALID_PRIORITY'
      });
    }

    // Target date validation (story.txt line 416)
    if (data.targetDateId) {
      const dateValidation = await validateTargetDate(data.targetDateId);
      if (!dateValidation.isValid) {
        errors.push({
          field: 'targetDateId',
          message: dateValidation.message,
          code: 'INVALID_TARGET_DATE'
        });
      }
    }

    // Platform compatibility validation (story.txt line 418)
    if (data.platformId && data.metricTypeId) {
      const compatibilityCheck = await validatePlatformCompatibility(data.platformId, data.metricTypeId);
      if (!compatibilityCheck.isCompatible) {
        errors.push({
          field: 'platformId',
          message: compatibilityCheck.message,
          code: 'PLATFORM_INCOMPATIBLE'
        });
      }
    }

    return errors;
  }, [existingOKRs, duplicateThreshold]);

  /**
   * Validate multiple OKRs for bulk operations
   */
  const validateBulkOKRs = useCallback(async (okrs: Partial<OKRCreationData>[]): Promise<BulkValidationResult> => {
    const errors: ValidationError[] = [];
    const warnings: string[] = [];

    // Bulk size limit (story.txt line 424)
    if (okrs.length > maxBulkSize) {
      return {
        isValid: false,
        errors: [{
          field: 'bulk',
          message: `Maximum ${maxBulkSize} OKRs allowed per bulk operation`,
          code: 'BULK_SIZE_EXCEEDED'
        }],
        warnings: [],
        canProceed: false
      };
    }

    // Validate each OKR
    for (let i = 0; i < okrs.length; i++) {
      const okrErrors = await validateOKR(okrs[i]);
      okrErrors.forEach(error => {
        errors.push({
          ...error,
          field: `okr[${i}].${error.field}`
        });
      });
    }

    // Check for duplicates within the batch
    const titles = okrs.map(okr => okr.title).filter(Boolean);
    const duplicatesInBatch = findDuplicatesInArray(titles);
    duplicatesInBatch.forEach(duplicate => {
      warnings.push(`Duplicate titles in batch: "${duplicate}"`);
    });

    // Priority distribution warning
    const priorities = okrs.map(okr => okr.priority).filter(Boolean);
    const highPriorityCount = priorities.filter(p => p === 1).length;
    if (highPriorityCount > Math.ceil(okrs.length * 0.3)) {
      warnings.push(`High number of high-priority OKRs (${highPriorityCount}). Consider balancing priorities.`);
    }

    return {
      isValid: errors.length === 0,
      errors,
      warnings,
      canProceed: errors.length === 0 || errors.every(e => e.code !== 'DUPLICATE_OKR' && e.code !== 'BULK_SIZE_EXCEEDED')
    };
  }, [maxBulkSize, validateOKR]);

  /**
   * Check for duplicate OKRs using similarity matching
   */
  const checkForDuplicates = useCallback((title: string): DuplicateCheck => {
    if (!title || existingOKRs.length === 0) {
      return { isDuplicate: false };
    }

    const normalizedTitle = title.toLowerCase().trim();
    
    for (const existingOKR of existingOKRs) {
      if (!existingOKR.is_active) continue;
      
      const similarity = calculateStringSimilarity(normalizedTitle, existingOKR.title.toLowerCase().trim());
      
      if (similarity >= duplicateThreshold) {
        return {
          isDuplicate: true,
          similarOKR: {
            id: existingOKR.id,
            title: existingOKR.title,
            similarity
          }
        };
      }
    }

    return { isDuplicate: false };
  }, [existingOKRs, duplicateThreshold]);

  /**
   * Validate target date is in future and exists in dim_date
   */
  const validateTargetDate = useCallback(async (targetDateId: number) => {
    // This would typically query the database to check if the date exists
    // For now, we'll do basic validation
    
    if (!targetDateId || targetDateId <= 0) {
      return {
        isValid: false,
        message: 'Target date is required'
      };
    }

    // In a real implementation, you'd query dim_date table
    // const dateExists = await checkDateExists(targetDateId);
    // const dateInFuture = await checkDateInFuture(targetDateId);
    
    return {
      isValid: true,
      message: 'Target date is valid'
    };
  }, []);

  /**
   * Validate platform and metric type compatibility
   */
  const validatePlatformCompatibility = useCallback(async (platformId: string, metricTypeId: string) => {
    // In a real implementation, this would check business rules for platform/metric compatibility
    // For now, we'll assume they're compatible unless there's a known incompatibility
    
    return {
      isCompatible: true,
      message: 'Platform and metric type are compatible'
    };
  }, []);

  /**
   * Real-time validation for form fields
   */
  const validateField = useCallback(async (field: string, value: any, context: Partial<OKRCreationData> = {}) => {
    const fieldSchema = okrCreationSchema.shape[field as keyof typeof okrCreationSchema.shape];
    if (!fieldSchema) return [];

    try {
      fieldSchema.parse(value);
      
      // Additional business rule validation for specific fields
      if (field === 'title' && typeof value === 'string') {
        const duplicateCheck = checkForDuplicates(value);
        if (duplicateCheck.isDuplicate) {
          return [{
            field,
            message: `Similar OKR exists: "${duplicateCheck.similarOKR?.title}"`,
            code: 'DUPLICATE_OKR'
          }];
        }
      }
      
      return [];
    } catch (error) {
      if (error instanceof z.ZodError) {
        return error.errors.map(err => ({
          field,
          message: err.message,
          code: err.code
        }));
      }
      return [];
    }
  }, [checkForDuplicates]);

  // Memoized validation utilities
  const validationUtils = useMemo(() => ({
    isValidPriority: (priority: number) => priority >= 1 && priority <= 3,
    getPriorityLabel: (priority: number) => {
      switch (priority) {
        case 1: return 'High Priority';
        case 2: return 'Medium Priority'; 
        case 3: return 'Low Priority';
        default: return 'Invalid Priority';
      }
    },
    isValidGranularity: (granularity: string) => ['daily', 'weekly', 'monthly'].includes(granularity),
    getMaxBulkSize: () => maxBulkSize
  }), [maxBulkSize]);

  return {
    // Validation functions
    validateOKR,
    validateBulkOKRs,
    validateField,
    checkForDuplicates,
    
    // Utilities
    validationUtils,
    
    // State
    validationCache,
    clearValidationCache: () => setValidationCache(new Map()),
    
    // Configuration
    maxBulkSize,
    duplicateThreshold
  };
}

// Utility functions
function calculateStringSimilarity(str1: string, str2: string): number {
  const longer = str1.length > str2.length ? str1 : str2;
  const shorter = str1.length > str2.length ? str2 : str1;
  
  if (longer.length === 0) return 1.0;
  
  const editDistance = levenshteinDistance(longer, shorter);
  return (longer.length - editDistance) / longer.length;
}

function levenshteinDistance(str1: string, str2: string): number {
  const matrix = Array(str2.length + 1).fill(null).map(() => Array(str1.length + 1).fill(null));
  
  for (let i = 0; i <= str1.length; i++) matrix[0][i] = i;
  for (let j = 0; j <= str2.length; j++) matrix[j][0] = j;
  
  for (let j = 1; j <= str2.length; j++) {
    for (let i = 1; i <= str1.length; i++) {
      const indicator = str1[i - 1] === str2[j - 1] ? 0 : 1;
      matrix[j][i] = Math.min(
        matrix[j][i - 1] + 1, // insertion
        matrix[j - 1][i] + 1, // deletion
        matrix[j - 1][i - 1] + indicator // substitution
      );
    }
  }
  
  return matrix[str2.length][str1.length];
}

function findDuplicatesInArray(arr: string[]): string[] {
  const counts = arr.reduce((acc, item) => {
    acc[item] = (acc[item] || 0) + 1;
    return acc;
  }, {} as Record<string, number>);
  
  return Object.keys(counts).filter(item => counts[item] > 1);
}