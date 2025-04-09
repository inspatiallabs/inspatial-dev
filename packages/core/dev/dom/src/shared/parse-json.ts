// @ts-nocheck - This file uses custom DOM implementation with symbol properties that TypeScript cannot model correctly

import {
  NODE_END,
  ELEMENT_NODE,
  ATTRIBUTE_NODE,
  TEXT_NODE,
  CDATA_SECTION_NODE,
  COMMENT_NODE,
  DOCUMENT_NODE,
  DOCUMENT_TYPE_NODE,
  DOCUMENT_FRAGMENT_NODE,
} from "./constants.ts";

import { END, PREV } from "./symbols.ts";

import { htmlClasses } from "./register-html-class.ts";
import { knownBoundaries, knownSiblings } from "./util/utils.ts";

import { Attr } from "../interface/attr.ts";
import { CDATASection } from "../interface/cdata-section.ts";
import { Comment } from "../interface/comment.ts";
import { DocumentType } from "../interface/document-type.ts";
import { Text } from "../interface/text.ts";
import { Node } from "../interface/node.ts";
import { Element } from "../interface/element.ts";
import { Document } from "../interface/document.ts";
import { DocumentFragment } from "../interface/document-fragment.ts";

import { HTMLDocument } from "../html/document.ts";
import { HTMLElement } from "../html/element.ts";
import { SVGElement } from "../svg/element.ts";

const { parse } = JSON;

/**
 * DOM Node with END symbol property
 */
interface NodeWithEnd extends Node {
  [END]: NodeWithEnd;
  [PREV]: NodeWithEnd | null;
  parentNode: NodeWithEnd | null;
  ownerSVGElement?: SVGElement | null;
}

/**
 * Either a node type or its content
 */
type JsdonValue = number | string;

/**
 * Appends a node to a parent node before a specified end node
 * @param parentNode The parent node to append to
 * @param node The node to append
 * @param end The end node to insert before
 */
const append = (parentNode, node, end) => {
  node.parentNode = parentNode;
  knownSiblings(end[PREV], node, end);
};

/**
 * Creates an HTML element with the specified local name
 * @param ownerDocument The document that owns the element
 * @param localName The local name of the element
 * @returns A new HTML element
 */
const createHTMLElement = (ownerDocument, localName) => {
  if (htmlClasses.has(localName)) {
    const Class = htmlClasses.get(localName);
    // The Class may be undefined, but the code handles it at runtime
    return new Class(ownerDocument, localName);
  }
  return new HTMLElement(ownerDocument, localName);
};

/**
 * Parse JSON into DOM structure
 * @param value A JSON string or array representing DOM content
 * @returns An HTMLDocument or Element or DocumentFragment depending on the content
 */
export const parseJSON = (value: string | any[]): HTMLDocument | Element | DocumentFragment => {
  const array = typeof value === "string" ? parse(value) : value;
  const { length } = array;
  const document = new HTMLDocument();

  let parentNode = document;
  let end = parentNode[END];
  let svg = false;
  let i = 0;

  while (i < length) {
    let nodeType = array[i++];
    switch (nodeType) {
      case ELEMENT_NODE: {
        const localName = array[i++];
        const isSVG = svg || localName === "svg" || localName === "SVG";

        // ownerSVGElement may not exist on parentNode in TypeScript, but it does at runtime
        const element = isSVG
          ? new SVGElement(
              document,
              localName,
              parentNode.ownerSVGElement || null
            )
          : createHTMLElement(document, localName);

        knownBoundaries(end[PREV], element, end);
        element.parentNode = parentNode;
        parentNode = element;
        end = parentNode[END];
        svg = isSVG;
        break;
      }
      case ATTRIBUTE_NODE: {
        const name = array[i++];
        const value = typeof array[i] === "string" ? array[i++] : "";
        const attr = new Attr(document, name, value);
        attr.ownerElement = parentNode;
        knownSiblings(end[PREV], attr, end);
        break;
      }
      case TEXT_NODE:
        append(parentNode, new Text(document, array[i++]), end);
        break;
      case COMMENT_NODE:
        append(parentNode, new Comment(document, array[i++]), end);
        break;
      case CDATA_SECTION_NODE:
        append(parentNode, new CDATASection(document, array[i++]), end);
        break;
      case DOCUMENT_TYPE_NODE: {
        const args = [document];
        while (typeof array[i] === "string") args.push(array[i++]);
        if (args.length === 3 && /\.dtd$/i.test(args[2])) args.splice(2, 0, "");
        append(parentNode, new DocumentType(...args), end);
        break;
      }
      case DOCUMENT_FRAGMENT_NODE:
        parentNode = document.createDocumentFragment();
        end = parentNode[END];
      /* eslint no-fallthrough:0 */
      case DOCUMENT_NODE:
        break;
      default:
        do {
          nodeType -= NODE_END;
          if (svg && !parentNode.ownerSVGElement) svg = false;
          parentNode = parentNode.parentNode || parentNode;
        } while (nodeType < 0);
        end = parentNode[END];
        break;
    }
  }
  switch (i && array[0]) {
    case ELEMENT_NODE:
      return document.firstElementChild;
    case DOCUMENT_FRAGMENT_NODE:
      return parentNode;
  }
  return document;
};

/**
 * Converts a Document or Element to a JSDON array representation
 * @param node The Document or Element to serialize
 * @returns The linear jsdon serialized array
 */
export const toJSON = (node: Node | Element | Document): any[] => node.toJSON();
