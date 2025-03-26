// https://dom.spec.whatwg.org/#interface-element

// @ts-ignore - Ignoring TS extension import error
import {
  ATTRIBUTE_NODE,
  BLOCK_ELEMENTS,
  CDATA_SECTION_NODE,
  COMMENT_NODE,
  ELEMENT_NODE,
  NODE_END,
  TEXT_NODE,
  SVG_NAMESPACE
} from '../shared/constants.ts';

// @ts-ignore - Ignoring TS extension import error
import {
  setAttribute, removeAttribute,
  numericAttribute, stringAttribute
} from '../shared/attributes.ts';

// @ts-ignore - Ignoring TS extension import error
import {
  CLASS_LIST, DATASET, STYLE,
  END, NEXT, PREV, START,
  MIME
} from '../shared/symbols.ts';

// @ts-ignore - Ignoring TS extension import error
import {
  ignoreCase,
  knownAdjacent,
  localCase,
  String
} from '../shared/util/utils.ts';

// @ts-ignore - Ignoring TS extension import error
import {elementAsJSON} from '../shared/jsdon.ts';
// @ts-ignore - Ignoring TS extension import error
import {matches, prepareMatch} from '../shared/matches.ts';
// @ts-ignore - Ignoring TS extension import error
import {shadowRoots} from '../shared/shadow-roots.ts';

// @ts-ignore - Ignoring TS extension import error
import {isConnected, parentElement, previousSibling, nextSibling} from '../shared/node.ts';
// @ts-ignore - Ignoring TS extension import error
import {previousElementSibling, nextElementSibling} from '../mixin/non-document-type-child-node.ts';

// @ts-ignore - Ignoring TS extension import error
import {before, after, replaceWith, remove} from '../mixin/child-node.ts';
// @ts-ignore - Ignoring TS extension import error
import {getInnerHtml, setInnerHtml} from '../mixin/inner-html.ts';
// @ts-ignore - Ignoring TS extension import error
import {ParentNode} from '../mixin/parent-node.ts';

// @ts-ignore - Ignoring TS extension import error
import {DOMStringMap} from '../document/string-map.ts';
// @ts-ignore - Ignoring TS extension import error
import {DOMTokenList} from '../document/token-list.ts';

// @ts-ignore - Ignoring TS extension import error
import {CSSStyleDeclaration} from './css-style-declaration.ts';
// @ts-ignore - Ignoring TS extension import error
import {Event} from './event.ts';
// @ts-ignore - Ignoring TS extension import error
import {NamedNodeMap} from './named-node-map.ts';
// @ts-ignore - Ignoring TS extension import error
import {ShadowRoot} from './shadow-root.ts';
// @ts-ignore - Ignoring TS extension import error
import {NodeList} from './node-list.ts';
// @ts-ignore - Ignoring TS extension import error
import {Attr} from './attr.ts';
// @ts-ignore - Ignoring TS extension import error
import {Text} from './text.ts';
// @ts-ignore - Ignoring TS extension import error
import {escapeHTML} from '../../../../util/src/escape-html.ts';

// For convenience, define a local escape function if the imported one has a different name
const escape = escapeHTML;

// Define types for attributes and nodes to help TypeScript
interface AttributeWithValue extends Node {
  name: string;
  value: string;
  ownerElement: Element | null;
}

interface ElementWithStyle extends Element {
  style: CSSStyleDeclaration;
}

interface NodeWithTagName extends Node {
  tagName: string;
  nodeType: number;
  [NEXT]: any;
}

// <utils>
const attributesHandler = {
  get(target: any, key: string | symbol) {
    return key in target ? target[key] : target.find(({name}: {name: string}) => name === key);
  }
};

const create = (ownerDocument: any, element: any, localName: string) => {
  if ('ownerSVGElement' in element) {
    const svg = ownerDocument.createElementNS(SVG_NAMESPACE, localName);
    svg.ownerSVGElement = element.ownerSVGElement;
    return svg;
  }
  return ownerDocument.createElement(localName);
};

const isVoid = ({localName, ownerDocument}: {localName: string, ownerDocument: any}) => {
  return ownerDocument[MIME].voidElements.test(localName);
};

// </utils>

/**
 * @implements globalThis.Element
 */
export class Element extends ParentNode {
  constructor(ownerDocument: any, localName: string) {
    super(ownerDocument, localName, ELEMENT_NODE);
    this[CLASS_LIST] = null;
    this[DATASET] = null;
    this[STYLE] = null;
  }

  // <Mixins>
  get isConnected() { return isConnected(this); }
  get parentElement() { return parentElement(this); }
  get previousSibling() { return previousSibling(this); }
  get nextSibling() { return nextSibling(this); }
  get namespaceURI() {
    return 'http://www.w3.org/1999/xhtml';
  }

  get previousElementSibling() { return previousElementSibling(this); }
  get nextElementSibling() { return nextElementSibling(this); }

  before(...nodes: any[]) { before(this, nodes); }
  after(...nodes: any[]) { after(this, nodes); }
  replaceWith(...nodes: any[]) { replaceWith(this, nodes); }
  remove() { remove(this[PREV], this, this[END][NEXT]); }
  // </Mixins>

  // <specialGetters>
  get id() { return stringAttribute.get(this, 'id'); }
  set id(value: string) { stringAttribute.set(this, 'id', value); }

  get className() { return this.classList.value; }
  set className(value: string) {
    const {classList} = this;
    classList.clear();
    classList.add(...(String(value).split(/\s+/)));
  }

  get nodeName() { return localCase(this); }
  get tagName() { return localCase(this); }

  get classList() {
    return this[CLASS_LIST] || (
      this[CLASS_LIST] = new DOMTokenList(this)
    );
  }

  get dataset() {
    return this[DATASET] || (
      this[DATASET] = new DOMStringMap(this)
    );
  }

  getBoundingClientRect() {
    return {
      x: 0,
      y: 0,
      bottom: 0,
      height: 0,
      left: 0,
      right: 0,
      top: 0,
      width: 0
    };
  }

  get nonce() { return stringAttribute.get(this, 'nonce'); }
  set nonce(value: string) { stringAttribute.set(this, 'nonce', value); }

  get style() {
    return this[STYLE] || (
      // @ts-ignore - This assignment is intentional and will work with the DOM implementation
      this[STYLE] = new CSSStyleDeclaration(this)
    );
  }

  get tabIndex() { return numericAttribute.get(this, 'tabindex') || -1; }
  set tabIndex(value: number) { numericAttribute.set(this, 'tabindex', value); }

  get slot() { return stringAttribute.get(this, 'slot'); }
  set slot(value: string) { stringAttribute.set(this, 'slot', value); }
  // </specialGetters>


  // <contentRelated>
  get innerText() {
    const text = [];
    let {[NEXT]: next, [END]: end} = this;
    while (next !== end) {
      if (next.nodeType === TEXT_NODE) {
        text.push(next.textContent.replace(/\s+/g, ' '));
      } else if(
        text.length && next[NEXT] != end &&
        // @ts-ignore - BLOCK_ELEMENTS will have the tagName property
        BLOCK_ELEMENTS.has((next as NodeWithTagName).tagName)
      ) {
        text.push('\n');
      }
      next = next[NEXT];
    }
    return text.join('');
  }

  /**
   * @returns {String}
   */
  get textContent() {
    const text = [];
    let {[NEXT]: next, [END]: end} = this;
    while (next !== end) {
      const nodeType = next.nodeType;
      if (nodeType === TEXT_NODE || nodeType === CDATA_SECTION_NODE)
        text.push(next.textContent);
      next = next[NEXT];
    }
    return text.join('');
  }

  set textContent(text: string) {
    this.replaceChildren();
    if (text != null && text !== '')
      this.appendChild(new Text(this.ownerDocument, text));
  }

  get innerHTML() {
    return getInnerHtml(this);
  }
  set innerHTML(html: string) {
    setInnerHtml(this, html);
  }

  get outerHTML() { return this.toString(); }
  set outerHTML(html: string) {
    const template = this.ownerDocument.createElement('');
    template.innerHTML = html;
    this.replaceWith(...template.childNodes);
  }
  // </contentRelated>

  // <attributes>
  get attributes() {
    const attributes = new NamedNodeMap(this);
    let next = this[NEXT];
    while (next.nodeType === ATTRIBUTE_NODE) {
      attributes.push(next);
      next = next[NEXT];
    }
    return new Proxy(attributes, attributesHandler);
  }

  focus() { 
    // @ts-ignore - Event constructor is compatible in this implementation
    this.dispatchEvent(new Event('focus')); 
  }

  getAttribute(name: string) {
    if (name === 'class')
      return this.className;
    const attribute = this.getAttributeNode(name);
    // @ts-ignore - Attribute has a value property in this implementation
    return attribute && (ignoreCase(this) ? attribute.value : escape(attribute.value));
  }

  getAttributeNode(name: string) {
    let next = this[NEXT];
    while (next.nodeType === ATTRIBUTE_NODE) {
      // @ts-ignore - Attribute has a name property in this implementation
      if ((next as AttributeWithValue).name === name)
        return next;
      next = next[NEXT];
    }
    return null;
  }

  getAttributeNames() {
    const attributes = new NodeList;
    let next = this[NEXT];
    while (next.nodeType === ATTRIBUTE_NODE) {
      // @ts-ignore - Attribute has a name property in this implementation
      attributes.push((next as AttributeWithValue).name);
      next = next[NEXT];
    }
    return attributes;
  }

  hasAttribute(name: string) { return !!this.getAttributeNode(name); }
  hasAttributes() { return this[NEXT].nodeType === ATTRIBUTE_NODE; }

  removeAttribute(name: string) {
    if (name === 'class' && this[CLASS_LIST])
        this[CLASS_LIST].clear();
    let next = this[NEXT];
    while (next.nodeType === ATTRIBUTE_NODE) {
      // @ts-ignore - Attribute has a name property in this implementation
      if ((next as AttributeWithValue).name === name) {
        removeAttribute(this, next);
        return;
      }
      next = next[NEXT];
    }
  }

  removeAttributeNode(attribute: Node) {
    let next = this[NEXT];
    while (next.nodeType === ATTRIBUTE_NODE) {
      if (next === attribute) {
        removeAttribute(this, next);
        return;
      }
      next = next[NEXT];
    }
  }

  setAttribute(name: string, value: string) {
    if (name === 'class')
      this.className = value;
    else {
      const attribute = this.getAttributeNode(name);
      if (attribute)
        // @ts-ignore - Attribute has a value property in this implementation
        (attribute as AttributeWithValue).value = value;
      else
        setAttribute(this, new Attr(this.ownerDocument, name, value));
    }
  }

  setAttributeNode(attribute: AttributeWithValue) {
    const {name} = attribute;
    const previously = this.getAttributeNode(name);
    if (previously !== attribute) {
      if (previously)
        this.removeAttributeNode(previously);
      const {ownerElement} = attribute;
      if (ownerElement)
        ownerElement.removeAttributeNode(attribute);
      setAttribute(this, attribute);
    }
    return previously;
  }

  toggleAttribute(name: string, force?: boolean) {
    if (this.hasAttribute(name)) {
      if (!force) {
        this.removeAttribute(name);
        return false;
      }
      return true;
    }
    else if (force || arguments.length === 1) {
      this.setAttribute(name, '');
      return true;
    }
    return false;
  }
  // </attributes>

  // <ShadowDOM>
  get shadowRoot() {
    if (shadowRoots.has(this)) {
      const {mode, shadowRoot} = shadowRoots.get(this);
      if (mode === 'open')
        return shadowRoot;
    }
    return null;
  }

  attachShadow(init: {mode: string}) {
    if (shadowRoots.has(this))
      throw new Error('operation not supported');
    // TODO: shadowRoot should be likely a specialized class that extends DocumentFragment
    //       but until DSD is out, I am not sure I should spend time on this.
    const shadowRoot = new ShadowRoot(this);
    shadowRoots.set(this, {
      mode: init.mode,
      shadowRoot
    });
    return shadowRoot;
  }
  // </ShadowDOM>

  // <selectors>
  matches(selectors: string) { return matches(this, selectors); }
  closest(selectors: string) {
    let parentElement = this;
    const matches = prepareMatch(parentElement, selectors);
    while (parentElement && !matches(parentElement))
      parentElement = parentElement.parentElement;
    return parentElement;
  }
  // </selectors>

  // <insertAdjacent>
  insertAdjacentElement(position: string, element: Element) {
    const {parentElement} = this;
    switch (position) {
      case 'beforebegin':
        if (parentElement) {
          parentElement.insertBefore(element, this);
          break;
        }
        return null;
      case 'afterbegin':
        this.insertBefore(element, this.firstChild);
        break;
      case 'beforeend':
        this.insertBefore(element, null);
        break;
      case 'afterend':
        if (parentElement) {
          parentElement.insertBefore(element, this.nextSibling);
          break;
        }
        return null;
    }
    return element;
  }

  insertAdjacentHTML(position: string, html: string) {
    const template = this.ownerDocument.createElement('template');
    template.innerHTML = html;
    this.insertAdjacentElement(position, template.content);
  }

  insertAdjacentText(position: string, text: string) {
    const node = this.ownerDocument.createTextNode(text);
    this.insertAdjacentElement(position, node);
  }
  // </insertAdjacent>

  cloneNode(deep = false) {
    const {ownerDocument, localName} = this;
    const addNext = (next: any) => {
      next.parentNode = parentNode;
      knownAdjacent($next, next);
      $next = next;
    };
    const clone = create(ownerDocument, this, localName);
    let parentNode = clone, $next = clone;
    let {[NEXT]: next, [END]: prev} = this;
    while (next !== prev && (deep || next.nodeType === ATTRIBUTE_NODE)) {
      switch (next.nodeType) {
        case NODE_END:
          knownAdjacent($next, parentNode[END]);
          $next = parentNode[END];
          parentNode = parentNode.parentNode;
          break;
        case ELEMENT_NODE: {
          const node = create(ownerDocument, next, next.localName);
          addNext(node);
          parentNode = node;
          break;
        }
        case ATTRIBUTE_NODE: {
          // @ts-ignore - cloneNode takes an optional deep parameter in this implementation
          const attr = next.cloneNode(deep);
          // @ts-ignore - Attribute has an ownerElement property in this implementation
          attr.ownerElement = parentNode;
          addNext(attr);
          break;
        }
        case TEXT_NODE:
        case COMMENT_NODE:
        case CDATA_SECTION_NODE:
          // @ts-ignore - cloneNode takes an optional deep parameter in this implementation
          addNext(next.cloneNode(deep));
          break;
      }
      next = next[NEXT];
    }
    knownAdjacent($next, clone[END]);
    return clone;
  }

  // <custom>
  toString() {
    const out = [];
    const {[END]: end} = this;
    let next = {[NEXT]: this};
    let isOpened = false;
    do {
      // @ts-ignore - This is accessing the [NEXT] symbol which is available in this implementation
      next = next[NEXT];
      switch (next.nodeType) {
        case ATTRIBUTE_NODE: {
          const attr = ' ' + next;
          switch (attr) {
            case ' id':
            case ' class':
            case ' style':
              break;
            default:
              out.push(attr);
          }
          break;
        }
        case NODE_END: {
          const start = next[START];
          if (isOpened) {
            if ('ownerSVGElement' in start)
              out.push(' />');
            else if (isVoid(start))
              out.push(ignoreCase(start) ? '>' : ' />');
            else
              out.push(`></${start.localName}>`);
            isOpened = false;
          }
          else
            out.push(`</${start.localName}>`);
          break;
        }
        case ELEMENT_NODE:
          if (isOpened)
            out.push('>');
          if (next.toString !== this.toString) {
            out.push(next.toString());
            next = next[END];
            isOpened = false;
          }
          else {
            // @ts-ignore - next.localName is available in this implementation
            out.push(`<${next.localName}`);
            isOpened = true;
          }
          break;
        case TEXT_NODE:
        case COMMENT_NODE:
        case CDATA_SECTION_NODE:
          out.push((isOpened ? '>' : '') + next);
          isOpened = false;
          break;
      }
    // @ts-ignore - This is comparing with the end symbol which is valid in this implementation
    } while (next !== end);
    return out.join('');
  }

  toJSON() {
    const json = [];
    elementAsJSON(this, json);
    return json;
  }
  // </custom>


  /* c8 ignore start */
  getAttributeNS(_: string, name: string) { return this.getAttribute(name); }
  getElementsByTagNameNS(_: string, name: string) { return this.getElementsByTagName(name); }
  hasAttributeNS(_: string, name: string) { return this.hasAttribute(name); }
  removeAttributeNS(_: string, name: string) { this.removeAttribute(name); }
  setAttributeNS(_: string, name: string, value: string) { this.setAttribute(name, value); }
  setAttributeNodeNS(attr: AttributeWithValue) { return this.setAttributeNode(attr); }
  /* c8 ignore stop */

  // <offset properties>
  /**
   * Returns the height of the element, including padding and border but not margins
   */
  get offsetHeight(): number {
    return 0; // Default implementation returns 0, would be overridden by renderer
  }

  /**
   * Returns the distance from the left border of the element to the left border of its offset parent
   */
  get offsetLeft(): number {
    return 0; // Default implementation returns 0, would be overridden by renderer
  }

  /**
   * Returns the nearest positioned ancestor element or null if none exists
   */
  get offsetParent(): Element | null {
    // Find the nearest positioned ancestor
    let parent = this.parentElement;
    while (parent && parent.style && 
           parent.style.position === 'static') {
      parent = parent.parentElement;
    }
    return parent;
  }

  /**
   * Returns the distance from the top border of the element to the top border of its offset parent
   */
  get offsetTop(): number {
    return 0; // Default implementation returns 0, would be overridden by renderer
  }

  /**
   * Returns the width of the element, including padding and border but not margins
   */
  get offsetWidth(): number {
    return 0; // Default implementation returns 0, would be overridden by renderer
  }
  // </offset properties>
}
