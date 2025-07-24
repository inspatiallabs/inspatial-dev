# InSpatial Trigger Tests

This directory contains comprehensive tests for the InSpatial Trigger System, which is a key component of the Interact - (InSpatial State x Trigger) management system.

## Overview

The Trigger System provides a cross-platform event handling mechanism with automatic mapping and transformation capabilities. Our tests validate all core functionality of this system.

## Test Structure

We've implemented tests in several key areas:

1. **Registry Tests** (`trigger-registry.test.ts`)
   - Tests for trigger registration
   - Tests for trigger lookup/retrieval
   - Tests for platform compatibility
   - Tests for built-in triggers

2. **Creation and Activation Tests** (`trigger-creation.test.ts`)
   - Tests for trigger creation
   - Tests for trigger activation
   - Tests for state transitions via triggers
   - Tests for error handling

3. **Connection Tests** (`trigger-connection.test.ts`)
   - Tests for connecting triggers to state
   - Tests for conditional activation
   - Tests for payload transformation
   - Tests for batched updates

4. **Bridge Tests** (`trigger-bridge.test.ts`)
   - Tests for event propagation
   - Tests for cross-platform event mapping
   - Tests for adapter integration
   - Tests for error resilience

5. **Monitoring Tests** (`trigger-monitoring.test.ts`)
   - Tests for performance tracking
   - Tests for error tracking
   - Tests for usage statistics

## Running the Tests

To run all trigger tests:

```bash
deno task test:trigger
```

To run trigger tests with coverage reporting:

```bash
deno task test:trigger:coverage
```

## Test Development

Our tests were developed following Test-Driven Development (TDD) principles:

1. **Red Phase**: Write failing tests first
2. **Green Phase**: Implement code to make tests pass
3. **Refactor Phase**: Clean up code while maintaining passing tests

When adding new functionality to the Trigger System, start by adding tests to validate the desired behavior before implementation.

## Test Coverage

We aim for high test coverage of the Trigger System. Current coverage metrics:

- **Function Coverage**: Target 85%+
- **Branch Coverage**: Target 80%+
- **Line Coverage**: Target 90%+

To view detailed coverage information, run the coverage command and check the generated report.

## Integration with State

The Trigger System is closely integrated with the Interact - (InSpatial State x Trigger) management system. Several tests validate this integration to ensure they work together seamlessly.

## License

InSpatial Trigger System is released under the Apache 2.0 License. 