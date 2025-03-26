/**
 * InSpatial Container System
 *
 * This module provides a hybrid container system that combines client-side WebAssembly
 * with server-side gVisor containers for resilient, stateless computation.
 */

/**
 * Core types
 */
export * from "./shared/types"

/**
 * Core interfaces
 */
export * from "./shared/interfaces"

/**
 * Communication protocols
 */
export * from "./shared/protocols"

/**
 * Client container implementation
 */
export { ClientContainerManager } from "./client/wasm/client-container"

/**
 * Server container implementation
 */
export { ServerContainerManager } from "./server/gvisor/server-container"
export { ServerSecurityManager, createSecurityProfile } from "./server/gvisor/security-utils"

/**
 * State synchronization
 */
export { DifferentialStateSynchronizer } from "./sync/differential-sync.ts"

/**
 * Container factory - creates the appropriate container manager based on environment
 */
export function createContainerManager(options: {
  environment?: "client" | "server"
  connectionManager?: any
  configDir?: string
  runtimePath?: string
  denoPath?: string
} = {}) {
  const { environment = typeof window !== "undefined" ? "client" : "server" } =
    options

  if (environment === "client") {
    // Dynamic import for client-side container manager
    // In the browser environment, this should be imported with the app
    try {
      // Direct import for server-side rendering and Node.js
      const { ClientContainerManager } = require("./client/wasm/client-container")
      return new ClientContainerManager()
    } catch (e) {
      // Try ESM module style import if require is not available
      try {
        const dynamicImport = new Function('modulePath', 'return import(modulePath)')
        return dynamicImport('./client/wasm/client-container.js')
          .then(module => new module.ClientContainerManager())
      } catch (err) {
        throw new Error(`Failed to load client container manager: ${err}`)
      }
    }
  } else {
    // Server-side container manager
    try {
      const { ServerContainerManager } = require("./server/gvisor/server-container")
      return new ServerContainerManager({
        configDir: options.configDir,
        runtimePath: options.runtimePath,
        denoPath: options.denoPath
      })
    } catch (e) {
      // Try ESM module style import if require is not available
      try {
        const dynamicImport = new Function('modulePath', 'return import(modulePath)')
        return dynamicImport('./server/gvisor/server-container.js')
          .then(module => new module.ServerContainerManager({
            configDir: options.configDir,
            runtimePath: options.runtimePath,
            denoPath: options.denoPath
          }))
      } catch (err) {
        throw new Error(`Failed to load server container manager: ${err}`)
      }
    }
  }
}

/**
 * Create state synchronizer
 */
export function createStateSynchronizer(connectionManager: any) {
  try {
    const { DifferentialStateSynchronizer } = require("./sync/differential-sync")
    return new DifferentialStateSynchronizer(connectionManager)
  } catch (e) {
    // Try ESM module style import if require is not available
    try {
      const dynamicImport = new Function('modulePath', 'return import(modulePath)')
      return dynamicImport('./sync/differential-sync.js')
        .then(module => new module.DifferentialStateSynchronizer(connectionManager))
    } catch (err) {
      throw new Error(`Failed to load state synchronizer: ${err}`)
    }
  }
}
