/**
 * # HTML Classes Testing
 * @summary Tests for HTML element class implementations
 *
 * These tests verify that all HTML element classes correctly render
 * their tags and handle their specific behaviors.
 */
import { parseHTML } from "../index.ts";
import {
  DOMBodyElement,
  DOMHtmlElement,
  DOMScriptElement,
  DOMIFrameElement,
  DOMObjectElement,
  DOMElement,
  DOMStyleElement,
  DOMTimeElement,
  DOMEmbedElement,
  DOMFieldSetElement,
  DOMHeadElement,
  DOMHRElement,
  DOMParagraphElement,
  DOMProgressElement,
  DOMTemplateElement,
  DOMInputElement,
  DOMDataListElement,
  DOMBaseElement,
  DOMLIElement,
  DOMTableElement,
  DOMMediaElement,
  DOMLegendElement,
  DOMCanvasElement,
  DOMQuoteElement,
  DOMHeadingElement,
  DOMAudioElement,
  DOMOptionElement,
  DOMSpanElement,
  DOMMeterElement,
  DOMVideoElement,
  DOMTableCellElement,
  DOMOutputElement,
  DOMTitleElement,
  DOMSelectElement,
  DOMBRElement,
  DOMButtonElement,
  DOMOptGroupElement,
  DOMMapElement,
  DOMLinkElement,
  DOMDivElement,
  DOMTextAreaElement,
  DOMDListElement,
  DOMSlotElement,
  DOMFormElement,
  DOMDataElement,
  DOMTableRowElement,
  DOMMenuElement,
  DOMPreElement,
  DOMUListElement,
  DOMImageElement,
  DOMPictureElement,
  DOMTrackElement,
  DOMTableCaptionElement,
  DOMAnchorElement,
  DOMDetailsElement,
  DOMUnknownElement,
  DOMLabelElement,
  DOMSourceElement,
  DOMOListElement,
  DOMAreaElement,
  DOMMetaElement,
} from "./html-classes.ts";
import { MIME } from "./symbols.ts";
import { describe, it, assert } from "@inspatial/test";

describe("HTMLElementClasses", () => {
  // Initialize document and get element constructors
  const { document } = parseHTML("");
  const { voidElements } = document[MIME];

  const {
    HTMLElement,
    HTMLTemplateElement,
    HTMLHtmlElement,
    HTMLScriptElement,
    HTMLIFrameElement,
    HTMLObjectElement,
    HTMLHeadElement,
    HTMLBodyElement,
    HTMLStyleElement,
    HTMLTimeElement,
    HTMLFieldSetElement,
    HTMLEmbedElement,
    HTMLHRElement,
    HTMLProgressElement,
    HTMLParagraphElement,
    HTMLTableElement,
    HTMLLIElement,
    HTMLBaseElement,
    HTMLDataListElement,
    HTMLInputElement,
    HTMLMediaElement,
    HTMLAudioElement,
    HTMLHeadingElement,
    HTMLQuoteElement,
    HTMLCanvasElement,
    HTMLLegendElement,
    HTMLOptionElement,
    HTMLSpanElement,
    HTMLMeterElement,
    HTMLVideoElement,
    HTMLTableCellElement,
    HTMLTitleElement,
    HTMLOutputElement,
    HTMLTableRowElement,
    HTMLDataElement,
    HTMLMenuElement,
    HTMLSelectElement,
    HTMLBRElement,
    HTMLButtonElement,
    HTMLMapElement,
    HTMLOptGroupElement,
    HTMLDListElement,
    HTMLTextAreaElement,
    HTMLDivElement,
    HTMLLinkElement,
    HTMLSlotElement,
    HTMLFormElement,
    HTMLImageElement,
    HTMLPreElement,
    HTMLUListElement,
    HTMLMetaElement,
    HTMLPictureElement,
    HTMLAreaElement,
    HTMLOListElement,
    HTMLTableCaptionElement,
    HTMLAnchorElement,
    HTMLLabelElement,
    HTMLUnknownElement,
    HTMLDetailsElement,
    HTMLSourceElement,
    HTMLTrackElement,
  } = document.defaultView;

  // Map classes to their DOM exports for testing
  const elementClassMappings = [
    { impl: HTMLElement, dom: DOMElement, name: "HTMLElement" },
    {
      impl: HTMLTemplateElement,
      dom: DOMTemplateElement,
      name: "HTMLTemplateElement",
    },
    { impl: HTMLHtmlElement, dom: DOMHtmlElement, name: "HTMLHtmlElement" },
    {
      impl: HTMLScriptElement,
      dom: DOMScriptElement,
      name: "HTMLScriptElement",
    },
    {
      impl: HTMLIFrameElement,
      dom: DOMIFrameElement,
      name: "HTMLIFrameElement",
    },
    {
      impl: HTMLObjectElement,
      dom: DOMObjectElement,
      name: "HTMLObjectElement",
    },
    { impl: HTMLHeadElement, dom: DOMHeadElement, name: "HTMLHeadElement" },
    { impl: HTMLBodyElement, dom: DOMBodyElement, name: "HTMLBodyElement" },
    { impl: HTMLStyleElement, dom: DOMStyleElement, name: "HTMLStyleElement" },
    { impl: HTMLTimeElement, dom: DOMTimeElement, name: "HTMLTimeElement" },
    {
      impl: HTMLFieldSetElement,
      dom: DOMFieldSetElement,
      name: "HTMLFieldSetElement",
    },
    { impl: HTMLEmbedElement, dom: DOMEmbedElement, name: "HTMLEmbedElement" },
    { impl: HTMLHRElement, dom: DOMHRElement, name: "HTMLHRElement" },
    {
      impl: HTMLProgressElement,
      dom: DOMProgressElement,
      name: "HTMLProgressElement",
    },
    {
      impl: HTMLParagraphElement,
      dom: DOMParagraphElement,
      name: "HTMLParagraphElement",
    },
    { impl: HTMLTableElement, dom: DOMTableElement, name: "HTMLTableElement" },
    { impl: HTMLLIElement, dom: DOMLIElement, name: "HTMLLIElement" },
    { impl: HTMLBaseElement, dom: DOMBaseElement, name: "HTMLBaseElement" },
    {
      impl: HTMLDataListElement,
      dom: DOMDataListElement,
      name: "HTMLDataListElement",
    },
    { impl: HTMLInputElement, dom: DOMInputElement, name: "HTMLInputElement" },
    { impl: HTMLMediaElement, dom: DOMMediaElement, name: "HTMLMediaElement" },
    { impl: HTMLAudioElement, dom: DOMAudioElement, name: "HTMLAudioElement" },
    {
      impl: HTMLHeadingElement,
      dom: DOMHeadingElement,
      name: "HTMLHeadingElement",
    },
    { impl: HTMLQuoteElement, dom: DOMQuoteElement, name: "HTMLQuoteElement" },
    {
      impl: HTMLCanvasElement,
      dom: DOMCanvasElement,
      name: "HTMLCanvasElement",
    },
    {
      impl: HTMLLegendElement,
      dom: DOMLegendElement,
      name: "HTMLLegendElement",
    },
    {
      impl: HTMLOptionElement,
      dom: DOMOptionElement,
      name: "HTMLOptionElement",
    },
    { impl: HTMLSpanElement, dom: DOMSpanElement, name: "HTMLSpanElement" },
    { impl: HTMLMeterElement, dom: DOMMeterElement, name: "HTMLMeterElement" },
    { impl: HTMLVideoElement, dom: DOMVideoElement, name: "HTMLVideoElement" },
    {
      impl: HTMLTableCellElement,
      dom: DOMTableCellElement,
      name: "HTMLTableCellElement",
    },
    { impl: HTMLTitleElement, dom: DOMTitleElement, name: "HTMLTitleElement" },
    {
      impl: HTMLOutputElement,
      dom: DOMOutputElement,
      name: "HTMLOutputElement",
    },
    {
      impl: HTMLTableRowElement,
      dom: DOMTableRowElement,
      name: "HTMLTableRowElement",
    },
    { impl: HTMLDataElement, dom: DOMDataElement, name: "HTMLDataElement" },
    { impl: HTMLMenuElement, dom: DOMMenuElement, name: "HTMLMenuElement" },
    {
      impl: HTMLSelectElement,
      dom: DOMSelectElement,
      name: "HTMLSelectElement",
    },
    { impl: HTMLBRElement, dom: DOMBRElement, name: "HTMLBRElement" },
    {
      impl: HTMLButtonElement,
      dom: DOMButtonElement,
      name: "HTMLButtonElement",
    },
    { impl: HTMLMapElement, dom: DOMMapElement, name: "HTMLMapElement" },
    {
      impl: HTMLOptGroupElement,
      dom: DOMOptGroupElement,
      name: "HTMLOptGroupElement",
    },
    { impl: HTMLDListElement, dom: DOMDListElement, name: "HTMLDListElement" },
    {
      impl: HTMLTextAreaElement,
      dom: DOMTextAreaElement,
      name: "HTMLTextAreaElement",
    },
    { impl: HTMLDivElement, dom: DOMDivElement, name: "HTMLDivElement" },
    { impl: HTMLLinkElement, dom: DOMLinkElement, name: "HTMLLinkElement" },
    { impl: HTMLSlotElement, dom: DOMSlotElement, name: "HTMLSlotElement" },
    { impl: HTMLFormElement, dom: DOMFormElement, name: "HTMLFormElement" },
    { impl: HTMLImageElement, dom: DOMImageElement, name: "HTMLImageElement" },
    { impl: HTMLPreElement, dom: DOMPreElement, name: "HTMLPreElement" },
    { impl: HTMLUListElement, dom: DOMUListElement, name: "HTMLUListElement" },
    { impl: HTMLMetaElement, dom: DOMMetaElement, name: "HTMLMetaElement" },
    {
      impl: HTMLPictureElement,
      dom: DOMPictureElement,
      name: "HTMLPictureElement",
    },
    { impl: HTMLAreaElement, dom: DOMAreaElement, name: "HTMLAreaElement" },
    { impl: HTMLOListElement, dom: DOMOListElement, name: "HTMLOListElement" },
    {
      impl: HTMLTableCaptionElement,
      dom: DOMTableCaptionElement,
      name: "HTMLTableCaptionElement",
    },
    {
      impl: HTMLAnchorElement,
      dom: DOMAnchorElement,
      name: "HTMLAnchorElement",
    },
    { impl: HTMLLabelElement, dom: DOMLabelElement, name: "HTMLLabelElement" },
    {
      impl: HTMLUnknownElement,
      dom: DOMUnknownElement,
      name: "HTMLUnknownElement",
    },
    {
      impl: HTMLDetailsElement,
      dom: DOMDetailsElement,
      name: "HTMLDetailsElement",
    },
    {
      impl: HTMLSourceElement,
      dom: DOMSourceElement,
      name: "HTMLSourceElement",
    },
    { impl: HTMLTrackElement, dom: DOMTrackElement, name: "HTMLTrackElement" },
  ];

  it("should have matching implementation classes and DOM exports", () => {
    // GIVEN all the element class mappings

    // THEN each implementation class should match its DOM export
    elementClassMappings.forEach(({ impl, dom, name }) => {
      assert(
        impl === dom,
        `${name} implementation class should match its DOM export`
      );
    });
  });

  it("should render void elements with self-closing tags", () => {
    // GIVEN the list of void elements
    const voidElementClasses = elementClassMappings.filter(({ impl }) => {
      const element = new impl(document);
      return voidElements.test(element.localName);
    });

    // WHEN rendering each void element

    // THEN each void element should be rendered with a self-closing tag
    voidElementClasses.forEach(({ impl, name }) => {
      const element = new impl(document);
      const { localName } = element;
      const renderedString = element.toString();

      assert(
        renderedString === `<${localName}>`,
        `${name} should render as <${localName}> (void element)`
      );
    });
  });

  it("should render non-void elements with opening and closing tags", () => {
    // GIVEN the list of non-void elements
    const nonVoidElementClasses = elementClassMappings.filter(({ impl }) => {
      const element = new impl(document);
      return !voidElements.test(element.localName);
    });

    // WHEN rendering each non-void element

    // THEN each non-void element should be rendered with opening and closing tags
    nonVoidElementClasses.forEach(({ impl, name }) => {
      const element = new impl(document);
      const { localName } = element;
      const renderedString = element.toString();

      assert(
        renderedString === `<${localName}></${localName}>`,
        `${name} should render as <${localName}></${localName}> (non-void element)`
      );
    });
  });

  it("should create elements with the correct node name", () => {
    // WHEN creating instances of each element class

    // THEN each element should have the correct node name
    elementClassMappings.forEach(({ impl, name }) => {
      const element = new impl(document);
      const expectedNodeName = element.localName.toUpperCase();

      assert(
        element.nodeName === expectedNodeName,
        `${name} should have nodeName "${expectedNodeName}"`
      );
    });
  });
});
