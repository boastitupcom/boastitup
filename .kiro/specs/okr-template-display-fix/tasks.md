# Implementation Plan

- [x] 1. Add comprehensive debugging to useOKRTemplates hook


  - Add detailed console logging for query parameters and results
  - Log industry slug resolution process and fallback attempts
  - Add timing measurements for performance monitoring
  - Create debug state interface for development mode visibility
  - _Requirements: 3.1, 3.2, 3.3, 3.4, 3.5_



- [ ] 2. Implement cascading fallback query strategy
  - Modify useOKRTemplates to try exact industry slug match first
  - Add fallback query for partial industry name matching using ILIKE
  - Add final fallback to load all active templates when no matches found


  - Track which query method successfully returned results
  - _Requirements: 1.1, 1.4, 2.1, 2.4_

- [ ] 3. Add error boundary and retry mechanism
  - Implement exponential backoff retry logic for failed queries


  - Add error state management with user-friendly messages
  - Create retry button component for manual retry attempts
  - Add network error detection and appropriate fallback behavior
  - _Requirements: 1.3, 1.4, 2.2, 3.1_



- [ ] 4. Enhance OKRTemplateGrid with debug and error states
  - Add debug mode prop to display query information in development
  - Implement improved empty state with industry-specific messaging
  - Add loading skeleton states with proper accessibility
  - Create error display component with retry functionality


  - _Requirements: 1.2, 1.5, 4.1, 4.2_

- [ ] 5. Fix industry slug resolution in OKRCreationView
  - Debug the industry slug passing from brand context to useOKRTemplates
  - Add logging to track selectedIndustryId and brandIndustry resolution


  - Ensure proper fallback when brand industry is not set
  - Add validation for industry slug format consistency
  - _Requirements: 1.1, 2.4, 4.3_

- [x] 6. Create database query validation script


  - Write test script to validate okr_master.industry values against industries.slug
  - Identify any data inconsistencies between tables
  - Create mapping of existing industry values to proper slugs
  - Generate report of templates that may not be matching due to slug issues
  - _Requirements: 3.4, 4.4_



- [ ] 7. Add template loading performance monitoring
  - Implement timing measurements for template fetch operations
  - Add metrics for fallback query usage and success rates
  - Create performance alerts for slow template loading (>2 seconds)
  - Log template count and filtering effectiveness metrics
  - _Requirements: 2.1, 2.3, 3.2_

- [ ] 8. Implement comprehensive error logging
  - Add structured error logging with context information
  - Log Supabase query errors with full error details
  - Track user actions that lead to template loading failures
  - Create error categorization for different failure types
  - _Requirements: 3.1, 3.2, 3.3, 3.5_

- [ ] 9. Add unit tests for template loading logic
  - Test useOKRTemplates hook with various industry slug inputs
  - Test fallback behavior when primary queries fail
  - Test error handling and retry mechanisms
  - Mock Supabase responses for consistent testing
  - _Requirements: 1.1, 1.2, 1.3, 2.2_

- [ ] 10. Create development debugging tools
  - Add debug panel component for development mode
  - Display current query parameters and results in UI
  - Add manual query testing interface for developers
  - Create template data validation and consistency checker
  - _Requirements: 3.1, 3.2, 3.4, 4.4_