import { ISSSelector } from "@inspatial/theme";
// @ts-ignore - Ignoring TS extension import error
import { ELEMENT_NODE, TEXT_NODE } from "./constants.ts";
// @ts-ignore - Ignoring TS extension import error
import { ignoreCase } from "./util/utils.ts";

const { isArray } = Array;

/* c8 ignore start */
// Make isTag a type predicate
const isTag = (node: any): node is { nodeType: number; childNodes: any[] } =>
  node && node.nodeType === ELEMENT_NODE;

const existsOne = (test: (element: any) => boolean, elements: any[]): boolean =>
  elements.some(
    (element) =>
      isTag(element) && (test(element) || existsOne(test, getChildren(element)))
  );

const getAttributeValue = (element: any, name: string): string =>
  name === "class" ? element.classList.value : element.getAttribute(name);

const getChildren = ({ childNodes }: { childNodes: any }): any[] => childNodes;

const getName = (element: any): string => {
  const { localName } = element;
  return ignoreCase(element) ? localName.toLowerCase() : localName;
};

const getParent = ({ parentNode }: { parentNode: any }): any => parentNode;

const getSiblings = (element: any): any[] => {
  const { parentNode } = element;
  return parentNode ? getChildren(parentNode) : element;
};

const getText = (node: any): string => {
  if (isArray(node)) return node.map(getText).join("");
  if (isTag(node)) return getText(getChildren(node));
  if (node.nodeType === TEXT_NODE) return node.data;
  return "";
};

const hasAttrib = (element: any, name: string): boolean =>
  element.hasAttribute(name);

const removeSubsets = (nodes: any[]): any[] => {
  let { length } = nodes;
  while (length--) {
    const node = nodes[length];
    if (length && -1 < nodes.lastIndexOf(node, length - 1)) {
      nodes.splice(length, 1);
      continue;
    }
    for (
      let { parentNode } = node;
      parentNode;
      parentNode = parentNode.parentNode
    ) {
      if (nodes.includes(parentNode)) {
        nodes.splice(length, 1);
        break;
      }
    }
  }
  return nodes;
};

const findAll = (test: (node: any) => boolean, nodes: any[]): any[] => {
  const matches = [];
  for (const node of nodes) {
    if (isTag(node)) {
      if (test(node)) matches.push(node);
      matches.push(...findAll(test, getChildren(node)));
    }
  }
  return matches;
};

const findOne = (test: (node: any) => boolean, nodes: any[]): any => {
  for (let node of nodes)
    if (test(node) || (node = findOne(test, getChildren(node)))) return node;
  return null;
};
/* c8 ignore stop */

const adapter = {
  isTag,
  existsOne,
  getAttributeValue,
  getChildren,
  getName,
  getParent,
  getSiblings,
  getText,
  hasAttrib,
  removeSubsets,
  findAll,
  findOne,
};

export const prepareMatch = (element: any, selectors: string) =>
  ISSSelector.compile(selectors, {
    context: selectors.includes(":scope") ? element : void 0,
    xmlMode: !ignoreCase(element),
    adapter,
  });

export const matches = (element: any, selectors: string) =>
  ISSSelector.is(element, selectors, {
    context: selectors.includes(":scope") ? element : void 0,
    xmlMode: !ignoreCase(element),
    adapter,
  });
