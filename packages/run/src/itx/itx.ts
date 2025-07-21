/**
 * ╔════════════════════════════════════════════════════╗
 * ║          INSPATIAL TEMPLATE SYNTAX (ITX)           ║
 * ╠════════════════════════════════════════════════════╣
 * ║ InSpatial Template Syntax (ITX) is a template      ║
 * ║ syntax for InSpatial. It is a simple yet powerful  ║
 * ║ way to create dynamic templates using variables    ║
 * ║ and expressions.                                   ║
 * ║                                                    ║
 * ║ If you are familiar with vue JS, you'll feel       ║
 * ║ right at home with ITX.                            ║
 * ╚════════════════════════════════════════════════════╝
 */

// @ts-ignore - Ignoring TS extension import error
// @ts-ignore - Ignoring TS extension import error
import { universalRenderer } from "../../../renderer/src/render.ts";
import { DOMParser, createDOM } from "../../..//dom/src/index.ts";


// Create a new HTML document using the upstreamed DOM implementation
const { document, window, Node, Element } =
createDOM(`<!DOCTYPE html><html><body></body></html>`);

// Make document globally available for Deno environment
(globalThis as any).document = document;
(globalThis as any).window = window;
(globalThis as any).Node = Node;
(globalThis as any).Element = Element;

// Reactive state tracking
type Dep = Set<() => void>;
const deps = new WeakMap<object, Map<string | symbol, Dep>>();

/**
 * TODO: Move to @in/teract
 * Creates a reactive object for template data
 */
export function reactive<T extends object>(obj: T): T {
  return new Proxy(obj, {
    get(target, key, receiver) {
      // Track dependencies
      const activeEffect = getCurrentEffect();
      if (activeEffect) {
        let depsMap = deps.get(target);
        if (!depsMap) {
          depsMap = new Map();
          deps.set(target, depsMap);
        }

        let dep = depsMap.get(key);
        if (!dep) {
          dep = new Set();
          depsMap.set(key, dep);
        }

        dep.add(activeEffect);
      }

      const value = Reflect.get(target, key, receiver);
      if (value && typeof value === "object") {
        return reactive(value);
      }
      return value;
    },
    set(target, key, value, receiver) {
      const result = Reflect.set(target, key, value, receiver);

      // Notify subscribers
      const depsMap = deps.get(target);
      if (depsMap) {
        const dep = depsMap.get(key);
        if (dep) {
          dep.forEach((effect) => effect());
        }
      }

      return result;
    },
  });
}

// Effect tracking
const currentEffect: (() => void) | null = null;

function getCurrentEffect() {
  return currentEffect;
}

/**
 * Text interpolation - replaces {{ expr }} with values from data
 */
function evaluateExpression(expr: string, data: Record<string, any>): string {
  // Simple version - replace all {{ variableName }} with data values
  return expr.replace(/\{\{\s*([^}]+)\s*\}\}/g, (_match, path) => {
    const trimmedPath = path.trim();
    const pathParts = trimmedPath.split(".");
    let result = data;

    for (const part of pathParts) {
      if (result === undefined || result === null) return "";
      result = result[part];
    }

    return result !== undefined ? String(result) : "";
  });
}

/**
 * Handle in-if directive
 */
function processInIf(
  el: Element,
  value: string,
  data: Record<string, any>
): boolean {
  // Evaluate the condition
  try {
    // Simple version that only handles direct property access
    const condition = value.trim();
    let result;

    if (condition.startsWith("!")) {
      const propName = condition.slice(1).trim();
      result = !data[propName];
    } else {
      result = data[condition];
    }

    return Boolean(result);
  } catch (e) {
    console.error("Error evaluating in-if expression:", value, e);
    return false;
  }
}

/**
 * Handle in-for directive
 */
function processInFor(
  el: Element,
  value: string,
  data: Record<string, any>,
  document: Document
): Element[] {
  // Parse "item in items" format
  const match = value.match(
    /^\s*(\w+)(?:\s*,\s*(\w+))?\s+in\s+(\w+(?:\.\w+)*)\s*$/
  );
  if (!match) {
    console.error("Invalid in-for expression:", value);
    return [];
  }

  const [_, itemName, indexName, collectionPath] = match;
  const pathParts = collectionPath.split(".");
  let collection = data;

  for (const part of pathParts) {
    collection = collection[part];
    if (!collection) {
      console.error(`Collection not found: ${collectionPath}`);
      return [];
    }
  }

  if (!Array.isArray(collection)) {
    console.error(
      `Expression does not evaluate to an array: ${collectionPath}`
    );
    return [];
  }

  // Create a clone for each item in the collection
  return collection.map((item, index) => {
    const clone = el.cloneNode(true) as Element;
    clone.removeAttribute("in-for");

    // Process the clone with the item data
    const itemData = { ...data, [itemName]: item };
    if (indexName) {
      itemData[indexName] = index;
    }

    processElement(clone, itemData, document);
    return clone;
  });
}

/**
 * Handle in-bind directive or :attr shorthand
 */
function processInBind(
  el: Element,
  attrName: string,
  expression: string,
  data: Record<string, any>
): void {
  // Get the real attribute name (either from in-bind:attr or :attr)
  const realAttrName = attrName.startsWith("in-bind:")
    ? attrName.slice(7)
    : attrName.startsWith(":")
      ? attrName.slice(1)
      : attrName;

  // Special handling for class and style
  if (realAttrName === "class" && typeof data[expression] === "object") {
    // Handle class objects like :class="{ active: isActive }"
    const classObj = data[expression];
    const activeClasses = Object.entries(classObj)
      .filter(([_, value]) => Boolean(value))
      .map(([className]) => className)
      .join(" ");

    if (activeClasses) {
      const currentClass = el.getAttribute("class") || "";
      el.setAttribute("class", `${currentClass} ${activeClasses}`.trim());
    }
  } else if (realAttrName === "style" && typeof data[expression] === "object") {
    // Handle style objects like :style="{ color: textColor }"
    const styleObj = data[expression];
    const styleString = Object.entries(styleObj)
      .map(([prop, value]) => `${prop}: ${value}`)
      .join("; ");

    if (styleString) {
      const currentStyle = el.getAttribute("style") || "";
      el.setAttribute("style", `${currentStyle}; ${styleString}`.trim());
    }
  } else {
    // Regular attribute binding
    const value = data[expression];
    if (value !== undefined && value !== null) {
      if (typeof value === "boolean") {
        if (value) {
          el.setAttribute(realAttrName, "");
        } else {
          el.removeAttribute(realAttrName);
        }
      } else {
        el.setAttribute(realAttrName, String(value));
      }
    }
  }

  // Remove the in-bind or shorthand attribute
  el.removeAttribute(attrName);
}

/**
 * Handle in-on directive or @event shorthand
 */
function processInOn(
  el: Element,
  attrName: string,
  expression: string,
  data: Record<string, any>,
  methods: Record<string, Function>
): void {
  // Get the real event name (either from in-on:event or @event)
  const eventName = attrName.startsWith("in-on:")
    ? attrName.slice(5)
    : attrName.startsWith("@")
      ? attrName.slice(1)
      : attrName;

  // Find the event handler in methods
  const handler = methods[expression];
  if (typeof handler === "function") {
    el.setAttribute(`data-event-${eventName}`, expression);

    // Add special handling for when this element gets mounted in the real DOM
    (el as any)._eventHandlers = (el as any)._eventHandlers || {};
    (el as any)._eventHandlers[eventName] = (event: Event) => {
      handler.call(data, event);
    };
  } else {
    console.error(`Method ${expression} not found`);
  }

  // Remove the directive attribute
  el.removeAttribute(attrName);
}

/**
 * Process a single element and its attributes/children
 */
function processElement(
  el: Element,
  data: Record<string, any>,
  document: Document,
  methods: Record<string, Function> = {}
): Element | Element[] | null {
  // Check for in-if directive first
  if (el.hasAttribute("in-if")) {
    const expression = el.getAttribute("in-if") || "";
    el.removeAttribute("in-if");
    if (!processInIf(el, expression, data)) {
      return null;
    }
  }

  // Check for in-for directive
  if (el.hasAttribute("in-for")) {
    const expression = el.getAttribute("in-for") || "";
    return processInFor(el, expression, data, document);
  }

  // Process all other directives and attributes
  const attributesToProcess = Array.from(el.attributes);
  for (const attr of attributesToProcess) {
    const { name, value } = attr;

    if (name.startsWith("in-bind:") || name.startsWith(":")) {
      processInBind(el, name, value, data);
    } else if (name.startsWith("in-on:") || name.startsWith("@")) {
      processInOn(el, name, value, data, methods);
    } else if (name.startsWith("in-model")) {
      // Basic in-model implementation
      el.setAttribute("value", String(data[value] || ""));
      processInOn(el, `in-on:input`, `_updateModel_${value}`, data, {
        [`_updateModel_${value}`]: function (event: Event) {
          data[value] = (event.target as HTMLInputElement).value;
        },
      });
      el.removeAttribute("in-model");
    }
  }

  // Process text content for interpolation
  if (el.childNodes.length > 0) {
    const childNodes = Array.from(el.childNodes);
    for (const child of childNodes) {
      if (child.nodeType === Node.TEXT_NODE && child.textContent) {
        const interpolated = evaluateExpression(child.textContent, data);
        if (interpolated !== child.textContent) {
          child.textContent = interpolated;
        }
      } else if (child.nodeType === Node.ELEMENT_NODE) {
        const result = processElement(
          child as Element,
          data,
          document,
          methods
        );

        if (result === null) {
          // in-if returned false, remove the element
          el.removeChild(child);
        } else if (Array.isArray(result)) {
          // in-for returned multiple elements, replace the original with these
          const fragment = document.createDocumentFragment();
          result.forEach((item) => fragment.appendChild(item));
          el.replaceChild(fragment, child);
        }
      }
    }
  }

  return el;
}

/**
 * Template literal tag function for ITX
 */
export function itx(
  strings: TemplateStringsArray,
  ...values: any[]
): Function {
  // Combine the template strings and values
  let templateString = "";
  strings.forEach((str, i) => {
    templateString += str;
    if (i < values.length) {
      templateString += String(values[i]);
    }
  });

  // Return a component factory function
  return function (
    options: {
      data?: () => Record<string, any>;
      methods?: Record<string, Function>;
      props?: string[];
    } = {}
  ) {
    // Create the component function that will be used with JSX
    return async function (props: Record<string, any> = {}) {
      // Parse the template
      const container = document.createElement("div");
      container.innerHTML = templateString.trim();

      // Get component data
      const componentData = {
        ...(options.data ? options.data() : {}),
        ...(options.props
          ? Object.fromEntries(options.props.map((prop) => [prop, props[prop]]))
          : {}),
      };

      // Make the data reactive
      const reactiveData = reactive(componentData);

      // Create a fragment to hold the processed elements
      const fragment = document.createDocumentFragment();

      // Process all root elements in the template
      Array.from(container.childNodes).forEach((node) => {
        if (node && typeof node === 'object' && 'nodeType' in node && node.nodeType === Node.ELEMENT_NODE) {
          const result = processElement(
            node as Element,
            reactiveData,
            document,
            options.methods || {}
          );

          if (result === null) {
            // Skip if in-if returned false
          } else if (Array.isArray(result)) {
            // Add all elements from in-for
            result.forEach((el) => fragment.appendChild(el));
          } else {
            fragment.appendChild(result);
          }
        } else {
          // Text nodes, comments, etc.
          fragment.appendChild(node);
        }
      });

      // Convert the fragment to an element for JSX compatibility
      const wrapper = document.createElement("div");
      wrapper.appendChild(fragment);

      // Create a RenderNode using the UniversalRenderer
      return universalRenderer.createElement("itx-component", {
        element: wrapper.firstChild || wrapper,
        template: templateString,
        data: reactiveData,
        ...props
      });
    };
  };
}

/**
 * Define a component using the ITX syntax
 */
export function defineComponent(options: {
  template: string;
  data?: () => Record<string, any>;
  methods?: Record<string, Function>;
  props?: string[];
}) {
  const templateArray = Object.assign([options.template], {
    raw: [options.template],
  });
  const templateFn = itx(templateArray, "");
  return async function(props: Record<string, any> = {}) {
    // Create a component using the UniversalRenderer
    return universalRenderer.createElement("itx-component", {
      template: options.template,
      data: options.data ? options.data() : {},
      methods: options.methods || {},
      props: options.props || [],
      passedProps: props
    });
  };
}
