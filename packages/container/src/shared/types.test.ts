/**
 * Tests for core container system types
 */

import { expect, test } from "@inspatial/test"
import {
  ContainerConfigType,
  ContainerEventType,
  ContainerExecutionResultType,
  ContainerRuntimeInfoType,
  ContainerStateType,
  SecurityContextType,
  StateSyncConfigType,
} from "./types.ts"

test("ContainerConfigType validates correct input", () => {
  const validConfig = {
    name: "test-container",
    environment: { type: "client" },
    resources: {
      cpu: 2,
      memory: 512,
      diskSpace: 1024,
    },
    timeout: 30000,
    metadata: {
      owner: "test-user",
      project: "test-project",
    },
  }

  const result = ContainerConfigType(validConfig)
  expect(result).not.toBeInstanceOf(Error)
  expect(result).toEqual(validConfig)
})

test("ContainerConfigType rejects invalid input", () => {
  const invalidConfig = {
    // Missing required 'name' field
    environment: { type: "client" },
    resources: {
      cpu: "invalid-cpu", // Should be a number
      memory: 512,
    },
  }

  const result = ContainerConfigType(invalidConfig)
  // Check that result has error-like properties
  const resultObj = result as any
  expect(resultObj.count > 0 || resultObj.errors?.length > 0).toBe(true)
})

test("ContainerStateType validates correct states", () => {
  const validStates = [
    { state: "creating" },
    { state: "running" },
    { state: "suspended" },
    { state: "resuming" },
    { state: "terminating" },
    { state: "terminated" },
    { state: "failed" },
  ]

  for (const state of validStates) {
    const result = ContainerStateType(state)
    expect(result).not.toBeInstanceOf(Error)
    expect(result).toEqual(state)
  }
})

test("ContainerStateType rejects invalid states", () => {
  const invalidStates = [
    { state: "invalid-state" },
    { state: 123 },
    { state: null },
    {},
  ]

  for (const state of invalidStates) {
    const result = ContainerStateType(state)
    // Check that result has error-like properties
    const resultObj = result as any
    expect(resultObj.count > 0 || resultObj.errors?.length > 0).toBe(true)
  }
})

test("ContainerRuntimeInfoType validates correct runtime info", () => {
  const validRuntimeInfo = {
    id: "test-container-123",
    config: {
      name: "test-container",
      environment: { type: "client" },
    },
    state: { state: "running" },
    startTime: 1625097600000,
    endTime: 1625097900000,
    stats: {
      cpuUsage: 25.5,
      memoryUsage: 256,
      networkIn: 1024,
      networkOut: 2048,
    },
  }

  const result = ContainerRuntimeInfoType(validRuntimeInfo)
  expect(result).not.toBeInstanceOf(Error)
  expect(result).toEqual(validRuntimeInfo)
})

test("ContainerExecutionResultType validates correct execution result", () => {
  const validResult = {
    success: true,
    containerId: "test-container-123",
    output: "Test output",
    exitCode: 0,
    stats: {
      executionTime: 150,
      cpuTime: 125,
      peakMemoryUsage: 256,
    },
  }

  const result = ContainerExecutionResultType(validResult)
  expect(result).not.toBeInstanceOf(Error)
  expect(result).toEqual(validResult)
})

test("ContainerExecutionResultType validates failed execution result", () => {
  const failedResult = {
    success: false,
    containerId: "test-container-123",
    error: "Command not found",
    stats: {
      executionTime: 15,
      cpuTime: 10,
      peakMemoryUsage: 50,
    },
  }

  const result = ContainerExecutionResultType(failedResult)
  expect(result).not.toBeInstanceOf(Error)
  expect(result).toEqual(failedResult)
})

test("StateSyncConfigType validates correct sync config", () => {
  const validConfigs = [
    {
      stateId: "test-state",
      priority: { priority: "critical" },
      direction: { direction: "clientToServer" },
      conflictStrategy: "clientWins",
    },
    {
      stateId: "test-state-2",
      priority: { priority: "normal" },
      direction: { direction: "bidirectional" },
    },
  ]

  for (const config of validConfigs) {
    const result = StateSyncConfigType(config)
    expect(result).not.toBeInstanceOf(Error)
    expect(result).toEqual(config)
  }
})

test("ContainerEventType validates correct events", () => {
  const validEvents = [
    {
      type: "created",
      containerId: "test-container-123",
      timestamp: 1625097600000,
      details: { config: { name: "test-container" } },
    },
    {
      type: "started",
      containerId: "test-container-123",
      timestamp: 1625097600000,
    },
    {
      type: "terminated",
      containerId: "test-container-123",
      timestamp: 1625097900000,
      details: { force: true },
    },
  ]

  for (const event of validEvents) {
    const result = ContainerEventType(event)
    expect(result).not.toBeInstanceOf(Error)
    expect(result).toEqual(event)
  }
})

test("SecurityContextType validates correct security context", () => {
  const validContexts = [
    {
      userId: "user-123",
      permissions: ["create", "start", "terminate"],
      securityTokens: { "api-key": "abc123" },
      isolationLevel: "enhanced",
    },
    {
      userId: "user-456",
      permissions: ["execute"],
    },
  ]

  for (const context of validContexts) {
    const result = SecurityContextType(context)
    expect(result).not.toBeInstanceOf(Error)
    expect(result).toEqual(context)
  }
})
