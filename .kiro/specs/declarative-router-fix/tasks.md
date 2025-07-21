# Implementation Plan

- [x] 1. Update BaseRouteConfig interface for flexibility

  - Extend BaseRouteConfig to allow additional properties using index signature
  - Ensure type compatibility with test configurations that include `view` and `handler` properties
  - Maintain type safety while allowing custom route properties
  - _Requirements: 2.3_

- [x] 2. Enhance constructor to accept both array and object formats

  - Add constructor overload to accept both `T[]` and `Record<string, T>` formats
  - Implement format detection logic to determine input type
  - Convert array format to object format internally using index-based keys
  - Ensure backward compatibility with existing object format usage
  - _Requirements: 2.1, 2.2, 2.3_

- [x] 3. Handle empty routes gracefully


  - Modify `_compile` method to handle empty route arrays/objects for testing
  - Return null from match method when no routes are configured
  - Remove or modify the "no routes specified" error for testing scenarios
  - _Requirements: 1.4, 2.4_

- [-] 4. Fix regex compilation to use valid capture group names
  - Update the `_compile` method to generate valid JavaScript regex patterns
  - Replace numeric capture group names with string-based names using `route_` prefix
  - Create mapping between capture group names and route names for lookup
  - Update `_matchRoute` method to work with new capture group structure
  - _Requirements: 1.1, 1.2, 1.3_

- [ ] 5. Add public match method for testing

  - Create public `match` method that exposes route matching functionality
  - Implement MatchResult interface to return comprehensive match information
  - Include path, params, search, and hash in match results
  - Ensure method works independently of browser navigation state
  - _Requirements: 3.1, 3.2, 3.3, 3.4_

- [ ] 6. Fix test file to use new interfaces

  - Update test imports and Router constructor calls to use proper formats
  - Replace `testMatch` utility with calls to new public `match` method
  - Fix route configuration objects to match expected interface
  - Update test expectations to work with new match result format
  - _Requirements: 3.1, 3.2, 3.3, 3.4_

- [ ] 7. Verify all tests pass
  - Run the test suite to ensure all previously failing tests now pass
  - Fix any remaining type errors or runtime issues
  - Validate that route matching works correctly for all test cases
  - Ensure parameter extraction and regex validation work as expected
  - _Requirements: 1.1, 1.2, 1.3, 2.1, 2.2, 3.1, 3.2, 4.1, 4.2, 4.3, 4.4, 4.5_
