// deno-lint-ignore-file ban-types

// @ts-ignore - Ignoring TS extension import error
import { parseHTML } from "../../../dom/src/dom.ts";

const { document, Node, Element } = parseHTML("");

// XML namespace registry
const namespaceRegistry = new Map<string, Record<string, Function>>();

/**
 * Register a component set for a specific XML namespace
 */
export function registerNamespace(
  uri: string,
  components: Record<string, Function>
) {
  namespaceRegistry.set(uri, components);
}

/**
 * XML specific parsing options
 */
interface XMLParseOptions {
  preserveWhitespace?: boolean;
  strictValidation?: boolean;
  processInstructions?: boolean;
}

/**
 * Manually extract namespaces from XML string before parsing
 * This is needed because linkedom's namespace handling is limited
 */
function extractNamespaces(xml: string): Record<string, string> {
  const namespaces: Record<string, string> = {};
  const nsRegex = /xmlns:([a-zA-Z0-9]+)="([^"]+)"/g;
  let match;

  while ((match = nsRegex.exec(xml)) !== null) {
    const [_, prefix, uri] = match;
    namespaces[prefix] = uri;
  }

  return namespaces;
}

/**
 * Converts XML string to DOM
 */
function parseXML(
  xml: string,
  options: XMLParseOptions = {}
): { document: Document; namespaces: Record<string, string> } {
  // Extract namespace declarations
  const namespaces = extractNamespaces(xml);

  // Create an XML document
  const xmlStr = `<?xml version="1.0" encoding="UTF-8"?>${xml}`;
  const container = document.createElement("div");
  container.innerHTML = xmlStr;

  // Get the parsed document
  const doc = {
    documentElement: (container.firstChild as Element) || container,
  } as unknown as Document;

  // Normalize whitespace if needed
  if (!options.preserveWhitespace) {
    normalizeWhitespace(doc.documentElement);
  }

  return { document: doc, namespaces };
}

/**
 * Normalize and trim whitespace in text nodes
 */
function normalizeWhitespace(node: Node): void {
  if (node.nodeType === Node.TEXT_NODE) {
    // Normalize whitespace in text nodes
    if (node.textContent) {
      const text = node.textContent.trim().replace(/\s+/g, " ");
      if (text === "") {
        // Remove empty text nodes
        node.parentNode?.removeChild(node);
      } else {
        node.textContent = text;
      }
    }
    return;
  }

  if (node.nodeType === Node.ELEMENT_NODE) {
    // Process child nodes
    const children = Array.from(node.childNodes);
    for (const child of children) {
      normalizeWhitespace(child);
    }
  }
}

/**
 * Check if an element uses a namespace prefix
 */
function getNamespaceInfo(
  element: Element,
  namespaces: Record<string, string>
): { prefix: string | null; localName: string; uri: string | null } {
  const nodeName = element.nodeName;
  const colonIndex = nodeName.indexOf(":");

  if (colonIndex > 0) {
    const prefix = nodeName.substring(0, colonIndex);
    const localName = nodeName.substring(colonIndex + 1);
    const uri = namespaces[prefix] || null;

    return { prefix, localName, uri };
  }

  return { prefix: null, localName: nodeName, uri: null };
}

/**
 * Process XML data structures with special handling for namespaces
 */
function processXMLElement(
  element: Element,
  data: Record<string, any>,
  namespaces: Record<string, string>,
  options: XMLParseOptions = {}
): Element {
  // Handle namespaces
  const nsInfo = getNamespaceInfo(element, namespaces);

  // Check if we have a component registered for this namespace and element
  if (nsInfo.uri && nsInfo.prefix && namespaceRegistry.has(nsInfo.uri)) {
    const components = namespaceRegistry.get(nsInfo.uri)!;
    if (components[nsInfo.localName]) {
      // Create a props object from attributes
      const props: Record<string, any> = {};
      Array.from(element.attributes).forEach((attr) => {
        const attrName = attr.name;
        // Skip namespace declarations
        if (attrName.startsWith("xmlns:")) return;

        // Process potential namespaced attributes
        if (attrName.includes(":")) {
          const [attrPrefix, attrLocal] = attrName.split(":");
          if (namespaces[attrPrefix]) {
            if (!props._namespaced) props._namespaced = {};
            if (!props._namespaced[namespaces[attrPrefix]])
              props._namespaced[namespaces[attrPrefix]] = {};
            props._namespaced[namespaces[attrPrefix]][attrLocal] =
              convertAttributeValue(attr.value);
          } else {
            // Handle it as a normal attribute if prefix is not recognized
            props[attrName] = convertAttributeValue(attr.value);
          }
        } else {
          // Convert attribute value to the appropriate type
          props[attrName] = convertAttributeValue(attr.value);
        }
      });

      // Handle child elements as nested content
      if (element.childNodes.length > 0) {
        const processedChildren: Node[] = [];

        Array.from(element.childNodes).forEach((child) => {
          if (child.nodeType === Node.ELEMENT_NODE) {
            processedChildren.push(
              processXMLElement(child as Element, data, namespaces, options)
            );
          } else if (child.nodeType === Node.TEXT_NODE && child.textContent) {
            // Process text for interpolation
            if (
              child.textContent.includes("{") &&
              child.textContent.includes("}")
            ) {
              child.textContent = processBraceExpressions(
                child.textContent,
                data
              );
            }

            // Only add non-empty text nodes
            if (child.textContent.trim()) {
              processedChildren.push(child);
            }
          } else if (child.nodeType === Node.CDATA_SECTION_NODE) {
            // Preserve CDATA content
            processedChildren.push(child);
          }
        });

        if (processedChildren.length > 0) {
          props.children =
            processedChildren.length === 1
              ? processedChildren[0]
              : processedChildren;
        }
      }

      // Call the component function with props
      try {
        const result = components[nsInfo.localName](props);
        if (result instanceof Element) {
          return result;
        } else {
          console.error(
            `Component ${nsInfo.prefix}:${nsInfo.localName} did not return a valid Element`
          );
          // Return a placeholder for debugging
          const placeholder = document.createElement("div");
          placeholder.setAttribute(
            "data-error",
            `Invalid component result: ${nsInfo.prefix}:${nsInfo.localName}`
          );
          return placeholder;
        }
      } catch (error) {
        console.error(
          `Error executing component ${nsInfo.prefix}:${nsInfo.localName}:`,
          error
        );
        // Return an error placeholder
        const errorEl = document.createElement("div");
        errorEl.setAttribute(
          "data-error",
          `Component error: ${nsInfo.prefix}:${nsInfo.localName}`
        );
        return errorEl;
      }
    }
  }

  // If no namespace component found, process as regular element
  // Clone the element to avoid modifying the original
  const processedElement = element.cloneNode(true) as Element;

  // Process attributes for data binding with {expression} syntax
  Array.from(processedElement.attributes).forEach((attr) => {
    if (attr.value.includes("{") && attr.value.includes("}")) {
      const processedValue = processBraceExpressions(attr.value, data);
      processedElement.setAttribute(attr.name, processedValue);
    }
  });

  // Process child elements
  const childNodes = Array.from(processedElement.childNodes);
  for (const child of childNodes) {
    if (child.nodeType === Node.ELEMENT_NODE) {
      const processedChild = processXMLElement(
        child as Element,
        data,
        namespaces,
        options
      );
      processedElement.replaceChild(processedChild, child);
    } else if (child.nodeType === Node.TEXT_NODE) {
      // Process text nodes for interpolation
      if (
        child.textContent &&
        child.textContent.includes("{") &&
        child.textContent.includes("}")
      ) {
        const processedText = processBraceExpressions(child.textContent, data);
        child.textContent = processedText;
      }
    }
    // CDATA sections and comments are preserved as-is
  }

  return processedElement;
}

/**
 * Process expressions in braces like {variable} or {nested.property}
 */
function processBraceExpressions(
  text: string,
  data: Record<string, any>
): string {
  return text.replace(/\{([^}]+)\}/g, (match, expression) => {
    const path = expression.trim().split(".");
    let value = data;

    for (const key of path) {
      if (value === undefined || value === null) return "";
      value = value[key];
    }

    return value !== undefined ? String(value) : "";
  });
}

/**
 * Convert string attribute values to appropriate JavaScript types
 */
function convertAttributeValue(value: string): any {
  // Boolean conversion
  if (value === "true") return true;
  if (value === "false") return false;

  // Number conversion
  if (/^-?\d+$/.test(value)) return parseInt(value, 10);
  if (/^-?\d+\.\d+$/.test(value)) return parseFloat(value);

  // Array or object conversion (JSON)
  if (
    (value.startsWith("[") && value.endsWith("]")) ||
    (value.startsWith("{") && value.endsWith("}"))
  ) {
    try {
      return JSON.parse(value);
    } catch (e) {
      // If it's not valid JSON, return as string
      return value;
    }
  }

  // Default is string
  return value;
}

/**
 * XML template function - returns a component that can be used with JSX
 */
export function xml(strings: TemplateStringsArray, ...values: any[]): Function {
  // Combine the template strings and values
  let xmlString = "";
  strings.forEach((str, i) => {
    xmlString += str;
    if (i < values.length) {
      xmlString += String(values[i]);
    }
  });

  // Return a component factory function
  return function (
    options: {
      data?: Record<string, any>;
      preserveWhitespace?: boolean;
      strictValidation?: boolean;
      processInstructions?: boolean;
    } = {}
  ) {
    // Parse the XML template once
    const { document: doc, namespaces } = parseXML(xmlString, {
      preserveWhitespace: options.preserveWhitespace,
      strictValidation: options.strictValidation,
      processInstructions: options.processInstructions,
    });

    // Return the component function
    return function (props: Record<string, any> = {}) {
      // Combine static data and props
      const data = { ...options.data, ...props };

      // Process the document with data
      const rootElement = processXMLElement(
        doc.documentElement,
        data,
        namespaces,
        {
          preserveWhitespace: options.preserveWhitespace,
          strictValidation: options.strictValidation,
          processInstructions: options.processInstructions,
        }
      );

      return rootElement;
    };
  };
}

/**
 * Define an XML-based component
 */
export function defineXmlComponent(options: {
  template: string;
  data?: Record<string, any>;
  props?: string[];
  preserveWhitespace?: boolean;
  strictValidation?: boolean;
  processInstructions?: boolean;
}) {
  const templateFn = xml`${options.template}`; // Use template literal for correct type

  // Create component data from props and static data
  const componentData: Record<string, any> = { ...(options.data || {}) };
  if (options.props) {
    options.props.forEach((prop) => {
      componentData[prop] = undefined; // Will be filled from props
    });
  }

  return templateFn({
    data: componentData,
    preserveWhitespace: options.preserveWhitespace,
    strictValidation: options.strictValidation,
    processInstructions: options.processInstructions,
  });
}

// Export XML-specific elements for specialized needs
export const XMLElements = {
  CDATA: (props: { children: string }) => {
    const el = document.createElement("xml-cdata");
    el.textContent = props.children;
    el.setAttribute("data-type", "cdata");
    return el;
  },

  ProcessingInstruction: (props: { target: string; data: string }) => {
    const el = document.createElement("xml-pi");
    el.setAttribute("target", props.target);
    el.setAttribute("data", props.data);
    el.setAttribute("data-type", "processing-instruction");
    return el;
  },

  Comment: (props: { children: string }) => {
    const el = document.createElement("xml-comment");
    el.textContent = props.children;
    el.setAttribute("data-type", "comment");
    return el;
  },
};
