/**
 * Tests for client-side container implementation
 */

import { expect, test } from "@inspatial/test"
import { ClientContainerManager } from "./client-container.ts"
import type { ContainerConfig, SecurityContext } from "../../shared/types.ts"

test("ClientContainerManager can create containers", async () => {
  // Create container manager
  const containerManager = new ClientContainerManager()

  // Create test config
  const config: ContainerConfig = {
    name: "test-client-container",
    environment: { type: "client" },
  }

  // Create test security context
  const securityContext: SecurityContext = {
    userId: "test-user",
  }

  // Create container
  const containerId = await containerManager.createContainer(
    config,
    securityContext,
  )

  // Verify container was created
  expect(containerId).toBeDefined()
  expect(typeof containerId).toBe("string")
  expect(containerId).toContain("client-")

  // Check container info
  const containerInfo = await containerManager.getContainerInfo(containerId)
  expect(containerInfo).toBeDefined()
  expect(containerInfo.id).toBe(containerId)
  expect(containerInfo.config).toEqual(config)
  expect(containerInfo.state.state).toBe("creating")
})

test("ClientContainerManager can start, suspend, resume, and terminate containers", async () => {
  // Create container manager
  const containerManager = new ClientContainerManager()

  // Create test config
  const config: ContainerConfig = {
    name: "test-lifecycle-container",
    environment: { type: "client" },
  }

  // Create test security context
  const securityContext: SecurityContext = {
    userId: "test-user",
  }

  // Create container
  const containerId = await containerManager.createContainer(
    config,
    securityContext,
  )

  // Start container
  await containerManager.startContainer(containerId)
  let containerInfo = await containerManager.getContainerInfo(containerId)
  expect(containerInfo.state.state).toBe("running")

  // Suspend container
  await containerManager.suspendContainer(containerId)
  containerInfo = await containerManager.getContainerInfo(containerId)
  expect(containerInfo.state.state).toBe("suspended")

  // Resume container
  await containerManager.resumeContainer(containerId)
  containerInfo = await containerManager.getContainerInfo(containerId)
  expect(containerInfo.state.state).toBe("running")

  // Terminate container
  await containerManager.terminateContainer(containerId)

  // Verify container is terminated by checking it doesn't exist anymore
  try {
    await containerManager.getContainerInfo(containerId)
    // Should not reach here
    expect(true).toBe(false)
  } catch (error: unknown) {
    expect((error as Error).message).toContain("Container not found")
  }
})

test("ClientContainerManager can execute commands in containers", async () => {
  // Create container manager
  const containerManager = new ClientContainerManager()

  // Create test config
  const config: ContainerConfig = {
    name: "test-exec-container",
    environment: { type: "client" },
  }

  // Create test security context
  const securityContext: SecurityContext = {
    userId: "test-user",
  }

  // Create and start container
  const containerId = await containerManager.createContainer(
    config,
    securityContext,
  )
  await containerManager.startContainer(containerId)

  // Execute command
  const result = await containerManager.executeCommand(containerId, "echo", [
    "Hello",
    "World",
  ])

  // Verify result
  expect(result.success).toBe(true)
  expect(result.containerId).toBe(containerId)
  expect(result.output).toContain("Hello World")
  expect(result.exitCode).toBe(0)
  expect(result.stats).toBeDefined()
})

test("ClientContainerManager can list containers with filters", async () => {
  // Create container manager
  const containerManager = new ClientContainerManager()

  // Create several containers
  const securityContext: SecurityContext = {
    userId: "test-user",
  }

  // Create running container
  const runningId = await containerManager.createContainer(
    { name: "test-running", environment: { type: "client" } },
    securityContext,
  )
  await containerManager.startContainer(runningId)

  // Create suspended container
  const suspendedId = await containerManager.createContainer(
    { name: "test-suspended", environment: { type: "client" } },
    securityContext,
  )
  await containerManager.startContainer(suspendedId)
  await containerManager.suspendContainer(suspendedId)

  // Create terminated container that will be auto-removed
  const terminatedId = await containerManager.createContainer(
    { name: "test-terminated", environment: { type: "client" } },
    securityContext,
  )
  await containerManager.startContainer(terminatedId)
  await containerManager.terminateContainer(terminatedId)

  // List all containers
  let containers = await containerManager.listContainers()
  expect(containers.length).toBe(2) // Terminated container is removed

  // List running containers
  containers = await containerManager.listContainers({
    states: ["running"],
  })
  expect(containers.length).toBe(1)
  expect(containers[0].id).toBe(runningId)

  // List suspended containers
  containers = await containerManager.listContainers({
    states: ["suspended"],
  })
  expect(containers.length).toBe(1)
  expect(containers[0].id).toBe(suspendedId)

  // List by name pattern
  containers = await containerManager.listContainers({
    namePattern: "suspended",
  })
  expect(containers.length).toBe(1)
  expect(containers[0].id).toBe(suspendedId)
})

test("ClientContainerManager can register event listeners", async () => {
  // Create container manager
  const containerManager = new ClientContainerManager()

  // Create test config
  const config: ContainerConfig = {
    name: "test-events-container",
    environment: { type: "client" },
  }

  // Create test security context
  const securityContext: SecurityContext = {
    userId: "test-user",
  }

  // Track events
  const events: string[] = []

  // Register event listener
  const removeListener = containerManager.addEventListener(
    ["created", "started", "terminated"],
    (event) => {
      events.push(event.type)
    },
  )

  // Create, start, and terminate container
  const containerId = await containerManager.createContainer(
    config,
    securityContext,
  )
  await containerManager.startContainer(containerId)
  await containerManager.terminateContainer(containerId)

  // Verify events were received
  expect(events).toEqual(["created", "started", "terminated"])

  // Remove listener
  removeListener()

  // Create another container - no events should be recorded
  events.length = 0
  await containerManager.createContainer(config, securityContext)
  expect(events.length).toBe(0)
})
