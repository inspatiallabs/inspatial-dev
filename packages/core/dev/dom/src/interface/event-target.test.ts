/**
 * EventTarget Interface Tests
 *
 * These tests verify the behavior of the EventTarget implementation
 * including event listener registration, event dispatch, and propagation.
 */

import { createDOM } from "../index.ts";
import { describe, it, expect } from "@inspatial/test";

describe("EventTarget", () => {
  // Common setup for all tests
  const getTestEnvironment = () => {
    const { Event, document, window, EventTarget } = createDOM(
      '<html><div id="container"><button id="buttonTarget" type="button">Click me!</button></div></html>'
    );
    const buttonTarget = document.getElementById("buttonTarget");
    const containerTarget = document.getElementById("container");

    // Helper for counting event handler calls
    let callCount = 0;
    const resetCallCount = () => {
      callCount = 0;
    };
    const getCallCount = () => callCount;
    const basicHandler = () => {
      callCount++;
    };

    return {
      Event,
      document,
      window,
      EventTarget,
      buttonTarget,
      containerTarget,
      basicHandler,
      resetCallCount,
      getCallCount,
    };
  };

  describe("Event Registration and Dispatch", () => {
    it("should allow registering and triggering event listeners", () => {
      // GIVEN a new EventTarget with a registered event listener
      const { Event, EventTarget, basicHandler, getCallCount } =
        getTestEnvironment();
      const eventTarget = new EventTarget();
      eventTarget.addEventListener("foo", basicHandler);

      // WHEN dispatching the event
      eventTarget.dispatchEvent(new Event("foo"));

      // THEN the handler should be called once
      expect(getCallCount()).toBe(1);
    });

    it("should register a listener only once even if added multiple times", () => {
      // GIVEN an EventTarget with the same listener registered multiple times
      const { Event, EventTarget, basicHandler, getCallCount } =
        getTestEnvironment();
      const eventTarget = new EventTarget();
      eventTarget.addEventListener("foo", basicHandler);
      eventTarget.addEventListener("foo", basicHandler);
      eventTarget.addEventListener("foo", () => {}); // Different handler

      // WHEN dispatching the event
      eventTarget.dispatchEvent(new Event("foo"));

      // THEN the handler should be called only once
      expect(getCallCount()).toBe(1);
    });

    it("should return true when dispatching an event with no listeners", () => {
      // GIVEN an EventTarget with no listeners for 'click'
      const { Event, EventTarget } = getTestEnvironment();
      const eventTarget = new EventTarget();

      // WHEN dispatching an event with no handlers
      const result = eventTarget.dispatchEvent(new Event("click"));

      // THEN it should return true
      expect(result).toBe(true);
    });

    it("should only call listeners for the specific event type dispatched", () => {
      // GIVEN an EventTarget with a listener for 'foo' but not for 'click'
      const { Event, EventTarget, basicHandler, getCallCount } =
        getTestEnvironment();
      const eventTarget = new EventTarget();
      eventTarget.addEventListener("foo", basicHandler);

      // WHEN dispatching a 'click' event
      eventTarget.dispatchEvent(new Event("click"));

      // THEN the handler should not be called
      expect(getCallCount()).toBe(0);
    });

    it("should not call listeners after they've been removed", () => {
      // GIVEN an EventTarget with a listener that is then removed
      const { Event, EventTarget, basicHandler, getCallCount } =
        getTestEnvironment();
      const eventTarget = new EventTarget();
      eventTarget.addEventListener("foo", basicHandler);
      eventTarget.dispatchEvent(new Event("foo")); // Initial call

      // WHEN removing the listener and dispatching again
      eventTarget.removeEventListener("foo", basicHandler);
      eventTarget.dispatchEvent(new Event("foo"));

      // THEN the handler should still only have been called once
      expect(getCallCount()).toBe(1);
    });
  });

  describe("Event Bubbling and Propagation", () => {
    it("should propagate events through the DOM tree when bubbling is enabled", () => {
      // GIVEN elements with click handlers at different levels of the DOM
      const {
        Event,
        buttonTarget,
        containerTarget,
        document,
        window,
        basicHandler,
        resetCallCount,
        getCallCount,
      } = getTestEnvironment();

      resetCallCount();

      // Add handlers at different levels of the DOM tree
      buttonTarget.addEventListener("click", basicHandler, { once: true });
      containerTarget.addEventListener("click", basicHandler, { once: true });
      document.addEventListener("click", basicHandler, { once: true });
      window.addEventListener("click", basicHandler, { once: true });

      // WHEN dispatching a bubbling event from the button
      buttonTarget.dispatchEvent(new Event("click", { bubbles: true }));

      // THEN all handlers in the propagation path should be called
      expect(getCallCount()).toBe(4);
    });

    it("should provide correct target information during event bubbling", () => {
      // GIVEN an event handler that inspects the event object
      const { Event, buttonTarget, containerTarget } = getTestEnvironment();

      let eventTarget = null;
      let eventCurrentTarget = null;
      let eventPhase = null;

      containerTarget.addEventListener(
        "click",
        (event: Event) => {
          eventTarget = event.target;
          eventCurrentTarget = event.currentTarget;
          eventPhase = event.eventPhase;
        },
        { once: true }
      );

      // WHEN dispatching a bubbling event from the button
      buttonTarget.dispatchEvent(new Event("click", { bubbles: true }));

      // THEN the event should have the correct properties
      expect(eventTarget).toBe(buttonTarget); // Original target
      expect(eventCurrentTarget).toBe(containerTarget); // Current target during bubbling
      expect(eventPhase).toBe(3); // BUBBLING_PHASE
    });

    it("should not bubble events when bubbling is disabled", () => {
      // GIVEN elements with click handlers at different levels of the DOM
      const {
        Event,
        buttonTarget,
        containerTarget,
        document,
        basicHandler,
        resetCallCount,
        getCallCount,
      } = getTestEnvironment();

      resetCallCount();

      buttonTarget.addEventListener("click", basicHandler, { once: true });
      containerTarget.addEventListener("click", basicHandler, { once: true });
      document.addEventListener("click", basicHandler, { once: true });

      // WHEN dispatching a non-bubbling event from the button
      buttonTarget.dispatchEvent(new Event("click", { bubbles: false }));

      // THEN only the handler on the target should be called
      expect(getCallCount()).toBe(1);
    });

    it("should respect the 'once' option for event listeners", () => {
      // GIVEN elements with event handlers set to trigger only once
      const {
        Event,
        buttonTarget,
        containerTarget,
        basicHandler,
        resetCallCount,
        getCallCount,
      } = getTestEnvironment();

      resetCallCount();

      buttonTarget.addEventListener("click", basicHandler, { once: true });
      containerTarget.addEventListener("click", basicHandler, { once: true });

      // WHEN dispatching the same event twice
      buttonTarget.dispatchEvent(new Event("click", { bubbles: true }));
      buttonTarget.dispatchEvent(new Event("click", { bubbles: true }));

      // THEN the handlers should only be called once
      expect(getCallCount()).toBe(2);
    });
  });

  describe("Event Propagation Control", () => {
    it("should stop event propagation when stopPropagation is called", () => {
      // GIVEN elements with click handlers, with one stopping propagation
      const {
        Event,
        buttonTarget,
        containerTarget,
        basicHandler,
        resetCallCount,
        getCallCount,
      } = getTestEnvironment();

      resetCallCount();

      buttonTarget.addEventListener(
        "click",
        (event: Event) => {
          event.stopPropagation();
          basicHandler();
        },
        { once: true }
      );

      containerTarget.addEventListener("click", basicHandler, { once: true });

      // WHEN dispatching a bubbling event
      buttonTarget.dispatchEvent(new Event("click", { bubbles: true }));

      // THEN only the handler that stops propagation should be called
      expect(getCallCount()).toBe(1);
    });

    it("should stop immediate propagation when stopImmediatePropagation is called", () => {
      // GIVEN multiple handlers on the same element, with one stopping immediate propagation
      const {
        Event,
        buttonTarget,
        containerTarget,
        basicHandler,
        resetCallCount,
        getCallCount,
      } = getTestEnvironment();

      resetCallCount();

      // First handler
      buttonTarget.addEventListener("click", basicHandler, { once: true });

      // Second handler stops propagation
      buttonTarget.addEventListener(
        "click",
        (event: Event) => {
          event.stopImmediatePropagation();
          basicHandler();
        },
        { once: true }
      );

      // Third handler should not run
      buttonTarget.addEventListener("click", basicHandler, { once: true });

      // Container handler should not run
      containerTarget.addEventListener("click", basicHandler, { once: true });

      // WHEN dispatching a bubbling event
      buttonTarget.dispatchEvent(new Event("click", { bubbles: true }));

      // THEN only the first two handlers should be called
      expect(getCallCount()).toBe(2);
    });
  });

  describe("Element Click Behavior", () => {
    it("should trigger click event handlers when click() method is called", () => {
      // GIVEN an element with a click handler
      const { buttonTarget, basicHandler, resetCallCount, getCallCount } =
        getTestEnvironment();

      resetCallCount();

      buttonTarget.addEventListener("click", basicHandler, { once: true });

      // WHEN calling the click() method
      buttonTarget.click();

      // THEN the handler should be called
      expect(getCallCount()).toBe(1);
    });

    it("should set default properties on synthetic click events", () => {
      // GIVEN an element with a click handler that inspects event properties
      const { buttonTarget } = getTestEnvironment();

      let eventButton = null;

      buttonTarget.addEventListener(
        "click",
        (event: MouseEvent) => {
          eventButton = event.button;
        },
        { once: true }
      );

      // WHEN calling the click() method
      buttonTarget.click();

      // THEN the event should have default properties set
      expect(eventButton).toBe(0); // Left click is the default
    });

    it("should preserve event handlers when an element is cloned", () => {
      // GIVEN a cloned element with an event handler
      const { buttonTarget, basicHandler, resetCallCount, getCallCount } =
        getTestEnvironment();

      resetCallCount();

      const cloned = buttonTarget.cloneNode(true);
      cloned.addEventListener("click", basicHandler);

      // WHEN calling the click() method on the clone
      cloned.click();

      // THEN the handler should be called
      expect(getCallCount()).toBe(1);
    });
  });
});
