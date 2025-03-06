// @ts-ignore - Ignoring TS extension import error
import {
  NODE_END,
  ATTRIBUTE_NODE,
  CDATA_SECTION_NODE,
  COMMENT_NODE,
  DOCUMENT_TYPE_NODE,
  ELEMENT_NODE,
  TEXT_NODE
} from './constants.ts';

// @ts-ignore - Ignoring TS extension import error
import {END, NEXT, VALUE} from './symbols.ts';

// @ts-ignore - Ignoring TS extension import error
import {getEnd} from './util/utils.ts';

interface NodeWithSymbols {
  nodeType: number;
  [NEXT]: any;
  [END]?: any;
  [VALUE]?: string;
  name?: string;
  localName?: string;
}

interface DocumentType {
  nodeType: number;
  name: string;
  publicId: string;
  systemId: string;
}

const loopSegment = ({[NEXT]: next, [END]: end}: NodeWithSymbols, json: any[]): void => {
  while (next !== end) {
    switch (next.nodeType) {
      case ATTRIBUTE_NODE:
        attrAsJSON(next, json);
        break;
      case TEXT_NODE:
      case COMMENT_NODE:
      case CDATA_SECTION_NODE:
        characterDataAsJSON(next, json);
        break;
      case ELEMENT_NODE:
        elementAsJSON(next, json);
        next = getEnd(next);
        break;
      case DOCUMENT_TYPE_NODE:
        documentTypeAsJSON(next, json);
        break;
    }
    next = next[NEXT];
  }
  const last = json.length - 1;
  const value = json[last];
  if (typeof value === 'number' && value < 0)
    json[last] += NODE_END;
  else
    json.push(NODE_END);
};

export const attrAsJSON = (attr: NodeWithSymbols, json: any[]): void => {
  json.push(ATTRIBUTE_NODE, attr.name);
  const value = attr[VALUE]?.trim();
  if (value)
    json.push(value);
};

export const characterDataAsJSON = (node: NodeWithSymbols, json: any[]): void => {
  const value = node[VALUE];
  if (value?.trim())
    json.push(node.nodeType, value);
};

export const nonElementAsJSON = (node: NodeWithSymbols, json: any[]): void => {
  json.push(node.nodeType);
  loopSegment(node, json);
};

export const documentTypeAsJSON = ({name, publicId, systemId}: DocumentType, json: any[]): void => {
  json.push(DOCUMENT_TYPE_NODE, name);
  if (publicId)
    json.push(publicId);
  if (systemId)
    json.push(systemId);
};

export const elementAsJSON = (element: NodeWithSymbols, json: any[]): void => {
  json.push(ELEMENT_NODE, element.localName);
  loopSegment(element, json);
};
