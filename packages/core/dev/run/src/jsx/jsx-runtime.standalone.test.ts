// Standalone test for jsx-runtime-like functionality

// Simple test function implementation
function test(name: string, fn: () => void | Promise<void>) {
  console.log(`Running test: ${name}`);
  try {
    const result = fn();
    if (result instanceof Promise) {
      result.then(
        () => console.log(`✓ ${name}`),
        (err) => console.error(`✗ ${name}`, err)
      );
    } else {
      console.log(`✓ ${name}`);
    }
  } catch (err) {
    console.error(`✗ ${name}`, err);
  }
}

// Simple assertion functions
function assertEquals(actual: any, expected: any, message?: string) {
  const equal = actual === expected || 
    (actual !== null && expected !== null && 
     typeof actual === 'object' && typeof expected === 'object' &&
     JSON.stringify(actual) === JSON.stringify(expected));
     
  if (!equal) {
    throw new Error(
      message || `Expected ${JSON.stringify(expected)}, but got ${JSON.stringify(actual)}`
    );
  }
}

function assertObjectMatch(actual: any, expected: any) {
  for (const [key, value] of Object.entries(expected)) {
    if (JSON.stringify(actual[key]) !== JSON.stringify(value)) {
      throw new Error(
        `Expected property ${key} to equal ${JSON.stringify(value)}, but got ${JSON.stringify(actual[key])}`
      );
    }
  }
}

// Mock RenderNode type
interface MockRenderNode {
  target: string;
  type: string;
}

// Mock JSX runtime implementation
function Fragment(props: any) {
  return props.children;
}

function createElement(type: any, props: any, ...children: any[]) {
  return {
    type,
    props: { ...props, children: children.length === 1 ? children[0] : children }
  };
}

function isRenderNode(node: any): node is MockRenderNode {
  return node && typeof node === "object" && "target" in node;
}

function jsx(type: any, props: any) {
  if (isRenderNode(type)) {
    throw new Error("RenderNode cannot be used as a JSX element type");
  }

  // Handle children separately
  const { children, ...rest } = props || {};
  
  // Process JSX
  return createElement(type, rest, children);
}

const jsxs = jsx;

// Helper function to create a mock component
function MockComponent(props: Record<string, unknown>) {
  return {
    type: "div",
    props: { ...props, className: "mock-component" }
  };
}

// Tests
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