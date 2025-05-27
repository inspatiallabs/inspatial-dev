// https://dom.spec.whatwg.org/#nondocumenttypechildnode
// CharacterData, Element

// @ts-ignore - Ignoring TS extension import error
import { ELEMENT_NODE } from "../shared/constants.ts";
// @ts-ignore - Ignoring TS extension import error
import { nextSibling, previousSibling } from "../shared/node.ts";

export const nextElementSibling = (node: Node) => {
  let next = nextSibling(node as any);
  while (next && next.nodeType !== ELEMENT_NODE)
    next = nextSibling(next as any);
  return next;
};

export const previousElementSibling = (node: Node) => {
  let prev = previousSibling(node as any);
  while (prev && prev.nodeType !== ELEMENT_NODE)
    prev = previousSibling(prev as any);
  return prev;
};
