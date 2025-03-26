/**
 * InSpatial Container System - Security Integration
 * 
 * This module integrates the security system with the container system,
 * providing convenience functions for setup and configuration.
 */

import { MemoryFileSystem } from "../fs/vfs/memory-fs.ts";
import { SecurityManager, IsolationLevel, SecurityProfile } from "./security-manager.ts";
import { SecurityLevel, BehaviorRule } from "./behavior-analyzer.ts";

/**
 * Options for creating a secured file system
 */
export interface SecureFileSystemOptions {
  containerName: string;
  isolationLevel?: IsolationLevel;
  customProfile?: Partial<SecurityProfile>;
  customRules?: BehaviorRule[];
  onSecurityIncident?: (incident: any) => void;
  onContainerBlocked?: (data: any) => void;
}

/**
 * Creates a secured file system with behavioral analysis
 * 
 * @param options Configuration options
 * @returns Object containing the file system and security manager
 */
export function createSecureFileSystem(options: SecureFileSystemOptions): {
  fs: MemoryFileSystem;
  securityManager: SecurityManager;
} {
  // Create the file system
  const fs = new MemoryFileSystem(`${options.containerName}-fs`);
  
  // Create the security manager
  const securityManager = new SecurityManager({
    containerName: options.containerName,
    isolationLevel: options.isolationLevel || IsolationLevel.STANDARD,
    customProfile: options.customProfile || {}
  });
  
  // Initialize the file system monitor
  securityManager.initializeFsMonitor(fs);
  
  // Set up event listeners
  if (options.onSecurityIncident) {
    securityManager.on('security-incident', options.onSecurityIncident);
  }
  
  if (options.onContainerBlocked) {
    securityManager.on('container-blocked', options.onContainerBlocked);
  }
  
  // Create a proxy for the file system that adds security checks
  const secureFs = createSecureFileSystemProxy(fs, securityManager);
  
  return {
    fs: secureFs,
    securityManager
  };
}

/**
 * Creates a proxy around the file system that enforces security policies
 * 
 * @param fs Original file system
 * @param securityManager Security manager to enforce policies
 * @returns Proxy file system with security checks
 */
function createSecureFileSystemProxy(
  fs: MemoryFileSystem,
  securityManager: SecurityManager
): MemoryFileSystem {
  // Create a proxy to intercept file system operations
  const proxy = new Proxy(fs, {
    get(target: any, prop: string, receiver: any) {
      const original = Reflect.get(target, prop, receiver);
      
      // If the property is not a function, return it directly
      if (typeof original !== 'function') {
        return original;
      }
      
      // For methods that access the file system, add security checks
      switch (prop) {
        case 'open':
        case 'readFile':
        case 'stat':
        case 'access':
        case 'readlink':
        case 'realpath':
          return function(...args: any[]) {
            const path = args[0];
            
            // Check if the container is blocked
            if (securityManager.isBlocked()) {
              throw new Error('Container is blocked due to security policy violation');
            }
            
            // Check if the path is allowed
            if (!securityManager.isPathAllowed(path)) {
              securityManager.recordIncident(
                SecurityLevel.MEDIUM,
                'forbidden-path-access',
                `Blocked access to forbidden path: ${path}`,
                { path, operation: prop }
              );
              throw new Error(`Access to path "${path}" is forbidden by security policy`);
            }
            
            // Call the original method
            return original.apply(target, args);
          };
        
        case 'writeFile':
        case 'mkdir':
        case 'rmdir':
        case 'unlink':
        case 'symlink':
        case 'rename':
        case 'truncate':
        case 'chmod':
        case 'chown':
        case 'utimes':
          return function(...args: any[]) {
            const path = args[0];
            
            // Check if the container is blocked
            if (securityManager.isBlocked()) {
              throw new Error('Container is blocked due to security policy violation');
            }
            
            // Check if write access to the path is allowed
            if (!securityManager.isPathAllowed(path, true)) {
              securityManager.recordIncident(
                SecurityLevel.MEDIUM,
                'forbidden-path-modification',
                `Blocked modification of forbidden/readonly path: ${path}`,
                { path, operation: prop }
              );
              throw new Error(`Modification of path "${path}" is forbidden by security policy`);
            }
            
            // Call the original method
            return original.apply(target, args);
          };
        
        case 'mount':
          return function(...args: any[]) {
            const [source, target, options] = args;
            
            // Check if the container is blocked
            if (securityManager.isBlocked()) {
              throw new Error('Container is blocked due to security policy violation');
            }
            
            // Mount operations are particularly sensitive
            securityManager.recordIncident(
              SecurityLevel.LOW,
              'mount-operation',
              `Mount operation detected: ${source} -> ${target}`,
              { source, target, options }
            );
            
            // Call the original method
            return original.apply(target, args);
          };
        
        default:
          // For other methods, just pass through
          return function(...args: any[]) {
            return original.apply(target, args);
          };
      }
    }
  });
  
  return proxy as MemoryFileSystem;
}

/**
 * Creates predefined security profiles for common use cases
 * 
 * @param containerName Name of the container
 * @returns Object with predefined security profiles
 */
export function createSecurityProfiles(containerName: string): {
  standard: SecureFileSystemOptions;
  enhanced: SecureFileSystemOptions;
  maximum: SecureFileSystemOptions;
} {
  const baseOptions = {
    containerName,
    onSecurityIncident: (incident: any) => {
      console.warn(`[SECURITY] ${incident.level}: ${incident.message}`);
    },
    onContainerBlocked: (data: any) => {
      console.error(`[SECURITY] Container ${data.containerName} blocked: ${data.reason}`);
    }
  };
  
  return {
    standard: {
      ...baseOptions,
      isolationLevel: IsolationLevel.STANDARD
    },
    enhanced: {
      ...baseOptions,
      isolationLevel: IsolationLevel.ENHANCED
    },
    maximum: {
      ...baseOptions,
      isolationLevel: IsolationLevel.MAXIMUM
    }
  };
} 