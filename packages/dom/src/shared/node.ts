// @ts-ignore - Ignoring TS extension import error
import {
  CDATA_SECTION_NODE,
  COMMENT_NODE,
  DOCUMENT_NODE,
  DOCUMENT_FRAGMENT_NODE,
  ELEMENT_NODE,
  TEXT_NODE,
  NODE_END,
} from "./constants.ts";
// @ts-ignore - Ignoring TS extension import error
import { START, NEXT, PREV } from "./symbols.ts";
// @ts-ignore - Ignoring TS extension import error
import { getEnd } from "./util/utils.ts";

export const isConnected = ({
  ownerDocument,
  parentNode,
}: {
  ownerDocument?: Node;
  parentNode?: Node;
}) => {
  while (parentNode) {
    if (parentNode === ownerDocument) return true;
    parentNode = parentNode.parentNode || (parentNode as any).host;
  }
  return false;
};

export const parentElement = ({ parentNode }: { parentNode?: Node }) => {
  if (parentNode) {
    switch (parentNode.nodeType) {
      case DOCUMENT_NODE:
      case DOCUMENT_FRAGMENT_NODE:
        return null;
    }
  }
  return parentNode;
};

export const previousSibling = (node: any) => {
  const prev = node[PREV];
  switch (prev ? prev.nodeType : 0) {
    case NODE_END:
      return (prev as any)?.[START];
    case ELEMENT_NODE:
    case TEXT_NODE:
    case COMMENT_NODE:
    case CDATA_SECTION_NODE:
      return prev;
  }
  return null;
};

export const nextSibling = (node: Node) => {
  // For simple elements, use direct NEXT
  const directNext = (node as any)[NEXT];
  if (directNext && directNext.nodeType !== NODE_END) {
    return directNext;
  }
  
  // For complex elements, use getEnd approach
  const next = getEnd(node as any)[NEXT];
  return next && (next.nodeType === NODE_END ? null : next);
};
