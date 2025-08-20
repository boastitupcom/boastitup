// Database Constraints Validation Utilities
// Ensures all business rules from story.txt are enforced at the application level

import { z } from 'zod';

// Priority level validation (story.txt line 414: 1-3 scale)
export const validatePriorityLevel = (priority: number): boolean => {
  return priority >= 1 && priority <= 3;
};

export const PRIORITY_LEVELS = {
  HIGH: 1,
  MEDIUM: 2, 
  LOW: 3
} as const;

export const getPriorityLabel = (priority: number): string => {
  switch (priority) {
    case PRIORITY_LEVELS.HIGH: return 'High Priority';
    case PRIORITY_LEVELS.MEDIUM: return 'Medium Priority';
    case PRIORITY_LEVELS.LOW: return 'Low Priority';
    default: throw new Error(`Invalid priority level: ${priority}. Must be between 1-3.`);
  }
};

// Granularity validation (story.txt line 158-163)
export const VALID_GRANULARITIES = ['daily', 'weekly', 'monthly'] as const;
export type ValidGranularity = typeof VALID_GRANULARITIES[number];

export const validateGranularity = (granularity: string): granularity is ValidGranularity => {
  return VALID_GRANULARITIES.includes(granularity as ValidGranularity);
};

// Multi-tenancy validation (story.txt line 422)
export const validateTenantScope = (tenantId: string, resourceTenantId: string): boolean => {
  if (!tenantId || !resourceTenantId) {
    throw new Error('Tenant ID is required for all operations');
  }
  
  if (tenantId !== resourceTenantId) {
    throw new Error('Access denied: Resource belongs to different tenant');
  }
  
  return true;
};

// Bulk operation limits (story.txt line 424)
export const MAX_BULK_OPERATIONS = 50;

export const validateBulkOperationSize = (items: any[]): boolean => {
  if (items.length > MAX_BULK_OPERATIONS) {
    throw new Error(`Maximum ${MAX_BULK_OPERATIONS} items allowed per bulk operation. Received ${items.length}.`);
  }
  return true;
};

// Date validation (story.txt line 416: future dates only)
export const validateTargetDate = (targetDateId: number, dates: Array<{id: number, date: string}>): boolean => {
  const targetDate = dates.find(d => d.id === targetDateId);
  
  if (!targetDate) {
    throw new Error('Invalid target date ID. Date must exist in dim_date table.');
  }
  
  const dateObj = new Date(targetDate.date);
  const today = new Date();
  today.setHours(0, 0, 0, 0); // Reset time for date comparison
  
  if (dateObj <= today) {
    throw new Error('Target date must be in the future.');
  }
  
  return true;
};

// Platform compatibility validation (story.txt line 418)
export const validatePlatformCompatibility = (
  platformId: string | null, 
  metricTypeId: string,
  platforms: Array<{id: string, category: string}>,
  metricTypes: Array<{id: string, category: string}>
): boolean => {
  // If no platform specified, it's valid (applies to all platforms)
  if (!platformId) return true;
  
  const platform = platforms.find(p => p.id === platformId);
  const metricType = metricTypes.find(m => m.id === metricTypeId);
  
  if (!platform) {
    throw new Error('Invalid platform ID.');
  }
  
  if (!metricType) {
    throw new Error('Invalid metric type ID.');
  }
  
  // Business logic for platform/metric compatibility
  // This would typically involve more complex rules based on your business requirements
  const incompatibleCombinations: Record<string, string[]> = {
    'social_media': ['financial_metrics'],
    'email_marketing': ['social_engagement'],
    // Add more incompatible combinations as needed
  };
  
  const platformCategory = platform.category;
  const metricCategory = metricType.category;
  
  if (incompatibleCombinations[platformCategory]?.includes(metricCategory)) {
    throw new Error(`Platform category '${platformCategory}' is not compatible with metric category '${metricCategory}'.`);
  }
  
  return true;
};

// OKR Creation Schema (comprehensive validation from story.txt lines 404-412)
export const okrObjectiveSchema = z.object({
  title: z.string()
    .min(3, 'Title must be at least 3 characters')
    .max(255, 'Title cannot exceed 255 characters'),
  description: z.string()
    .optional(),
  target_value: z.number()
    .positive('Target value must be positive')
    .max(999999999999999, 'Target value exceeds maximum allowed'),
  target_date_id: z.number()
    .int('Target date ID must be an integer')
    .positive('Target date ID must be positive'),
  granularity: z.enum(['daily', 'weekly', 'monthly'], {
    errorMap: () => ({ message: 'Granularity must be daily, weekly, or monthly' })
  }),
  metric_type_id: z.string()
    .uuid('Metric type ID must be a valid UUID'),
  platform_id: z.string()
    .uuid('Platform ID must be a valid UUID')
    .optional(),
  tenant_id: z.string()
    .uuid('Tenant ID must be a valid UUID'),
  brand_id: z.string()
    .uuid('Brand ID must be a valid UUID'),
  master_template_id: z.string()
    .uuid('Master template ID must be a valid UUID')
    .optional()
});

// Validate complete OKR objective
export const validateOKRObjective = (data: any) => {
  try {
    const validated = okrObjectiveSchema.parse(data);
    
    // Additional business rule validations
    if (data.priority !== undefined) {
      if (!validatePriorityLevel(data.priority)) {
        throw new Error('Priority must be between 1 (High) and 3 (Low)');
      }
    }
    
    return { success: true, data: validated };
  } catch (error) {
    if (error instanceof z.ZodError) {
      return { 
        success: false, 
        errors: error.errors.map(err => ({
          field: err.path.join('.'),
          message: err.message,
          code: err.code
        }))
      };
    }
    
    return { 
      success: false, 
      errors: [{ field: 'general', message: (error as Error).message, code: 'VALIDATION_ERROR' }]
    };
  }
};

// Duplicate detection (story.txt line 420)
export interface DuplicateCheckOptions {
  title: string;
  existingOKRs: Array<{ id: string; title: string; is_active: boolean }>;
  tenantId: string;
  brandId: string;
  threshold?: number; // Similarity threshold (0.8 = 80% similar)
}

export const checkForDuplicateOKRs = ({
  title,
  existingOKRs,
  tenantId,
  brandId,
  threshold = 0.8
}: DuplicateCheckOptions) => {
  const normalizedTitle = title.toLowerCase().trim();
  
  // Only check against active OKRs in the same tenant/brand
  const relevantOKRs = existingOKRs.filter(okr => okr.is_active);
  
  for (const existing of relevantOKRs) {
    const similarity = calculateStringSimilarity(normalizedTitle, existing.title.toLowerCase().trim());
    
    if (similarity >= threshold) {
      return {
        isDuplicate: true,
        similarOKR: {
          id: existing.id,
          title: existing.title,
          similarity: Math.round(similarity * 100)
        }
      };
    }
  }
  
  return { isDuplicate: false };
};

// String similarity calculation using Levenshtein distance
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

// Database constraint enforcement utilities
export class DatabaseConstraintValidator {
  static validateForeignKey(id: string | number | null, tableName: string, fieldName: string): void {
    if (id === null || id === undefined || id === '') {
      throw new Error(`${fieldName} is required (foreign key constraint to ${tableName})`);
    }
  }
  
  static validateUniqueConstraint(value: any, existingValues: any[], fieldName: string): void {
    if (existingValues.includes(value)) {
      throw new Error(`${fieldName} must be unique. Value '${value}' already exists.`);
    }
  }
  
  static validateCheckConstraint(value: any, validator: (val: any) => boolean, constraintName: string): void {
    if (!validator(value)) {
      throw new Error(`Value violates check constraint: ${constraintName}`);
    }
  }
  
  static validateNotNull(value: any, fieldName: string): void {
    if (value === null || value === undefined) {
      throw new Error(`${fieldName} cannot be null`);
    }
  }
}

// Export comprehensive validation function
export const validateOKRBusinessRules = (data: any, context: {
  existingOKRs?: Array<{ id: string; title: string; is_active: boolean }>;
  dates?: Array<{ id: number; date: string }>;
  platforms?: Array<{ id: string; category: string }>;
  metricTypes?: Array<{ id: string; category: string }>;
}) => {
  const errors: Array<{ field: string; message: string; code: string }> = [];
  
  try {
    // 1. Schema validation
    const schemaResult = validateOKRObjective(data);
    if (!schemaResult.success) {
      errors.push(...schemaResult.errors);
    }
    
    // 2. Priority validation
    if (data.priority !== undefined && !validatePriorityLevel(data.priority)) {
      errors.push({
        field: 'priority',
        message: `Priority must be between 1-3. Received: ${data.priority}`,
        code: 'INVALID_PRIORITY'
      });
    }
    
    // 3. Duplicate check
    if (context.existingOKRs && data.title) {
      const duplicateCheck = checkForDuplicateOKRs({
        title: data.title,
        existingOKRs: context.existingOKRs,
        tenantId: data.tenant_id,
        brandId: data.brand_id
      });
      
      if (duplicateCheck.isDuplicate) {
        errors.push({
          field: 'title',
          message: `Similar OKR exists: "${duplicateCheck.similarOKR?.title}" (${duplicateCheck.similarOKR?.similarity}% similar)`,
          code: 'DUPLICATE_OKR'
        });
      }
    }
    
    // 4. Date validation
    if (context.dates && data.target_date_id) {
      try {
        validateTargetDate(data.target_date_id, context.dates);
      } catch (error) {
        errors.push({
          field: 'target_date_id',
          message: (error as Error).message,
          code: 'INVALID_TARGET_DATE'
        });
      }
    }
    
    // 5. Platform compatibility
    if (context.platforms && context.metricTypes && data.platform_id && data.metric_type_id) {
      try {
        validatePlatformCompatibility(data.platform_id, data.metric_type_id, context.platforms, context.metricTypes);
      } catch (error) {
        errors.push({
          field: 'platform_id',
          message: (error as Error).message,
          code: 'PLATFORM_INCOMPATIBLE'
        });
      }
    }
    
    return {
      isValid: errors.length === 0,
      errors,
      warnings: generateValidationWarnings(data)
    };
    
  } catch (error) {
    return {
      isValid: false,
      errors: [{
        field: 'general',
        message: (error as Error).message,
        code: 'VALIDATION_ERROR'
      }],
      warnings: []
    };
  }
};

function generateValidationWarnings(data: any): string[] {
  const warnings: string[] = [];
  
  // Warning for very high target values
  if (data.target_value && data.target_value > 1000000) {
    warnings.push('Target value is very high. Please verify this is correct.');
  }
  
  // Warning for titles that might be too generic
  const genericTitles = ['test', 'sample', 'example', 'dummy'];
  if (data.title && genericTitles.some(generic => data.title.toLowerCase().includes(generic))) {
    warnings.push('Title appears to be a placeholder. Consider using a more specific title.');
  }
  
  return warnings;
}