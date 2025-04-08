// @ts-ignore - Ignoring TS extension import error
import {Element} from '../interface/element.ts';
// @ts-ignore - Ignoring TS extension import error
import {String} from '../shared/util/utils.ts';

const classNames = new WeakMap;

const handler = {
  get(target: any, name: string): any {
    return target[name];
  },
  set(target: any, name: string, value: any): boolean {
    target[name] = value;
    return true;
  }
};

/**
 * @implements globalThis.SVGElement
 */
export class SVGElement extends Element {
  ownerSVGElement: SVGElement | null;

  constructor(ownerDocument: any, localName: string, ownerSVGElement: SVGElement | null = null) {
    super(ownerDocument, localName);
    this.ownerSVGElement = ownerSVGElement;
  }

  // @ts-ignore - SVG DOM spec requires className to be an object with baseVal/animVal
  override get className(): { baseVal: string, animVal: string } {
    if (!classNames.has(this))
      classNames.set(this, new Proxy({baseVal: '', animVal: ''}, handler));
    return classNames.get(this);
  }

  /* c8 ignore start */
  // @ts-ignore - Allowing setting className with a string while returning as object
  override set className(value: string) {
    const {classList} = this;
    classList.clear();
    classList.add(...(String(value).split(/\s+/)));
  }
  /* c8 ignore stop */

  override get namespaceURI(): string {
    return 'http://www.w3.org/2000/svg';
  }

  override getAttribute(name: string): string | null {
    return name === 'class' ?
      [...this.classList].join(' ') :
      super.getAttribute(name);
  }

  override setAttribute(name: string, value: string): void {
    if (name === 'class')
      this.className = value;
    else if (name === 'style') {
      const {className} = this;
      className.baseVal = className.animVal = value;
    }
    super.setAttribute(name, value);
  }
}
