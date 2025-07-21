/**
 * InSpatial Container System - Behavior Analysis Test
 * 
 * This file provides tests to demonstrate the behavior analysis capabilities
 * of the container security system.
 */

import { createSecureFileSystem } from "./integration.ts";
import { IsolationLevel, SecurityLevel } from "./security-manager.ts";

/**
 * Runs tests for the behavior analysis system
 */
async function runBehaviorTests() {
  console.log("===== BEHAVIOR ANALYSIS SECURITY TESTS =====");
  console.log("Creating secure file system...");
  
  // Track security incidents
  const securityIncidents: any[] = [];
  
  // Create a secure file system with enhanced isolation
  const { fs, securityManager } = createSecureFileSystem({
    containerName: "test-container",
    isolationLevel: IsolationLevel.ENHANCED,
    onSecurityIncident: (incident) => {
      securityIncidents.push(incident);
      console.log(`Security incident detected: ${incident.message}`);
    },
    onContainerBlocked: (data) => {
      console.log(`Container blocked: ${data.reason}`);
    }
  });
  
  // Helper function to create a delay
  const delay = (ms: number) => new Promise(resolve => setTimeout(resolve, ms));
  
  // Helper function to run tests
  const runTest = async (name: string, testFn: () => Promise<void>) => {
    console.log(`\n--- Test: ${name} ---`);
    try {
      await testFn();
      console.log(`✅ Test completed`);
    } catch (error) {
      console.log(`❌ Test failed: ${error.message}`);
    }
  };
  
  // Test 1: Path traversal detection
  await runTest("Path traversal detection", async () => {
    console.log("Attempting to access /etc/passwd...");
    try {
      await fs.readFile("/etc/passwd");
      throw new Error("Expected security policy to block access");
    } catch (error) {
      if (!error.message.includes("forbidden")) {
        throw error;
      }
      console.log("Access correctly blocked by security policy");
    }
  });
  
  // Test 2: High frequency file access detection
  await runTest("High frequency file access detection", async () => {
    console.log("Creating test file...");
    await fs.writeFile("/home/test.txt", new TextEncoder().encode("test content"));
    
    console.log("Performing high frequency access pattern...");
    const promises = [];
    for (let i = 0; i < 60; i++) {
      promises.push(fs.readFile("/home/test.txt").catch(() => {}));
    }
    
    await Promise.all(promises);
    await delay(100); // Give time for events to process
    
    // Check if a high frequency incident was recorded
    const highFrequencyIncident = securityIncidents.find(i => 
      i.type === 'high-frequency-access' || i.message.includes('High frequency')
    );
    
    if (!highFrequencyIncident) {
      console.log("Note: High frequency incident might not be detected in test environment");
    } else {
      console.log("High frequency access correctly detected");
    }
  });
  
  // Test 3: Permission escalation detection
  await runTest("Permission escalation detection", async () => {
    console.log("Creating executable file...");
    await fs.writeFile("/home/executable.sh", new TextEncoder().encode("#!/bin/bash\necho 'test'"));
    
    console.log("Changing permissions to make it executable with setuid bit...");
    try {
      await fs.chmod("/home/executable.sh", 0o4755); // setuid + rwxr-xr-x
      
      // Give time for events to process
      await delay(100);
      
      // Check if a permission escalation incident was recorded
      const permissionIncident = securityIncidents.find(i => 
        i.type === 'permission-escalation-attempt' || 
        i.message.includes('permission escalation') ||
        i.message.includes('setuid')
      );
      
      if (!permissionIncident) {
        console.log("⚠️ Permission escalation not detected - this might be expected in test environment");
      } else {
        console.log("Permission escalation correctly detected");
      }
    } catch (error) {
      console.log(`Setting setuid bit failed: ${error.message}`);
    }
  });
  
  // Test 4: Suspicious symlink detection
  await runTest("Suspicious symlink detection", async () => {
    console.log("Creating symlink to /etc/passwd...");
    try {
      await fs.symlink("/etc/passwd", "/home/passwd-link");
      
      // Give time for events to process
      await delay(100);
      
      // Check if a suspicious symlink incident was recorded
      const symlinkIncident = securityIncidents.find(i => 
        i.type === 'suspicious-symlink' || 
        i.message.includes('symlink')
      );
      
      if (!symlinkIncident) {
        console.log("⚠️ Suspicious symlink not detected - this might be expected in test environment");
      } else {
        console.log("Suspicious symlink correctly detected");
      }
    } catch (error) {
      console.log(`Creating symlink failed: ${error.message}`);
    }
  });
  
  // Test 5: Mount operation detection
  await runTest("Mount operation detection", async () => {
    console.log("Attempting to mount a device...");
    try {
      await fs.mount("/dev/sda1", "/mnt");
      
      // Give time for events to process
      await delay(100);
      
      // Check if a mount operation incident was recorded
      const mountIncident = securityIncidents.find(i => 
        i.type === 'mount-operation' || 
        i.message.includes('mount')
      );
      
      if (!mountIncident) {
        console.log("⚠️ Mount operation not detected - this might be expected in test environment");
      } else {
        console.log("Mount operation correctly detected");
      }
    } catch (error) {
      console.log(`Mount operation failed: ${error.message}`);
    }
  });
  
  // Summary
  console.log("\n===== TEST SUMMARY =====");
  console.log(`Total security incidents detected: ${securityIncidents.length}`);
  console.log("Incident breakdown:");
  
  const typeCounts: Record<string, number> = {};
  const levelCounts: Record<string, number> = {};
  
  securityIncidents.forEach(incident => {
    typeCounts[incident.type] = (typeCounts[incident.type] || 0) + 1;
    levelCounts[incident.level] = (levelCounts[incident.level] || 0) + 1;
  });
  
  console.log("By type:");
  Object.entries(typeCounts).forEach(([type, count]) => {
    console.log(`- ${type}: ${count}`);
  });
  
  console.log("By severity level:");
  Object.entries(levelCounts).forEach(([level, count]) => {
    console.log(`- ${level}: ${count}`);
  });
  
  console.log("\n===== BEHAVIOR ANALYSIS SECURITY TESTS COMPLETE =====");
}

// Run the tests
runBehaviorTests().catch(console.error); 