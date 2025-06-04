// @ts-ignore - Ignoring TS extension import error
import {MUTATION_OBSERVER} from '../shared/symbols.ts';

// @ts-ignore - Ignoring TS extension import error
import type {Node} from './node.ts';

/**
 * Interface for MutationRecord objects
 */
interface MutationRecord {
  type: string;
  target: Node;
  addedNodes: Node[];
  removedNodes: Node[];
  attributeName: string | null;
  oldValue: string | undefined;
  previousSibling: Node | null;
  nextSibling: Node | null;
}

/**
 * Interface for MutationObserverInit options
 */
interface MutationObserverInit {
  subtree?: boolean;
  childList?: boolean;
  attributes?: boolean;
  attributeFilter?: string[] | null;
  attributeOldValue?: boolean;
  characterData?: boolean;
  // characterDataOldValue?: boolean; // Not implemented yet
}

/**
 * Interface for Observer object
 */
interface Observer {
  callback: (records: MutationRecord[], observer: any) => void;
  records: MutationRecord[];
  scheduled: boolean;
  nodes: Map<Node, MutationObserverInit>;
}

/**
 * Creates a mutation record
 */
const createRecord = (
  type: string, 
  target: Node, 
  element: Node | null, 
  addedNodes: Node[], 
  removedNodes: Node[], 
  attributeName: string | null, 
  oldValue: string | undefined
): MutationRecord => ({
  type,
  target,
  addedNodes,
  removedNodes,
  attributeName,
  oldValue,
  previousSibling: element?.previousSibling || null,
  nextSibling: element?.nextSibling || null,
});

/**
 * Queues an attribute change record
 */
const queueAttribute = (
  observer: Observer, 
  target: Node, 
  attributeName: string, 
  attributeFilter: string[] | null, 
  attributeOldValue: boolean, 
  oldValue: string | undefined
): void => {
  if ((!attributeFilter || attributeFilter.includes(attributeName))) {
    const {callback, records, scheduled} = observer;
    records.push(createRecord(
      'attributes', target, null,
      [], [],
      attributeName, attributeOldValue ? oldValue : void 0
    ));
    if (!scheduled) {
      observer.scheduled = true;
      Promise.resolve().then(() => {
        observer.scheduled = false;
        callback(records.splice(0), observer);
      });
    }
  }
};

/**
 * Callback for attribute changes
 */
export const attributeChangedCallback = (element: Node, attributeName: string, oldValue: string | undefined): void => {
  const {ownerDocument} = element;
  const {active, observers} = ownerDocument[MUTATION_OBSERVER];
  if (active) {
    for (const observer of observers) {
      for (const [
        target,
        {
          childList,
          subtree,
          attributes,
          attributeFilter,
          attributeOldValue
        }
      ] of observer.nodes) {
        if (childList) {
          if (
            (subtree && (target === ownerDocument || target.contains(element))) ||
            (!subtree && target.children.includes(element))
          ) {
            queueAttribute(
              observer, element,
              attributeName, attributeFilter, attributeOldValue, oldValue
            );
            break;
          }
        }
        else if (
          attributes &&
          target === element
        ) {
          queueAttribute(
            observer, element,
            attributeName, attributeFilter, attributeOldValue, oldValue
          );
          break;
        }
      }
    }
  }
};

/**
 * Callback for mutation observer
 */
export const moCallback = (element: Node, parentNode: Node | null): void => {
  try {
    if (!element || !element.ownerDocument) return;
    
    const { ownerDocument } = element;
    
    // Safely check if MUTATION_OBSERVER exists and has the expected properties
    if (!ownerDocument[MUTATION_OBSERVER] || 
        typeof ownerDocument[MUTATION_OBSERVER] !== 'object' ||
        !('active' in ownerDocument[MUTATION_OBSERVER]) ||
        !('observers' in ownerDocument[MUTATION_OBSERVER])) {
      return;
    }
    
    const { active, observers } = ownerDocument[MUTATION_OBSERVER];
    if (!active || !observers || !(observers instanceof Set)) return;
    
    for (const observer of observers) {
      if (!observer || !observer.nodes || !(observer.nodes instanceof Map)) continue;
      
      for (const [target, { subtree, childList, characterData }] of observer.nodes) {
        if (!childList) continue;
        
        if (
          (parentNode && (target === parentNode || (subtree && target.contains && target.contains(parentNode)))) ||
          (!parentNode && ((subtree && (target === ownerDocument || (target.contains && target.contains(element)))) ||
                        (!subtree && target[characterData ? 'childNodes' : 'children'] && 
                                  target[characterData ? 'childNodes' : 'children'].includes && 
                                  target[characterData ? 'childNodes' : 'children'].includes(element))))
        ) {
          const { callback, records, scheduled } = observer;
          if (!records || !callback) continue;
          
          records.push(createRecord(
            'childList', target, element,
            parentNode ? [] : [element], parentNode ? [element] : [],
            null, undefined
          ));
          
          if (!scheduled) {
            observer.scheduled = true;
            Promise.resolve().then(() => {
              observer.scheduled = false;
              callback(records.splice(0), observer);
            });
          }
          break;
        }
      }
    }
  } catch (error) {
    console.warn('Error in mutation observer callback:', error);
  }
};

/**
 * MutationObserver class implementation
 */
export class MutationObserverClass {
  observers: Set<Observer>;
  active: boolean;
  class: any;

  constructor(ownerDocument: any) {
    const observers = new Set<Observer>();
    this.observers = observers;
    this.active = false;

    /**
     * @implements globalThis.MutationObserver
     */
    this.class = class MutationObserver {
      callback: (records: MutationRecord[], observer: any) => void;
      nodes: Map<Node, MutationObserverInit>;
      records: MutationRecord[];
      scheduled: boolean;

      constructor(callback: (records: MutationRecord[], observer: any) => void) {
        /**
         * @private
         */
        this.callback = callback;

        /**
         * @private
         */
        this.nodes = new Map();

        /**
         * @private
         */
        this.records = [];

        /**
         * @private
         */
        this.scheduled = false;
      }

      disconnect(): void {
        this.records.splice(0);
        this.nodes.clear();
        observers.delete(this);
        ownerDocument[MUTATION_OBSERVER].active = !!observers.size;
      }

      /**
       * @param {Element} target
       * @param {MutationObserverInit} options
       */
      observe(target: Node, options: MutationObserverInit = {
        subtree: false,
        childList: false,
        attributes: false,
        attributeFilter: null,
        attributeOldValue: false,
        characterData: false,
        // TODO(@benemma): not implemented yet
        // characterDataOldValue: false
      }): void {
        if (('attributeOldValue' in options) || ('attributeFilter' in options))
          options.attributes = true;
        // if ('characterDataOldValue' in options)
        //   options.characterData = true;
        options.childList = !!options.childList;
        options.subtree = !!options.subtree;
        this.nodes.set(target, options);
        observers.add(this);
        ownerDocument[MUTATION_OBSERVER].active = true;
      }

      /**
       * @returns {MutationRecord[]}
       */
      takeRecords(): MutationRecord[] { return this.records.splice(0); }
    }
  }
}
