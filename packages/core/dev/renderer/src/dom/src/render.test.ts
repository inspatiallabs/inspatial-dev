// Import the necessary modules
import { test, expect } from "jsr:@inspatial/test";
import { DOMRenderer } from "./render.ts";
import { DOMNode } from "../../types.ts";

/*#########################################(SETUP)#########################################*/

function createTestElement(tag: string, props: Record<string, any> = {}): DOMNode {
  const renderer = DOMRenderer.getInstance();
  return renderer.createElement(tag, props);
}

// Helper function to check if something is a DOM node
function isDOMNode(obj: any): boolean {
  return obj && typeof obj === "object" && "nodeType" in obj;
}

/*#########################################(CORE TESTS)#########################################*/

test({
  name: "DOMRenderer singleton instance creation",
  fn: () => {
    const instance1 = DOMRenderer.getInstance();
    const instance2 = DOMRenderer.getInstance();
    
    expect(instance1).toBeDefined();
    expect(instance2).toBeDefined();
    expect(instance1).toBe(instance2);
  }
});

test({
  name: "createElement creates basic elements",
  fn: () => {
    const renderer = DOMRenderer.getInstance();
    const div = renderer.createElement("div", { id: "test" });
    
    expect(div.type).toBe("div");
    expect(div.props.id).toBe("test");
    // Replace instanceof Node with our helper function
    expect(isDOMNode(div.element)).toBe(true);
    expect((div.element as HTMLElement).id).toBe("test");
  }
});

test({
  name: "createElement handles style objects correctly",
  fn: () => {
    const div = createTestElement("div", {
      style: {
        backgroundColor: "red",
        fontSize: "16px"
      }
    });
    
    expect((div.element as HTMLElement).getAttribute("style")).toBe("background-color: red; font-size: 16px;");
  }
});

test({
  name: "createElement handles className prop",
  fn: () => {
    const div = createTestElement("div", {
      className: "test-class"
    });
    
    expect((div.element as HTMLElement).getAttribute("class")).toBe("test-class");
  }
});

test({
  name: "createElement handles boolean attributes",
  fn: () => {
    const input = createTestElement("input", {
      disabled: true,
      required: false
    });
    
    expect((input.element as HTMLElement).hasAttribute("disabled")).toBe(true);
    expect((input.element as HTMLElement).hasAttribute("required")).toBe(false);
  }
});

test({
  name: "createElement handles children correctly",
  fn: () => {
    const renderer = DOMRenderer.getInstance();
    
    // Create a child element first
    const childSpan = renderer.createElement("span", { id: "child" });
    
    // Now create the parent with the child element (not the DOMNode)
    const parent = renderer.createElement(
      "div",
      { id: "parent" },
      childSpan.element // Use .element to pass the actual DOM element
    );
    
    const element = parent.element as HTMLElement;
    
    // Debug log to understand the structure
    console.log("Parent children count:", element.childNodes.length);
    console.log("First child tag:", element.firstChild ? (element.firstChild as any).tagName : "none");
    
    expect(element.childNodes.length).toBe(1);
    // Check the type instead of using firstElementChild
    expect((element.firstChild as any).tagName.toLowerCase()).toBe("span");
    // Use getAttribute instead of direct property access
    expect((element.firstChild as Element).getAttribute("id")).toBe("child");
  }
});

test({
  name: "createElement handles function components",
  fn: () => {
    const renderer = DOMRenderer.getInstance();
    const CustomComponent = (props: any) => {
      return renderer.createElement("div", { id: props.id });
    };
    
    const component = renderer.createElement(CustomComponent, { id: "custom" });
    
    expect(component.type).toBe("component");
    // Replace instanceof Node with our helper function
    expect(isDOMNode(component.element)).toBe(true);
    expect((component.element as HTMLElement).id).toBe("custom");
  }
});

test({
  name: "render mounts elements to container",
  fn: () => {
    const renderer = DOMRenderer.getInstance();
    const container = renderer.createElement("div", { id: "container" });
    const element = renderer.createElement("span", { id: "test" });
    
    renderer.render(element, (container.element as HTMLElement));
    
    const containerEl = container.element as HTMLElement;
    expect(containerEl.childNodes.length).toBe(1);
    expect((containerEl.firstChild as Element).getAttribute("id")).toBe("test");
  }
});

test({
  name: "event delegation works correctly",
  fn: async () => {
    const renderer = DOMRenderer.getInstance();
    let clicked = false;
    
    const button = renderer.createElement("button", {
      onClick: () => { clicked = true; }
    });
    
    const container = renderer.createElement("div");
    renderer.render(button, (container.element as HTMLElement));
    
    // Use the triggerEvent method we added to the document
    (renderer as any).document.triggerEvent(button.element, 'click');
    
    // Wait for event delegation
    await new Promise(resolve => setTimeout(resolve, 0));
    
    expect(clicked).toBe(true);
  }
});

test({
  name: "parseChild handles different types of children",
  fn: () => {
    const renderer = DOMRenderer.getInstance();
    
    // Test null/undefined
    expect(renderer.parseChild(null).textContent).toBe("");
    expect(renderer.parseChild(undefined).textContent).toBe("");
    
    // Test boolean
    expect(renderer.parseChild(true).textContent).toBe("");
    expect(renderer.parseChild(false).textContent).toBe("");
    
    // Test number
    expect(renderer.parseChild(42).textContent).toBe("42");
    
    // Test string
    expect(renderer.parseChild("test").textContent).toBe("test");
    
    // Test array
    const fragment = renderer.parseChild(["a", "b"]);
    expect(fragment.childNodes.length).toBe(2);
    expect(fragment.childNodes[0].textContent).toBe("a");
    expect(fragment.childNodes[1].textContent).toBe("b");
  }
});

test({
  name: "serialize returns correct HTML string",
  fn: () => {
    const renderer = DOMRenderer.getInstance("<html><body></body></html>");
    const div = renderer.createElement("div", { id: "test" });
    
    renderer.render(div, "body");
    
    const html = renderer.serialize();
    expect(html).toContain("<!DOCTYPE html>");
    expect(html).toContain('<div id="test"></div>');
  }
});