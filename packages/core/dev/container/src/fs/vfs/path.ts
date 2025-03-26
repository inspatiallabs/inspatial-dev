/**
 * InSpatial Container System - VFS Path Utilities
 * 
 * This file provides utility functions for path manipulation and validation
 * within the virtual file system.
 */

/**
 * Path utilities for the virtual file system
 */
export class VfsPath {
  /**
   * Normalizes a path by resolving '.', '..' segments and removing duplicate separators
   */
  static normalize(path: string): string {
    // Handle empty path
    if (!path) {
      return ".";
    }

    // Detect platform-specific path separator
    const separator = path.includes("/") ? "/" : "\\";
    const isAbsolute = path.startsWith(separator);
    
    // Split path into segments
    const segments = path.split(separator).filter(s => s.length > 0);
    const result: string[] = [];
    
    // Process each segment
    for (const segment of segments) {
      if (segment === ".") {
        // Skip '.' segments
        continue;
      } else if (segment === "..") {
        // For '..' segments, remove the previous segment if possible
        if (result.length > 0 && result[result.length - 1] !== "..") {
          result.pop();
        } else if (!isAbsolute) {
          result.push("..");
        }
      } else {
        // Add normal segments
        result.push(segment);
      }
    }
    
    // Construct normalized path
    let normalizedPath = result.join(separator);
    
    // Restore leading separator for absolute paths
    if (isAbsolute) {
      normalizedPath = separator + normalizedPath;
    }
    
    // Handle empty result
    if (!normalizedPath) {
      return isAbsolute ? separator : ".";
    }
    
    return normalizedPath;
  }

  /**
   * Joins multiple path segments into a single path
   */
  static join(...paths: string[]): string {
    if (paths.length === 0) {
      return ".";
    }
    
    // Detect platform-specific path separator from the first non-empty path
    const separator = paths.find(p => p.length > 0)?.includes("/") ? "/" : "\\";
    
    // Join paths with separator
    const joined = paths.filter(p => p.length > 0).join(separator);
    
    // Handle empty result
    if (!joined) {
      return ".";
    }
    
    // Normalize the joined path
    return VfsPath.normalize(joined);
  }

  /**
   * Returns the directory name of a path
   */
  static dirname(path: string): string {
    // Handle empty or single component paths
    if (!path || path === "." || path === "..") {
      return ".";
    }
    
    // Detect platform-specific path separator
    const separator = path.includes("/") ? "/" : "\\";
    
    // Handle root paths
    if (path === separator) {
      return separator;
    }
    
    // Remove trailing separator if present
    if (path.endsWith(separator)) {
      path = path.slice(0, -1);
    }
    
    // Find the last separator
    const lastSeparatorIndex = path.lastIndexOf(separator);
    if (lastSeparatorIndex === -1) {
      return ".";
    }
    
    // Handle root directory
    if (lastSeparatorIndex === 0) {
      return separator;
    }
    
    // Return the parent directory
    return path.slice(0, lastSeparatorIndex);
  }

  /**
   * Returns the base name of a path
   */
  static basename(path: string, ext?: string): string {
    // Handle empty paths
    if (!path) {
      return "";
    }
    
    // Detect platform-specific path separator
    const separator = path.includes("/") ? "/" : "\\";
    
    // Remove trailing separator if present
    if (path.endsWith(separator)) {
      path = path.slice(0, -1);
    }
    
    // Find the last separator
    const lastSeparatorIndex = path.lastIndexOf(separator);
    
    // Extract the basename
    const basename = lastSeparatorIndex === -1 ? path : path.slice(lastSeparatorIndex + 1);
    
    // Remove extension if specified and matches
    if (ext && basename.endsWith(ext) && basename !== ext) {
      return basename.slice(0, basename.length - ext.length);
    }
    
    return basename;
  }

  /**
   * Returns the extension of a path
   */
  static extname(path: string): string {
    // Get basename to handle the path properly
    const basename = VfsPath.basename(path);
    
    // Find the last dot in the basename
    const lastDotIndex = basename.lastIndexOf(".");
    
    // Return the extension or empty string
    return lastDotIndex === -1 || lastDotIndex === 0 ? "" : basename.slice(lastDotIndex);
  }

  /**
   * Resolves a path to an absolute path
   */
  static resolve(...paths: string[]): string {
    // Handle empty path list
    if (paths.length === 0) {
      return ".";
    }
    
    // Detect platform-specific path separator from the first non-empty path
    const separator = paths.find(p => p.length > 0)?.includes("/") ? "/" : "\\";
    
    let resolvedPath = "";
    let isAbsolute = false;
    
    // Process each path in reverse order
    for (let i = paths.length - 1; i >= 0; i--) {
      const path = paths[i];
      
      // Skip empty paths
      if (!path) {
        continue;
      }
      
      // Prepend the current path to the resolved path
      resolvedPath = resolvedPath ? VfsPath.join(path, resolvedPath) : path;
      
      // Check if the path is absolute
      if (path.startsWith(separator)) {
        isAbsolute = true;
        break;
      }
    }
    
    // Handle case when no absolute path is found
    if (!isAbsolute && !resolvedPath.startsWith(separator)) {
      // Use current working directory for relative paths
      // In a container, we'll use the container's root or CWD
      resolvedPath = VfsPath.join("/", resolvedPath);
    }
    
    return VfsPath.normalize(resolvedPath);
  }

  /**
   * Checks if a path is absolute
   */
  static isAbsolute(path: string): boolean {
    if (!path) {
      return false;
    }
    
    // Check if the path starts with a separator
    return path.startsWith("/") || path.startsWith("\\");
  }

  /**
   * Makes a path relative to a base path
   */
  static relative(from: string, to: string): string {
    // Normalize paths
    from = VfsPath.normalize(from);
    to = VfsPath.normalize(to);
    
    // If paths are identical, return empty path
    if (from === to) {
      return "";
    }
    
    // Detect platform-specific path separator
    const separator = from.includes("/") ? "/" : "\\";
    
    // Split paths into segments
    const fromSegments = from.split(separator).filter(s => s.length > 0);
    const toSegments = to.split(separator).filter(s => s.length > 0);
    
    // Find common prefix
    let commonPrefixLength = 0;
    const minLength = Math.min(fromSegments.length, toSegments.length);
    
    while (commonPrefixLength < minLength && 
           fromSegments[commonPrefixLength] === toSegments[commonPrefixLength]) {
      commonPrefixLength++;
    }
    
    // Build the relative path
    const relativeSegments: string[] = [];
    
    // Add '..' for each remaining segment in 'from'
    for (let i = 0; i < fromSegments.length - commonPrefixLength; i++) {
      relativeSegments.push("..");
    }
    
    // Add the remaining segments from 'to'
    for (let i = commonPrefixLength; i < toSegments.length; i++) {
      relativeSegments.push(toSegments[i]);
    }
    
    // Handle empty relative path
    if (relativeSegments.length === 0) {
      return ".";
    }
    
    return relativeSegments.join(separator);
  }

  /**
   * Validates a path for security issues
   */
  static validate(path: string): boolean {
    // Check for null or empty paths
    if (!path) {
      return false;
    }
    
    // Normalize the path
    const normalizedPath = VfsPath.normalize(path);
    
    // Check for path traversal attempts that escape the root
    if (normalizedPath.includes("..")) {
      const parts = normalizedPath.split(/[\/\\]/).filter(p => p.length > 0);
      let depth = 0;
      
      for (const part of parts) {
        if (part === "..") {
          depth--;
          if (depth < 0) {
            return false; // Path tries to escape the root
          }
        } else if (part !== ".") {
          depth++;
        }
      }
    }
    
    // Additional security checks could be added here
    
    return true;
  }

  /**
   * Maps a virtual path to a real path
   * 
   * @param virtualPath The path within the virtual file system
   * @param virtualRoot The virtual root directory
   * @param realRoot The real root directory
   * @returns The mapped real path
   */
  static mapToReal(virtualPath: string, virtualRoot: string, realRoot: string): string {
    // Normalize paths
    virtualPath = VfsPath.normalize(virtualPath);
    virtualRoot = VfsPath.normalize(virtualRoot);
    realRoot = VfsPath.normalize(realRoot);
    
    // Detect platform-specific path separator
    const separator = virtualPath.includes("/") ? "/" : "\\";
    
    // Ensure the virtual path is within the virtual root
    if (!virtualPath.startsWith(virtualRoot)) {
      virtualPath = VfsPath.join(virtualRoot, virtualPath);
    }
    
    // Get the relative path from the virtual root
    const relativePath = VfsPath.relative(virtualRoot, virtualPath);
    
    // Map to the real root
    return VfsPath.join(realRoot, relativePath);
  }

  /**
   * Maps a real path to a virtual path
   * 
   * @param realPath The real file system path
   * @param realRoot The real root directory
   * @param virtualRoot The virtual root directory
   * @returns The mapped virtual path
   */
  static mapToVirtual(realPath: string, realRoot: string, virtualRoot: string): string {
    // Normalize paths
    realPath = VfsPath.normalize(realPath);
    realRoot = VfsPath.normalize(realRoot);
    virtualRoot = VfsPath.normalize(virtualRoot);
    
    // Detect platform-specific path separator
    const separator = realPath.includes("/") ? "/" : "\\";
    
    // Ensure the real path is within the real root
    if (!realPath.startsWith(realRoot)) {
      return ""; // Path is outside the real root
    }
    
    // Get the relative path from the real root
    const relativePath = VfsPath.relative(realRoot, realPath);
    
    // Map to the virtual root
    return VfsPath.join(virtualRoot, relativePath);
  }
} 