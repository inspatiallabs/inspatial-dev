/*##################################(TYPES)###########################*/

/**
 * Represents a DOM attribute with optional namespace
 */
export interface Attribute {
  /**
   * Namespace URI for the attribute (null for standard attributes)
   */
  ns: string | null;

  /**
   * Name of the attribute
   */
  name: string;

  /**
   * Value of the attribute
   */
  value: string;
}

export interface EventDescriptor {
  target: EventTarget;
  type: string;
  handler: (event: Event) => void;
  capture?: boolean;
  once?: boolean;
  passive?: boolean;
  signal?: AbortSignal;
  removed?: boolean;
  abortHandler?: () => void;
}

export interface EventOptions {
  bubbles?: boolean;
  captures?: boolean;
  cancelable?: boolean;
}

export interface EventHandlers {
  /**
   * Event handlers registered for the capture phase, grouped by event type.
   *
   * The key is the event type (e.g., "click"), and the value is a Map where:
   * - the key is the original listener callback supplied to `addEventListener`
   * - the value is an {@link EventDescriptor} describing listener options
   */
  capturePhase: Record<string, Map<(event: unknown) => void, EventDescriptor>>;

  /**
   * Event handlers registered for the bubble phase.
   *
   * The structure mirrors {@link EventHandlers.capturePhase}.
   */
  bubblePhase: Record<string, Map<(event: unknown) => void, EventDescriptor>>;
}

export interface EnvironmentOptions {
  silent?: boolean;
  commonAncestors?: Record<string, any>;
  initDocument?: (document: Document) => void;
  preserveClassNameOnRegister?: boolean;
  onGetData?: (this: Node, callback: (data: any) => void) => void;
  onSetData?: (this: Node, data: any) => void;
  onCreateNode?: (this: Node, nodeType: number, localName?: string) => void;
  onInsertBefore?: (this: ParentNode, child: Node, ref?: Node) => void;
  onRemoveChild?: (this: ParentNode, child: Node) => void;
  onSetInnerHTML?: (this: Element, html: string) => void;
  onSetOuterHTML?: (this: Element, html: string) => void;
  onSetTextContent?: (this: ParentNode, text: string) => boolean | void;
  onGetTextContent?: (this: ParentNode) => string | void;
  onSetAttributeNS?: (
    this: Element,
    ns: string | null,
    name: string,
    value: string
  ) => void;
  onGetAttributeNS?: (
    this: Element,
    ns: string | null,
    name: string,
    callback: (value: string) => void
  ) => void;
  onRemoveAttributeNS?: (
    this: Element,
    ns: string | null,
    name: string
  ) => void;
  onChangeOwnerDocument?: (
    this: Node,
    newOwnerDocument: Document | null,
    previousOwnerDocument: Document | null
  ) => void;
  onAddEventListener?: (
    this: EventTarget,
    type: string,
    handler: (event: Event) => void,
    options?: boolean | AddEventListenerOptions
  ) => boolean | void;
  onAddedEventListener?: (
    this: EventTarget,
    type: string,
    handler: (event: Event) => void,
    options?: boolean | AddEventListenerOptions
  ) => void;
  onRemoveEventListener?: (
    this: EventTarget,
    type: string,
    handler: (event: Event) => void,
    options?: boolean | EventListenerOptions
  ) => boolean | void;
  onRemovedEventListener?: (
    this: EventTarget,
    type: string,
    handler: (event: Event) => void,
    options?: boolean | EventListenerOptions
  ) => void;
}

export interface Environment {
  scope: Record<string, any>;
  createEvent: (eventName: string, options?: EventOptions) => Event;
  createDocument: (
    namespaceURI: string | null,
    qualifiedNameStr: string,
    ...args: any[]
  ) => Document;
  makeEventTarget: any;
  makeNode: any;
  makeParentNode: any;
  makeText: any;
  makeComment: any;
  makeDocumentFragment: any;
  makeElement: any;
  makeHTMLElement: any;
  makeSVGElement: any;
  makeDocument: any;
  registerElement: (
    name: string,
    value: any,
    isSVG?: boolean,
    isHTML?: boolean
  ) => any;
  DOMImplementation: typeof DOMImplementation;
}

export interface AddEventListenerOptions extends EventListenerOptions {
  once?: boolean;
  passive?: boolean;
  signal?: AbortSignal;
}

export interface EventListenerOptions {
  capture?: boolean;
}
