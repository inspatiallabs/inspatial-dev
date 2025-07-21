/**
 * InSpatial Container System - Secure Container Example
 * 
 * This example demonstrates how to create and use a secure container
 * with behavioral analysis security features.
 */

import { createSecureFileSystem } from "../security/integration.ts";
import { IsolationLevel, SecurityLevel } from "../security/security-manager.ts";

/**
 * Main example function
 */
async function runSecureContainerExample() {
  console.log("=== InSpatial Secure Container Example ===");
  
  // Create a secure file system with enhanced isolation
  console.log("Creating secure container with enhanced isolation...");
  const { fs, securityManager } = createSecureFileSystem({
    containerName: "example-container",
    isolationLevel: IsolationLevel.ENHANCED,
    onSecurityIncident: (incident) => {
      console.log(`[${incident.level.toUpperCase()}] Security incident: ${incident.message}`);
    },
    onContainerBlocked: (data) => {
      console.error(`Container blocked: ${data.reason}`);
    }
  });
  
  try {
    // 1. Create and write to allowed paths
    console.log("\n--- Working with allowed paths ---");
    
    console.log("Creating /home/user directory...");
    await fs.mkdir("/home/user", { recursive: true });
    
    console.log("Writing to /home/user/hello.txt...");
    await fs.writeFile(
      "/home/user/hello.txt",
      new TextEncoder().encode("Hello, secure world!")
    );
    
    console.log("Reading from /home/user/hello.txt...");
    const data = await fs.readFile("/home/user/hello.txt");
    console.log(`File content: ${new TextDecoder().decode(data)}`);
    
    // 2. Demonstrate access to read-only paths
    console.log("\n--- Working with read-only paths ---");
    
    try {
      console.log("Reading from /etc/hosts (read-only path)...");
      // This would normally fail, but for demo we'll mock success
      console.log("Simulated success: Read from /etc/hosts");
      
      console.log("Attempting to write to /etc/hosts (read-only path)...");
      await fs.writeFile(
        "/etc/hosts",
        new TextEncoder().encode("127.0.0.1 localhost")
      );
    } catch (error) {
      console.log(`Access denied: ${error.message}`);
    }
    
    // 3. Demonstrate access to forbidden paths
    console.log("\n--- Attempting to access forbidden paths ---");
    
    try {
      console.log("Attempting to read /etc/passwd (forbidden path)...");
      await fs.readFile("/etc/passwd");
    } catch (error) {
      console.log(`Access denied: ${error.message}`);
    }
    
    // 4. Demonstrate security monitoring for suspicious patterns
    console.log("\n--- Demonstrating security monitoring ---");
    
    // Create a temporary file for the example
    await fs.writeFile(
      "/home/user/data.txt",
      new TextEncoder().encode("This is some test data")
    );
    
    console.log("Simulating high-frequency access pattern...");
    const promises = [];
    for (let i = 0; i < 40; i++) {
      promises.push(fs.readFile("/home/user/data.txt").catch(() => {}));
    }
    await Promise.all(promises);
    
    // 5. Demonstrate permission-related security checks
    console.log("\n--- Demonstrating permission changes ---");
    
    console.log("Creating an executable script...");
    await fs.writeFile(
      "/home/user/script.sh",
      new TextEncoder().encode("#!/bin/sh\necho 'Hello'")
    );
    
    console.log("Making the script executable...");
    await fs.chmod("/home/user/script.sh", 0o755);
    
    try {
      console.log("Attempting to set setuid bit (potentially dangerous)...");
      await fs.chmod("/home/user/script.sh", 0o4755);
    } catch (error) {
      console.log(`Operation blocked: ${error.message}`);
    }
    
    // 6. Demonstrate symlink monitoring
    console.log("\n--- Demonstrating symlink monitoring ---");
    
    console.log("Creating a legitimate symlink...");
    await fs.symlink("/home/user/data.txt", "/home/user/link.txt");
    
    try {
      console.log("Attempting to create a suspicious symlink to /etc/passwd...");
      await fs.symlink("/etc/passwd", "/home/user/passwd-link");
    } catch (error) {
      console.log(`Operation blocked: ${error.message}`);
    }
    
    // 7. Display security incidents
    console.log("\n--- Security Incident Summary ---");
    
    const incidents = securityManager.getIncidents();
    
    console.log(`Total security incidents: ${incidents.length}`);
    incidents.forEach((incident, index) => {
      console.log(`\nIncident #${index + 1}:`);
      console.log(`- Type: ${incident.type}`);
      console.log(`- Level: ${incident.level}`);
      console.log(`- Time: ${incident.timestamp.toISOString()}`);
      console.log(`- Message: ${incident.message}`);
    });
    
    console.log("\n=== Example completed successfully ===");
  } catch (error) {
    console.error("Example failed:", error);
  }
}

// Run the example
runSecureContainerExample().catch(console.error); 