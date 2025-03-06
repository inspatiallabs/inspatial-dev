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

/*#########################################(OTHER TESTS)#########################################*/


// test({
//   name: "createElement handles data attributes correctly",
//   fn: () => {
//     const div = createTestElement("div", {
//       "data-testid": "test-element",
//       "data-custom": "custom-value"
//     });
    
//     expect((div.element as HTMLElement).getAttribute("data-testid")).toBe("test-element");
//     expect((div.element as HTMLElement).getAttribute("data-custom")).toBe("custom-value");
//   }
// });

// test({
//   name: "createElement handles aria attributes correctly",
//   fn: () => {
//     const button = createTestElement("button", {
//       "aria-label": "Close dialog",
//       "aria-pressed": "false"
//     });
    
//     expect((button.element as HTMLElement).getAttribute("aria-label")).toBe("Close dialog");
//     expect((button.element as HTMLElement).getAttribute("aria-pressed")).toBe("false");
//   }
// });

// test({
//   name: "createElement handles multiple class names",
//   fn: () => {
//     const div = createTestElement("div", {
//       className: "class1 class2 class3"
//     });
    
//     expect((div.element as HTMLElement).getAttribute("class")).toBe("class1 class2 class3");
//   }
// });

// test({
//   name: "createElement handles null and undefined props",
//   fn: () => {
//     const div = createTestElement("div", {
//       id: null,
//       className: undefined,
//       "data-test": ""
//     });
    
//     expect((div.element as HTMLElement).hasAttribute("id")).toBe(false);
//     expect((div.element as HTMLElement).hasAttribute("class")).toBe(false);
//     expect((div.element as HTMLElement).getAttribute("data-test")).toBe("");
//   }
// });

// // SVG Element Tests

// test({
//   name: "createElement handles SVG elements correctly",
//   fn: () => {
//     // First, ensure SVG_ELEMENTS includes some elements for testing
//     const renderer = DOMRenderer.getInstance();
//     const svgElement = renderer.createElement("svg", { width: "100", height: "100" });
    
//     expect(svgElement.type).toBe("svg");
//     expect((svgElement.element as SVGElement).getAttribute("width")).toBe("100");
//     expect((svgElement.element as SVGElement).getAttribute("height")).toBe("100");
//   }
// });

// test({
//   name: "createElement nests SVG elements correctly",
//   fn: () => {
//     const renderer = DOMRenderer.getInstance();
    
//     // Create SVG container
//     const svg = renderer.createElement("svg", { 
//       width: "200", 
//       height: "200",
//       viewBox: "0 0 200 200"
//     });
    
//     // Create circle inside SVG
//     const circle = renderer.createElement("circle", {
//       cx: "100",
//       cy: "100",
//       r: "50",
//       fill: "red"
//     });
    
//     // Render circle inside SVG
//     renderer.render(circle, svg.element as Element);
    
//     // Check if the circle was added correctly
//     const svgEl = svg.element as Element;
//     expect(svgEl.childNodes.length).toBe(1);
//     expect((svgEl.firstChild as Element).tagName.toLowerCase()).toBe("circle");
//     expect((svgEl.firstChild as Element).getAttribute("cx")).toBe("100");
//     expect((svgEl.firstChild as Element).getAttribute("fill")).toBe("red");
//   }
// });

// // Event Handling Tests

// test({
//   name: "Multiple event handlers on the same element",
//   fn: async () => {
//     const renderer = DOMRenderer.getInstance();
//     let clickCount = 0;
//     let mouseoverCalled = false;
    
//     const button = renderer.createElement("button", {
//       onClick: () => { clickCount++; },
//       onMouseover: () => { mouseoverCalled = true; }
//     });
    
//     const container = renderer.createElement("div");
//     renderer.render(button, (container.element as HTMLElement));
    
//     // Trigger click event
//     (renderer as any).document.triggerEvent(button.element, 'click');
    
//     // Trigger mouseover event
//     (renderer as any).document.triggerEvent(button.element, 'mouseover');
    
//     // Wait for event delegation
//     await new Promise(resolve => setTimeout(resolve, 0));
    
//     expect(clickCount).toBe(1);
//     expect(mouseoverCalled).toBe(true);
//   }
// });

// test({
//   name: "Event handler receives event object",
//   fn: async () => {
//     const renderer = DOMRenderer.getInstance();
//     let receivedEvent: any = null;
    
//     const button = renderer.createElement("button", {
//       onClick: (e: Event) => { receivedEvent = e; }
//     });
    
//     const container = renderer.createElement("div");
//     renderer.render(button, (container.element as HTMLElement));
    
//     // Trigger click event
//     (renderer as any).document.triggerEvent(button.element, 'click');
    
//     // Wait for event delegation
//     await new Promise(resolve => setTimeout(resolve, 0));
    
//     expect(receivedEvent).not.toBe(null);
//     expect(receivedEvent.type).toBe('click');
//     expect(receivedEvent.target).toBe(button.element);
//   }
// });

// // Component Tests

// test({
//   name: "Nested function components handle props correctly",
//   fn: () => {
//     const renderer = DOMRenderer.getInstance();
    
//     // Inner component
//     const Button = (props: any) => {
//       return renderer.createElement("button", { 
//         className: props.className,
//         id: props.id 
//       }, props.children);
//     };
    
//     // Outer component that uses Button
//     const Card = (props: any) => {
//       return renderer.createElement("div", { className: "card" },
//         renderer.createElement("h2", {}, props.title),
//         renderer.createElement(Button, { 
//           className: "card-button",
//           id: "action-btn"
//         }, "Click me")
//       );
//     };
    
//     // Create the component
//     const card = renderer.createElement(Card, { title: "My Card" });
    
//     // Check div structure
//     expect(card.type).toBe("component");
//     const cardElement = card.element as HTMLElement;
//     expect(cardElement.tagName.toLowerCase()).toBe("div");
//     expect(cardElement.getAttribute("class")).toBe("card");
    
//     // Check title
//     const titleElement = cardElement.firstChild as HTMLElement;
//     expect(titleElement.tagName.toLowerCase()).toBe("h2");
//     expect(titleElement.textContent).toBe("My Card");
    
//     // Check button
//     const buttonElement = cardElement.lastChild as HTMLElement;
//     expect(buttonElement.tagName.toLowerCase()).toBe("button");
//     expect(buttonElement.getAttribute("class")).toBe("card-button");
//     expect(buttonElement.getAttribute("id")).toBe("action-btn");
//     expect(buttonElement.textContent).toBe("Click me");
//   }
// });

// test({
//   name: "Function components can return arrays of elements",
//   fn: () => {
//     const renderer = DOMRenderer.getInstance();
    
//     // A component that returns multiple elements without a wrapper
//     const ListItems = (props: any) => {
//       const items = props.items || [];
//       // Create array of li elements
//       const listItems = items.map((item: string) => 
//         renderer.createElement("li", {}, item)
//       );
      
//       // Return fragment container with the items
//       const fragment = renderer.document.createDocumentFragment();
//       listItems.forEach((li: any) => fragment.appendChild(li));
//       return fragment;
//     };
    
//     // Create wrapper list
//     const list = renderer.createElement("ul", {});
    
//     // Create items component
//     const itemsComponent = renderer.createElement(ListItems, { 
//       items: ["Apple", "Banana", "Cherry"] 
//     });
    
//     // Add items to the list
//     renderer.render(itemsComponent, list.element as HTMLElement);
    
//     // Check result
//     const listElement = list.element as HTMLElement;
//     expect(listElement.childNodes.length).toBe(3);
//     expect((listElement.childNodes[0] as HTMLElement).textContent).toBe("Apple");
//     expect((listElement.childNodes[1] as HTMLElement).textContent).toBe("Banana");
//     expect((listElement.childNodes[2] as HTMLElement).textContent).toBe("Cherry");
//   }
// });

// // Text Content and Special Characters Tests

// test({
//   name: "createElement handles text content with special characters",
//   fn: () => {
//     const div = createTestElement("div", {}, "Special < > & \" ' characters");
    
//     expect((div.element as HTMLElement).textContent).toBe("Special < > & \" ' characters");
//     // The text should be properly escaped in HTML
//     const html = (div.element as HTMLElement).innerHTML;
//     expect(html).toBe("Special < > & \" ' characters");
//   }
// });

// test({
//   name: "createElement handles HTML content via dangerouslySetInnerHTML",
//   fn: () => {
//     const div = createTestElement("div", {
//       dangerouslySetInnerHTML: { __html: "<strong>Bold</strong> text" }
//     });
    
//     expect((div.element as HTMLElement).innerHTML).toBe("<strong>Bold</strong> text");
//     const strong = (div.element as HTMLElement).querySelector("strong");
//     expect(strong?.textContent).toBe("Bold");
//   }
// });

// // Rendering and Serialization Tests

// test({
//   name: "render replaces existing content when reusing container",
//   fn: () => {
//     const renderer = DOMRenderer.getInstance();
//     const container = renderer.createElement("div", {});
    
//     // First render
//     const span1 = renderer.createElement("span", {}, "First content");
//     renderer.render(span1, (container.element as HTMLElement));
    
//     // Check first render
//     expect((container.element as HTMLElement).childNodes.length).toBe(1);
//     expect(((container.element as HTMLElement).firstChild as HTMLElement).textContent).toBe("First content");
    
//     // Second render to same container
//     const span2 = renderer.createElement("span", {}, "Second content");
//     renderer.render(span2, (container.element as HTMLElement));
    
//     // Check that both children exist (since we didn't clear)
//     expect((container.element as HTMLElement).childNodes.length).toBe(2);
//     expect(((container.element as HTMLElement).childNodes[1] as HTMLElement).textContent).toBe("Second content");
//   }
// });

// test({
//   name: "serialize returns correct HTML string with nested components",
//   fn: () => {
//     const renderer = DOMRenderer.getInstance("<html><body></body></html>");
    
//     // Create a structure with nested components
//     const div = renderer.createElement("div", { id: "container" });
//     const header = renderer.createElement("header", { className: "page-header" }, 
//       renderer.createElement("h1", {}, "Page Title")
//     );
//     const main = renderer.createElement("main", {}, 
//       renderer.createElement("p", {}, "Content goes here")
//     );
    
//     // Render components to body
//     renderer.render(div, "body");
//     renderer.render(header, (div.element as HTMLElement));
//     renderer.render(main, (div.element as HTMLElement));
    
//     // Serialize and check
//     const html = renderer.serialize();
//     expect(html).toContain("<!DOCTYPE html>");
//     expect(html).toContain('<div id="container">');
//     expect(html).toContain('<header class="page-header">');
//     expect(html).toContain("<h1>Page Title</h1>");
//     expect(html).toContain("<main>");
//     expect(html).toContain("<p>Content goes here</p>");
//   }
// });

// // Edge Cases and Error Handling

// test({
//   name: "createElement handles empty arrays for children",
//   fn: () => {
//     const div = createTestElement("div", {}, []);
    
//     expect((div.element as HTMLElement).childNodes.length).toBe(0);
//   }
// });

// test({
//   name: "createElement handles deeply nested arrays for children",
//   fn: () => {
//     const div = createTestElement("div", {}, [
//       "Text",
//       [
//         createTestElement("span", {}, "Span 1"),
//         [
//           createTestElement("span", {}, "Span 2"),
//           ["Nested", "Text"]
//         ]
//       ]
//     ]);
    
//     // We should have flattened all arrays and have all content there
//     const divElement = div.element as HTMLElement;
//     expect(divElement.childNodes.length).toBe(4); // Text, Span 1, Span 2, NestedText
//     expect(divElement.childNodes[0].textContent).toBe("Text");
//     expect((divElement.childNodes[1] as HTMLElement).tagName.toLowerCase()).toBe("span");
//     expect((divElement.childNodes[1] as HTMLElement).textContent).toBe("Span 1");
//     expect((divElement.childNodes[2] as HTMLElement).tagName.toLowerCase()).toBe("span");
//     expect((divElement.childNodes[2] as HTMLElement).textContent).toBe("Span 2");
//     expect(divElement.childNodes[3].textContent).toBe("NestedText");
//   }
// });

// test({
//   name: "createElement handles numeric children as strings",
//   fn: () => {
//     const div = createTestElement("div", {}, [42, 3.14]);
    
//     expect((div.element as HTMLElement).childNodes.length).toBe(2);
//     expect((div.element as HTMLElement).childNodes[0].textContent).toBe("42");
//     expect((div.element as HTMLElement).childNodes[1].textContent).toBe("3.14");
//   }
// });

// test({
//   name: "ref callback receives element reference",
//   fn: () => {
//     let refElement: HTMLElement | null = null;
//     const div = createTestElement("div", {
//       ref: (el: HTMLElement) => { refElement = el; }
//     });
    
//     expect(refElement).not.toBe(null);
//     expect(refElement).toBe(div.element);
//   }
// });

// test({
//   name: "custom component with complex rendering logic",
//   fn: () => {
//     const renderer = DOMRenderer.getInstance();
    
//     // A component with conditional rendering
//     const ConditionalComponent = (props: any) => {
//       if (props.condition) {
//         return renderer.createElement("div", { className: "yes" }, "Condition is true");
//       } else {
//         return renderer.createElement("span", { className: "no" }, "Condition is false");
//       }
//     };
    
//     // Test true condition
//     const trueComponent = renderer.createElement(ConditionalComponent, { condition: true });
//     expect(trueComponent.type).toBe("component");
//     expect((trueComponent.element as HTMLElement).tagName.toLowerCase()).toBe("div");
//     expect((trueComponent.element as HTMLElement).getAttribute("class")).toBe("yes");
    
//     // Test false condition
//     const falseComponent = renderer.createElement(ConditionalComponent, { condition: false });
//     expect(falseComponent.type).toBe("component");
//     expect((falseComponent.element as HTMLElement).tagName.toLowerCase()).toBe("span");
//     expect((falseComponent.element as HTMLElement).getAttribute("class")).toBe("no");
//   }
// });