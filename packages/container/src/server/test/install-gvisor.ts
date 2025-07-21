/**
 * gVisor Installation Helper Script
 * 
 * This script helps users install gVisor on their system.
 * It provides platform-specific installation instructions and can attempt automatic installation.
 */

// Define Deno types for TypeScript
// deno-lint-ignore-file no-explicit-any
declare global {
  interface DenoNamespace {
    Command: new (command: string, options?: { args: string[] }) => {
      output(): Promise<{ code: number; stdout: Uint8Array; stderr: Uint8Array }>;
    };
    build?: {
      os?: string;
    };
  }
  
  interface ImportMeta {
    main: boolean;
  }
}

/**
 * Detect the operating system
 */
async function detectOS(): Promise<"linux" | "darwin" | "windows" | "unknown"> {
  try {
    // Try to get OS info using Deno
    const os = (globalThis.Deno as any).build?.os;
    if (os === "linux") return "linux";
    if (os === "darwin") return "darwin";
    if (os === "windows") return "windows";
    
    // Fallback to command-line detection
    const command = new globalThis.Deno.Command("uname", { args: ["-s"] });
    const output = await command.output();
    
    if (output.code !== 0) return "unknown";
    
    const osName = new TextDecoder().decode(output.stdout).trim().toLowerCase();
    if (osName.includes("linux")) return "linux";
    if (osName.includes("darwin")) return "darwin";
    
    return "unknown";
  } catch (error) {
    console.error("Error detecting OS:", error);
    return "unknown";
  }
}

/**
 * Check if a command exists
 */
async function commandExists(command: string): Promise<boolean> {
  try {
    const whichCommand = (globalThis.Deno as any).build?.os === "windows" ? "where" : "which";
    const cmd = new globalThis.Deno.Command(whichCommand, { args: [command] });
    const output = await cmd.output();
    return output.code === 0;
  } catch (error) {
    return false;
  }
}

/**
 * Main installation function
 */
async function installGVisor() {
  console.log("gVisor Installation Helper");
  console.log("=========================\n");
  
  // Check if gVisor is already installed
  const gvisorExists = await commandExists("runsc");
  if (gvisorExists) {
    try {
      const cmd = new globalThis.Deno.Command("runsc", { args: ["--version"] });
      const output = await cmd.output();
      const version = new TextDecoder().decode(output.stdout).trim();
      console.log(`✅ gVisor is already installed: ${version}`);
      return;
    } catch (error) {
      console.log("⚠️ runsc command was found but failed to run properly");
    }
  }
  
  // Detect OS
  const os = await detectOS();
  console.log(`Detected OS: ${os}`);
  
  if (os === "linux") {
    console.log("\nInstallation instructions for Linux:");
    console.log("1. Install using the official script:\n");
    console.log("   curl -fsSL https://gvisor.dev/archive.key | sudo gpg --dearmor -o /usr/share/keyrings/gvisor-archive-keyring.gpg");
    console.log("   echo \"deb [arch=$(dpkg --print-architecture) signed-by=/usr/share/keyrings/gvisor-archive-keyring.gpg] https://storage.googleapis.com/gvisor/releases release main\" | sudo tee /etc/apt/sources.list.d/gvisor.list > /dev/null");
    console.log("   sudo apt-get update && sudo apt-get install -y runsc");
    console.log("\n2. Configure Docker to use gVisor (runsc):\n");
    console.log("   sudo mkdir -p /etc/docker");
    console.log("   sudo tee /etc/docker/daemon.json > /dev/null << EOF");
    console.log("   {");
    console.log("     \"runtimes\": {");
    console.log("       \"runsc\": {");
    console.log("         \"path\": \"/usr/bin/runsc\",");
    console.log("         \"runtimeArgs\": [");
    console.log("           \"--platform=ptrace\"");
    console.log("         ]");
    console.log("       }");
    console.log("     }");
    console.log("   }");
    console.log("   EOF");
    console.log("   sudo systemctl restart docker");
    
    // Ask if user wants to attempt automatic installation
    console.log("\nWould you like to attempt automatic installation? [y/N]");
    const decision = prompt("> ");
    
    if (decision?.toLowerCase() === "y") {
      // Check if we have sudo access
      const hasSudo = await commandExists("sudo");
      if (!hasSudo) {
        console.log("❌ sudo command not found. Cannot proceed with automatic installation.");
        console.log("Please follow the manual installation steps above.");
        return;
      }
      
      // Attempt to install
      console.log("\nAttempting to install gVisor...");
      
      try {
        // Download key
        const keyCmd = new globalThis.Deno.Command("sh", {
          args: ["-c", "curl -fsSL https://gvisor.dev/archive.key | sudo gpg --dearmor -o /usr/share/keyrings/gvisor-archive-keyring.gpg"]
        });
        await keyCmd.output();
        
        // Add repository
        const repoCmd = new globalThis.Deno.Command("sh", {
          args: ["-c", "echo \"deb [arch=$(dpkg --print-architecture) signed-by=/usr/share/keyrings/gvisor-archive-keyring.gpg] https://storage.googleapis.com/gvisor/releases release main\" | sudo tee /etc/apt/sources.list.d/gvisor.list > /dev/null"]
        });
        await repoCmd.output();
        
        // Update and install
        const installCmd = new globalThis.Deno.Command("sudo", {
          args: ["apt-get", "update"]
        });
        await installCmd.output();
        
        const installRunscCmd = new globalThis.Deno.Command("sudo", {
          args: ["apt-get", "install", "-y", "runsc"]
        });
        await installRunscCmd.output();
        
        // Verify installation
        const verifyCmd = new globalThis.Deno.Command("runsc", {
          args: ["--version"]
        });
        const verifyOutput = await verifyCmd.output();
        
        if (verifyOutput.code === 0) {
          const version = new TextDecoder().decode(verifyOutput.stdout).trim();
          console.log(`✅ gVisor installed successfully: ${version}`);
        } else {
          console.log("❌ Installation seemed to succeed but runsc command failed");
          console.log("Please try the manual installation steps");
        }
      } catch (error) {
        console.error("❌ Installation failed:", error);
        console.log("Please try the manual installation steps");
      }
    }
  } else if (os === "darwin") {
    console.log("\n⚠️ gVisor is primarily designed for Linux.");
    console.log("For macOS development, we recommend:");
    console.log("1. Using Docker Desktop with Virtualization");
    console.log("2. Running tests in a Linux VM");
    console.log("3. Using our mock implementations for local testing");
    
    console.log("\nIf you want to use our container tests with real gVisor support,");
    console.log("please run them in a Linux environment.");
  } else if (os === "windows") {
    console.log("\n⚠️ gVisor is primarily designed for Linux.");
    console.log("For Windows development, we recommend:");
    console.log("1. Using WSL2 with Ubuntu");
    console.log("2. Using Docker Desktop with WSL2 backend");
    console.log("3. Using our mock implementations for local testing");
    
    console.log("\nTo install with WSL2:");
    console.log("1. Open a WSL2 terminal");
    console.log("2. Follow the Linux installation instructions in that terminal");
  } else {
    console.log("\n❌ Unsupported operating system.");
    console.log("gVisor is primarily designed for Linux.");
    console.log("Please visit https://gvisor.dev/docs/user_guide/install/ for more information.");
  }
  
  console.log("\nFor more information, visit: https://gvisor.dev/docs/user_guide/install/");
}

// Self-executing function for module entry point
// @ts-ignore: Allow import.meta usage
if (import.meta.main) {
  installGVisor();
} 