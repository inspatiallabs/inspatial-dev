<div align="center">
    <a href="https://inspatial.io" target="_blank">
    <picture>
        <source media="(prefers-color-scheme: light)" srcset="https://inspatial-storage.s3.eu-west-2.amazonaws.com/media/icon-brutal-light.svg">
        <source media="(prefers-color-scheme: dark)" srcset="https://inspatial-storage.s3.eu-west-2.amazonaws.com/media/icon-brutal-dark.svg">
        <img src="https://inspatial-storage.s3.eu-west-2.amazonaws.com/media/icon-brutal-dark.svg" alt="InSpatial" width="300"/>
    </picture>
    </a>

<br>
   <br>

<a href="https://inspatial.io" target="_blank">
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
        InSpatial is a universal development environment (UDE) <br> for building cross-platform and spatial (AR/MR/VR) applications
  </h3>

[![License](https://img.shields.io/badge/license-Apache%202.0-blue.svg)](https://opensource.org/licenses/Intentional-License-1.0)
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
| [![InSpatial App](https://inspatial-storage.s3.eu-west-2.amazonaws.com/media/app-badge.svg)](https://www.inspatial.io)       | Build and manage your InSpatial apps | [inspatial.app](https://www.inspatial.io)     |
| [![InSpatial Store](https://inspatial-storage.s3.eu-west-2.amazonaws.com/media/store-badge.svg)](https://www.inspatial.store) | Deploy and discover InSpatial apps   | [inspatial.store](https://www.inspatial.store) |

</div>

---

## 🔍 InSpatial Container (🟡 Preview)

**What is `InSpatial Container` AKA `Dev Container`?** Think of it as a special box that can run your code safely in a web browser or on a server. It keeps your code and data secure while making sure your app keeps working even if your internet connection drops.



### 👨‍💻 What Can I Do With InSpatial Dev Container?

- **Safe Third-Party Code**: Run untrusted code in a secure sandbox 
- **Universal Applications**: Write code once that works consistently across platforms
- **Offline Applications**: Build apps that continues to function even when internet connection is lost
- **State Preservation**: Keep application state intact during connectivity changes
- **Enhanced Data Security**: Protect sensitive information with multiple security layers


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
- 🌍 **Runtime Agnostic** (Deno)
- 📝 **Secure Virtual File System** - DirectFS with permission controls and mount point security
- 🧩 **Comprehensive Security Profiles** - Customizable security policies for different workloads
- 📸 **Automated Threat Response** - Auto-blocking for critical security events

## 🔮 Coming Soon

- 🌍 **Runtime Agnostic** (Bun & Node.js)
- 🌐 **Advanced Network Virtualization** - Full network namespace isolation with inter-container communication
- 📊 **Real-time Resource Analytics** - Detailed resource usage metrics and visualization
- 🤖 **AI-Enhanced Security Posture** - ML models for predictive threat detection and anomaly classification
- 🌍 **Cross-Region Synchronization** - Geo-distributed container execution with latency optimization
- 🔄 **Continuous State Checkpoint** - Automated state backup with point-in-time recovery
- 🔌 **Extension API** - Framework for third-party security and monitoring plugins
- 📱 **Mobile Device Support** - Extended WASM client support for iOS and Android WebViews
- 🗄️ **GPU Workload support**
-    **Emulate Native Environments** - Stream Native Environments directly on the web


## ✨ Advanced Features ✨

<div class="features-grid">
  <div class="feature-tile" onclick="showFeatureDetails('differential-sync')">
    <span class="feature-icon">🔄</span>
    <h4>Differential State Synchronization</h4>
    <p class="feature-brief">Efficiently synchronize state changes with minimal data transfer</p>
  </div>
  
  <div class="feature-tile" onclick="showFeatureDetails('container-lifecycle')">
    <span class="feature-icon">🧩</span>
    <h4>Container Lifecycle Management</h4>
    <p class="feature-brief">Complete control over container creation, execution, and termination</p>
  </div>
  
  <div class="feature-tile" onclick="showFeatureDetails('command-execution')">
    <span class="feature-icon">⚡</span>
    <h4>Command Execution</h4>
    <p class="feature-brief">Execute commands within containers with full input/output control</p>
  </div>
  
  <div class="feature-tile" onclick="showFeatureDetails('event-system')">
    <span class="feature-icon">📋</span>
    <h4>Event System</h4>
    <p class="feature-brief">Subscribe to container lifecycle events for real-time monitoring</p>
  </div>
  
  <div class="feature-tile" onclick="showFeatureDetails('security-monitoring')">
    <span class="feature-icon">🔒</span>
    <h4>Security Monitoring & Analysis</h4>
    <p class="feature-brief">Real-time detection of suspicious activities with automated responses</p>
  </div>
  
  <div class="feature-tile" onclick="showFeatureDetails('secure-filesystem')">
    <span class="feature-icon">🗄️</span>
    <h4>Secure File System</h4>
    <p class="feature-brief">Virtual file system with granular access controls</p>
  </div>
  
  <div class="feature-tile" onclick="showFeatureDetails('conflict-resolution')">
    <span class="feature-icon">📚</span>
    <h4>Conflict Resolution</h4>
    <p class="feature-brief">Smart handling of conflicting state changes with customizable strategies</p>
  </div>
</div>

<div id="feature-details-container">
  <div class="feature-detail" id="differential-sync">
    <h4>🔄 Differential State Synchronization</h4>
    <p>Efficiently synchronize state changes between client and server with minimal data transfer</p>
    <pre><code>// Synchronize critical state with minimal overhead
const sync = createStateSynchronizer(connectionManager);
await sync.initializeSync(containerId);
await sync.updateState(containerId, "editor", { cursor: { line: 10, column: 5 } });</code></pre>
    <ul class="feature-benefits">
      <li>Minimizes network overhead by sending only what changed</li>
      <li>Automatically handles synchronization conflicts</li>
      <li>Works seamlessly with connection disruptions</li>
    </ul>
  </div>
  
  <div class="feature-detail" id="container-lifecycle">
    <h4>🧩 Container Lifecycle Management</h4>
    <p>Complete control over container creation, execution, and termination</p>
    <pre><code>// Create and manage containers
const container = createContainerManager();
const id = await container.createContainer({
  name: "dev-environment",
  environment: { type: "client" }
}, { userId: "user-123" });</code></pre>
    <ul class="feature-benefits">
      <li>Full lifecycle management (create, start, suspend, resume, terminate)</li>
      <li>Consistent API across browser and server environments</li>
      <li>Fine-grained control over container resources and permissions</li>
    </ul>
  </div>
  
  <div class="feature-detail" id="command-execution">
    <h4>⚡ Command Execution</h4>
    <p>Execute commands within containers with full input/output control</p>
    <pre><code>// Run commands in containers
const result = await container.executeCommand(
  containerId,
  "echo",
  ["Hello", "World"]
);</code></pre>
    <ul class="feature-benefits">
      <li>Run any supported command in the container environment</li>
      <li>Structured arguments handling prevents command injection</li>
      <li>Full capture of output and error streams</li>
    </ul>
  </div>
  
  <div class="feature-detail" id="event-system">
    <h4>📋 Event System</h4>
    <p>Subscribe to container lifecycle events for real-time monitoring</p>
    <pre><code>// Monitor container events
container.addEventListener(
  ["created", "started", "terminated"],
  (event) => console.log(`Container ${event.containerId}: ${event.type}`)
);</code></pre>
    <ul class="feature-benefits">
      <li>Real-time notifications for all container state changes</li>
      <li>Filter events by type for targeted handling</li>
      <li>Clean event handling with automatic cleanup</li>
    </ul>
  </div>
  
  <div class="feature-detail" id="security-monitoring">
    <h4>🔒 Security Monitoring & Analysis</h4>
    <p>Real-time detection of suspicious activities with automated responses</p>
    <pre><code>// Configure security monitoring
const security = container.getSecurityManager();
security.enableBehaviorAnalysis({
  autoBlockThreshold: "high",
  sensitivePathPatterns: ["/etc/*", "/sys/*"],
  rules: ["path-traversal", "high-frequency-access"]
});</code></pre>
    <ul class="feature-benefits">
      <li>Proactive monitoring for suspicious activity patterns</li>
      <li>Configurable security thresholds based on your risk tolerance</li>
      <li>Automated responses to potential threats</li>
    </ul>
  </div>
  
  <div class="feature-detail" id="secure-filesystem">
    <h4>🗄️ Secure File System</h4>
    <p>Virtual file system with granular access controls</p>
    <pre><code>// Configure secure file access
const fs = container.getFileSystem();
fs.mountDirectory("/host/data", "/data", { 
  readOnly: true,
  allowedOperations: ["read", "stat"]
});</code></pre>
    <ul class="feature-benefits">
      <li>Fine-grained access control for container file operations</li>
      <li>Secure mounting of host directories with permission limits</li>
      <li>Path-based rules for read/write access</li>
    </ul>
  </div>
  
  <div class="feature-detail" id="conflict-resolution">
    <h4>📚 Conflict Resolution</h4>
    <p>Smart handling of conflicting state changes with customizable strategies</p>
    <pre><code>// Resolve state conflicts
await sync.resolveConflict(containerId, "document",
  { clientWins: true, serverWins: false }
);</code></pre>
    <ul class="feature-benefits">
      <li>Automatically detect and handle conflicting state changes</li>
      <li>Configurable resolution strategies (client wins, server wins, etc.)</li>
      <li>Customizable per state category for optimal handling</li>
    </ul>
  </div>
</div>

<style>
.features-grid {
  display: grid;
  grid-template-columns: repeat(auto-fill, minmax(250px, 1fr));
  gap: 20px;
  margin-bottom: 30px;
}

.feature-tile {
  border: 1px solid #ddd;
  border-radius: 8px;
  padding: 15px;
  background-color: #f8f9fa;
  cursor: pointer;
  transition: all 0.3s ease;
}

.feature-tile:hover {
  transform: translateY(-5px);
  box-shadow: 0 10px 20px rgba(0,0,0,0.1);
  background-color: #fff;
}

.feature-icon {
  font-size: 24px;
  display: block;
  margin-bottom: 10px;
}

.feature-brief {
  color: #555;
  font-size: 14px;
  margin-top: 5px;
}

#feature-details-container {
  margin-top: 30px;
  border-top: 1px solid #eee;
  padding-top: 20px;
}

.feature-detail {
  display: none;
  animation: fadeIn 0.5s;
  padding: 20px;
  border-radius: 8px;
  background-color: #f8f9fa;
  margin-bottom: 20px;
}

.feature-detail h4 {
  margin-top: 0;
}

.feature-benefits {
  margin-top: 15px;
}

@keyframes fadeIn {
  from { opacity: 0; }
  to { opacity: 1; }
}
</style>

<script>
function showFeatureDetails(featureId) {
  // Hide all feature details
  document.querySelectorAll('.feature-detail').forEach(detail => {
    detail.style.display = 'none';
  });
  
  // Show the selected feature detail
  const selectedFeature = document.getElementById(featureId);
  if (selectedFeature) {
    selectedFeature.style.display = 'block';
    selectedFeature.scrollIntoView({ behavior: 'smooth', block: 'start' });
  }
}

// Show the first feature by default
document.addEventListener('DOMContentLoaded', function() {
  showFeatureDetails('differential-sync');
});
</script>

<div align="center">
  <h4>🚀 Keep reading to learn how to use all these amazing features! 🚀</h4>
</div>

---
## 🔄 Comparison: InSpatial Dev Container vs. Replit & WebContainers
If you're deciding between different container solutions, here's how InSpatial Container compares:

### InSpatial Dev Container vs. Replit

| Feature | InSpatial Dev Container | Replit |
|---------|---------------------|--------|
| **Open Source** | ✅ 100% | ❌ 0% |
| **Offline Support** | ✅ Built-in offline functionality with automatic sync | ❌ Requires internet connection |
| **Execution Environment** | ✅ Dual-mode (browser + server) | ✅ Server-side only |
| **State Management** | ✅ Differential state sync with priority-based recovery | ❌ Full state reload required |
| **Security Model** | ✅ Zero-trust with behavioral analysis | ✅ Basic isolation |
| **Development Experience** | ✅ Same container works in development and production | ❌ Different environments |
| **Resource Usage** | ✅ Intelligent workload distribution | ❌ Fixed resource allocation |
| **Deployment Speed** | ✅ Instant local execution + progressive server sync | ⚠️ Deployment queue system |
| **Cross-Platform Support** | ✅ Works across any WebAssembly target | ⚠️ Limited to supported platforms |

### InSpatial Dev Container vs. StackBlitz WebContainers

| Feature | InSpatial Dev Container | StackBlitz Web Container |
|---------|---------------------|----------------------|
| **Open Source** | ✅ 100% | ❌ 0% |
| **Runtime Flexibility** | ✅ WebAssembly + gVisor containers | ⚠️ Browser-only Node.js runtime |
| **Offline Sync** | ✅ Offline changes sync when reconnected | ✅ Works offline but limited sync |
| **System Support** | ✅ General-purpose computing | ⚠️ Node.js-focused environment |
| **Security Model** | ✅ Multi-layered with behavioral analysis | ✅ Browser sandbox isolation |
| **Server-Side Integration** | ✅ Seamless client-server transitions | ❌ Browser-only execution |
| **Resource Efficiency** | ✅ Intelligent workload distribution | ⚠️ Limited by browser resources |
| **Persistent State** | ✅ Three-tier state architecture | ❌ Lost on page refresh |
| **Network Resilience** | ✅ Built-in resilience and recovery | ⚠️ Limited recovery capabilities |
| **Startup Speed** | ✅ Near-instant (milliseconds) | ✅ Fast startup (milliseconds) |


### Why Choose InSpatial Dev Container?

1. **Open Source**
2. **True Hybrid Execution**: Run the same code seamlessly in browser and server
3. **Built for Resilience**: Keep working even when connections fail
4. **Smarter Security**: Advanced protections that learn and adapt
5. **Efficiency First**: Smaller, faster, and more resource-efficient
6. **Developer Friendly**: Simple API that abstracts complexity

InSpatial Container combines the best aspects of browser-based WebAssembly and server-side containers with intelligent state synchronization - something neither Replit nor StackBlitz WebContainers currently offer.


---

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
---

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

## 🛡️ How gVisor Powers InSpatial Container Security

InSpatial Container leverages [gVisor](https://gvisor.dev/) on the server side to provide industry-leading security isolation. Here's what makes gVisor special and why we chose it:

### What is gVisor?

gVisor is an application kernel, written in Go, that implements a substantial portion of the Linux system call interface. It provides a strong isolation boundary between the container and the host operating system by intercepting all container system calls and handling them within a userspace sandbox.

### How gVisor Works (Simplified)

Unlike traditional containers that share the host kernel, gVisor:

1. **Intercepts System Calls**: When your container code makes a system call, gVisor catches it before it reaches the host kernel
2. **Acts as a Virtual Kernel**: gVisor processes the system call in its own memory space, using its own implementation
3. **Provides Defense in Depth**: It uses multiple isolation techniques together for layered security

```
┌────────────────┐     ┌────────────────┐
│  Container A   │     │  Container B   │
└───────┬────────┘     └────────┬───────┘
        │                       │
┌───────▼───────────────────────▼───────┐
│             gVisor Sandbox            │
│  ┌─────────────────────────────────┐  │
│  │   Application Kernel (in Go)    │  │
│  └──────────────────┬──────────────┘  │
│                     │                 │
│  ┌──────────────────▼──────────────┐  │
│  │  Minimal Host System Interface  │  │
│  └──────────────────┬──────────────┘  │
└─────────────────────┼─────────────────┘
                      │
┌─────────────────────▼───────────────┐
│           Host Linux Kernel         │
└─────────────────────────────────────┘
```

### Why gVisor is Essential for InSpatial Dev Container

1. **Strong Security Isolation**: Protects against container escape vulnerabilities and kernel exploits
   
2. **Fast Performance**: Starts in milliseconds with minimal overhead, unlike full VMs

3. **Memory Safety**: Written in Go, eliminating whole classes of memory corruption vulnerabilities

4. **Checkpoint & Restore**: Allows capture and restore of container state, perfect for our state synchronization model

5. **Reduced Attack Surface**: Minimizes the exposure to the host kernel by implementing system calls in userspace

6. **Runs Untrusted Code Safely**: Perfect for running third-party or user-submitted code

### gVisor in the InSpatial Dev Container Architecture

InSpatial Container uses gVisor differently than traditional deployments:

- **Stateless Design**: We use gVisor in a stateless configuration, storing state externally
- **Hybrid Execution**: Seamlessly integrates with our WebAssembly client runtime
- **Custom Security Profiles**: We've configured gVisor with enhanced security profiles specific to different workload types
- **Integrated Behavioral Analysis**: Our security system works with gVisor to detect and respond to anomalous behaviors

This architecture gives you the best of both worlds—the security isolation of a VM with the resource efficiency and speed of containers.


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

## 🤔 FAQ

### "Do I need to know about containers to use this?"
No! We handle all the complex container technology behind the scenes. You just use simple functions like `createContainer()` and `executeCommand()`.

### "Will my app work if the user goes offline?"
Yes! Your app will continue to work in the browser. When the user comes back online, any changes they made will automatically sync.

### "Is it secure to run user-submitted code?"
Yes! InSpatial Container uses multiple security layers to safely run code, whether it's yours or from users.

### "Do I need a special server setup?"
No special setup needed for basic use. For advanced server features, we provide simple setup instructions.

### "How much do I need to change my existing code?"
Very little! Many apps can add InSpatial Container with just a few lines of code.



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


### TypeScript Interfaces

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
