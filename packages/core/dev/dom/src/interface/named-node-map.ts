// @ts-ignore - Ignoring TS extension import error
import type {Node} from './node.ts';
// @ts-ignore - Ignoring TS extension import error
import type {Element} from './element.ts';

/**
 * Interface for attribute nodes
 */
interface AttributeNode extends Node {
  name: string;
  value: string;
  ownerElement: Element | null;
  
  // Add methods needed for AttributeWithValue compatibility
  isDefaultNamespace?(namespaceURI: string | null): boolean;
  lookupNamespaceURI?(prefix: string | null): string | null;
  lookupPrefix?(namespaceURI: string | null): string | null;
  
  // Any additional properties required by AttributeWithValue
  ENTITY_REFERENCE_NODE?: number;
}

/**
 * @implements globalThis.NamedNodeMap
 */
export class NamedNodeMap extends Array<AttributeNode> {
  /**
   * The element that owns this attribute map
   */
  ownerElement: Element;

  /**
   * Create a new NamedNodeMap
   * @param ownerElement - The element that owns this attribute map
   */
  constructor(ownerElement: Element) {
    super();
    this.ownerElement = ownerElement;
  }

  /**
   * Returns the attribute node with the specified name
   * @param name - The name of the attribute to retrieve
   * @returns The specified attribute node, or null if not found
   */
  getNamedItem(name: string): AttributeNode | null {
    return this.ownerElement.getAttributeNode(name) as AttributeNode | null;
  }

  /**
   * Adds a new attribute node to the map
   * @param attr - The attribute node to add
   * @returns The attribute node that was replaced, if any
   */
  setNamedItem(attr: AttributeNode): AttributeNode | null {
    // Use type assertion to make TypeScript happy
    const previous = this.ownerElement.setAttributeNode(attr as any);
    this.unshift(attr);
    // Ensure we return the right type
    return previous as AttributeNode | null;
  }

  /**
   * Removes an attribute from the map
   * @param name - The name of the attribute to remove
   * @returns The removed attribute node
   */
  removeNamedItem(name: string): AttributeNode {
    const item = this.getNamedItem(name);
    if (!item) {
      throw new Error(`Attribute ${name} not found`);
    }
    this.ownerElement.removeAttribute(name);
    this.splice(this.indexOf(item), 1);
    return item;
  }

  /**
   * Returns the attribute at the specified index
   * @param index - The index of the attribute to retrieve
   * @returns The attribute at the specified index, or null if not found
   */
  item(index: number): AttributeNode | null {
    return index < this.length ? this[index] : null;
  }

  /* c8 ignore start */
  /**
   * Returns the attribute node with the specified namespace and name
   * @param namespace - The namespace of the attribute
   * @param name - The local name of the attribute
   * @returns The specified attribute node, or null if not found
   */
  getNamedItemNS(_: string | null, name: string): AttributeNode | null {
    return this.getNamedItem(name);
  }

  /**
   * Adds a new attribute node with a namespace to the map
   * @param namespace - The namespace of the attribute
   * @param attr - The attribute node to add
   * @returns The attribute node that was replaced, if any
   */
  setNamedItemNS(_: string | null, attr: AttributeNode): AttributeNode | null {
    return this.setNamedItem(attr);
  }

  /**
   * Removes an attribute with a namespace from the map
   * @param namespace - The namespace of the attribute
   * @param name - The local name of the attribute
   * @returns The removed attribute node
   */
  removeNamedItemNS(_: string | null, name: string): AttributeNode {
    return this.removeNamedItem(name);
  }
  /* c8 ignore stop */
}
