import { HTMLElement } from "../html/element.ts";
import { HTMLTemplateElement } from "../html/template-element.ts";
import { HTMLHtmlElement } from "../html/html-element.ts";
import { HTMLScriptElement } from "../html/script-element.ts";
import { HTMLFencedFrameElement } from "../html/fenced-frame-element.ts";
import { HTMLIFrameElement } from "../html/i-frame-element.ts";
import { HTMLObjectElement } from "../html/object-element.ts";
import { HTMLHeadElement } from "../html/head-element.ts";
import { HTMLBodyElement } from "../html/body-element.ts";
import { HTMLStyleElement } from "../html/style-element.ts";
import { HTMLTimeElement } from "../html/time-element.ts";
import { HTMLFieldSetElement } from "../html/field-set-element.ts";
import { HTMLEmbedElement } from "../html/embed-element.ts";
import { HTMLHRElement } from "../html/hr-element.ts";
import { HTMLProgressElement } from "../html/progress-element.ts";
import { HTMLParagraphElement } from "../html/paragraph-element.ts";
import { HTMLTableElement } from "../html/table-element.ts";
import { HTMLLIElement } from "../html/li-element.ts";
import { HTMLBaseElement } from "../html/base-element.ts";
import { HTMLDataListElement } from "../html/data-list-element.ts";
import { HTMLInputElement } from "../html/input-element.ts";
import { HTMLMediaElement } from "../html/media-element.ts";
import { HTMLAudioElement } from "../html/audio-element.ts";
import { HTMLHeadingElement } from "../html/heading-element.ts";
import { HTMLQuoteElement } from "../html/quote-element.ts";
import { HTMLCanvasElement } from "../html/canvas-element.ts";
import { HTMLLegendElement } from "../html/legend-element.ts";
import { HTMLOptionElement } from "../html/option-element.ts";
import { HTMLSpanElement } from "../html/span-element.ts";
import { HTMLMeterElement } from "../html/meter-element.ts";
import { HTMLVideoElement } from "../html/video-element.ts";
import { HTMLTableCellElement } from "../html/table-cell-element.ts";
import { HTMLTitleElement } from "../html/title-element.ts";
import { HTMLOutputElement } from "../html/output-element.ts";
import { HTMLTableRowElement } from "../html/table-row-element.ts";
import { HTMLDataElement } from "../html/data-element.ts";
import { HTMLMenuElement } from "../html/menu-element.ts";
import { HTMLSelectElement } from "../html/select-element.ts";
import { HTMLBRElement } from "../html/br-element.ts";
import { HTMLButtonElement } from "../html/button-element.ts";
import { HTMLMapElement } from "../html/map-element.ts";
import { HTMLOptGroupElement } from "../html/opt-group-element.ts";
import { HTMLDListElement } from "../html/d-list-element.ts";
import { HTMLTextAreaElement } from "../html/text-area-element.ts";
import { HTMLDivElement } from "../html/div-element.ts";
import { HTMLLinkElement } from "../html/link-element.ts";
import { HTMLSlotElement } from "../html/slot-element.ts";
import { HTMLFormElement } from "../html/form-element.ts";
import { HTMLImageElement } from "../html/image-element.ts";
import { HTMLPreElement } from "../html/pre-element.ts";
import { HTMLUListElement } from "../html/u-list-element.ts";
import { HTMLMetaElement } from "../html/meta-element.ts";
import { HTMLPictureElement } from "../html/picture-element.ts";
import { HTMLAreaElement } from "../html/area-element.ts";
import { HTMLOListElement } from "../html/ol-element.ts";
import { HTMLTableCaptionElement } from "../html/table-caption-element.ts";
import { HTMLAnchorElement } from "../html/anchor-element.ts";
import { HTMLLabelElement } from "../html/label-element.ts";
import { HTMLUnknownElement } from "../html/unknown-element.ts";
import { HTMLMainElement } from "../html/main-element.ts";
import { HTMLDetailsElement } from "../html/details-element.ts";
import { HTMLSourceElement } from "../html/source-element.ts";
import { HTMLTrackElement } from "../html/track-element.ts";
import { HTMLSectionElement } from "../html/section-element.ts";

export {
  HTMLElement as DOMElement,
  HTMLTemplateElement as DOMTemplateElement,
  HTMLHtmlElement as DOMHtmlElement,
  HTMLScriptElement as DOMScriptElement,
  HTMLFencedFrameElement as DOMFencedFrameElement,
  HTMLIFrameElement as DOMIFrameElement,
  HTMLObjectElement as DOMObjectElement,
  HTMLHeadElement as DOMHeadElement,
  HTMLBodyElement as DOMBodyElement,
  HTMLStyleElement as DOMStyleElement,
  HTMLTimeElement as DOMTimeElement,
  HTMLFieldSetElement as DOMFieldSetElement,
  HTMLEmbedElement as DOMEmbedElement,
  HTMLHRElement as DOMHRElement,
  HTMLProgressElement as DOMProgressElement,
  HTMLParagraphElement as DOMParagraphElement,
  HTMLTableElement as DOMTableElement,
  HTMLLIElement as DOMLIElement,
  HTMLBaseElement as DOMBaseElement,
  HTMLDataListElement as DOMDataListElement,
  HTMLInputElement as DOMInputElement,
  HTMLMediaElement as DOMMediaElement,
  HTMLAudioElement as DOMAudioElement,
  HTMLHeadingElement as DOMHeadingElement,
  HTMLQuoteElement as DOMQuoteElement,
  HTMLCanvasElement as DOMCanvasElement,
  HTMLLegendElement as DOMLegendElement,
  HTMLOptionElement as DOMOptionElement,
  HTMLSpanElement as DOMSpanElement,
  HTMLMeterElement as DOMMeterElement,
  HTMLVideoElement as DOMVideoElement,
  HTMLTableCellElement as DOMTableCellElement,
  HTMLTitleElement as DOMTitleElement,
  HTMLOutputElement as DOMOutputElement,
  HTMLTableRowElement as DOMTableRowElement,
  HTMLDataElement as DOMDataElement,
  HTMLMenuElement as DOMMenuElement,
  HTMLSelectElement as DOMSelectElement,
  HTMLBRElement as DOMBRElement,
  HTMLButtonElement as DOMButtonElement,
  HTMLMapElement as DOMMapElement,
  HTMLOptGroupElement as DOMOptGroupElement,
  HTMLDListElement as DOMDListElement,
  HTMLTextAreaElement as DOMTextAreaElement,
  HTMLDivElement as DOMDivElement,
  HTMLLinkElement as DOMLinkElement,
  HTMLSlotElement as DOMSlotElement,
  HTMLFormElement as DOMFormElement,
  HTMLImageElement as DOMImageElement,
  HTMLPreElement as DOMPreElement,
  HTMLUListElement as DOMUListElement,
  HTMLMetaElement as DOMMetaElement,
  HTMLPictureElement as DOMPictureElement,
  HTMLAreaElement as DOMAreaElement,
  HTMLOListElement as DOMOListElement,
  HTMLTableCaptionElement as DOMTableCaptionElement,
  HTMLAnchorElement as DOMAnchorElement,
  HTMLLabelElement as DOMLabelElement,
  HTMLUnknownElement as DOMUnknownElement,
  HTMLMainElement as DOMMainElement,
  HTMLDetailsElement as DOMDetailsElement,
  HTMLSourceElement as DOMSourceElement,
  HTMLTrackElement as DOMTrackElement,
  HTMLSectionElement as DOMSectionElement,
};

const HTMLClasses = {
  HTMLElement,
  HTMLTemplateElement,
  HTMLHtmlElement,
  HTMLScriptElement,
  HTMLFencedFrameElement,
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
  HTMLMainElement,
  HTMLDetailsElement,
  HTMLSourceElement,
  HTMLTrackElement,
  HTMLSectionElement,
};

export { HTMLClasses as DOMClasses };
