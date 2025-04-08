// https://dom.spec.whatwg.org/#interface-eventtarget

// Define standard event listener interfaces
export interface EventListener {
  (evt: Event): void;
}

export interface EventListenerObject {
  handleEvent(evt: Event): void;
}

export type EventListenerOrEventListenerObject = EventListener | EventListenerObject;

export interface AddEventListenerOptions extends EventListenerOptions {
  once?: boolean;
  passive?: boolean;
  signal?: AbortSignal;
}

export interface EventListenerOptions {
  capture?: boolean;
}

export interface AbortSignal {
  readonly aborted: boolean;
  addEventListener(type: string, listener: EventListener | EventListenerObject): void;
  removeEventListener(type: string, listener: EventListener | EventListenerObject): void;
}

/**
 * Extended Event interface with additional properties used in this implementation
 */
interface CustomEvent extends Event {
  _stopImmediatePropagationFlag: boolean;
  _path: Array<{currentTarget: DOMEventTarget, target: EventTarget}>;
  cancelBubble: boolean;
  // Allow writing to read-only properties in our implementation
  eventPhase: number;
  currentTarget: EventTarget | null;
  target: EventTarget | null;
  // Constants for event phases
  readonly AT_TARGET: 2;
  readonly BUBBLING_PHASE: 3;
  readonly CAPTURING_PHASE: 1;
  readonly NONE: 0;
}

// Use our internal type for the event target
type DOMEventTarget = EventTarget;

const wm = new WeakMap<DOMEventTarget, Map<string, Map<EventListenerOrEventListenerObject, AddEventListenerOptions | boolean | undefined>>>();

/**
 * Internal function to dispatch an event to a listener
 * @param event - The event being dispatched
 * @param listener - The event listener function or object
 * @returns Whether immediate propagation should stop
 */
function dispatch(event: CustomEvent, listener: EventListenerOrEventListenerObject): boolean {
  if (typeof listener === 'function')
    listener.call(event.target, event);
  else
    listener.handleEvent(event);
  return event._stopImmediatePropagationFlag;
}

/**
 * Internal function to invoke all listeners for an event
 * @param this - The event being processed
 * @param param0 - Object containing currentTarget and target
 * @returns Whether event bubbling should be canceled
 */
function invokeListeners(this: CustomEvent, {currentTarget, target}: {currentTarget: DOMEventTarget, target: EventTarget}): boolean {
  const map = wm.get(currentTarget);
  if (map && map.has(this.type)) {
    const listeners = map.get(this.type)!;
    if (currentTarget === target) {
      this.eventPhase = this.AT_TARGET;
    } else {
      this.eventPhase = this.BUBBLING_PHASE;
    }

    this.currentTarget = currentTarget;
    this.target = target;
    for (const [listener, options] of Array.from(listeners.entries())) {
      // Check if the listener should be called based on capture phase
      const capture = typeof options === 'boolean' ? options : (options as AddEventListenerOptions)?.capture;
      const once = typeof options === 'boolean' ? false : (options as AddEventListenerOptions)?.once;
      // Skip listeners meant for capturing phase when we're in bubbling phase
      // or listeners meant for bubbling phase when we're in capturing phase
      if (this.eventPhase === this.CAPTURING_PHASE && !capture) continue;
      if (this.eventPhase === this.BUBBLING_PHASE && capture) continue;

      // Dispatch the event to the listener
      if (dispatch(this, listener) || this.cancelBubble) {
        return true;
      }
      
      // If this was a once listener, remove it
      if (once && listeners.has(listener)) {
        listeners.delete(listener);
      }
    }
  }
  
  return false;
}

/**
 * @implements globalThis.EventTarget
 */
export class EventTarget {
  /**
   * Add an event listener for a specific event type
   * @param type - The type of event to listen for
   * @param callback - The event handler function
   * @param options - Options for the event listener
   */
  addEventListener(type: string, callback: EventListenerOrEventListenerObject | null, options?: AddEventListenerOptions | boolean): void {
    if (!callback) return;
    
    // Get or create event type map for this target
    let map = wm.get(this);
    if (!map) wm.set(this, map = new Map());
    
    // Get or create listeners map for this event type
    let listeners = map.get(type);
    if (!listeners) map.set(type, listeners = new Map());
    
    // Add the listener if it doesn't already exist
    if (!listeners.has(callback)) {
      listeners.set(callback, options);
    }
  }

  /**
   * Remove an event listener for a specific event type
   * @param type - The type of event to stop listening for
   * @param callback - The event handler function to remove
   * @param options - Options for the event listener
   */
  removeEventListener(type: string, callback: EventListenerOrEventListenerObject | null, options?: AddEventListenerOptions | boolean): void {
    if (!callback) return;
    
    const map = wm.get(this);
    if (!map) return;
    
    const listeners = map.get(type);
    if (!listeners) return;
    
    // Check if the capture phase matches
    const capture = typeof options === 'boolean' ? options : !!(options as AddEventListenerOptions)?.capture;
    const listenerOptions = listeners.get(callback);
    const listenerCapture = typeof listenerOptions === 'boolean' ? 
      listenerOptions : 
      !!(listenerOptions as AddEventListenerOptions)?.capture;
    
    // Only remove if capture phase matches
    if (capture === listenerCapture) {
      listeners.delete(callback);
    }
    
    // Clean up empty maps
    if (listeners.size === 0) map.delete(type);
    if (map.size === 0) wm.delete(this);
  }

  /**
   * Dispatch an event to this target
   * @param event - The event to dispatch
   * @returns Whether the default action was prevented
   */
  dispatchEvent(event: Event): boolean {
    // Check if event is an instance of Event by checking its properties rather than instanceof
    if (!event || typeof event !== 'object' || typeof event.type !== 'string') {
      throw new Error('Invalid event');
    }
    
    // Set up the event
    const customEvent = event as unknown as CustomEvent;
    if (!customEvent.target) {
      customEvent.target = this;
    }
    
    // Reset event state for new dispatch
    customEvent._stopImmediatePropagationFlag = false;
    customEvent.cancelBubble = false;
    
    // Build the event path for propagation
    // Start with this node as the target
    const path = [];
    
    // If this element has a parentNode, add to path for bubbling phase (bottom-up)
    if ('parentNode' in this && (this as any).parentNode) {
      // Add current target
      path.push({currentTarget: this as EventTarget, target: customEvent.target || this});
      
      // Add parent nodes
      let parent = (this as any).parentNode as EventTarget;
      while (parent) {
        path.push({currentTarget: parent as EventTarget, target: customEvent.target || this});
        // Check if parent has a parentNode property and it's not null before assigning
        const nextParent = 'parentNode' in parent ? (parent as any).parentNode : null;
        if (!nextParent) break;
        parent = nextParent as EventTarget;
      }
    } else {
      // For non-DOM EventTargets, just handle on the target itself
      path.push({currentTarget: this as EventTarget, target: customEvent.target || this});
    }
    
    // Store the path for composedPath() calls
    customEvent._path = path;
    
    let stopped = false;
    let defaultPrevented = false;
    
    // At target phase - always happens first
    const firstNode = path[0];
    customEvent.eventPhase = customEvent.AT_TARGET;
    customEvent.currentTarget = firstNode.currentTarget;
    
    // Dispatch to target
    try {
      const listeners = this._getListeners(customEvent.type);
      if (listeners) {
        for (const [listener, options] of Array.from(listeners.entries())) {
          if (customEvent._stopImmediatePropagationFlag) break;
          
          try {
            // Call the listener
            if (typeof listener === 'function') {
              listener.call(customEvent.target as EventTarget, customEvent);
            } else {
              listener.handleEvent(customEvent);
            }
          } catch (error) {
            console.error('Error in event listener:', error);
          }
          
          // Handle once option
          const once = typeof options === 'boolean' ? false : !!(options as AddEventListenerOptions)?.once;
          if (once && listeners.has(listener)) {
            listeners.delete(listener);
          }
          
          // Check if default was prevented
          if (customEvent.defaultPrevented) {
            defaultPrevented = true;
          }
        }
      }
    } catch (error) {
      console.error('Error dispatching event at target:', error);
    }
    
    // Stop if propagation was explicitly stopped
    if (customEvent.cancelBubble) {
      stopped = true;
    }
    
    // Bubbling phase (go through parent chain) if the event bubbles and wasn't stopped
    if (!stopped && customEvent.bubbles && path.length > 1) {
      // Only go through parents (skip the target)
      const bubblePath = path.slice(1);
      
      for (const node of bubblePath) {
        if (stopped) break;
        
        customEvent.eventPhase = customEvent.BUBBLING_PHASE;
        customEvent.currentTarget = node.currentTarget;
        
        try {
          // Get listeners for this node
          const parentTarget = node.currentTarget as EventTarget;
          const map = wm.get(parentTarget);
          
          if (map && map.has(customEvent.type)) {
            const listeners = map.get(customEvent.type)!;
            
            for (const [listener, options] of Array.from(listeners.entries())) {
              if (customEvent.cancelBubble || customEvent._stopImmediatePropagationFlag) {
                stopped = true;
                break;
              }
              
              // Skip capturing listeners during bubble phase
              const capture = typeof options === 'boolean' ? options : !!(options as AddEventListenerOptions)?.capture;
              if (capture) continue;
              
              try {
                // Call the listener
                if (typeof listener === 'function') {
                  listener.call(parentTarget as EventTarget, customEvent);
                } else {
                  listener.handleEvent(customEvent);
                }
              } catch (error) {
                console.error('Error in event listener during bubble:', error);
              }
              
              // Handle once option
              const once = typeof options === 'boolean' ? false : !!(options as AddEventListenerOptions)?.once;
              if (once && listeners.has(listener)) {
                listeners.delete(listener);
              }
              
              // Check if propagation was stopped
              if (customEvent.cancelBubble) {
                stopped = true;
                break;
              }
              
              // Check if default was prevented
              if (customEvent.defaultPrevented) {
                defaultPrevented = true;
              }
            }
          }
        } catch (error) {
          console.error('Error dispatching event during bubble:', error);
        }
      }
    }
    
    // Reset event properties
    customEvent.currentTarget = null;
    customEvent.eventPhase = customEvent.NONE || 0;
    
    // For non-cancelable events, always return true regardless of defaultPrevented
    if (!customEvent.cancelable) {
      return true;
    }
    
    // For cancelable events, return false if defaultPrevented
    return !defaultPrevented;
  }
  
  /**
   * Helper method to get listeners for a specific event type
   * @private
   */
  private _getListeners(type: string): Map<EventListenerOrEventListenerObject, AddEventListenerOptions | boolean | undefined> | undefined {
    const map = wm.get(this);
    if (!map) return undefined;
    return map.get(type);
  }
}
