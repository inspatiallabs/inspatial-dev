// @ts-ignore - Ignoring TS extension import error
import { ELEMENT_NODE, DOCUMENT_FRAGMENT_NODE } from "../shared/constants.ts";
// @ts-ignore - Ignoring TS extension import error
import { CUSTOM_ELEMENTS } from "../shared/symbols.ts";
// @ts-ignore - Ignoring TS extension import error
import { parseFromString } from "../shared/parse-from-string.ts";
// @ts-ignore - Ignoring TS extension import error
import { ignoreCase } from "../shared/util/utils.ts";

interface NodeWithChildNodes {
  childNodes: {
    join(separator: string): string;
    forEach(callback: (node: any) => void, thisArg?: any): void;
    map<T>(callback: (node: any) => T, thisArg?: any): T[];
  };
  ownerDocument: any;
  nodeType: number;
  replaceChildren(...nodes: any[]): void;
}

/**
 * @param {Node} node
 * @returns {String}
 */
export const getInnerHtml = (node: NodeWithChildNodes): string =>
  node.childNodes.join("");

/**
 * @param {Node} node
 * @param {String} html
 */
export const setInnerHtml = (node: NodeWithChildNodes, html: string): void => {
  // Prevent infinite recursion by checking if we're already setting innerHTML
  if ((node as any)._settingInnerHTML) {
    return;
  }
  
  try {
    (node as any)._settingInnerHTML = true;
    
    const { ownerDocument } = node;
    const { constructor } = ownerDocument;
    const document = new constructor();
    document[CUSTOM_ELEMENTS] = ownerDocument[CUSTOM_ELEMENTS];
    const { childNodes } = parseFromString(document, ignoreCase(node), html);

    node.replaceChildren(...childNodes.map(setOwnerDocument, ownerDocument));
  } finally {
    (node as any)._settingInnerHTML = false;
  }
};

function setOwnerDocument(this: any, node: any): any {
  node.ownerDocument = this;
  switch (node.nodeType) {
    case ELEMENT_NODE:
    case DOCUMENT_FRAGMENT_NODE:
      node.childNodes.forEach(setOwnerDocument, this);
      break;
  }
  return node;
}
