// https://dom.spec.whatwg.org/#interface-customevent

// @ts-ignore - Ignoring TS extension import error
import {Event} from './event.ts';

/**
 * Interface for CustomEvent initialization dictionary
 */
interface CustomEventInit extends EventInit {
  /** Any data that will be accessible through the CustomEvent.detail property */
  detail?: any;
}

/**
 * @implements globalThis.CustomEvent
 */
export class CustomEvent<T = any> extends Event {
  /** Any data passed when initializing the event */
  readonly detail: T;
  
  // Event properties that need to be recognized by TypeScript
  declare type: string;
  declare bubbles: boolean;
  declare cancelable: boolean;

  /**
   * Creates a new CustomEvent
   * @param type - The name of the event
   * @param eventInitDict - Event options including any custom data
   */
  constructor(type: string, eventInitDict: CustomEventInit = {}) {
    super(type, eventInitDict);
    this.detail = eventInitDict.detail as T;
  }

  /**
   * Initialize the event with the given parameters
   * @param type - The event type
   * @param bubbles - Whether the event bubbles
   * @param cancelable - Whether the event is cancelable
   */
  override initEvent(type: string, bubbles: boolean, cancelable: boolean): void {
    this.type = type;
    this.bubbles = bubbles;
    this.cancelable = cancelable;
  }

  /**
   * Creates a new CustomEvent with the same properties as this one
   * @param type - Optional new event type
   * @param bubbles - Whether the event should bubble
   * @param cancelable - Whether the event should be cancelable
   * @param detail - The custom data for the event
   */
  initCustomEvent(type?: string, bubbles?: boolean, cancelable?: boolean, detail?: T): void {
    this.initEvent(type || this.type, bubbles ?? this.bubbles, cancelable ?? this.cancelable);
    // @ts-ignore - Property assignment after initialization
    this.detail = detail;
  }
}

