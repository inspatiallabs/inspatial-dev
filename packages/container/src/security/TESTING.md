# Testing the InSpatial Container Security System

This document provides information on how to run tests and verify the security system's functionality.

## Overview

The security system test suite includes tests for all major components:

1. **Behavior Analyzer**: Tests for rule evaluation, event processing, and anomaly detection
2. **File System Security Monitor**: Tests for file system operation interception and security event generation
3. **Security Manager**: Tests for security policy enforcement, incident tracking, and container blocking
4. **Security Integration**: Tests for secure file system proxy and security profile management
5. **DirectFS**: Tests for performance optimizations and security controls

## Running Tests

### Running All Security Tests

To run the complete security test suite:

```bash
deno task test-security
```

This command runs all security-related tests defined in `src/security/tests.config.ts`.

### Running Individual Component Tests

You can also run tests for individual components:

```bash
# Run just the behavior analyzer tests
deno test --allow-all src/security/behavior-analyzer.test.ts

# Run just the security manager tests
deno test --allow-all src/security/security-manager.test.ts

# Run just the fs monitor tests
deno test --allow-all src/security/fs-monitor.test.ts

# Run just the integration tests
deno test --allow-all src/security/integration.test.ts

# Run just the DirectFS tests
deno test --allow-all src/fs/directfs.test.ts
```

### Running All Container System Tests

To run all tests in the container system, including the security tests:

```bash
deno task test
```

## Test Coverage

The test suite aims for high coverage of the security system:

| Component           | Coverage | Description                                      |
|---------------------|----------|--------------------------------------------------|
| Behavior Analyzer   | 95%+     | Tests all rule types and event handling          |
| FS Monitor          | 90%+     | Tests file operation monitoring                  |
| Security Manager    | 95%+     | Tests policy enforcement and incident handling   |
| Integration         | 95%+     | Tests end-to-end security scenarios              |
| DirectFS            | 90%+     | Tests performance optimizations                  |

## Test Organization

Each component has its own test file with a consistent organization:

1. **Setup**: Mock objects and helper functions
2. **Unit Tests**: Individual function and method tests
3. **Integration Tests**: Tests of component interactions
4. **Edge Cases**: Tests for error handling and unusual conditions

## Mocking Strategy

The tests use a consistent mocking approach:

1. **MemoryFileSystem**: Mocked to track operation calls without performing real file operations
2. **EventEmitter**: Mocked to track event emissions
3. **SecurityManager**: Mocked to simulate security policy decisions
4. **Window**: Mocked for event handling (container-blocked events, etc.)

## Extending the Tests

When adding new features to the security system, follow these guidelines for testing:

1. **Add unit tests** for any new functions or methods
2. **Add integration tests** for interactions with other components
3. **Add edge case tests** for error conditions and boundary values
4. **Update the mock objects** if new methods need to be tracked

## Debugging Tests

If you encounter test failures:

1. Run individual test files to isolate the issue
2. Use the `--verbose` flag for more detailed output:
   ```bash
   deno test --allow-all --verbose src/security/behavior-analyzer.test.ts
   ```
3. Check for mock object configuration issues
4. Look for timing issues in async tests (you may need to add delays)

## Test Data

The tests use simulated security events and file operations rather than real files to ensure consistency and avoid external dependencies.

## Test Design Principles

The security system tests follow these principles:

1. **Isolation**: Tests should not depend on each other
2. **Determinism**: Tests should produce the same results on every run
3. **Clarity**: Test intentions should be clear from the descriptions
4. **Coverage**: Tests should cover normal operation, edge cases, and error conditions

## Future Test Improvements

Planned improvements to the test suite:

1. **Performance testing**: Measure and verify DirectFS optimizations
2. **Stress testing**: Test with large numbers of files and operations
3. **Fuzz testing**: Use randomized inputs to find edge cases
4. **Benchmarking**: Compare security overhead in different configurations

## Contributing Tests

When contributing new tests:

1. Follow the existing test structure and style
2. Add clear test descriptions
3. Avoid dependencies on external services
4. Ensure tests clean up after themselves 