// https://dom.spec.whatwg.org/#interface-characterdata

// @ts-ignore - Ignoring TS extension import error
import {NEXT, PREV, VALUE} from '../shared/symbols.ts';
// @ts-ignore - Ignoring TS extension import error
import {String} from '../shared/util/utils.ts';
import {isConnected, parentElement, previousSibling, nextSibling} from '../shared/node.ts';
// @ts-ignore - Ignoring TS extension import error
import {characterDataAsJSON} from '../shared/jsdon.ts';

import {previousElementSibling, nextElementSibling} from '../mixin/non-document-type-child-node.ts';
import {before, after, replaceWith, remove} from '../mixin/child-node.ts';

// @ts-ignore - Ignoring TS extension import error
import {Node} from './node.ts';
import {moCallback} from './mutation-observer.ts';

// Interface extensions for type safety with symbol properties
export interface CharacterData {
  [VALUE]: string;
  [NEXT]: Node | null;
  [PREV]: Node | null;
}

/**
 * @implements globalThis.CharacterData
 */
export class CharacterData extends Node {
  constructor(ownerDocument: any, localName: string, nodeType: number, data: string) {
    super(ownerDocument, localName, nodeType);
    // @ts-ignore - Symbol property access
    this[VALUE] = String(data);
  }

  // <Mixins>
  override get isConnected(): boolean { return isConnected(this); }
  override get parentElement(): Node | null { return parentElement(this); }
  override get previousSibling(): Node | null { return previousSibling(this); }
  override get nextSibling(): Node | null { return nextSibling(this); }

  override get previousElementSibling(): Node | null { return previousElementSibling(this); }
  override get nextElementSibling(): Node | null { return nextElementSibling(this); }

  before(...nodes: any[]): void { before(this, nodes); }
  after(...nodes: any[]): void { after(this, nodes); }
  replaceWith(...nodes: any[]): void { replaceWith(this, nodes); }
  remove(): void { 
    // @ts-ignore - Symbol property access
    remove(this[PREV], this, this[NEXT]); 
  }
  // </Mixins>

  // CharacterData only
  /* c8 ignore start */
  get data(): string { 
    // @ts-ignore - Symbol property access
    return this[VALUE]; 
  }
  set data(value: string) {
    // @ts-ignore - Symbol property access
    this[VALUE] = String(value);
    moCallback(this, this.parentNode);
  }

  override get nodeValue(): string { return this.data; }
  override set nodeValue(value: string) { this.data = value; }

  override get textContent(): string { return this.data; }
  override set textContent(value: string) { this.data = value; }

  get length(): number { return this.data.length; }

  substringData(offset: number, count: number): string {
    return this.data.substr(offset, count);
  }

  appendData(data: string): void {
    this.data += data;
  }

  insertData(offset: number, data: string): void {
    const {data: t} = this;
    this.data = t.slice(0, offset) + data + t.slice(offset);
  }

  deleteData(offset: number, count: number): void {
    const {data: t} = this;
    this.data = t.slice(0, offset) + t.slice(offset + count);
  }

  replaceData(offset: number, count: number, data: string): void {
    const {data: t} = this;
    this.data = t.slice(0, offset) + data + t.slice(offset + count);
  }
  /* c8 ignore stop */

  toJSON(): any[] {
    const json: any[] = [];
    characterDataAsJSON(this, json);
    return json;
  }
}
