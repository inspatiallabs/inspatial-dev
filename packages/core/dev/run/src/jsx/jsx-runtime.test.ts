/**
 * @file jsx-runtime.test.ts
 * @description Tests for JSX Runtime implementation
 */

// @ts-nocheck - Bypass type checking for testing
import { assertEquals, assertObjectMatch, assertHTMLEquals, test } from "../../../test/src/index.ts";
import { createElement, Fragment, jsx, jsxs } from "./jsx-runtime.ts";

/**
 * This test file is used to verify the functionality of the JSX runtime implementation.
 * To run this test, use:
 * deno test --allow-all --unstable-sloppy-imports src/jsx/jsx-runtime.test.ts
 * 
 * If you encounter dependency issues, consider using the standalone test version:
 * jsx-runtime.standalone.test.ts
 */

// Mock RenderNode type for testing
interface MockRenderNode {
  target: string;
  type: string;
}

// Helper function to create a mock component
function MockComponent(props: Record<string, unknown>) {
  return {
    type: "div",
    props: { ...props, className: "mock-component" }
  };
}

// Helper to check if an object looks like a jsx element
function isJsxElement(obj: unknown): boolean {
  return obj && typeof obj === "object" && "type" in obj && "props" in obj;
}

test("jsx-runtime: createElement creates valid element objects", () => {
  // Test simple element
  const element = createElement("div", { className: "test" }, "Hello World");
  
  assertEquals(element.type, "div");
  assertEquals(element.props.className, "test");
  assertEquals(element.props.children, "Hello World");
  
  // Test with multiple children
  const multiChildElement = createElement("div", { id: "multi" }, "Child 1", "Child 2");
  
  assertEquals(multiChildElement.type, "div");
  assertEquals(multiChildElement.props.id, "multi");
  assertEquals(Array.isArray(multiChildElement.props.children), true);
  assertEquals(multiChildElement.props.children.length, 2);
  assertEquals(multiChildElement.props.children[0], "Child 1");
  
  // Test with function component
  const componentElement = createElement(MockComponent, { testProp: "value" });
  
  assertEquals(typeof componentElement.type, "function");
  assertEquals(componentElement.props.testProp, "value");
});

test("jsx-runtime: Fragment returns its children", () => {
  // Test fragment with single child
  const singleChild = "test child";
  const fragmentResult = Fragment({ children: singleChild });
  
  assertEquals(fragmentResult, singleChild);
  
  // Test fragment with multiple children
  const multipleChildren = ["child1", "child2"];
  const fragmentMultiResult = Fragment({ children: multipleChildren });
  
  assertEquals(fragmentMultiResult, multipleChildren);
});

test("jsx-runtime: jsx function creates elements", () => {
  // Test with HTML element
  const jsxElement = jsx("div", { 
    className: "test-class", 
    children: "Hello JSX"
  });
  
  assertEquals(jsxElement.type, "div");
  assertEquals(jsxElement.props.className, "test-class");
  assertEquals(jsxElement.props.children, "Hello JSX");
  
  // Test with component
  const componentJsx = jsx(MockComponent, { 
    testProp: "value",
    children: "Component Child"
  });
  
  assertEquals(typeof componentJsx.type, "function");
  assertEquals(componentJsx.props.testProp, "value");
  assertEquals(componentJsx.props.children, "Component Child");
  
  // Test with no children
  const noChildrenJsx = jsx("span", { id: "empty" });
  
  assertEquals(noChildrenJsx.type, "span");
  assertEquals(noChildrenJsx.props.id, "empty");
  assertEquals(noChildrenJsx.props.children, undefined);
});

test("jsx-runtime: jsxs function is an alias of jsx", () => {
  // Create elements with both jsx and jsxs
  const jsxElement = jsx("div", { children: ["Item 1", "Item 2"] });
  const jsxsElement = jsxs("div", { children: ["Item 1", "Item 2"] });
  
  // They should produce identical results
  assertObjectMatch(jsxElement, jsxsElement);
});

test("jsx-runtime: jsx throws error when passing RenderNode as type", () => {
  // Create a mock RenderNode
  const mockRenderNode = {
    target: "dom",
    type: "div"
  } as MockRenderNode;
  
  // Attempt to use it as a type should throw
  let errorThrown = false;
  try {
    jsx(mockRenderNode, {});
  } catch (err) {
    errorThrown = true;
    const error = err as Error;
    assertEquals(error.message, "RenderNode cannot be used as a JSX element type");
  }
  
  assertEquals(errorThrown, true, "Expected an error to be thrown");
});

test("jsx-runtime: createElement handles nested components", () => {
  // Create a nested structure
  const nestedElement = createElement(
    "div",
    { className: "parent" },
    createElement("span", { className: "child" }, "Text"),
    createElement(MockComponent, { id: "nested-component" })
  );
  
  assertEquals(nestedElement.type, "div");
  assertEquals(nestedElement.props.className, "parent");
  assertEquals(Array.isArray(nestedElement.props.children), true);
  assertEquals(nestedElement.props.children.length, 2);
  
  // Check first child
  const firstChild = nestedElement.props.children[0];
  assertEquals(firstChild.type, "span");
  assertEquals(firstChild.props.className, "child");
  assertEquals(firstChild.props.children, "Text");
  
  // Check second child
  const secondChild = nestedElement.props.children[1];
  assertEquals(typeof secondChild.type, "function");
  assertEquals(secondChild.props.id, "nested-component");
});

test("jsx-runtime: handles null and undefined props", () => {
  // Create element with null props
  const nullPropsElement = jsx("div", null);
  
  assertEquals(nullPropsElement.type, "div");
  assertEquals(typeof nullPropsElement.props, "object");
  
  // Create element with undefined props
  const undefinedPropsElement = jsx("div", undefined);
  
  assertEquals(undefinedPropsElement.type, "div");
  assertEquals(typeof undefinedPropsElement.props, "object");
});

test("jsx-runtime: jsx correctly separates children from other props", () => {
  // Create element with children and other props
  const element = jsx("div", {
    id: "test-id",
    className: "test-class",
    children: "Child Content"
  });
  
  assertEquals(element.type, "div");
  assertEquals(element.props.id, "test-id");
  assertEquals(element.props.className, "test-class");
  assertEquals(element.props.children, "Child Content");
  
  // Check no children property is duplicated
  const keys = Object.keys(element.props);
  assertEquals(keys.filter(key => key === "children").length, 1);
});
