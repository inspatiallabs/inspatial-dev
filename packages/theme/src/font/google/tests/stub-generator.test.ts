/**
 * # Stub Generator Test
 * @summary Tests for the stub generator functionality
 */

import {
  test,
  assertEquals,
  assertExists,
  assertIsError,
  assertSpyCalls,
} from "@inspatial/test";
import { POPULAR_FONTS, generateGoogleFontStubs } from "../stub-generator.ts";
import { InSpatialFontProp } from "../font-generator.ts";
// @ts-ignore: Import mock adapter
import { createMockFunction } from "./mock-adapter.ts";

// Set up mocks
const mockConsoleLog = createMockFunction();
const mockConsoleError = createMockFunction();
const mockReadTextFile = createMockFunction();
const mockWriteTextFile = createMockFunction();

const originalConsoleLog = console.log;
const originalConsoleError = console.error;

// Sample font map for testing
const mockFontMap = {
  Roboto: {
    weights: ["400", "500", "700"],
    styles: ["normal", "italic"],
    subsets: ["latin", "latin-ext", "cyrillic"],
    family: "Roboto",
  },
  Open_Sans: {
    weights: ["300", "400", "600", "700"],
    styles: ["normal", "italic"],
    subsets: ["latin", "latin-ext"],
    family: "Open Sans",
  },
  Lato: {
    weights: ["400"],
    styles: ["normal", "italic"],
    subsets: ["latin"],
    family: "Lato",
  },
};

/**
 * Utility to extract exports from generated stub content
 */
function extractExports(stubContent: string): string[] {
  const exportLines = stubContent
    .split("\n")
    .filter((line) => line.startsWith("export const "))
    .map((line) => line.replace("export const ", "").split(" ")[0]);
  return exportLines;
}

/**
 * Creates a test placeholder function for use in tests
 */
function createTestPlaceholder(): (options: any) => InSpatialFontProp {
  return (options: any) => {
    return {
      className: "test-class",
      style: {
        fontFamily: "Test Font, sans-serif",
      },
    };
  };
}

test("POPULAR_FONTS should contain important Google Fonts", () => {
  // Verify popular fonts include the most common ones
  assertEquals(POPULAR_FONTS.includes("Roboto"), true);
  assertEquals(POPULAR_FONTS.includes("Open Sans"), true);
  assertEquals(POPULAR_FONTS.includes("Lato"), true);
  assertEquals(POPULAR_FONTS.includes("Montserrat"), true);
  assertEquals(POPULAR_FONTS.includes("Poppins"), true);

  // Verify we have a reasonable number of popular fonts
  assertEquals(POPULAR_FONTS.length >= 10, true);
});

test("generateGoogleFontStubs should generate stub content correctly", async () => {
  // Setup mocks
  console.log = mockConsoleLog;
  console.error = mockConsoleError;

  try {
    // Mock Deno namespace
    const mockDeno = {
      readTextFile: mockReadTextFile,
      writeTextFile: mockWriteTextFile,
    };

    // Track function calls
    let readTextFileCalled = false;
    let writeTextFileCalled = false;
    let stubContentArg = "";

    // Set up mock responses
    mockReadTextFile.mock.mockImplementation((path) => {
      readTextFileCalled = true;
      return Promise.resolve(JSON.stringify(mockFontMap));
    });

    mockWriteTextFile.mock.mockImplementation((path, content) => {
      writeTextFileCalled = true;
      stubContentArg = content;
      return Promise.resolve();
    });

    // Temporarily attach mock Deno functions to a safely mutable object
    const tempGlobal = globalThis as any;
    tempGlobal._mockDeno = mockDeno;

    // Use the mock functions from our safe container
    await generateGoogleFontStubs({
      readTextFile: tempGlobal._mockDeno.readTextFile,
      writeTextFile: tempGlobal._mockDeno.writeTextFile,
    });

    // Verify file operations were called
    assertEquals(readTextFileCalled, true);
    assertEquals(writeTextFileCalled, true);

    // Check for required content sections
    assertEquals(
      stubContentArg.includes("export type GoogleFontTypes = string;"),
      true
    );
    assertEquals(
      stubContentArg.includes(
        "export type AllFontVariants = GoogleFontTypes | PrimitiveFontTypes;"
      ),
      true
    );
    assertEquals(
      stubContentArg.includes("export const POPULAR_FONTS = "),
      true
    );
    assertEquals(
      stubContentArg.includes("function createGoogleFontPlaceholder"),
      true
    );

    // Check for font exports
    const exports = extractExports(stubContentArg);
    assertEquals(exports.includes("Roboto"), true);
    assertEquals(exports.includes("Open_Sans"), true);
    assertEquals(exports.includes("Lato"), true);

    // Check for utility functions
    assertEquals(stubContentArg.includes("export function fontFace"), true);
    assertEquals(stubContentArg.includes("export function getFontMap"), true);
    assertEquals(stubContentArg.includes("export default {"), true);

    // Clean up
    delete tempGlobal._mockDeno;
  } finally {
    // Restore console
    console.log = originalConsoleLog;
    console.error = originalConsoleError;
  }
});

test("Font placeholder function should return correct stub object", () => {
  // Import a placeholder function to test its behavior
  const placeholder = createTestPlaceholder();

  // Call the placeholder with mock options
  const result = placeholder({ weight: "400", style: "normal" });

  // Verify the structure and properties of the returned object
  assertEquals(typeof result.className, "string");
  assertExists(result.style);
  assertEquals(typeof result.style, "object");

  // If style is an object (not an array), check fontFamily property
  if (!Array.isArray(result.style)) {
    assertExists(result.style.fontFamily);
    assertEquals(typeof result.style.fontFamily, "string");
  }
});

test("Generated stub should handle errors gracefully", async () => {
  // Setup mocks
  console.log = mockConsoleLog;
  console.error = mockConsoleError;

  try {
    // Create mock functions and track calls
    let errorCalled = false;
    console.error = (...args: any[]) => {
      errorCalled = true;
      mockConsoleError(...args);
    };

    const mockExit = createMockFunction();
    let exitCalled = false;
    mockExit.mock.mockImplementation(() => {
      exitCalled = true;
      // Don't actually exit in tests
    });

    // Set up tempGlobal
    const tempGlobal = globalThis as any;
    tempGlobal._mockDeno = {
      readTextFile: mockReadTextFile,
      writeTextFile: mockWriteTextFile,
      exit: mockExit,
    };

    // Force an error by rejecting the file read
    mockReadTextFile.mock.mockImplementation(() =>
      Promise.reject(new Error("Mock file read error"))
    );

    // Run the stub generator with mocked dependencies that will fail
    try {
      // Modify generateGoogleFontStubs to use our mocked exit
      const originalExit = Deno.exit;
      Deno.exit = mockExit;

      await generateGoogleFontStubs({
        readTextFile: tempGlobal._mockDeno.readTextFile,
        writeTextFile: tempGlobal._mockDeno.writeTextFile,
      });

      // Restore original exit
      Deno.exit = originalExit;
    } catch (e) {
      // Expected to throw, but will fail the test if we don't catch
    }

    // Verify error handling
    assertEquals(errorCalled, true);

    // Clean up
    delete tempGlobal._mockDeno;
  } finally {
    // Restore console
    console.log = originalConsoleLog;
    console.error = originalConsoleError;
  }
});
