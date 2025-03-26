// @ts-ignore - Ignoring TS extension import error
import {registerHTMLClass} from '../shared/register-html-class.ts';
// @ts-ignore - Ignoring TS extension import error
import {booleanAttribute} from '../shared/attributes.ts';

// @ts-ignore - Ignoring TS extension import error
import {HTMLElement} from './element.ts';
// @ts-ignore - Ignoring TS extension import error
import {NodeList} from '../interface/node-list.ts';

const tagName = 'select';

// Interface for option elements
interface HTMLOptionElement extends HTMLElement {
  value: string;
}

/**
 * @implements globalThis.HTMLSelectElement
 */
export class HTMLSelectElement extends HTMLElement {
  constructor(ownerDocument: any, localName: string = tagName) {
    super(ownerDocument, localName);
  }

  get options(): NodeList {
    let children = new NodeList();
    let {firstElementChild} = this;
    while (firstElementChild) {
      if ((firstElementChild as HTMLElement).tagName === 'OPTGROUP') {
        children.push(...(firstElementChild as HTMLElement).children);
      } else {
        children.push(firstElementChild);
      }
      firstElementChild = firstElementChild.nextElementSibling;
    }
    return children;
  }

  /* c8 ignore start */
  get disabled(): boolean { return booleanAttribute.get(this, 'disabled'); }
  set disabled(value: boolean) { booleanAttribute.set(this, 'disabled', value); }

  get name(): string | null { return this.getAttribute('name'); }
  set name(value: string) { this.setAttribute('name', value); }
  /* c8 ignore stop */

  get value(): string | undefined { 
    const selected = this.querySelector('option[selected]');
    return selected ? (selected as HTMLOptionElement).value : undefined; 
  }
}

registerHTMLClass(tagName, HTMLSelectElement);

