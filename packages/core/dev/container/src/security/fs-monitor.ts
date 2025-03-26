/**
 * InSpatial Container System - File System Security Monitor
 * 
 * This module provides security monitoring for file system operations,
 * capturing events and sending them to the behavior analyzer.
 */

import { MemoryFileSystem } from "../fs/vfs/memory-fs.ts";
import { 
  BehaviorAnalyzer, 
  SecurityEventType, 
  SecurityLevel,
  defaultRules
} from "./behavior-analyzer.ts";

/**
 * Configuration for the file system security monitor
 */
export interface FsSecurityMonitorConfig {
  containerName: string;
  enableBehaviorAnalysis: boolean;
  historySize?: number;
  autoBlockThreshold?: SecurityLevel;
  customRules?: any[];
  sensitiveDirectories?: string[];
  sensitiveFilePatterns?: RegExp[];
  trackReads?: boolean;
  trackWrites?: boolean;
  trackMetadataChanges?: boolean;
}

/**
 * Default file system security monitor configuration
 */
const DEFAULT_CONFIG: Partial<FsSecurityMonitorConfig> = {
  enableBehaviorAnalysis: true,
  historySize: 1000,
  autoBlockThreshold: SecurityLevel.CRITICAL,
  trackReads: true,
  trackWrites: true,
  trackMetadataChanges: true,
  sensitiveDirectories: [
    "/etc", 
    "/var/log", 
    "/var/run", 
    "/proc", 
    "/sys", 
    "/dev"
  ],
  sensitiveFilePatterns: [
    /passwd/i,
    /shadow/i,
    /\.env$/i,
    /\.key$/i,
    /\.pem$/i,
    /secret/i,
    /token/i,
    /credential/i
  ]
};

/**
 * Monitors file system operations for security threats
 */
export class FsSecurityMonitor {
  private fs: MemoryFileSystem;
  private config: FsSecurityMonitorConfig;
  private analyzer: BehaviorAnalyzer | null = null;
  private accessCounts: Map<string, { count: number, lastReset: number }> = new Map();
  private readonly RATE_RESET_INTERVAL = 10000; // 10 seconds
  
  /**
   * Creates a new file system security monitor
   * 
   * @param fs The file system to monitor
   * @param config Security monitoring configuration
   */
  constructor(fs: MemoryFileSystem, config: FsSecurityMonitorConfig) {
    this.fs = fs;
    this.config = { ...DEFAULT_CONFIG, ...config } as FsSecurityMonitorConfig;
    
    // Initialize behavior analyzer if enabled
    if (this.config.enableBehaviorAnalysis) {
      this.analyzer = new BehaviorAnalyzer({
        historySize: this.config.historySize || 1000,
        rules: [...defaultRules, ...(this.config.customRules || [])],
        autoBlockThreshold: this.config.autoBlockThreshold
      });
      
      // Subscribe to security events
      this.analyzer.on('security-event', (event) => {
        this.handleSecurityEvent(event);
      });
      
      this.analyzer.on('auto-block', (data) => {
        this.handleAutoBlock(data);
      });
    }
    
    // Monkey patch the file system methods to add monitoring
    this.monkeyPatchFs();
  }
  
  /**
   * Handles a security event
   */
  private handleSecurityEvent(event: any): void {
    console.warn(`[SECURITY] ${event.level.toUpperCase()}: ${event.message}`);
    
    // Log the event
    // In a real system, this would send the event to a centralized logging system
  }
  
  /**
   * Handles auto-blocking of a container
   */
  private handleAutoBlock(data: any): void {
    console.error(`[SECURITY] CRITICAL: Auto-blocking container ${data.containerName} - ${data.reason}`);
    
    // In a real system, this would trigger isolation or termination of the container
    // For our implementation, we'll just emit an event that can be handled by the container manager
    
    // Create a custom event for auto-blocking
    const event = new CustomEvent('container-blocked', {
      detail: {
        containerName: data.containerName,
        reason: data.reason,
        timestamp: new Date(),
        event: data.event
      }
    });
    
    // Dispatch the event
    window.dispatchEvent(event);
  }
  
  /**
   * Checks if a path is sensitive
   */
  private isSensitivePath(path: string): boolean {
    if (!path) return false;
    
    // Check sensitive directories
    if (this.config.sensitiveDirectories) {
      for (const dir of this.config.sensitiveDirectories) {
        if (path.startsWith(dir)) {
          return true;
        }
      }
    }
    
    // Check sensitive file patterns
    if (this.config.sensitiveFilePatterns) {
      for (const pattern of this.config.sensitiveFilePatterns) {
        if (pattern.test(path)) {
          return true;
        }
      }
    }
    
    return false;
  }
  
  /**
   * Tracks access rate for a path to detect potential brute force or scanning
   */
  private trackAccessRate(path: string): boolean {
    const now = Date.now();
    let entry = this.accessCounts.get(path);
    
    if (!entry) {
      entry = { count: 0, lastReset: now };
      this.accessCounts.set(path, entry);
    }
    
    // Reset counter if interval has passed
    if (now - entry.lastReset > this.RATE_RESET_INTERVAL) {
      entry.count = 0;
      entry.lastReset = now;
    }
    
    // Increment access count
    entry.count++;
    
    // Check if access rate is suspicious (more than 30 accesses in 10 seconds)
    return entry.count > 30;
  }
  
  /**
   * Monkey patches file system methods to add security monitoring
   */
  private monkeyPatchFs(): void {
    // Store original methods
    const originalOpen = this.fs.open;
    const originalReadFile = this.fs.readFile;
    const originalWriteFile = this.fs.writeFile;
    const originalMkdir = this.fs.mkdir;
    const originalRmdir = this.fs.rmdir;
    const originalUnlink = this.fs.unlink;
    const originalChmod = this.fs.chmod;
    const originalChown = this.fs.chown;
    const originalSymlink = this.fs.symlink;
    const originalMount = this.fs.mount;
    const originalUnmount = this.fs.unmount;
    
    // Patch open method
    this.fs.open = async (...args) => {
      const [path, flags, mode] = args;
      
      // Check for suspicious access
      const isSensitive = this.isSensitivePath(path);
      const isHighRate = this.trackAccessRate(path);
      
      if ((isSensitive || isHighRate) && this.analyzer) {
        // Create a security event
        const isWrite = flags !== undefined ? (flags & 0x2) !== 0 : false; // Check if write flag is set
        const event = {
          type: isWrite ? SecurityEventType.FILE_MODIFICATION : SecurityEventType.FILE_ACCESS,
          timestamp: new Date(),
          containerName: this.config.containerName,
          userId: (this.fs as any).currentUid || 0,
          action: isWrite ? "open-write" : "open-read",
          path,
          details: {
            flags,
            mode,
            isSensitive,
            isHighRate
          }
        };
        
        // Process the event
        this.analyzer.processEvent(event);
      }
      
      // Call original method
      return originalOpen.apply(this.fs, args);
    };
    
    // Patch readFile method
    if (this.config.trackReads) {
      this.fs.readFile = async (path) => {
        // Check for suspicious access
        const isSensitive = this.isSensitivePath(path);
        const isHighRate = this.trackAccessRate(path);
        
        if ((isSensitive || isHighRate) && this.analyzer) {
          // Create a security event
          const event = {
            type: SecurityEventType.FILE_ACCESS,
            timestamp: new Date(),
            containerName: this.config.containerName,
            userId: (this.fs as any).currentUid || 0,
            action: "read",
            path,
            details: {
              isSensitive,
              isHighRate
            }
          };
          
          // Process the event
          this.analyzer.processEvent(event);
        }
        
        // Call original method
        return originalReadFile.call(this.fs, path);
      };
    }
    
    // Patch writeFile method
    if (this.config.trackWrites) {
      this.fs.writeFile = async (path, data, options) => {
        // Check for suspicious access
        const isSensitive = this.isSensitivePath(path);
        
        if (isSensitive && this.analyzer) {
          // Create a security event
          const event = {
            type: SecurityEventType.FILE_MODIFICATION,
            timestamp: new Date(),
            containerName: this.config.containerName,
            userId: (this.fs as any).currentUid || 0,
            action: "write",
            path,
            details: {
              options,
              isSensitive,
              dataSize: data?.length
            }
          };
          
          // Process the event
          this.analyzer.processEvent(event);
        }
        
        // Call original method
        return originalWriteFile.call(this.fs, path, data, options);
      };
    }
    
    // Patch other security-relevant methods similarly
    
    // Mount operations are particularly security-sensitive
    this.fs.mount = async (source, target, options) => {
      if (this.analyzer) {
        // Create a security event
        const event = {
          type: SecurityEventType.MOUNT_OPERATION,
          timestamp: new Date(),
          containerName: this.config.containerName,
          userId: (this.fs as any).currentUid || 0,
          action: "mount",
          path: target,
          details: {
            source,
            target,
            options
          }
        };
        
        // Process the event
        this.analyzer.processEvent(event);
      }
      
      // Call original method
      return originalMount.call(this.fs, source, target, options);
    };
    
    // Patch chmod - crucial for detecting permission escalation attempts
    if (this.config.trackMetadataChanges) {
      this.fs.chmod = async (path, mode) => {
        if (this.analyzer) {
          // Check for suspicious chmod (making files executable or setuid/setgid)
          const isExecutable = (mode & 0o111) !== 0;
          const isSetuid = (mode & 0o4000) !== 0;
          const isSetgid = (mode & 0o2000) !== 0;
          
          if (isExecutable || isSetuid || isSetgid) {
            // Create a security event
            const event = {
              type: SecurityEventType.PERMISSION_CHANGE,
              timestamp: new Date(),
              containerName: this.config.containerName,
              userId: (this.fs as any).currentUid || 0,
              action: "chmod",
              path,
              details: {
                newMode: mode,
                isExecutable,
                isSetuid,
                isSetgid
              }
            };
            
            // Process the event
            this.analyzer.processEvent(event);
          }
        }
        
        // Call original method
        return originalChmod.call(this.fs, path, mode);
      };
    }
    
    // Patch symlink creation - important for detecting link-based attacks
    this.fs.symlink = async (target, path) => {
      if (this.analyzer) {
        // Create a security event
        const event = {
          type: SecurityEventType.SYMLINK_OPERATION,
          timestamp: new Date(),
          containerName: this.config.containerName,
          userId: (this.fs as any).currentUid || 0,
          action: "symlink",
          path,
          details: {
            target
          }
        };
        
        // Process the event
        this.analyzer.processEvent(event);
      }
      
      // Call original method
      return originalSymlink.call(this.fs, target, path);
    };
  }
} 