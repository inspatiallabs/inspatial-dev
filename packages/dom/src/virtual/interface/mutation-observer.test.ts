/**
 * MutationObserver Tests
 *
 * These tests verify the implementation of the MutationObserver API for
 * monitoring changes to the DOM tree including attributes, child nodes,
 * and character data.
 */

import { createVirtualDOM } from "../index.ts";
import { describe, it, expect } from "@inspatial/test";

describe("MutationObserver", () => {
  // Helper function to wait for asynchronous mutations to be processed
  const waitForMutations = (ms = 10) =>
    new Promise((resolve) => setTimeout(resolve, ms));

  // Helper function to compare mutation records
  const recordsMatch = (actual: any, expected: any) => {
    if (!actual || !expected) return false;

    return (
      actual.type === expected.type &&
      actual.target === expected.target &&
      arraysEqual(actual.addedNodes || [], expected.addedNodes || []) &&
      arraysEqual(actual.removedNodes || [], expected.removedNodes || []) &&
      (actual.attributeName || null) === (expected.attributeName || null) &&
      actual.oldValue === expected.oldValue
    );
  };

  // Helper to compare arrays
  const arraysEqual = (a: any[], b: any[]) => {
    if (a.length !== b.length) return false;
    return a.every((node: any, i: number) => node === b[i]);
  };

  // Common test setup
  const setupTest = () => {
    const { document, MutationObserver } = createVirtualDOM("<html />");

    // Add null check for documentElement
    if (!document.documentElement) {
      throw new Error("documentElement is null");
    }

    const observed = document.documentElement.appendChild(
      document.createElement("observed")
    );
    const notObserved = document.documentElement.appendChild(
      document.createElement("not-observed")
    );

    let mutationRecords: any = null;
    const observer = new MutationObserver((records: MutationRecord[]) => {
      mutationRecords = records;
    });

    return {
      document,
      MutationObserver,
      observer,
      observed,
      notObserved,
      getMutationRecords: () => mutationRecords,
      resetMutationRecords: () => {
        mutationRecords = null;
      },
    };
  };

  describe("Attribute Observation", () => {
    it("should observe attribute changes when configured", async () => {
      // GIVEN a MutationObserver watching for attribute changes
      const { observer, observed, getMutationRecords, resetMutationRecords } =
        setupTest();

      // WHEN observing specific attributes
      observer.observe(observed, {
        attributes: true,
        attributeFilter: ["first"],
      });

      // AND modifying the observed attribute
      observed.setAttribute("first", "123");

      // THEN the observer shouldn't fire synchronously
      expect(getMutationRecords()).toBeNull();

      // BUT after a short wait, we should have the mutation
      await waitForMutations();
      const records = observer.takeRecords();

      // THEN we should have a record of the attribute change
      expect(records.length).toBe(1);
      expect(records[0].type).toBe("attributes");
      expect(records[0].target).toBe(observed);
      expect(records[0].attributeName).toBe("first");

      // Clean up
      observer.disconnect();
    });

    it("should not observe attribute changes for attributes not in filter", async () => {
      // GIVEN a MutationObserver watching for specific attribute changes
      const { observer, observed, getMutationRecords } = setupTest();

      // WHEN observing only the 'first' attribute
      observer.observe(observed, {
        attributes: true,
        attributeFilter: ["first"],
      });

      // AND modifying a different attribute
      observed.setAttribute("second", "456");

      // THEN after waiting, no mutations should be recorded
      await waitForMutations();
      const records = observer.takeRecords();

      // No records should be present for unobserved attributes
      expect(records.length).toBe(0);

      // Clean up
      observer.disconnect();
    });

    it("should include oldValue when attributeOldValue is true", async () => {
      // GIVEN a MutationObserver watching for attribute changes with old values
      const { observer, observed, getMutationRecords } = setupTest();

      // WHEN setting an initial attribute value
      observed.setAttribute("first", "456");

      // AND THEN observing with attributeOldValue
      observer.observe(observed, {
        attributes: true,
        attributeOldValue: true,
      });

      // AND modifying the attribute
      observed.setAttribute("first", "789");

      // THEN after waiting, we should have the mutation with oldValue
      await waitForMutations();
      const records = observer.takeRecords();

      // Record should include the old value
      expect(records.length).toBe(1);
      expect(records[0].oldValue).toBe("456");

      // Clean up
      observer.disconnect();
    });

    it("should not trigger for non-observed elements", async () => {
      // GIVEN a MutationObserver watching a specific element
      const { observer, observed, notObserved, getMutationRecords } =
        setupTest();

      // WHEN observing only the 'observed' element
      observer.observe(observed, {
        attributes: true,
      });

      // AND modifying a different element
      notObserved.setAttribute("first", "nope");

      // THEN after waiting, no mutations should be recorded
      await waitForMutations();
      const records = observer.takeRecords();

      // No records should be present for unobserved elements
      expect(records.length).toBe(0);

      // Clean up
      observer.disconnect();
    });
  });

  describe("Child List Observation", () => {
    it("should observe child nodes being added", async () => {
      // GIVEN a MutationObserver watching for childList changes
      const { observer, observed, notObserved, document, getMutationRecords } =
        setupTest();

      // WHEN observing childList
      observer.observe(observed, {
        childList: true,
      });

      // AND adding a child node
      const addedNode = document.createTextNode("!");
      observed.appendChild(addedNode);

      // THEN after waiting, we should have the mutation
      await waitForMutations();
      const records = observer.takeRecords();

      // Records should show the node being added
      expect(records.length).toBe(1);
      expect(records[0].type).toBe("childList");
      expect(records[0].addedNodes[0]).toBe(addedNode);

      // Clean up
      observer.disconnect();
    });

    it("should observe child nodes being removed", async () => {
      // GIVEN a MutationObserver watching for childList changes
      const { observer, observed, notObserved, getMutationRecords } =
        setupTest();

      // AND a child already added
      observed.appendChild(notObserved);

      // WHEN observing childList
      observer.observe(observed, {
        childList: true,
      });

      // AND removing a child node
      observed.removeChild(notObserved);

      // THEN after waiting, we should have the mutation
      await waitForMutations();
      const records = observer.takeRecords();

      // Records should show the node being removed
      expect(records.length).toBe(1);
      expect(records[0].type).toBe("childList");
      expect(records[0].removedNodes[0]).toBe(notObserved);

      // Clean up
      observer.disconnect();
    });
  });

  describe("Subtree Observation", () => {
    it("should observe changes in child elements when subtree is true", async () => {
      // GIVEN a MutationObserver watching a subtree
      const { observer, observed, notObserved, getMutationRecords } =
        setupTest();

      // AND a child already added
      observed.appendChild(notObserved);

      // WHEN observing with subtree option
      observer.observe(observed, {
        attributes: true,
        subtree: true,
        attributeFilter: ["first"],
      });

      // AND modifying an attribute on a child node
      notObserved.setAttribute("first", "subtree-test");

      // THEN after waiting, we should have the mutation
      await waitForMutations();
      const records = observer.takeRecords();

      // Records should show the attribute change on the child
      expect(records.length).toBe(1);
      expect(records[0].type).toBe("attributes");
      expect(records[0].target).toBe(notObserved);
      expect(records[0].attributeName).toBe("first");

      // Clean up
      observer.disconnect();
    });
  });

  describe("Observer Methods", () => {
    it("should stop observing after disconnect() is called", async () => {
      // GIVEN a MutationObserver that's disconnected after setup
      const { observer, observed, getMutationRecords } = setupTest();

      // WHEN observing and then disconnecting
      observer.observe(observed, {
        attributes: true,
      });
      observer.disconnect();

      // AND modifying an attribute
      observed.setAttribute("first", "after-disconnect");

      // THEN after waiting, no mutations should be recorded
      await waitForMutations();
      const records = observer.takeRecords();

      // No records should be present after disconnect
      expect(records.length).toBe(0);
    });

    it("should return pending records with takeRecords()", async () => {
      // GIVEN a MutationObserver watching for attribute changes
      const { observer, observed } = setupTest();

      // WHEN observing attributes
      observer.observe(observed, {
        attributes: true,
      });

      // AND modifying an attribute multiple times
      observed.setAttribute("first", "1");
      observed.setAttribute("first", "2");
      observed.setAttribute("first", "3");

      // THEN takeRecords should return pending records
      const records = observer.takeRecords();

      // Records should be returned and cleared
      expect(records.length).toBeGreaterThan(0);
      expect(observer.takeRecords().length).toBe(0);

      // Clean up
      observer.disconnect();
    });
  });

  describe("Document-level Observation", () => {
    it("should observe changes to the document when it's the target", async () => {
      // GIVEN a MutationObserver watching the document
      const { observer, document, notObserved, getMutationRecords } =
        setupTest();

      // WHEN observing the document with subtree
      observer.observe(document, {
        childList: true,
        subtree: true,
      });

      // AND adding a node to the document
      document.appendChild(notObserved);

      // THEN after waiting, we should have the mutation
      await waitForMutations();
      const records = observer.takeRecords();

      // Records should show the node being added to the document
      expect(records.length).toBe(1);
      expect(records[0].type).toBe("childList");
      expect(records[0].target).toBe(document);
      expect(records[0].addedNodes[0]).toBe(notObserved);

      // Clean up
      observer.disconnect();
      notObserved.remove();
    });
  });
});
