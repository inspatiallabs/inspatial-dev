// @ts-ignore - Ignoring TS extension import error
import { booleanAttribute, stringAttribute } from '../shared/attributes.ts';
// @ts-ignore - Ignoring TS extension import error
import { registerHTMLClass } from '../shared/register-html-class.ts';

// @ts-ignore - Ignoring TS extension import error
import { TextElement } from './text-element.ts';
// @ts-ignore - Ignoring TS extension import error
import type { ElementNode } from "../shared/attributes.ts";

const tagName = 'script';

/**
 * @implements globalThis.HTMLScriptElement
 */
export class HTMLScriptElement extends TextElement {
  constructor(ownerDocument: any, localName: string = tagName) {
    super(ownerDocument, localName);
  }

  get type(): string {
    return stringAttribute.get(this as unknown as ElementNode, 'type');
  }
  set type(value: string) {
    stringAttribute.set(this as unknown as ElementNode, 'type', value);
  }

  get src(): string {
    return stringAttribute.get(this as unknown as ElementNode, 'src');
  }
  set src(value: string) {
    stringAttribute.set(this as unknown as ElementNode, 'src', value);
  }

  get defer(): boolean {
    return booleanAttribute.get(this as unknown as ElementNode, 'defer');
  }
  set defer(value: boolean) {
    booleanAttribute.set(this as unknown as ElementNode, 'defer', value);
  }
  
  get crossOrigin(): string | null {
    return this.getAttribute('crossorigin');
  }
  set crossOrigin(value: string) {
    this.setAttribute('crossorigin', value);
  }
  
  get nomodule(): boolean {
    return booleanAttribute.get(this as unknown as ElementNode, 'nomodule');
  }
  set nomodule(value: boolean) {
    booleanAttribute.set(this as unknown as ElementNode, 'nomodule', value);
  }
  
  get referrerPolicy(): string {
    return stringAttribute.get(this as unknown as ElementNode, 'referrerpolicy');
  }
  set referrerPolicy(value: string) {
    stringAttribute.set(this as unknown as ElementNode, 'referrerpolicy', value);
  }
  
  override get nonce(): string {
    return stringAttribute.get(this as unknown as ElementNode, 'nonce');
  }
  override set nonce(value: string) {
    stringAttribute.set(this as unknown as ElementNode, 'nonce', value);
  }
  
  get async(): boolean {
    return booleanAttribute.get(this as unknown as ElementNode, 'async');
  }
  set async(value: boolean) {
    booleanAttribute.set(this as unknown as ElementNode, 'async', value);
  }
  
  get text(): string | null { return this.textContent; }
  set text(content: string) { this.textContent = content; }
}

registerHTMLClass(tagName, HTMLScriptElement);
