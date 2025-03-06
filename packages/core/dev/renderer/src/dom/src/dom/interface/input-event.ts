// https://dom.spec.whatwg.org/#interface-customevent

// @ts-ignore - Ignoring TS extension import error
import {Event} from './event.ts';

/**
 * Simplified Range interface for use in InputEvent
 * Using any type for containers since Node is not directly available
 */
interface Range {
  startContainer: any;
  endContainer: any;
  startOffset: number;
  endOffset: number;
  collapsed: boolean;
}

/**
 * Interface for InputEvent initialization options
 */
export interface InputEventInit extends EventInit {
  /** The type of input operation that occurred */
  inputType?: string;
  /** The inserted data */
  data?: string | null;
  /** The data transfer (for drag and drop or cut/paste) */
  dataTransfer?: any;
  /** Whether the event occurred during IME composition */
  isComposing?: boolean;
  /** Text ranges affected by this input event */
  ranges?: Range[];
}

/**
 * @implements globalThis.InputEvent
 */
export class InputEvent extends Event {
  /** The type of input operation that occurred (e.g., 'insertText', 'deleteContentBackward') */
  readonly inputType: string;
  /** The inserted text if any */
  readonly data: string | null;
  /** The data transfer for clipboard operations */
  readonly dataTransfer: any;
  /** Whether the event occurred during IME composition */
  readonly isComposing: boolean;
  /** Text ranges affected by this input event */
  readonly ranges?: Range[];

  /**
   * Creates a new InputEvent
   * @param type - The type of event (e.g., 'input', 'beforeinput')
   * @param inputEventInit - Options for the event
   */
  constructor(type: string, inputEventInit: InputEventInit = {}) {
    super(type, inputEventInit);
    this.inputType = inputEventInit.inputType || '';
    this.data = inputEventInit.data || null;
    this.dataTransfer = inputEventInit.dataTransfer || null;
    this.isComposing = inputEventInit.isComposing || false;
    this.ranges = inputEventInit.ranges;
  }
}
