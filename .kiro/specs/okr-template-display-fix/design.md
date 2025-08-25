# Design Document

## Overview

The OKR template display issue stems from a mismatch between the industry filtering logic and the data structure in the database. The system is failing to display templates because of inconsistent industry slug handling between the `industries` table and the `okr_master` table. The database contains valid templates (20 active templates confirmed), but the frontend filtering mechanism is not properly matching industry slugs.

## Architecture

### Current System Flow
1. User navigates to create OKR page
2. `OKRCreationView` component loads with brand context
3. `useOKRTemplates` hook fetches templates based on industry slug
4. Templates should display in `OKRTemplateGrid` component

### Problem Analysis
Based on the test results and code analysis:
- Database contains 20 active OKR templates across industries: fitness (6), supplements (4), bakery (2), general (5), activewear (3)
- The `industries` table has proper slugs: "fitness", "technology", "healthcare", etc.
- The `okr_master` table stores industry values that may not match the `industries.slug` format
- The `useOKRTemplates` hook filters by `industrySlug` but there's a potential mismatch

### Root Cause
The issue is in the industry slug mapping between:
1. `brands.industry_id` → `industries.slug` (e.g., "fitness")
2. `okr_master.industry` field (stores string values that may not match slugs)

## Components and Interfaces

### Data Flow Debugging Components

#### 1. Enhanced Logging System
```typescript
interface TemplateDebugInfo {
  industrySlug: string | null;
  brandIndustry: Industry | null;
  queryParams: {
    table: string;
    filter: string;
    value: string | null;
  };
  results: {
    totalFound: number;
    templates: OKRTemplate[];
  };
  timestamp: string;
}
```

#### 2. Template Loading State Management
```typescript
interface TemplateLoadingState {
  isLoading: boolean;
  hasError: boolean;
  errorMessage: string | null;
  debugInfo: TemplateDebugInfo | null;
  fallbackAttempted: boolean;
}
```

### Fixed Data Fetching Logic

#### 1. Industry Slug Resolution
```typescript
interface IndustryResolution {
  selectedIndustrySlug: string | null;
  brandIndustrySlug: string | null;
  finalQuerySlug: string | null;
  resolutionMethod: 'selected' | 'brand' | 'all' | 'fallback';
}
```

#### 2. Template Query Strategy
```typescript
interface TemplateQueryStrategy {
  primary: {
    method: 'exact_match';
    field: 'industry';
    value: string;
  };
  fallback: {
    method: 'contains_match' | 'all_templates';
    field?: string;
    value?: string;
  };
}
```

## Data Models

### Enhanced Template Interface
```typescript
interface OKRTemplateWithDebug extends OKRTemplate {
  debugInfo?: {
    sourceIndustry: string;
    matchedBy: 'exact' | 'contains' | 'fallback';
    queryTimestamp: string;
  };
}
```

### Template Loading Response
```typescript
interface TemplateLoadingResponse {
  templates: OKRTemplate[];
  metadata: {
    totalAvailable: number;
    filteredBy: string | null;
    queryMethod: string;
    executionTime: number;
  };
  debugInfo: TemplateDebugInfo;
}
```

## Error Handling

### Cascading Fallback Strategy
1. **Primary Query**: Filter by exact industry slug match
2. **Fallback 1**: Filter by industry name contains match
3. **Fallback 2**: Load all active templates regardless of industry
4. **Fallback 3**: Display empty state with clear error message

### Error State Management
```typescript
interface TemplateErrorState {
  level: 'warning' | 'error' | 'critical';
  message: string;
  technicalDetails: string;
  suggestedAction: string;
  retryAvailable: boolean;
}
```

### User-Friendly Error Messages
- **No Templates Found**: "No templates available for [Industry]. Showing all available templates instead."
- **Loading Error**: "Unable to load templates. Please check your connection and try again."
- **Permission Error**: "You don't have access to templates for this industry."

## Testing Strategy

### Debug Mode Implementation
```typescript
interface DebugMode {
  enabled: boolean;
  logLevel: 'verbose' | 'normal' | 'minimal';
  showQueryDetails: boolean;
  showFallbackAttempts: boolean;
  displayRawData: boolean;
}
```

### Test Scenarios
1. **Industry Match Test**: Verify templates load for known industries (fitness, technology, etc.)
2. **Fallback Test**: Verify fallback behavior when no exact matches found
3. **Empty State Test**: Verify proper empty state display when no templates exist
4. **Error Recovery Test**: Verify system recovers from API failures
5. **Performance Test**: Verify template loading completes within 2 seconds

### Debugging Tools
1. **Console Logging**: Detailed query parameters and results
2. **Network Tab**: Verify Supabase queries are executing correctly
3. **Component State**: Display loading states and error conditions
4. **Data Validation**: Verify template data structure matches interface

## Implementation Approach

### Phase 1: Immediate Fix (Debug and Identify)
1. Add comprehensive logging to `useOKRTemplates` hook
2. Implement debug mode in `OKRCreationView`
3. Add fallback query strategies
4. Display debug information in development mode

### Phase 2: Data Consistency (Normalize Industry Values)
1. Audit `okr_master.industry` values against `industries.slug`
2. Create data migration script if needed
3. Add database constraints to ensure consistency
4. Update template creation process to use proper slugs

### Phase 3: Enhanced UX (Improved Error Handling)
1. Implement cascading fallback strategy
2. Add retry mechanisms with exponential backoff
3. Improve loading states and error messages
4. Add template search and filtering capabilities

### Phase 4: Monitoring (Production Readiness)
1. Add error tracking and analytics
2. Implement performance monitoring
3. Create alerting for template loading failures
4. Add user feedback collection for template relevance

## Technical Specifications

### Database Query Optimization
```sql
-- Primary query with exact match
SELECT * FROM okr_master 
WHERE industry = $1 AND is_active = true
ORDER BY priority_level ASC, category ASC;

-- Fallback query with pattern match
SELECT * FROM okr_master 
WHERE industry ILIKE '%' || $1 || '%' AND is_active = true
ORDER BY priority_level ASC, category ASC;

-- Final fallback - all active templates
SELECT * FROM okr_master 
WHERE is_active = true
ORDER BY priority_level ASC, category ASC;
```

### Frontend State Management
```typescript
// Enhanced hook with fallback logic
export function useOKRTemplatesWithFallback(industrySlug?: string) {
  const [state, setState] = useState<TemplateLoadingState>({
    isLoading: false,
    hasError: false,
    errorMessage: null,
    debugInfo: null,
    fallbackAttempted: false
  });
  
  // Implementation with cascading queries
}
```

### Component Integration
```typescript
// Enhanced template grid with debug info
<OKRTemplateGrid
  templates={templates}
  isLoading={isLoading}
  error={error}
  debugMode={process.env.NODE_ENV === 'development'}
  onRetry={refetch}
  fallbackMessage={fallbackMessage}
/>
```

This design addresses the core issue through systematic debugging, fallback strategies, and improved error handling while maintaining the existing component architecture.