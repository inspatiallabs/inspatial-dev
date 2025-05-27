/**
 * Unit tests for the EventTarget class
 *
 * These tests verify that the EventTarget class correctly implements
 * DOM's EventTarget interface, focusing on event handling.
 */

// Import from test package
import { test, expect, assertEquals } from "@inspatial/test";
// Import DOM classes
import { Event, Element, Document } from "../cached.ts";
import { EventTarget } from "../interface/event-target.ts";
// @ts-ignore - Ignoring TS extension import error
import { MIME } from "../shared/symbols.ts";

// Test document to use for creating elements
const createTestDocument = () => {
  const doc = new Document("");
  // Initialize MIME object with default HTML settings
  doc[MIME] = {
    ignoreCase: true,
    docType: "<!DOCTYPE html>",
    voidElements:
      /^(?:area|base|br|col|embed|hr|img|input|keygen|link|menuitem|meta|param|source|track|wbr)$/i,
    textOnlyElements: /^(?:plaintext|script|style|textarea|title|xmp)$/i,
  };
  return doc;
};

// Create a test event
const createEvent = (type = "click", options = {}) => {
  return new Event(type, options);
};

/**
 * Test suite for basic event handling
 */
test({
  name: "EventTarget.addEventListener registers event listeners",
  fn: () => {
    const target = new EventTarget();
    let callCount = 0;

    // Create a simple event handler
    const handler = () => {
      callCount++;
    };

    // Add the event listener
    target.addEventListener("test", handler);

    // Dispatch an event
    const event = createEvent("test");
    target.dispatchEvent(event);

    // Event handler should have been called once
    expect(callCount).toBe(1);

    // Dispatch again
    target.dispatchEvent(event);
    expect(callCount).toBe(2);
  },
});

test({
  name: "EventTarget.removeEventListener removes event listeners",
  fn: () => {
    const target = new EventTarget();
    let callCount = 0;

    // Create a simple event handler
    const handler = () => {
      callCount++;
    };

    // Add the event listener
    target.addEventListener("test", handler);

    // Dispatch an event to verify it works
    const event = createEvent("test");
    target.dispatchEvent(event);
    expect(callCount).toBe(1);

    // Remove the event listener
    target.removeEventListener("test", handler);

    // Dispatch again - should not increment count
    target.dispatchEvent(event);
    expect(callCount).toBe(1);
  },
});

test({
  name: "EventTarget handles multiple event listeners for the same event",
  fn: () => {
    const target = new EventTarget();
    let count1 = 0;
    let count2 = 0;

    // Create two different handlers
    const handler1 = () => {
      count1++;
    };
    const handler2 = () => {
      count2++;
    };

    // Add both event listeners
    target.addEventListener("test", handler1);
    target.addEventListener("test", handler2);

    // Dispatch an event
    const event = createEvent("test");
    target.dispatchEvent(event);

    // Both handlers should have been called
    expect(count1).toBe(1);
    expect(count2).toBe(1);

    // Remove one handler
    target.removeEventListener("test", handler1);

    // Dispatch again
    target.dispatchEvent(event);

    // Only handler2 should have been called again
    expect(count1).toBe(1);
    expect(count2).toBe(2);
  },
});

test({
  name: "EventTarget.addEventListener with 'once' option only fires once",
  fn: () => {
    const target = new EventTarget();
    let callCount = 0;

    // Create a simple event handler
    const handler = () => {
      callCount++;
    };

    // Add the event listener with once option
    target.addEventListener("test", handler, { once: true });

    // Dispatch an event
    const event = createEvent("test");
    target.dispatchEvent(event);

    // Event handler should have been called once
    expect(callCount).toBe(1);

    // Dispatch again - should not call handler again
    target.dispatchEvent(event);
    expect(callCount).toBe(1);
  },
});

test({
  name: "EventTarget.dispatchEvent returns false when preventDefault is called",
  fn: () => {
    const target = new EventTarget();

    // Add an event listener that calls preventDefault
    target.addEventListener("test", (event: Event) => {
      event.preventDefault();
    });

    // Dispatch an event
    const event = createEvent("test", { cancelable: true });
    const result = target.dispatchEvent(event);

    // dispatchEvent should return false when preventDefault was called
    expect(result).toBe(false);
  },
});

test({
  name: "EventTarget.dispatchEvent returns true for non-cancelable events",
  fn: () => {
    const target = new EventTarget();

    // Add an event listener that calls preventDefault
    target.addEventListener("test", (event: Event) => {
      event.preventDefault();
    });

    // Dispatch a non-cancelable event
    const event = createEvent("test", { cancelable: false });
    const result = target.dispatchEvent(event);

    // dispatchEvent should return true for non-cancelable events
    expect(result).toBe(true);
  },
});

test({
  name: "EventTarget.dispatchEvent sets correct target and currentTarget",
  fn: () => {
    const parent = new EventTarget();
    const child = new EventTarget();

    let eventTarget = null;
    let eventCurrentTarget = null;

    // Add event listener to parent
    parent.addEventListener("test", (event: Event) => {
      eventTarget = event.target;
      eventCurrentTarget = event.currentTarget;
    });

    // Dispatch from child to parent
    const event = createEvent("test");
    event.target = child; // Manually set for this test
    parent.dispatchEvent(event);

    // Target should be child, currentTarget should be parent
    expect(eventTarget).toBe(child);
    expect(eventCurrentTarget).toBe(parent);
  },
});

/**
 * Test suite for event propagation
 */
test({
  name: "Events properly propagate through the DOM tree",
  fn: () => {
    const doc = createTestDocument();

    // Create a simple DOM tree
    const parent = doc.createElement("div");
    const child = doc.createElement("div");
    parent.appendChild(child);

    // Track event propagation
    const propagationPath: unknown = [];

    // Add listeners to both elements
    parent.addEventListener("test", () => {
      (propagationPath as string[]).push("parent");
    });

    child.addEventListener("test", () => {
      (propagationPath as string[]).push("child");
    });

    // Dispatch an event on the child
    const event = createEvent("test", { bubbles: true });
    child.dispatchEvent(event);

    // Event should have bubbled up to parent
    expect(propagationPath).toEqual(["child", "parent"]);
  },
});

test({
  name: "Event.stopPropagation prevents further propagation",
  fn: () => {
    const doc = createTestDocument();

    // Create a simple DOM tree
    const parent = doc.createElement("div");
    const child = doc.createElement("div");
    parent.appendChild(child);

    // Track if parent received event
    let parentReceived = false;

    // Add listeners to both elements
    parent.addEventListener("test", () => {
      parentReceived = true;
    });

    child.addEventListener("test", (event: Event) => {
      event.stopPropagation();
    });

    // Dispatch an event on the child
    const event = createEvent("test", { bubbles: true });
    child.dispatchEvent(event);

    // Event should not have reached parent
    expect(parentReceived).toBe(false);
  },
});

test({
  name: "Event listeners receive the Event object as parameter",
  fn: () => {
    const target = new EventTarget();
    let receivedEvent: any = null;

    // Create a handler that captures the event
    const handler = (event: any) => {
      receivedEvent = event;
    };

    // Add the event listener
    target.addEventListener("test", handler);

    // Dispatch an event with custom properties
    const event = createEvent("test", { bubbles: true, cancelable: true });
    target.dispatchEvent(event);

    // Handler should have received the event
    expect(receivedEvent).not.toBe(null);
    expect(receivedEvent.type).toBe("test");
    expect(receivedEvent.bubbles).toBe(true);
    expect(receivedEvent.cancelable).toBe(true);
  },
});
