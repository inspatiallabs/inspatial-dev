// @ts-nocheck
import { createDOM } from "@in/dom";

/**
 * # TestSetup
 * @summary #### Optimized test environment setup for InSpatial Motion testing in Deno
 *
 * This module provides a streamlined test environment that leverages InSpatial's
 * built-in utilities and avoids redundant implementations.
 *
 * @since 0.1.0
 * @category InSpatial Motion Testing
 */

console.log("🔄 Starting test setup module import...");

// ------------------------------------------------------------
// 🌐 InSpatial DOM bootstrap
// We use the lightweight `InSpatial DOM` module to simulate the browser environment
// ------------------------------------------------------------

let isSetup = false;

// Initialize DOM environment synchronously
function initializeDom() {
  console.log("🔄 initializeDom called, isSetup:", isSetup);

  if (isSetup) return;

  console.log("🔄 Setting up performance...");
  // Make sure we have a reliable performance.now() implementation
  if (!globalThis.performance) {
    globalThis.performance = {
      now: () => Date.now(),
    };
  }

  console.log("🔄 Creating DOM...");
  const { window, document, Node, Element, HTMLElement, SVGElement } =
    createDOM("<html><body></body></html>");

  console.log("🔄 Assigning globals...");

  const setInnerHTML = (html: string) => document.documentElement.innerHTML = html;
  
  // Expose browser-like globals expected by InSpatial Motion tests
  Object.assign(globalThis, {
    window,
    document,
    Node,
    Element,
    HTMLElement,
    SVGElement,
    setInnerHTML,
    getComputedStyle: (element: any) => ({
      transform: element.style.transform || "none",
      width: element.style.width || "auto",
      height: element.style.height || "auto",
      opacity: element.style.opacity || "1",
      fontSize: element.style.fontSize || "16px",
      backgroundColor: element.style.backgroundColor || "transparent",
    }),
    cancelAnimationFrame: (handle: number) => clearTimeout(handle),
  });


  console.log("🔄 Setting up RAF...");
  // Set up window.requestAnimationFrame and cancelAnimationFrame
  globalThis.requestAnimationFrame = (
    callback: FrameRequestCallback
  ): number => {
    return setTimeout(() => {
      callback(performance.now());
    }, 16) as unknown as number;
  };

  globalThis.cancelAnimationFrame = (handle: number): void => {
    clearTimeout(handle);
    window.cancelAnimationFrame = globalThis.cancelAnimationFrame;
  };

  // Add other window properties
  globalThis.window = globalThis;

  console.log("✅ InSpatial DOM environment initialised");
  isSetup = true;
}

console.log("🔄 About to call initializeDom...");
// Initialize immediately when this module is imported
initializeDom();
console.log("🔄 initializeDom completed");

// Create test objects to match the original test setup
const testObject: Record<string, any> = {
  plainValue: 10,
  valueWithUnit: "10px",
  multiplePlainValues: "16 32 64 128",
  multipleValuesWithUnits: "16px 32em 64% 128ch",
};

const anOtherTestObject: Record<string, any> = {
  plainValue: 20,
};

console.log("🔄 Setting up global test objects...");
// Expose test objects globally
(globalThis as any).testObject = testObject;
(globalThis as any).anOtherTestObject = anOtherTestObject;

// Set up the global document object with proper test structure
function setupTestDOM() {
  console.log("🔄 setupTestDOM called");
  const doc = globalThis.document;

  // Clear body first
  doc.body.innerHTML = "";

  // Create and append #tests element manually
  const testsEl = doc.createElement("div");
  testsEl.id = "tests";
  doc.body.appendChild(testsEl);

  // Create target elements manually
  const targetId = doc.createElement("div");
  targetId.id = "target-id";
  targetId.className = "target-class";
  targetId.setAttribute("data-index", "0");
  testsEl.appendChild(targetId);

  // Create more target class elements
  for (let i = 1; i < 4; i++) {
    const targetClass = doc.createElement("div");
    targetClass.className = "target-class";
    targetClass.setAttribute("data-index", i.toString());
    if (i === 1) {
      targetClass.classList.add("with-width-attribute");
      targetClass.setAttribute("width", "200");
    }
    if (i === 2) {
      targetClass.classList.add("with-inline-styles");
      targetClass.style.width = "200px";
    }
    testsEl.appendChild(targetClass);
  }

  // Create SVG element manually
  const svgEl = doc.createElementNS("http://www.w3.org/2000/svg", "svg");
  svgEl.id = "svg-element";
  svgEl.setAttribute("viewBox", "0 0 600 400");

  const pathEl = doc.createElementNS("http://www.w3.org/2000/svg", "path");
  pathEl.id = "path";
  pathEl.setAttribute("stroke", "#4E7EFC");
  pathEl.setAttribute(
    "d",
    "M250 300c0-27.614 22.386-50 50-50s50 22.386 50 50v50h-50c-27.614 0-50-22.386-50-50z"
  );
  svgEl.appendChild(pathEl);

  testsEl.appendChild(svgEl);

  // Create input element
  const inputEl = doc.createElement("input");
  inputEl.type = "number";
  inputEl.id = "input-number";
  inputEl.name = "Input number test";
  inputEl.min = "0";
  inputEl.max = "100";
  inputEl.value = "0";
  testsEl.appendChild(inputEl);

  // Reset test objects
  testObject.plainValue = 10;
  testObject.valueWithUnit = "10px";
  testObject.multiplePlainValues = "16 32 64 128";
  testObject.multipleValuesWithUnits = "16px 32em 64% 128ch";
  anOtherTestObject.plainValue = 20;

  console.log("Test DOM setup completed");
}

console.log("🔄 About to call setupTestDOM...");
// Set up HTML elements based on the original test setup
setupTestDOM();

console.log("✅ Optimized test environment setup completed");

// Called by our test scripts to ensure DOM is ready
export function ensureTestEnvironment() {
  console.log("🔄 ensureTestEnvironment called");
  if (!globalThis.document) {
    console.error("Document not defined! Setup failed.");
    return false;
  }

  const testsEl = globalThis.document.querySelector("#tests");
  if (!testsEl) {
    setupTestDOM();
  }

  return true;
}

// Expose functions to run before each test
export function beforeEachTest() {
  console.log("🔄 beforeEachTest called");
  // Reset test objects
  testObject.plainValue = 10;
  testObject.valueWithUnit = "10px";
  testObject.multiplePlainValues = "16 32 64 128";
  testObject.multipleValuesWithUnits = "16px 32em 64% 128ch";
  anOtherTestObject.plainValue = 20;

  // Reset test DOM
  setupTestDOM();

  // Reset target styles
  const targets = document.querySelectorAll(
    "#target-id, .target-class, .css-properties, .with-inline-styles"
  );
  targets.forEach((target) => {
    if (target.style) {
      target.style.cssText = "";
      target.removeAttribute("transform");
    }
  });
}

export function afterEachTest() {
  globalThis.cancelAnimationFrame(globalThis.requestAnimationFrame(() => {}));
  console.log("🔄 afterEachTest called");
  // Reset test objects
  testObject.plainValue = 10;
  testObject.valueWithUnit = "10px";
  testObject.multiplePlainValues = "16 32 64 128";
}

console.log("🔄 Test setup module completed");
