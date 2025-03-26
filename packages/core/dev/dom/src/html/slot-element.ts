// @ts-ignore - Ignoring TS extension import error
import {HTMLElement} from './element.ts';
// @ts-ignore - Ignoring TS extension import error
import {registerHTMLClass} from '../shared/register-html-class.ts';
// @ts-ignore - Ignoring TS extension import error
import {Node} from '../interface/node.ts';
// @ts-ignore - Ignoring TS extension import error
import {Element} from '../interface/element.ts';

const tagName = 'slot';

// Define interfaces for slot options
interface SlotOptions {
  flatten?: boolean;
}

// Interface for host elements with childNodes
interface HostNode extends Node {
  host?: {
    childNodes: NodeListLike;
  };
}

// Interface for NodeList-like structures
interface NodeListLike {
  [index: number]: Node;
  length: number;
}

/**
 * @implements globalThis.HTMLSlotElement
 */
export class HTMLSlotElement extends HTMLElement {
  constructor(ownerDocument: any, localName: string = tagName) {
    super(ownerDocument, localName);
  }

  /* c8 ignore start */
  get name(): string | null { return this.getAttribute('name'); }
  set name(value: string) { this.setAttribute('name', value); }

  assign(): void {}

  assignedNodes(options?: SlotOptions): Node[] {
    const isNamedSlot = !!this.name;
    const rootNode = this.getRootNode() as HostNode;
    const hostChildNodes = rootNode.host?.childNodes ?? [];
    let slottables: Node[];

    if (isNamedSlot) {
      slottables = Array.from(hostChildNodes).filter(node => (node as any).slot === this.name);
    } else {
      slottables = Array.from(hostChildNodes).filter(node => !(node as any).slot);
    }

    if (options?.flatten) {
      const result: Node[] = [];

      // Element and Text nodes are slottables. A slot can be a slottable.
      for (let slottable of slottables) {
        if ((slottable as any).localName === 'slot') {
          result.push(...((slottable as unknown) as HTMLSlotElement).assignedNodes({ flatten: true }));
        } else {
          result.push(slottable);
        }
      }

      slottables = result;
    }

    // If no assigned nodes are found, it returns the slot's fallback content.
    return slottables.length ? slottables : Array.from(this.childNodes);
  }

  assignedElements(options?: SlotOptions): Element[] {
    const slottables = this.assignedNodes(options).filter(n => n.nodeType === 1) as Element[];

    // If no assigned elements are found, it returns the slot's fallback content.
    return slottables.length ? slottables : Array.from(this.children);
  }
  /* c8 ignore stop */
}

registerHTMLClass(tagName, HTMLSlotElement);
