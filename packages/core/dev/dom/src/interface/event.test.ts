/**
 * Event Interface Tests
 *
 * These tests verify the behavior of the Event implementation including
 * event creation, dispatching, bubbling, and the composedPath functionality.
 */

import { parseHTML } from "../index.ts";
import { describe, it, expect } from "@inspatial/test";

describe("Event", () => {
  // Common test environment setup
  const setupTestEnvironment = () => {
    const { Event, document } = parseHTML("<html><div /></html>");
    const node = document.getElementsByTagName("div")[0];

    // Create various event types for testing
    const standardEvent = document.createEvent("Event") as Event;
    standardEvent.initEvent("test-event", false, false);

    const bubblingEvent = document.createEvent("HTMLEvents") as Event;
    bubblingEvent.initEvent("click", true, false); // bubbles = true

    const customEvent = document.createEvent("CustomEvent") as CustomEvent;
    (customEvent as any).initCustomEvent("click", false, false, 123); // with detail data

    return {
      Event,
      document,
      node,
      standardEvent,
      bubblingEvent,
      customEvent,
    };
  };

  describe("Event Creation", () => {
    it("should create standard events with correct properties", () => {
      // GIVEN a test environment with events
      const { standardEvent } = setupTestEnvironment();

      // THEN the event should have the correct type
      expect(standardEvent.type).toBe("test-event");
      expect(standardEvent.bubbles).toBe(false);
      expect(standardEvent.cancelable).toBe(false);
    });

    it("should create bubbling events with correct properties", () => {
      // GIVEN a test environment with events
      const { bubblingEvent } = setupTestEnvironment();

      // THEN the bubbling event should have the correct properties
      expect(bubblingEvent.type).toBe("click");
      expect(bubblingEvent.bubbles).toBe(true);
    });

    it("should create custom events with detail data", () => {
      // GIVEN a test environment with events
      const { customEvent } = setupTestEnvironment();

      // THEN the custom event should have the correct detail value
      expect(customEvent.type).toBe("click");
      expect((customEvent as any).detail).toBe(123);
    });
  });

  describe("Event Handling", () => {
    it("should call event handlers with event listener objects", () => {
      // GIVEN a test environment with a node
      const { node, Event } = setupTestEnvironment();

      // AND an event listener object
      let capturedEvent: Event | null = null;
      const listener = {
        handleEvent(event: Event) {
          capturedEvent = event;
        },
      };

      // WHEN registering the listener and dispatching an event
      node.addEventListener("click", listener);
      node.dispatchEvent(new Event("click"));

      // THEN the handler should be called with the event
      expect(capturedEvent).not.toBeNull();
      expect(capturedEvent?.type).toBe("click");
    });

    it("should provide event.target as the dispatching element", () => {
      // GIVEN a test environment with a node
      const { node, Event } = setupTestEnvironment();

      // AND an event handler that captures the event
      let capturedTarget: EventTarget | null = null;
      node.addEventListener("click", (event: Event) => {
        capturedTarget = event.target;
      });

      // WHEN dispatching an event
      node.dispatchEvent(new Event("click"));

      // THEN event.target should be the node
      expect(capturedTarget).toBe(node);
    });

    it("should pass custom event detail to handlers", () => {
      // GIVEN a test environment with a node and custom event
      const { node, customEvent } = setupTestEnvironment();

      // AND an event handler that captures the detail
      let capturedDetail: any = null;
      node.addEventListener("click", (event: Event) => {
        capturedDetail = (event as any).detail;
      });

      // WHEN dispatching the custom event
      node.dispatchEvent(customEvent);

      // THEN the handler should receive the custom detail
      expect(capturedDetail).toBe(123);
    });
  });

  describe("Event Bubbling", () => {
    it("should not bubble events when bubbling is disabled", () => {
      // GIVEN a test environment
      const { node, document, customEvent } = setupTestEnvironment();

      // AND document has an event listener
      let documentEventFired = false;
      document.addEventListener("click", () => {
        documentEventFired = true;
      });

      // WHEN dispatching a non-bubbling event on the node
      node.dispatchEvent(customEvent); // customEvent has bubbles=false

      // THEN the document listener should not be called
      expect(documentEventFired).toBe(false);
    });

    it("should bubble events to parent elements when bubbling is enabled", () => {
      // GIVEN a test environment
      const { node, document, bubblingEvent } = setupTestEnvironment();

      // AND document has an event listener
      let documentEventTarget: EventTarget | null = null;
      let documentEventCurrentTarget: EventTarget | null = null;

      document.addEventListener("click", (event: Event) => {
        documentEventTarget = event.target;
        documentEventCurrentTarget = event.currentTarget;
      });

      // WHEN dispatching a bubbling event on the node
      node.dispatchEvent(bubblingEvent);

      // THEN the document listener should be called with the correct properties
      expect(documentEventTarget).toBe(node); // Original target remains the node
      expect(documentEventCurrentTarget).toBe(document); // Current target is document
    });
  });

  describe("Event ComposedPath", () => {
    it("should return the correct path of elements an event will pass through", () => {
      // GIVEN a test environment
      const { node, document, bubblingEvent } = setupTestEnvironment();

      // AND a handler that captures the composed path
      let capturedPath: EventTarget[] = [];
      document.addEventListener("click", (event: Event) => {
        capturedPath = event.composedPath();
      });

      // WHEN dispatching a bubbling event
      node.dispatchEvent(bubblingEvent);

      // THEN the composedPath should contain the correct elements in order
      expect(capturedPath.length).toBe(3);
      expect(capturedPath[0]).toBe(node); // Event starts at the node
      expect(capturedPath[1]).toBe(document.firstChild); // Then goes to html
      expect(capturedPath[2]).toBe(document); // Then to document
    });
  });
});
