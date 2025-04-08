/** @module InSpatialDOM
 * Provides functionality for efficiently diffing and updating DOM nodes based on HTML streams.
 * This module is crucial for InSpatial DOM implementation and streaming updates.
 */

import { parseHTML } from "./index.ts";

/** Interface for the DOM tree walker used in streaming updates */
interface InWalkerType {
  root: Node | null;
  [FIRST_CHILD]: (node: Node) => Promise<Node | null>;
  [NEXT_SIBLING]: (node: Node) => Promise<Node | null>;
  [APPLY_TRANSITION]: (v: () => void) => void;
}

/** Type definition for node traversal callback */
type NextNodeCallbackType = (node: Node) => void;

/** Interface for configuration options in the diffing process */
interface InOptionsType {
  onNextNode?: NextNodeCallbackType;
  transition?: boolean;
  shouldIgnoreNode?: (node: Node | null) => boolean;
}

/** DOM node type constants */
const ELEMENT_TYPE = 1;
const DOCUMENT_TYPE = 9;
const DOCUMENT_FRAGMENT_TYPE = 11;

/** Walker operation constants */
const APPLY_TRANSITION = 0;
const FIRST_CHILD = 1;
const NEXT_SIBLING = 2;

/** Special HTML tags that require specific handling */
const SPECIAL_TAGS = new Set(["HTML", "HEAD", "BODY"]);

/** Utility function to wait for the next animation frame */
const wait = () => new Promise((resolve) => requestAnimationFrame(resolve));

/**
 * Main function to diff and update DOM nodes based on an HTML stream
 * @param oldNode - The existing DOM node to update
 * @param stream - ReadableStream containing the new HTML content
 * @param options - Configuration options for the diffing process
 */
export async function diffStream(
  oldNode: Node,
  stream: ReadableStream,
  options?: InOptionsType
) {
  const walker = await htmlStreamWalker(stream, options);
  const newNode = walker.root!;

  if (oldNode.nodeType === DOCUMENT_TYPE) {
    oldNode = (oldNode as Document).documentElement;
  }

  if (newNode.nodeType === DOCUMENT_FRAGMENT_TYPE) {
    await setChildNodes(oldNode, newNode, walker);
  } else {
    await updateNode(oldNode, newNode, walker);
  }
}

/**
 * Updates a single node by comparing and applying changes from the new node
 * @param oldNode - The existing DOM node to update
 * @param newNode - The new node to diff against
 * @param walker - Walker instance for traversing the DOM tree
 */
async function updateNode(oldNode: Node, newNode: Node, walker: InWalkerType) {
  if (oldNode.nodeType !== newNode.nodeType) {
    return walker[APPLY_TRANSITION](() =>
      oldNode.parentNode!.replaceChild(newNode.cloneNode(true), oldNode)
    );
  }

  if (oldNode.nodeType === ELEMENT_TYPE) {
    await setChildNodes(oldNode, newNode, walker);

    walker[APPLY_TRANSITION](() => {
      if (oldNode.nodeName === newNode.nodeName) {
        if (newNode.nodeName !== "BODY") {
          setAttributes(
            (oldNode as Element).attributes,
            (newNode as Element).attributes
          );
        }
      } else {
        const hasDocumentFragmentInside = newNode.nodeName === "TEMPLATE";
        const clonedNewNode = newNode.cloneNode(hasDocumentFragmentInside);
        while (oldNode.firstChild)
          clonedNewNode.appendChild(oldNode.firstChild);
        oldNode.parentNode!.replaceChild(clonedNewNode, oldNode);
      }
    });
  } else if (oldNode.nodeValue !== newNode.nodeValue) {
    walker[APPLY_TRANSITION](() => (oldNode.nodeValue = newNode.nodeValue));
  }
}

/**
 * Updates attributes of an element by comparing old and new attribute sets
 * @param oldAttributes - Current attributes of the element
 * @param newAttributes - New attributes to apply
 */
function setAttributes(
  oldAttributes: NamedNodeMap,
  newAttributes: NamedNodeMap
) {
  let i, oldAttribute, newAttribute, namespace, name;

  // Remove old attributes.
  for (i = oldAttributes.length; i--; ) {
    oldAttribute = oldAttributes[i];
    namespace = oldAttribute.namespaceURI;
    name = oldAttribute.localName;
    newAttribute = newAttributes.getNamedItemNS(namespace, name);

    if (!newAttribute) oldAttributes.removeNamedItemNS(namespace, name);
  }

  // Set new attributes.
  for (i = newAttributes.length; i--; ) {
    oldAttribute = newAttributes[i];
    namespace = oldAttribute.namespaceURI;
    name = oldAttribute.localName;
    newAttribute = oldAttributes.getNamedItemNS(namespace, name);

    if (oldAttribute.name === "data-action") continue;

    if (!newAttribute) {
      // Add a new attribute.
      newAttributes.removeNamedItemNS(namespace, name);
      oldAttributes.setNamedItemNS(oldAttribute);
    } else if (newAttribute.value !== oldAttribute.value) {
      // Update existing attribute.
      newAttribute.value = oldAttribute.value;
    }
  }
}

/**
 * Recursively updates child nodes of a parent element
 * @param oldParent - The existing parent node
 * @param newParent - The new parent node to diff against
 * @param walker - Walker instance for traversing the DOM tree
 */
async function setChildNodes(
  oldParent: Node,
  newParent: Node,
  walker: InWalkerType
) {
  let checkOld;
  let oldKey;
  let newKey;
  let foundNode;
  let keyedNodes: Record<string, Node> | null = null;
  let oldNode = oldParent.firstChild;
  let newNode = await walker[FIRST_CHILD](newParent);
  let extra = 0;

  // Extract keyed nodes from previous children and keep track of total count.
  while (oldNode) {
    extra++;
    checkOld = oldNode;
    oldKey = getKey(checkOld);
    oldNode = oldNode.nextSibling;

    if (oldKey) {
      if (!keyedNodes) keyedNodes = {};
      keyedNodes[oldKey] = checkOld;
    }
  }

  oldNode = oldParent.firstChild;

  // Loop over new nodes and perform updates.
  while (newNode) {
    let insertedNode;

    if (
      keyedNodes &&
      (newKey = getKey(newNode)) &&
      (foundNode = keyedNodes[newKey])
    ) {
      delete keyedNodes[newKey];
      if (foundNode !== oldNode) {
        walker[APPLY_TRANSITION](() =>
          oldParent.insertBefore(foundNode!, oldNode)
        );
      } else {
        oldNode = oldNode.nextSibling;
      }

      await updateNode(foundNode, newNode, walker);
    } else if (oldNode) {
      checkOld = oldNode;
      oldNode = oldNode.nextSibling;
      if (getKey(checkOld)) {
        insertedNode = newNode.cloneNode(true);
        walker[APPLY_TRANSITION](() =>
          oldParent.insertBefore(insertedNode!, checkOld!)
        );
      } else {
        await updateNode(checkOld, newNode, walker);
      }
    } else {
      insertedNode = newNode.cloneNode(true);
      walker[APPLY_TRANSITION](() => oldParent.appendChild(insertedNode!));
    }

    newNode = (await walker[NEXT_SIBLING](newNode)) as ChildNode;

    // If we didn't insert a node this means we are updating an existing one, so we
    // need to decrement the extra counter, so we can skip removing the old node.
    if (!insertedNode) extra--;
  }

  walker[APPLY_TRANSITION](() => {
    // Remove old keyed nodes.
    for (oldKey in keyedNodes) {
      extra--;
      oldParent.removeChild(keyedNodes![oldKey]!);
    }

    // If we have any remaining unkeyed nodes remove them from the end.
    while (--extra >= 0) oldParent.removeChild(oldParent.lastChild!);
  });
}

/**
 * Retrieves the key identifier for a node
 * @param node - The node to get the key from
 * @returns The key value from either the 'key' attribute or id
 */
function getKey(node: Node) {
  return (node as Element)?.getAttribute?.("key") || (node as Element).id;
}

/**
 * Creates a walker for traversing an HTML stream
 * @param stream - ReadableStream containing HTML content
 * @param options - Configuration options for the walker
 * @returns Walker instance for DOM traversal
 */
async function htmlStreamWalker(
  stream: ReadableStream,
  options: InOptionsType = {}
): Promise<InWalkerType> {
  // Use InSpatial DOM to parse the HTML stream
  const { document: doc } = parseHTML("");

  doc.open();
  const decoderStream = new TextDecoderStream();
  const decoderStreamReader = decoderStream.readable.getReader();
  let streamInProgress = true;

  stream.pipeTo(decoderStream.writable);
  processStream();

  async function processStream() {
    try {
      while (true) {
        const { done, value } = await decoderStreamReader.read();
        if (done) {
          streamInProgress = false;
          break;
        }
        doc.write(value);
      }
    } finally {
      doc.close();
    }
  }

  while (!doc.documentElement || isLastNodeOfChunk(doc.documentElement)) {
    await wait();
  }

  function next(field: "firstChild" | "nextSibling") {
    return async (node: Node) => {
      if (!node) return null;

      let nextNode = node[field];

      while (options.shouldIgnoreNode?.(nextNode)) {
        nextNode = nextNode![field];
      }

      if (nextNode) options.onNextNode?.(nextNode);

      const waitChildren = field === "firstChild";

      while (isLastNodeOfChunk(nextNode as Element, waitChildren)) {
        await wait();
      }

      return nextNode;
    };
  }

  function isLastNodeOfChunk(node: Node, waitChildren?: boolean) {
    if (!node || !streamInProgress || node.nextSibling) {
      return false;
    }

    if (SPECIAL_TAGS.has(node.nodeName)) {
      return !doc.body?.hasChildNodes?.();
    }

    let parent = node.parentElement;

    while (parent) {
      if (parent.nextSibling) return false;
      parent = parent.parentElement;
    }

    return waitChildren
      ? streamInProgress && !node.hasChildNodes?.()
      : streamInProgress;
  }

  return {
    root: doc.documentElement,
    [FIRST_CHILD]: next("firstChild"),
    [NEXT_SIBLING]: next("nextSibling"),
    [APPLY_TRANSITION]: (v) => {
      v();
    },
  };
}
