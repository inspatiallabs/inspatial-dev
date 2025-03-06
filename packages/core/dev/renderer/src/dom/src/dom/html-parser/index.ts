import { Parser, type ParserOptions } from "./parser.ts";
import {
  DomHandler,
  type DomHandlerOptions,
  type ChildNode,
  type Element,
  type Document,
} from "../handler/index.ts";

export type { Handler, ParserOptions } from "./parser.ts";
export { Parser } from "./parser.ts";

export {
  DomHandler,
  // Old name for DomHandler
  DomHandler as DefaultHandler,
  type DomHandlerOptions,
} from "../handler/index.ts";

export type Options = ParserOptions & DomHandlerOptions;

// Helper methods

/**
 * Parses the data, returns the resulting document.
 *
 * @param data The data that should be parsed.
 * @param options Optional options for the parser and DOM handler.
 */
export function parseDocument(data: string, options?: Options): Document {
  const handler = new DomHandler(undefined, options);
  new Parser(handler, options).end(data);
  return handler.root;
}
/**
 * Parses data, returns an array of the root nodes.
 *
 * Note that the root nodes still have a `Document` node as their parent.
 * Use `parseDocument` to get the `Document` node instead.
 *
 * @param data The data that should be parsed.
 * @param options Optional options for the parser and DOM handler.
 * @deprecated Use `parseDocument` instead.
 */
export function parseDOM(data: string, options?: Options): ChildNode[] {
  return parseDocument(data, options).children;
}
/**
 * Creates a parser instance, with an attached DOM handler.
 *
 * @param callback A callback that will be called once parsing has been completed, with the resulting document.
 * @param options Optional options for the parser and DOM handler.
 * @param elementCallback An optional callback that will be called every time a tag has been completed inside of the DOM.
 */
export function createDocumentStream(
  callback: (error: Error | null, document: Document) => void,
  options?: Options,
  elementCallback?: (element: Element) => void
): Parser {
  const handler: DomHandler = new DomHandler(
    (error: Error | null) => callback(error, handler.root),
    options,
    elementCallback
  );
  return new Parser(handler, options);
}
/**
 * Creates a parser instance, with an attached DOM handler.
 *
 * @param callback A callback that will be called once parsing has been completed, with an array of root nodes.
 * @param options Optional options for the parser and DOM handler.
 * @param elementCallback An optional callback that will be called every time a tag has been completed inside of the DOM.
 * @deprecated Use `createDocumentStream` instead.
 */
export function createDomStream(
  callback: (error: Error | null, dom: ChildNode[]) => void,
  options?: Options,
  elementCallback?: (element: Element) => void
): Parser {
  const handler = new DomHandler(callback, options, elementCallback);
  return new Parser(handler, options);
}

export {
  default as Tokenizer,
  type Callbacks as TokenizerCallbacks,
  QuoteType,
} from "./tokenize.ts";

/*
 * All of the following exports exist for backwards-compatibility.
 * They should probably be removed eventually.
 */
export * as ElementType from "../handler/element-type.ts";
