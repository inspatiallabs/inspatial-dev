# DirectFS: Optimized File System Performance with Security

## Overview

DirectFS is a feature inspired by gVisor's DirectFS implementation, designed to improve file system performance while maintaining strong security isolation. Rather than routing all file operations through the virtual file system (VFS) layer, DirectFS allows the container to directly access specific host file system resources in a controlled manner.

## How DirectFS Works

DirectFS operates on a simple principle: controlled direct access to host file descriptors. Here's how it works:

1. The container administrator defines explicit mount points that can be accessed directly
2. When a file within a DirectFS mount point is opened, the system:
   - Validates the path against security policies
   - Opens a real host file descriptor
   - Passes the descriptor to the container
3. The container can then perform file operations directly on the host file descriptor
4. Security measures ensure the container can only operate on exposed files

## Key Benefits

### 1. Performance Improvements

DirectFS significantly reduces overhead for I/O-intensive workloads:

- **Reduced Copying**: Data doesn't need to be copied between the host and container
- **Fewer Context Switches**: Direct operations avoid extra system call processing
- **Lower Latency**: File operations complete faster with fewer intermediary steps
- **Higher Throughput**: More efficient use of available I/O bandwidth

### 2. Resource Efficiency

DirectFS improves resource utilization:

- **Lower Memory Usage**: Less memory used for caching data that passes through the VFS
- **Reduced CPU Overhead**: Less CPU time spent on syscall processing and data copying
- **Better Scalability**: More containers can run efficiently on the same host

### 3. Compatibility

DirectFS maintains compatibility with existing applications:

- **Transparent Usage**: Applications don't need any changes to benefit
- **Same API**: File system operations work exactly the same way
- **Gradual Adoption**: Can be selectively enabled for specific mount points

## Security Considerations

DirectFS maintains strong security through several mechanisms:

### 1. Strict Mount Control

- Only explicitly allowed host directories can be mounted
- Mount points can be set as read-only by default
- Security policies control which files are accessible

### 2. Seccomp Filters

In a production implementation, seccomp filters would be used to:

- Force the use of `O_NOFOLLOW` to prevent symlink attacks
- Prevent file descriptor leakage
- Restrict file operations to the allowed set

### 3. Path Validation

- Strict validation prevents path traversal attacks
- Absolute paths are properly resolved and checked
- Symbolic links are controlled to prevent escapes

### 4. Integration with Behavioral Analysis

DirectFS operations are still monitored by the behavioral analysis system:

- Suspicious access patterns are detected
- Unusual file operations trigger security alerts
- Automatic blocking is still possible for malicious behavior

## Implementation Details

Our DirectFS implementation includes:

1. **Mount Point Management**:
   - Registration of allowed host directories
   - Tracking of mount point metadata
   - Strict path resolution and validation

2. **File Descriptor Handling**:
   - Direct mapping between container and host FDs
   - Proper cleanup on file close
   - Resource limit enforcement

3. **Security Integration**:
   - Coordination with the security manager
   - Permission verification before operations
   - Enforcement of read-only restrictions

4. **Graceful Fallback**:
   - Falls back to regular VFS when needed
   - Handles errors gracefully
   - Maintains compatibility with all file operations

## Performance Comparison

Based on gVisor's documentation and similar implementations, DirectFS provides significant performance improvements:

| Operation Type | Regular VFS | DirectFS | Improvement |
|----------------|-------------|----------|-------------|
| Sequential Read | 1x | 2-3x | 100-200% |
| Random Read | 1x | 3-5x | 200-400% |
| Sequential Write | 1x | 2-4x | 100-300% |
| Small File Access | 1x | 5-10x | 400-900% |

*Note: Actual performance varies based on workload characteristics, hardware, and configuration.*

## Usage Example

```typescript
import { MemoryFileSystem } from "./vfs/memory-fs.ts";
import { DirectFS } from "./directfs.ts";

// Create a file system
const fs = new MemoryFileSystem("container-fs");

// Enable DirectFS
const directfs = new DirectFS(fs, {
  enabled: true,
  containerName: "my-container",
  allowedMountPoints: [
    "/host/data",
    "/host/configs"
  ],
  readOnlyByDefault: true
});

// Mount a host directory
await fs.mount("/host/data", "/data", { readonly: false });

// Use the file system normally - DirectFS handles optimization automatically
const fileHandle = await fs.open("/data/large-file.txt", OpenFlags.READ);
const content = await fileHandle.readFile();
await fileHandle.close();
```

## Best Practices

1. **Minimize DirectFS Mounts**: Only mount directories that need high performance
2. **Use Read-Only When Possible**: Limit write access for better security
3. **Monitor Activity**: Keep behavioral analysis enabled to detect unusual patterns
4. **Regular Security Audits**: Review DirectFS mount points and their permissions
5. **Consider Workload Characteristics**: Apply DirectFS to I/O-intensive mount points

## Limitations

1. **Security Trade-offs**: DirectFS involves a small increase in attack surface
2. **Implementation Complexity**: More complex than a pure VFS approach
3. **Platform Dependencies**: May require platform-specific implementations
4. **Debugging Challenges**: Issues may span the container/host boundary

## Conclusion

DirectFS represents a balanced approach to container file system performance, addressing the structural costs identified in the VFS implementation while maintaining strong security guarantees. By allowing controlled direct access to host file descriptors, it provides significant performance improvements for I/O-intensive workloads without compromising the security isolation that containers require. 