# Design Document

## Overview

The declarative router fix will address four critical issues: invalid regex capture group names, constructor signature mismatches, missing test methods, and type system inconsistencies. The solution will maintain backward compatibility while fixing the core functionality.

## Architecture

The fix involves three main components:
1. **Regex Compilation Engine**: Fix the `_compile` method to generate valid JavaScript regular expressions
2. **Constructor Interface**: Update constructor to handle both array and object route formats
3. **Testing Interface**: Add a public method for testing route matching functionality

## Components and Interfaces

### 1. Regex Compilation Fix

**Problem**: Current implementation uses numeric capture group names like `(?<0>...)` which are invalid in JavaScript.

**Solution**: Use valid string-based capture group names:
```typescript
// Current (broken):
mappings.push(`(?<${name}>${compiledRoute.mapping})`);

// Fixed:
mappings.push(`(?<route_${index}>${compiledRoute.mapping})`);
```

The system will:
- Generate unique, valid capture group names using `route_` prefix and index
- Maintain a mapping between capture group names and route names
- Update the matching logic to use the new capture group structure

### 2. Constructor Interface Enhancement

**Problem**: Tests expect array format but constructor only accepts Record format.

**Solution**: Overload constructor to accept both formats:
```typescript
constructor(routes: T[] | Record<string, T> = {}, options: RouterOptions<T, C> = {})
```

The system will:
- Detect input format (array vs object)
- Convert array format to object format internally using index-based keys
- Preserve all existing functionality for object format

### 3. Testing Interface Addition

**Problem**: Tests try to access private `_match` method that doesn't exist.

**Solution**: Add public `match` method for testing:
```typescript
public match(path: string, search: Record<string, string> = {}, hash: string = ""): MatchResult<T> | null
```

The system will:
- Expose route matching functionality for testing
- Return comprehensive match results including route, params, search, and hash
- Maintain separation between internal matching logic and public testing interface

### 4. Type System Fixes

**Problem**: Tests use properties not defined in BaseRouteConfig interface.

**Solution**: Extend BaseRouteConfig to be more flexible:
```typescript
interface BaseRouteConfig {
  path: string;
  hooks?: Hook<BaseRouteConfig, any>[];
  redirect?: string;
  [key: string]: any; // Allow additional properties
}
```

## Data Models

### MatchResult Interface
```typescript
interface MatchResult<T extends BaseRouteConfig> {
  route: CompiledRoute<T>;
  params: Record<string, string>;
  path: string;
  search: Record<string, string>;
  hash: string;
}
```

### RouteMapping Interface
```typescript
interface RouteMapping {
  name: string;
  captureGroupName: string;
  route: CompiledRoute<T>;
}
```

## Error Handling

1. **Regex Compilation Errors**: Catch and provide meaningful error messages for malformed paths
2. **Empty Routes**: Handle empty route arrays/objects gracefully for testing scenarios
3. **Invalid Capture Groups**: Validate capture group names before regex compilation
4. **Type Mismatches**: Provide clear error messages for invalid route configurations

## Testing Strategy

1. **Unit Tests**: Fix existing tests to work with new interfaces
2. **Integration Tests**: Ensure router works in browser environment
3. **Regression Tests**: Verify all existing functionality still works
4. **Edge Case Tests**: Test empty routes, malformed paths, and boundary conditions

The testing approach will:
- Use the new public `match` method for testing
- Verify regex compilation produces valid expressions
- Test both array and object constructor formats
- Validate parameter extraction and route matching logic