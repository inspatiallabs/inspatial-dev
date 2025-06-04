// @ts-ignore - Ignoring TS extension import error
import {OWNER_ELEMENT} from '../shared/symbols.ts';
// @ts-ignore - Ignoring TS extension import error
import {setAttribute} from '../shared/attributes.ts';

// @ts-ignore - Ignoring TS extension import error
import {Attr} from '../interface/attr.ts';

// Import Element type from DOM
type Element = any;

const {add} = Set.prototype;
// @ts-ignore - Type compatibility with DOMTokenList
const addTokens = (self: any, tokens: string[]): void => {
  for (const token of tokens) {
    if (token)
      add.call(self, token);
  }
};

// @ts-ignore - Symbol property access
const update = (self: any): void => {
  const ownerElement = self[OWNER_ELEMENT];
  // @ts-ignore - Spread operator downlevel iteration
  const value = [...self].join(' ');
  const attribute = ownerElement.getAttributeNode('class');
  if (attribute)
    attribute.value = value;
  else
    setAttribute(
      ownerElement,
      new Attr(ownerElement.ownerDocument, 'class', value)
    );
};

/**
 * @implements globalThis.DOMTokenList
 */
export class DOMTokenList extends Set {
  /**
   * @param {Element} ownerElement
   */
  constructor(ownerElement: Element) {
    super();
    // @ts-ignore - Symbol property access
    this[OWNER_ELEMENT] = ownerElement;
    const attribute = ownerElement.getAttributeNode('class');
    if (attribute)
      addTokens(this, attribute.value.split(/\s+/));
  }

  get length(): number { return this.size; }

  // @ts-ignore - Spread operator downlevel iteration
  get value(): string { return [...this].join(' '); }

  /**
   * @param  {...string} tokens
   */
  override add(...tokens: string[]): this {
    addTokens(this, tokens);
    update(this);
    return this;
  }

  /**
   * @param {string} token
   */
  contains(token: string): boolean { return this.has(token); }

  /**
   * @param  {...string} tokens
   */
  remove(...tokens: string[]): void {
    for (const token of tokens)
      this.delete(token);
    update(this);
  }

  /**
   * @param {string} token
   * @param {boolean?} force
   */
  toggle(token: string, force?: boolean): boolean {
    if (this.has(token)) {
      if (force)
        return true;
      this.delete(token);
      update(this);
    }
    else if (force || arguments.length === 1) {
      super.add(token);
      update(this);
      return true;
    }
    return false;
  }

  /**
   * @param {string} token
   * @param {string} newToken
   */
  replace(token: string, newToken: string): boolean {
    if (this.has(token)) {
      this.delete(token);
      super.add(newToken);
      update(this);
      return true;
    }
    return false;
  }

  /**
   * @param {string} token
   */
  supports(_token: string): boolean { return true; }
}

// Extend the DOMTokenList interface to support symbol indexing
// @ts-ignore - Symbol property type extension
export interface DOMTokenList {
  [OWNER_ELEMENT]: Element;
  [key: symbol]: any;
}
