// @ts-ignore - Ignoring JS extension import error
import { HTMLElement } from "./element.ts";

const { toString } = HTMLElement.prototype;

export class TextElement extends HTMLElement {
  override get innerHTML(): string {
    return this.textContent ?? "";
  }
  override set innerHTML(html: string) {
    this.textContent = html;
  }

  override get innerText(): string {
    return this.textContent ?? "";
  }
  override set innerText(text: string) {
    this.textContent = text;
  }

  override toString(): string {
    const outerHTML = toString.call(this.cloneNode());
    return outerHTML.replace("><", () => `>${this.textContent ?? ""}<`);
  }
}
