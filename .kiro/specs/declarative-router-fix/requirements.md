# Requirements Document

## Introduction

This feature will fix the critical issues in the declarative router implementation that are causing all tests to fail. The router currently has regex compilation errors, incorrect constructor signatures, missing methods, and type mismatches that prevent it from functioning properly.

## Requirements

### Requirement 1

**User Story:** As a developer, I want the declarative router to compile valid regular expressions, so that route matching works correctly without syntax errors.

#### Acceptance Criteria

1. WHEN the router compiles route mappings THEN the system SHALL generate valid JavaScript regular expressions
2. WHEN using named capture groups THEN the system SHALL use valid capture group names (not numeric)
3. WHEN multiple routes are defined THEN the system SHALL create a single regex that can match all routes
4. IF no routes are specified THEN the system SHALL handle this gracefully without throwing compilation errors

### Requirement 2

**User Story:** As a developer, I want the router constructor to accept the expected input format, so that I can create router instances with my route configurations.

#### Acceptance Criteria

1. WHEN creating a router with an array of routes THEN the system SHALL accept this format
2. WHEN creating a router with a record object of routes THEN the system SHALL accept this format
3. WHEN route configurations include custom properties THEN the system SHALL preserve these properties
4. WHEN no routes are provided THEN the system SHALL create an empty router that can be used for testing

### Requirement 3

**User Story:** As a developer, I want to test the router's matching functionality, so that I can verify routes work correctly before deployment.

#### Acceptance Criteria

1. WHEN testing route matching THEN the system SHALL provide a testable match method
2. WHEN a path matches a route THEN the system SHALL return the matched route and extracted parameters
3. WHEN a path doesn't match any route THEN the system SHALL return null or appropriate fallback
4. WHEN testing with search parameters and hash THEN the system SHALL include these in the match result

### Requirement 4

**User Story:** As a developer, I want the router to handle various route patterns correctly, so that I can define flexible routing rules for my application.

#### Acceptance Criteria

1. WHEN defining exact path routes THEN the system SHALL match only exact paths
2. WHEN defining parameterized routes THEN the system SHALL extract parameters correctly
3. WHEN defining regex-constrained parameters THEN the system SHALL validate parameters against the regex
4. WHEN defining catch-all routes THEN the system SHALL match any unmatched paths
5. WHEN multiple routes could match THEN the system SHALL respect route definition order