<div align="center">
    <a href="https://inspatiallabs.com" target="_blank">
    <picture>
        <source media="(prefers-color-scheme: light)" srcset="https://inspatial-storage.s3.eu-west-2.amazonaws.com/media/icon-brutal-light.svg">
        <source media="(prefers-color-scheme: dark)" srcset="https://inspatial-storage.s3.eu-west-2.amazonaws.com/media/icon-brutal-dark.svg">
        <img src="https://inspatial-storage.s3.eu-west-2.amazonaws.com/media/icon-brutal-dark.svg" alt="InSpatial" width="300"/>
    </picture>
    </a>

<br>
   <br>

<a href="https://inspatiallabs.com" target="_blank">
<p align="center">
    <picture>
        <source media="(prefers-color-scheme: light)" srcset="https://inspatial-storage.s3.eu-west-2.amazonaws.com/media/logo-light.svg">
        <source media="(prefers-color-scheme: dark)" srcset="https://inspatial-storage.s3.eu-west-2.amazonaws.com/media/logo-dark.svg">
        <img src="https://inspatial-storage.s3.eu-west-2.amazonaws.com/media/logo-dark.svg" height="75" alt="InSpatial">
    </picture>
</p>
</a>

_Reality is your canvas_

<h3 align="center">
    InSpatial Container is a universal development environment (UDE) <br> component for resilient hybrid containers across client and server
  </h3>

[![License](https://img.shields.io/badge/license-Apache%202.0-blue.svg)](https://opensource.org/licenses/Apache-2.0)
[![Discord](https://img.shields.io/badge/discord-join_us-5a66f6.svg?style=flat-square)](https://discord.gg/inspatiallabs)
[![Twitter](https://img.shields.io/badge/twitter-follow_us-1d9bf0.svg?style=flat-square)](https://twitter.com/inspatiallabs)
[![LinkedIn](https://img.shields.io/badge/linkedin-connect_with_us-0a66c2.svg?style=flat-square)](https://www.linkedin.com/company/inspatiallabs)

</div>

##

<div align="center">

| InSpatial                                                                                                                     | Description                          | Link                                           |
| ----------------------------------------------------------------------------------------------------------------------------- | ------------------------------------ | ---------------------------------------------- |
| [![InSpatial Dev](https://inspatial-storage.s3.eu-west-2.amazonaws.com/media/dev-badge.svg)](https://www.inspatial.dev)       | Universal Libraries & Frameworks     | [inspatial.dev](https://www.inspatial.dev)     |
| [![InSpatial Cloud](https://inspatial-storage.s3.eu-west-2.amazonaws.com/media/cloud-badge.svg)](https://www.inspatial.cloud) | Backend APIs and SDKs                | [inspatial.cloud](https://www.inspatial.cloud) |
| [![InSpatial App](https://inspatial-storage.s3.eu-west-2.amazonaws.com/media/app-badge.svg)](https://www.inspatial.app)       | Build and manage your InSpatial apps | [inspatial.app](https://www.inspatial.app)     |
| [![InSpatial Store](https://inspatial-storage.s3.eu-west-2.amazonaws.com/media/store-badge.svg)](https://www.inspatial.store) | Deploy and discover InSpatial apps   | [inspatial.store](https://www.inspatial.store) |

</div>

---

## 🔍 InSpatial Container (🟡 Preview)

InSpatial Container is a stateless hybrid container system that combines client-side WebAssembly with server-side gVisor containers, providing intelligent state synchronization and seamless workload distribution for resilient application execution.

## 🌟 Features

- 🌍 **Dual-Mode Execution Environment** - Fully implemented browser WASM Runtime + Server gVisor containers
- 🔍 **Stateless Container Design** - Ephemeral containers with externalized state management
- 🎮 **Intelligent State Synchronization** - Differential state sync with priority-based processing
- 📝 **Advanced Security System** - Zero-trust model with behavioral analysis and intrusion detection
- 🎯 **Fast Reconnection** - Instant local resume with progressive state restoration
- ⚡ **Resilient Operation** - Robust connection manager for handling network disruptions
- 🔄 **Protocol Buffer Communication** - Efficient serialization for all messages
- 🔍 **Workload Distribution** - Intelligent routing of computation between client and server
- 🎨 **Portable Runtime** - Cross-platform compatibility with any WebAssembly target
- 🛡️ **Multi-Layer Sandbox Isolation** - Complete security containment with configurable isolation levels
- 🔄 **Three-Tier State Architecture** - Critical, Operational, and Non-Critical state prioritization
- 🧪 **Runtime Security Monitoring** - Real-time behavioral analysis with anomaly detection
- 📝 **Secure Virtual File System** - DirectFS with permission controls and mount point security
- 🧩 **Comprehensive Security Profiles** - Customizable security policies for different workloads
- 📸 **Automated Threat Response** - Auto-blocking for critical security events

## 🔮 Coming Soon

- 🌐 **Advanced Network Virtualization** - Full network namespace isolation with inter-container communication
- 📊 **Real-time Resource Analytics** - Detailed resource usage metrics and visualization
- 🤖 **AI-Enhanced Security Posture** - ML models for predictive threat detection and anomaly classification
- 🌍 **Cross-Region Synchronization** - Geo-distributed container execution with latency optimization
- 🔄 **Continuous State Checkpoint** - Automated state backup with point-in-time recovery
- 🔌 **Extension API** - Framework for third-party security and monitoring plugins
- 📱 **Mobile Device Support** - Extended WASM client support for iOS and Android WebViews

## ✨ Advanced Features ✨

<table>
  <tr>
    <td>
      <h4>🔄 Differential State Synchronization</h4>
      <p>Efficiently synchronize state changes between client and server with minimal data transfer</p>
      <pre><code>// Synchronize critical state with minimal overhead
const sync = createStateSynchronizer(connectionManager);
await sync.initializeSync(containerId);
await sync.updateState(containerId, "editor", { cursor: { line: 10, column: 5 } });</code></pre>
    </td>
    <td>
      <h4>🧩 Container Lifecycle Management</h4>
      <p>Complete control over container creation, execution, and termination</p>
      <pre><code>// Create and manage containers
const container = createContainerManager();
const id = await container.createContainer({
  name: "dev-environment",
  environment: { type: "client" }
}, { userId: "user-123" });</code></pre>
    </td>
  </tr>
  <tr>
    <td>
      <h4>⚡ Command Execution</h4>
      <p>Execute commands within containers with full input/output control</p>
      <pre><code>// Run commands in containers
const result = await container.executeCommand(
  containerId,
  "echo",
  ["Hello", "World"]
);</code></pre>
    </td>
    <td>
      <h4>📋 Event System</h4>
      <p>Subscribe to container lifecycle events for real-time monitoring</p>
      <pre><code>// Monitor container events
container.addEventListener(
  ["created", "started", "terminated"],
  (event) => console.log(`Container ${event.containerId}: ${event.type}`)
);</code></pre>
    </td>
  </tr>
  <tr>
    <td>
      <h4>🔒 Security Monitoring & Analysis</h4>
      <p>Real-time detection of suspicious activities with automated responses</p>
      <pre><code>// Configure security monitoring
const security = container.getSecurityManager();
security.enableBehaviorAnalysis({
  autoBlockThreshold: "high",
  sensitivePathPatterns: ["/etc/*", "/sys/*"],
  rules: ["path-traversal", "high-frequency-access"]
});</code></pre>
    </td>
    <td>
      <h4>🗄️ Secure File System</h4>
      <p>Virtual file system with granular access controls</p>
      <pre><code>// Configure secure file access
const fs = container.getFileSystem();
fs.mountDirectory("/host/data", "/data", { 
  readOnly: true,
  allowedOperations: ["read", "stat"]
});</code></pre>
    </td>
  </tr>
  <tr>
    <td colspan="2" align="center">
      <h4>📚 Conflict Resolution</h4>
      <p>Smart handling of conflicting state changes with customizable strategies</p>
      <pre><code>// Resolve state conflicts
await sync.resolveConflict(containerId, "document",
  { clientWins: true, serverWins: false }
);</code></pre>
    </td>
  </tr>
</table>

<div align="center">
  <h4>🚀 Keep reading to learn how to use all these amazing features! 🚀</h4>
</div>

## 📦 Install InSpatial Container:

Choose your preferred package manager:

```bash
deno install jsr:@inspatial/container
```

##

```bash
npx jsr add @inspatial/container
```

##

```bash
yarn dlx jsr add @inspatial/container
```

##

```bash
pnpm dlx jsr add @inspatial/container
```

##

```bash
bunx jsr add @inspatial/container
```

## 🛠️ Step-by-Step Usage Guide

Here are the essential usage patterns for working with InSpatial Container:

### 1. **Creating and Managing Containers**

```typescript
import { createContainerManager } from "@inspatial/container";

// Create a container manager for the current environment (client or server)
const containerManager = createContainerManager();

// Create a container
const containerId = await containerManager.createContainer(
  {
    name: "dev-container",
    environment: { type: "client" },
    resources: {
      cpu: 2,
      memory: 512,
    },
  },
  {
    userId: "user-123",
    permissions: ["create", "execute"],
  }
);

// Start the container
await containerManager.startContainer(containerId);

// Execute a command
const result = await containerManager.executeCommand(containerId, "node", [
  "-e",
  "console.log('Hello from container!')",
]);

console.log(result.output); // "Hello from container!"

// Suspend and resume container
await containerManager.suspendContainer(containerId);
await containerManager.resumeContainer(containerId);

// Terminate when done
await containerManager.terminateContainer(containerId);
```

### 2. **Server-Side gVisor Containers with Deno**

```typescript
import { createContainerManager } from "@inspatial/container";

// Create a server-side container manager with gVisor
const containerManager = createContainerManager({
  environment: "server",
  // Optional: Configure paths
  configDir: "/var/lib/inspatial/containers",
  runtimePath: "/usr/local/bin/runsc",
  denoPath: "/usr/local/bin/deno",
});

// Create a secure container with Deno runtime
const containerId = await containerManager.createContainer(
  {
    name: "deno-server",
    environment: { type: "server" },
    resources: {
      cpu: 2,
      memory: 512,
      diskSpace: 1024,
    },
  },
  {
    userId: "user-123",
    permissions: ["create", "execute"],
    isolationLevel: "enhanced", // Options: "standard", "enhanced", "maximum"
  }
);

// Start the container
await containerManager.startContainer(containerId);

// Execute Deno commands in the container
const result = await containerManager.executeCommand(containerId, "deno", [
  "run",
  "--allow-net",
  "main.ts",
]);

// Or use the shorthand syntax for Deno commands
const evalResult = await containerManager.executeCommand(containerId, "eval", [
  "console.log('Running in secure gVisor container')",
]);

// Terminate when done
await containerManager.terminateContainer(containerId);
```

### 3. **State Synchronization**

```typescript
import { createStateSynchronizer } from "@inspatial/container";

// Create connection manager (implementation depends on your app)
const connectionManager = createMyConnectionManager();

// Create a state synchronizer
const stateSynchronizer = createStateSynchronizer(connectionManager);

// Initialize sync for a container
await stateSynchronizer.initializeSync(containerId);

// Update state (changes are automatically synchronized)
await stateSynchronizer.updateState(containerId, "editorState", {
  cursor: { line: 10, column: 5 },
  selection: {
    start: { line: 10, column: 5 },
    end: { line: 12, column: 10 },
  },
});

// Get current state
const editorState = await stateSynchronizer.getState(
  containerId,
  "editorState"
);

// Resolve conflicts if they occur
await stateSynchronizer.resolveConflict(
  containerId,
  "editorState",
  "clientWins" // Or "serverWins" or explicit state
);

// Terminate synchronization when done
await stateSynchronizer.terminateSync(containerId);
```

### 4. **Event Handling**

```typescript
// Listen for container events
const removeListener = containerManager.addEventListener(
  ["created", "started", "suspended", "resumed", "terminated", "failed"],
  (event) => {
    console.log(`Container ${event.containerId}: ${event.type}`);

    if (event.type === "failed") {
      console.error("Container failed:", event.details);
    }
  }
);

// Remove listener when no longer needed
removeListener();
```

### 5. **Advanced Features Overview**

InSpatial Container includes several advanced capabilities:

- **Container Reconnection**: Seamless handling of connection loss and recovery
- **Differential Sync**: Efficient state updates with minimal data transfer
- **Priority-Based Sync**: Critical state is synchronized first
- **Multi-Layer Security**: Sandboxed execution environment
- **Execution Isolation**: Complete separation of code execution from data

See the API Reference below for detailed documentation of these features.

## 🎯 API Reference

### Core Functions

| Function                    | Description                                                         |
| --------------------------- | ------------------------------------------------------------------- |
| `createContainerManager()`  | Creates a container manager appropriate for the current environment |
| `createStateSynchronizer()` | Creates a state synchronization manager                             |
| `createSecurityManager()`   | Creates a security manager for monitoring and threat detection      |
| `createVirtualFileSystem()` | Creates a virtual file system with security controls                |

### Container Management

| Class/Type               | Description                                  |
| ------------------------ | -------------------------------------------- |
| `InContainerManager`     | Interface for container lifecycle management |
| `ClientContainerManager` | Client-side WASM container implementation    |
| `ServerContainerManager` | Server-side gVisor container implementation  |

### State Synchronization

| Feature                         | Description                                          |
| ------------------------------- | ---------------------------------------------------- |
| `InStateSynchronizer`           | Interface for state synchronization                  |
| `DifferentialStateSynchronizer` | Implementation of differential state synchronization |
| `StateSyncConfig`               | Configuration options for state synchronization      |

### Security System

| Feature             | Description                                            |
| ------------------- | ------------------------------------------------------ |
| `InSecurityManager` | Interface for security monitoring and management       |
| `BehaviorAnalyzer`  | Analyzes container behavior for suspicious patterns    |
| `FsSecurityMonitor` | Monitors file system operations for security threats   |
| `SecurityProfile`   | Configurable security policies for different use cases |
| `IsolationLevel`    | Configurable security isolation levels                 |

### Virtual File System

| Feature               | Description                                       |
| --------------------- | ------------------------------------------------- |
| `InVirtualFileSystem` | Interface for virtual file system operations      |
| `DirectFS`            | High-performance file system with security checks |
| `PathPermissionCheck` | Path-based permission validation                  |
| `MountPoint`          | Secure mount point with read-only options         |

### 🔄 Differential Synchronization - Efficient State Updates

Differential synchronization enables efficient state updates between client and server with minimal data transfer.

```typescript
import { createStateSynchronizer } from "@inspatial/container";

// Create state synchronizer
const sync = createStateSynchronizer(connectionManager);
await sync.initializeSync(containerId);

// Update state (only changes are transmitted)
await sync.updateState(containerId, "document", {
  cursor: { line: 10, column: 5 },
});

// Later update only what changed
await sync.updateState(containerId, "document", {
  cursor: { line: 11, column: 0 },
});
```

#### Synchronization Functions

| Function            | Description                                        |
| ------------------- | -------------------------------------------------- |
| `initializeSync()`  | Initializes synchronization for a container        |
| `updateState()`     | Updates state and synchronizes with remote         |
| `getState()`        | Gets current state value                           |
| `resolveConflict()` | Resolves conflicts between client and server state |
| `terminateSync()`   | Terminates synchronization and cleans up resources |

#### Synchronization Methods

| Method                        | Description                                                 |
| ----------------------------- | ----------------------------------------------------------- |
| `JsonPatchUtil.applyPatch()`  | Applies a JSON patch to an object                           |
| `JsonPatchUtil.createPatch()` | Creates a patch representing the difference between objects |
| `JsonPatchUtil.areEqual()`    | Checks if two values are equal                              |

### 🧩 Container Management - Complete Lifecycle Control

The container management system provides complete control over the container lifecycle.

```typescript
import { createContainerManager } from "@inspatial/container";

// Create container manager
const containers = createContainerManager();

// Create container
const containerId = await containers.createContainer(
  {
    name: "dev-environment",
    environment: { type: "client" },
  },
  { userId: "user-123" }
);

// Container lifecycle
await containers.startContainer(containerId);
await containers.suspendContainer(containerId);
await containers.resumeContainer(containerId);
await containers.terminateContainer(containerId);
```

### 🔒 Security System - Multi-Layered Protection

InSpatial Container includes a comprehensive security system with behavioral analysis and threat detection.

```typescript
import { createContainerManager } from "@inspatial/container";

// Create container with security context
const containers = createContainerManager();
const containerId = await containers.createContainer(containerConfig, {
  userId: "user-123",
  permissions: ["create", "execute"],
  isolationLevel: "enhanced", // Options: "standard", "enhanced", "maximum"
});

// Get the security manager
const security = containers.getSecurityManager(containerId);

// Configure behavioral analysis
security.enableBehaviorAnalysis({
  autoBlockThreshold: "high", // When to auto-block the container
  sensitivePathPatterns: ["/etc/*", "/sys/*"], // Paths to monitor
  rules: [
    "path-traversal", // Detect path traversal attempts
    "high-frequency-access", // Detect suspicious access patterns
    "permission-escalation", // Detect attempts to gain higher privileges
  ],
});

// Subscribe to security events
security.addEventListener("securityEvent", (event) => {
  console.log(`Security event: ${event.type}, severity: ${event.severity}`);
  if (event.severity === "critical") {
    // Take immediate action
  }
});
```

### 🗄️ Virtual File System - Secure File Access

The virtual file system provides consistent and secure file access across environments.

```typescript
import { createContainerManager } from "@inspatial/container";

// Get container's file system
const containers = createContainerManager();
const containerId = await containers.createContainer(containerConfig);
const fs = containers.getFileSystem(containerId);

// Mount host directories with security constraints
await fs.mountDirectory("/host/data", "/data", {
  readOnly: true, // Prevent writes
  allowedOperations: ["read", "stat"], // Only allow these operations
});

// Configure path permissions
fs.setPathPermissions({
  allowedPaths: ["/data/*", "/app/*"], // Paths that can be accessed
  readOnlyPaths: ["/data/config/*"], // Paths that cannot be modified
  forbiddenPaths: ["/etc/*", "/sys/*"], // Paths that cannot be accessed at all
});

// Access files through the secure interface
const file = await fs.openFile("/data/config.json", "r");
const content = await file.readAll();
await file.close();
```

## TypeScript Interfaces

This package exports the following TypeScript interfaces and types:

| Interface                | Description                                              |
| ------------------------ | -------------------------------------------------------- |
| `InContainerManager`     | Interface for container lifecycle management             |
| `InStateSynchronizer`    | Interface for state synchronization                      |
| `InSecurityManager`      | Interface for container security operations              |
| `InConnectionManager`    | Interface for connection management                      |
| `InVirtualFileSystem`    | Interface for virtual file system operations             |
| `InSecurityMonitor`      | Interface for security monitoring and alerting           |
| `ContainerConfig`        | Container configuration options                          |
| `ContainerState`         | Container lifecycle states                               |
| `ContainerRuntimeInfo`   | Container runtime information                            |
| `ContainerEvent`         | Container event data                                     |
| `SecurityContext`        | Security context for container operations                |
| `SyncPriority`           | Priority levels for state synchronization                |
| `StateSyncConfig`        | Configuration for state synchronization                  |
| `BehaviorAnalyzerConfig` | Configuration for behavior analysis and threat detection |
| `SecurityProfile`        | Security profile with isolation levels and permissions   |
| `FileSystemConfig`       | Configuration for virtual file system                    |
| `PathPermissions`        | Path-based access control permissions                    |
| `MountOptions`           | Options for mounting directories                         |
| `SecurityEvent`          | Security event data with severity and details            |

---

## 🔍 Security/Performance Tradeoffs

InSpatial Container leverages gVisor's sandboxing capabilities on the server side, which provides strong security benefits but comes with performance considerations:

### Security Benefits

- **Complete Kernel Isolation**: Protects against most Linux CVEs and container escape vulnerabilities
- **Reduced Attack Surface**: Limits exposure to the host kernel and between containers
- **Behavioral Analysis**: Real-time monitoring of suspicious activities with automated responses
- **Defense-in-Depth**: Multiple layers of protection for critical workloads
- **Intrusion Detection**: Built-in monitoring for abnormal behavior patterns

### Performance Considerations

- **Workload Suitability**:

  - ✅ **Ideal for**: CPU-bound workloads (API servers, web servers, data processing)
  - ⚠️ **Consider alternatives for**: I/O-heavy workloads (databases) or network-heavy workloads (load balancers)

- **Overhead Sources**:
  - **Structural costs**: Additional memory for security components and syscall interception
  - **Implementation costs**: Optimizations still being made to specific subsystems

### When to Use Sandboxing

Consider using InSpatial Container's enhanced security features for:

- Externally-facing endpoints and services
- Applications handling sensitive user data
- Multi-tenant environments where isolation is critical
- Workloads subject to compliance requirements
- Applications where security outweighs minor performance considerations

For maximum performance with less stringent security requirements, you can configure InSpatial Container to use lower isolation levels.

---

## 🧪 Testing

### Unit Tests

The container system includes comprehensive unit tests for both client and server implementations:

```bash
deno task test
```

The tests use mocks to simulate the behavior of WebAssembly in the client and gVisor in the server, ensuring tests can run in any environment without dependencies.

### gVisor Support

To verify if gVisor is installed on your system:

```bash
deno task check-gvisor
```

If gVisor is not installed but you'd like to use it, we provide an installation helper:

```bash
deno task install-gvisor
```

This will provide platform-specific instructions and can attempt automatic installation on Linux systems.

### Integration Tests

For environments with gVisor installed, integration tests can be run to verify actual gVisor functionality:

```bash
deno test --allow-run ./src/server/test/integration/gvisor-integration.test.ts
```

> Note: All regular tests will continue to work even without gVisor installed by using our mock implementations, so you don't need to install gVisor for normal development.

---

## 🤝 Contributing

We welcome contributions from the community! Please read our [Contributing Guidelines](CONTRIBUTING.md) to get started.

---

## 📄 License

InSpatial Container is released under the Apache 2.0 License. See the [LICENSE](LICENSE) file for details.

---

<div align="center">
  <strong>Ready to shape the future of spatial computing?</strong>
  <br>
  <a href="https://www.inspatiallabs.com">Start Building with InSpatial</a>
</div>
