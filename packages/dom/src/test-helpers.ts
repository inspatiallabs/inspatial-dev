/**
 * @module Test Helpers for InSpatial DOM
 * 
 * Provides isolated test environments for DOM testing to prevent test interference
 * and ensure consistent, reproducible test results.
 */

import { createDOM } from "./index.ts";

/**
 * Creates an isolated DOM environment for testing
 * 
 * This function creates a fresh DOM environment for each test,
 * preventing test interference and ensuring clean state.
 * 
 * @param initialHTML - Optional initial HTML to parse
 * @returns Isolated DOM environment with document, window, and all DOM interfaces
 */
export function createIsolatedDOM(initialHTML = "<html><head></head><body></body></html>"): any {
  const domResult = createDOM(initialHTML);
  
  // Extract window and document properly
  const window = domResult.window || domResult;
  const document = window.document || domResult.document;
  
  return {
    ...domResult,
    window,
    document,
  };
}

/**
 * Test helper that provides a fresh DOM environment for each test function
 * 
 * @param testFn - Test function that receives the DOM environment
 * @returns Wrapped test function with isolated DOM
 */
export function withIsolatedDOM<T>(
  testFn: (dom: ReturnType<typeof createIsolatedDOM>) => T | Promise<T>
): () => Promise<T> {
  return async () => {
    const dom = createIsolatedDOM();
    return await testFn(dom);
  };
}

/**
 * Test helper for testing specific HTML elements
 * 
 * @param html - HTML string to test
 * @param testFn - Test function that receives the DOM environment
 * @returns Wrapped test function with the specific HTML loaded
 */
export function withElement<T>(
  html: string,
  testFn: (dom: ReturnType<typeof createIsolatedDOM>) => T | Promise<T>
): () => Promise<T> {
  return async () => {
    const domResult = createDOM(html);
    
    // Extract window and document properly  
    const window = domResult.window || domResult;
    const document = window.document || domResult.document;
    
    const dom = {
      ...domResult,
      window,
      document,
    };
    return await testFn(dom);
  };
}

/**
 * Creates a test element with specified tag and attributes
 * 
 * @param dom - DOM environment
 * @param tagName - Element tag name
 * @param attributes - Optional attributes to set
 * @returns Created element
 */
export function createElement(
  dom: ReturnType<typeof createIsolatedDOM>,
  tagName: string,
  attributes: Record<string, string> = {}
): any {
  const element = dom.document.createElement(tagName);
  
  Object.entries(attributes).forEach(([name, value]) => {
    element.setAttribute(name, value);
  });
  
  return element;
}

/**
 * Asserts that an element has the expected attribute value
 * 
 * @param element - Element to check
 * @param attribute - Attribute name
 * @param expectedValue - Expected attribute value
 * @param message - Optional error message
 */
export function assertAttribute(
  element: Element,
  attribute: string,
  expectedValue: string | null,
  message?: string
) {
  const actualValue = element.getAttribute(attribute);
  if (actualValue !== expectedValue) {
    throw new Error(
      message || 
      `Expected attribute '${attribute}' to be '${expectedValue}', but got '${actualValue}'`
    );
  }
}

/**
 * Asserts that an element has the expected property value
 * 
 * @param element - Element to check
 * @param property - Property name
 * @param expectedValue - Expected property value
 * @param message - Optional error message
 */
export function assertProperty(
  element: any,
  property: string,
  expectedValue: any,
  message?: string
) {
  const actualValue = element[property];
  if (actualValue !== expectedValue) {
    throw new Error(
      message || 
      `Expected property '${property}' to be '${expectedValue}', but got '${actualValue}'`
    );
  }
} 