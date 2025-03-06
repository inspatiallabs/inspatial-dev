// @ts-ignore - Ignoring TS extension import error
import { DOMParser } from "./document/parser.ts";
// @ts-ignore - Ignoring TS extension import error
import { Document as _Document } from "./interface/document.ts";

// @ts-ignore - Ignoring TS extension import error
import { illegalConstructor } from "./shared/facades.ts";
// @ts-ignore - Ignoring TS extension import error
import { setPrototypeOf } from "./shared/object.ts";
// @ts-ignore - Ignoring TS extension import error
export { parseJSON, toJSON } from "./shared/parse-json.ts";

// @ts-ignore - Ignoring TS extension import error
export * from "./shared/facades.ts";
// @ts-ignore - Ignoring TS extension import error
export * from "./shared/html-classes.ts";

export { DOMParser };

// @ts-ignore - Ignoring TS extension import error
export { CustomEvent } from "./interface/custom-event.ts";
// @ts-ignore - Ignoring TS extension import error
export { Event } from "./interface/event.ts";
// @ts-ignore - Ignoring TS extension import error
export { EventTarget } from "./interface/event-target.ts";
// @ts-ignore - Ignoring TS extension import error
export { InputEvent } from "./interface/input-event.ts";
// @ts-ignore - Ignoring TS extension import error
export { NodeList } from "./interface/node-list.ts";
// @ts-ignore - Ignoring TS extension import error
export { NodeFilter } from "./interface/node-filter.ts";

export const parseHTML = (html: string, globals = null) =>
  new DOMParser().parseFromString(html, "text/html", globals).defaultView;

export function Document() {
  illegalConstructor();
}

setPrototypeOf(Document, _Document).prototype = _Document.prototype;
