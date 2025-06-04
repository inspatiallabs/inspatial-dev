// @ts-ignore - Ignoring TS extension import error
import { IMAGE } from "../shared/symbols.ts";
// @ts-ignore - Ignoring TS extension import error
import { registerHTMLClass } from "../shared/register-html-class.ts";
// @ts-ignore - Ignoring TS extension import error
import { numericAttribute } from "../shared/attributes.ts";
// @ts-ignore - Ignoring TS extension import error
import { HTMLElement } from "./element.ts";

class Canvas {
  width: number;
  height: number;

  constructor(width: number, height: number) {
    this.width = width;
    this.height = height;
  }

  getContext(_type?: string): any {
    return null;
  }

  toDataURL(_type?: string, _quality?: number): string {
    return "";
  }

  static createCanvas(width: number, height: number): Canvas {
    return new Canvas(width, height);
  }
}

const createCanvas = Canvas.createCanvas;

const tagName = "canvas";

/**
 * @implements globalThis.HTMLCanvasElement
 */
export class HTMLCanvasElement extends HTMLElement {
  // @ts-ignore - Symbol indexing
  [IMAGE]: Canvas;

  constructor(ownerDocument: any, localName: string = tagName) {
    super(ownerDocument, localName);
    // @ts-ignore - Symbol indexing
    this[IMAGE] = createCanvas(300, 150);
  }

  override get width(): number {
    // @ts-ignore - Symbol indexing
    return this[IMAGE].width;
  }

  override set width(value: number) {
    numericAttribute.set(this as any, "width", value);
    // @ts-ignore - Symbol indexing
    this[IMAGE].width = value;
  }

  override get height(): number {
    // @ts-ignore - Symbol indexing
    return this[IMAGE].height;
  }

  override set height(value: number) {
    numericAttribute.set(this as any, "height", value);
    // @ts-ignore - Symbol indexing
    this[IMAGE].height = value;
  }

  getContext(type: string): any {
    // @ts-ignore - Symbol indexing
    return this[IMAGE].getContext(type);
  }

  toDataURL(...args: any[]): string {
    // @ts-ignore - Symbol indexing
    return this[IMAGE].toDataURL(...args);
  }
}

registerHTMLClass(tagName, HTMLCanvasElement);
