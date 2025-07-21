// /**
//  * TODO: Replace with InTeract TriggerBridge 
//  * @file event-bridge.ts
//  * @description Cross-renderer event system for unified event handling
//  */

// // deno-lint-ignore-file no-explicit-any
// import {
//   DirectiveRenderTargetProp,
//   EventHandler,
//   EventRegistry,
// } from "./types.ts";

// /**
//  * EventBridge - Handles events across different renderers
//  *
//  * This class provides a unified event system that works across DOM, GPU,
//  * and Native renderers, allowing for consistent event handling.
//  */
// class EventBridge {
//   // Event registry maps renderer targets to event names to handlers
//   private eventRegistry: EventRegistry = {};

//   // Registry of event mappings between renderer types
//   private eventMappings: Record<string, Record<string, string>> = {
//     // DOM to GPU event mappings
//     "dom:gpu": {
//       click: "tap",
//       mousedown: "pointerdown",
//       mouseup: "pointerup",
//       mousemove: "pointermove",
//       touchstart: "pointerdown",
//       touchend: "pointerup",
//       touchmove: "pointermove",
//     },
//     // DOM to Native event mappings
//     "dom:native": {
//       click: "tap",
//       mousedown: "touch",
//       mouseup: "touchEnd",
//       mousemove: "pan",
//       touchstart: "touch",
//       touchend: "touchEnd",
//       touchmove: "pan",
//     },
//     // GPU to DOM event mappings
//     "gpu:dom": {
//       tap: "click",
//       pointerdown: "mousedown",
//       pointerup: "mouseup",
//       pointermove: "mousemove",
//     },
//     // GPU to Native event mappings
//     "gpu:native": {
//       tap: "tap",
//       pointerdown: "touch",
//       pointerup: "touchEnd",
//       pointermove: "pan",
//     },
//     // Native to DOM event mappings
//     "native:dom": {
//       tap: "click",
//       touch: "mousedown",
//       touchEnd: "mouseup",
//       pan: "mousemove",
//     },
//     // Native to GPU event mappings
//     "native:gpu": {
//       tap: "tap",
//       touch: "pointerdown",
//       touchEnd: "pointerup",
//       pan: "pointermove",
//     },
//   };

//   /**
//    * Register an event handler
//    *
//    * @param target - The renderer target
//    * @param nodeId - The node ID to attach the event to
//    * @param eventName - The event name
//    * @param handler - The event handler function
//    */
//   public registerEventHandler(
//     target: DirectiveRenderTargetProp,
//     nodeId: string,
//     eventName: string,
//     handler: EventHandler
//   ): void {
//     // Initialize registry structure if needed
//     if (!this.eventRegistry[target]) {
//       this.eventRegistry[target] = {};
//     }

//     if (!this.eventRegistry[target][nodeId]) {
//       this.eventRegistry[target][nodeId] = {};
//     }

//     // Store the handler
//     this.eventRegistry[target][nodeId][eventName] = handler;
//   }

//   /**
//    * Unregister an event handler
//    *
//    * @param target - The renderer target
//    * @param nodeId - The node ID
//    * @param eventName - The event name
//    */
//   public unregisterEventHandler(
//     target: DirectiveRenderTargetProp,
//     nodeId: string,
//     eventName: string
//   ): void {
//     if (
//       this.eventRegistry[target] &&
//       this.eventRegistry[target][nodeId] &&
//       this.eventRegistry[target][nodeId][eventName]
//     ) {
//       delete this.eventRegistry[target][nodeId][eventName];
//     }
//   }

//   /**
//    * Dispatch an event to the appropriate handler
//    *
//    * @param target - The renderer target
//    * @param nodeId - The node ID
//    * @param eventName - The event name
//    * @param eventData - The event data
//    */
//   public dispatchEvent(
//     target: DirectiveRenderTargetProp,
//     nodeId: string,
//     eventName: string,
//     eventData: any
//   ): void {
//     if (
//       this.eventRegistry[target] &&
//       this.eventRegistry[target][nodeId] &&
//       this.eventRegistry[target][nodeId][eventName]
//     ) {
//       // Call the handler with the event data
//       const handler = this.eventRegistry[target][nodeId][eventName];
//       if (typeof handler === "function") {
//         handler(eventData);
//       }
//     }
//   }

//   /**
//    * Map an event from one renderer type to another
//    *
//    * @param fromTarget - The source renderer target
//    * @param toTarget - The destination renderer target
//    * @param fromEventName - The source event name
//    * @returns The mapped event name for the destination renderer
//    */
//   public mapEvent(
//     fromTarget: DirectiveRenderTargetProp,
//     toTarget: DirectiveRenderTargetProp,
//     fromEventName: string
//   ): string {
//     const mappingKey = `${fromTarget}:${toTarget}`;

//     if (
//       this.eventMappings[mappingKey] &&
//       this.eventMappings[mappingKey][fromEventName]
//     ) {
//       return this.eventMappings[mappingKey][fromEventName];
//     }

//     // Return the original event name if no mapping exists
//     return fromEventName;
//   }

//   /**
//    * Forward an event from one renderer to another
//    *
//    * @param fromTarget - The source renderer target
//    * @param toTarget - The destination renderer target
//    * @param fromNodeId - The source node ID
//    * @param toNodeId - The destination node ID
//    * @param fromEventName - The source event name
//    * @param eventData - The event data
//    */
//   public forwardEvent(
//     fromTarget: DirectiveRenderTargetProp,
//     toTarget: DirectiveRenderTargetProp,
//     fromNodeId: string,
//     toNodeId: string,
//     fromEventName: string,
//     eventData: any
//   ): void {
//     // Map the event name to the destination renderer's event system
//     const toEventName = this.mapEvent(fromTarget, toTarget, fromEventName);

//     // Dispatch the event to the destination
//     this.dispatchEvent(toTarget, toNodeId, toEventName, eventData);
//   }

//   /**
//    * Create a bi-directional event forwarding between two nodes
//    *
//    * @param nodeA - The first node information
//    * @param nodeB - The second node information
//    * @param eventPairs - Pairs of events to forward between the nodes
//    */
//   public createEventLink(
//     nodeA: { target: DirectiveRenderTargetProp; nodeId: string },
//     nodeB: { target: DirectiveRenderTargetProp; nodeId: string },
//     eventPairs: [string, string][]
//   ): void {
//     // For each event pair, set up bi-directional forwarding
//     for (const [eventA, eventB] of eventPairs) {
//       // Create a handler for A that forwards to B
//       this.registerEventHandler(
//         nodeA.target,
//         nodeA.nodeId,
//         eventA,
//         (eventData) => {
//           this.forwardEvent(
//             nodeA.target,
//             nodeB.target,
//             nodeA.nodeId,
//             nodeB.nodeId,
//             eventA,
//             eventData
//           );
//         }
//       );

//       // Create a handler for B that forwards to A
//       this.registerEventHandler(
//         nodeB.target,
//         nodeB.nodeId,
//         eventB,
//         (eventData) => {
//           this.forwardEvent(
//             nodeB.target,
//             nodeA.target,
//             nodeB.nodeId,
//             nodeA.nodeId,
//             eventB,
//             eventData
//           );
//         }
//       );
//     }
//   }
// }

// /**
//  * Singleton instance of the EventBridge
//  */
// export const eventBridge = new EventBridge();
