#!/usr/bin/env deno

/**
 * Initialization script for @inspatial/theme
 *
 * This script provides a guided setup for the theme package.
 * It helps users initialize their environment with either stubs (lightweight)
 * or actual Google Fonts (complete).
 */

// Type definition for Deno to help TypeScript
declare global {
  namespace Deno {
    function run(options: { cmd: string[] }): {
      status(): Promise<{ success: boolean; code: number }>;
    };
  }
}

function colorText(text: string, color: string): string {
  const colors: Record<string, string> = {
    red: "\x1b[31m",
    green: "\x1b[32m",
    yellow: "\x1b[33m",
    blue: "\x1b[34m",
    magenta: "\x1b[35m",
    cyan: "\x1b[36m",
    reset: "\x1b[0m",
  };

  return `${colors[color] || ""}${text}${colors.reset}`;
}

async function runCommand(cmd: string[]): Promise<boolean> {
  console.log(colorText(`> ${cmd.join(" ")}`, "cyan"));

  try {
    const process = new Deno.Command(cmd[0], {
      args: cmd.slice(1),
      stdout: "inherit",
      stderr: "inherit",
    });

    const { code } = await process.output();
    return code === 0;
  } catch (error) {
    console.error(colorText(`Error running command: ${error.message}`, "red"));
    return false;
  }
}

async function main() {
  console.log(colorText("\n📚 InSpatial Theme Setup", "magenta"));
  console.log(colorText("=======================", "magenta"));

  console.log(
    "\nWelcome to the InSpatial Theme setup! This script will help you get started."
  );
  console.log("You have two options for Google Fonts:\n");

  console.log(colorText("1. Lightweight (Default)", "green"));
  console.log(
    "   Uses stub implementations for Google Fonts (small bundle size)"
  );
  console.log(
    "   Good for development or when you don't need actual Google Fonts\n"
  );

  console.log(colorText("2. Complete", "yellow"));
  console.log("   Installs actual Google Fonts (larger bundle size)");
  console.log("   Better for production or when you need the actual fonts\n");

  // Ask the user to select an option
  const response = prompt(
    colorText("Please select an option (1/2) [default: 1]: ", "cyan")
  );
  const option = response === "2" ? 2 : 1;

  // Generate stubs regardless of the option
  console.log(colorText("\nGenerating Google Font stubs...", "cyan"));
  const stubsGenerated = await runCommand([
    "deno",
    "task",
    "generate-google-stubs",
  ]);

  if (!stubsGenerated) {
    console.error(
      colorText("Failed to generate stubs. Please try again.", "red")
    );
    Deno.exit(1);
  }

  // If the user selected option 2, install popular Google Fonts
  if (option === 2) {
    console.log(colorText("\nInstalling popular Google Fonts...", "cyan"));
    console.log(
      "This will download and process the most commonly used Google Fonts."
    );
    console.log("This might take a moment...\n");

    const fontsInstalled = await runCommand([
      "deno",
      "task",
      "fonts:google:install",
      "--",
      "--popular",
    ]);

    if (!fontsInstalled) {
      console.error(
        colorText(
          "Failed to install Google Fonts. You can try again later with:",
          "red"
        )
      );
      console.log(
        colorText("  deno task fonts:google:install -- --popular", "yellow")
      );
      Deno.exit(1);
    }
  }

  console.log(colorText("\n✅ Setup complete!", "green"));
  console.log("\nYou can now use InSpatial Theme in your project.");

  if (option === 1) {
    console.log("\nTo install actual Google Fonts later, run:");
    console.log(
      colorText("  deno task fonts:google:install -- --popular", "yellow")
    );
  } else {
    console.log("\nTo uninstall Google Fonts and revert to stubs, run:");
    console.log(colorText("  deno task fonts:google:uninstall", "yellow"));
  }

  console.log("\nTo see all available options, check out the README.md file.");
}

// Run the main function
if (import.meta.main) {
  main();
}
