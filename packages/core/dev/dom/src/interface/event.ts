// https://dom.spec.whatwg.org/#interface-event

// Node 15 has Event but 14 and 12 don't
const BUBBLING_PHASE = 3;
const AT_TARGET = 2;
const CAPTURING_PHASE = 1;
const NONE = 0;

/**
 * Get the current target of an event
 * @param ev - The event to get the current target from
 * @returns The current target of the event
 */
function getCurrentTarget(ev: any): any {
  return ev.currentTarget;
}

/**
 * Interface for Event initialization dictionary
 */
export interface EventInit {
  /** Whether the event bubbles up through the DOM */
  bubbles?: boolean;
  /** Whether the event is cancelable */
  cancelable?: boolean;
  /** Whether the event will trigger listeners outside a shadow root */
  composed?: boolean;
}

/**
 * @implements globalThis.Event
 */
class GlobalEvent {
  static get BUBBLING_PHASE(): number {
    return BUBBLING_PHASE;
  }
  static get AT_TARGET(): number {
    return AT_TARGET;
  }
  static get CAPTURING_PHASE(): number {
    return CAPTURING_PHASE;
  }
  static get NONE(): number {
    return NONE;
  }

  type: string;
  bubbles: boolean;
  cancelable: boolean;
  cancelBubble: boolean;
  defaultPrevented: boolean;
  eventPhase: number;
  timeStamp: number;
  originalTarget: any;
  returnValue: any;
  srcElement: any;
  target: any;
  /** @internal */
  _stopImmediatePropagationFlag: boolean;
  /** @internal */
  _path: any[];

  /**
   * Create a new event
   * @param type - The type of the event
   * @param eventInitDict - Options for the event
   */
  constructor(type: string, eventInitDict: EventInit = {}) {
    this.type = type;
    this.bubbles = !!eventInitDict.bubbles;
    this.cancelBubble = false;
    this._stopImmediatePropagationFlag = false;
    this.cancelable = !!eventInitDict.cancelable;
    this.eventPhase = this.NONE;
    this.timeStamp = Date.now();
    this.defaultPrevented = false;
    this.originalTarget = null;
    this.returnValue = null;
    this.srcElement = null;
    this.target = null;
    this._path = [];
  }

  get BUBBLING_PHASE(): number {
    return BUBBLING_PHASE;
  }
  get AT_TARGET(): number {
    return AT_TARGET;
  }
  get CAPTURING_PHASE(): number {
    return CAPTURING_PHASE;
  }
  get NONE(): number {
    return NONE;
  }

  /**
   * Prevent the event's default action
   */
  preventDefault(): void {
    this.defaultPrevented = true;
  }

  /**
   * Get the path through which the event bubbles
   * @returns Array of event targets
   */
  // simplified implementation, should be https://dom.spec.whatwg.org/#dom-event-composedpath
  composedPath(): any[] {
    return this._path.map(getCurrentTarget);
  }

  /**
   * Stop propagation of the event
   */
  stopPropagation(): void {
    this.cancelBubble = true;
  }

  /**
   * Stop immediate propagation of the event
   */
  stopImmediatePropagation(): void {
    this.stopPropagation();
    this._stopImmediatePropagationFlag = true;
  }

  /**
   * Initialize the event with the given parameters
   * @param type - The event type
   * @param bubbles - Whether the event bubbles
   * @param cancelable - Whether the event is cancelable
   */
  initEvent(type: string, bubbles: boolean, cancelable: boolean): void {
    this.type = type;
    this.bubbles = bubbles;
    this.cancelable = cancelable;
  }
}

export { GlobalEvent as Event };
