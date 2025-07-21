// /**
//  * @file directive.ts
//  * @description Directive handler for controlling render targets
//  */

// import { DirectiveRenderTargetProp, Directive } from "./types.ts";

// /**
//  * Directive Handler - Manages render target directives
//  * This singleton class is responsible for managing the current render target
//  * and processing directives for rendering operations
//  */
// class DirectiveHandler {
//   // Default target is DOM
//   private currentTarget: DirectiveRenderTargetProp = "dom";

//   // Map to store directives by ID
//   private directives = new Map<string, Directive>();

//   /**
//    * Set the current rendering target
//    */
//   public setTarget(target: DirectiveRenderTargetProp): void {
//     this.currentTarget = target;
//   }

//   /**
//    * Get the current rendering target
//    */
//   public getTarget(): DirectiveRenderTargetProp {
//     return this.currentTarget;
//   }

//   /**
//    * Register a directive with an ID
//    */
//   public registerDirective(id: string, directive: Directive): void {
//     this.directives.set(id, directive);
//   }

//   /**
//    * Get a directive by ID
//    */
//   public getDirective(id: string): Directive | undefined {
//     return this.directives.get(id);
//   }

//   /**
//    * Remove a directive by ID
//    */
//   public removeDirective(id: string): boolean {
//     return this.directives.delete(id);
//   }

//   /**
//    * Clear all directives
//    */
//   public clearDirectives(): void {
//     this.directives.clear();
//   }

//   /**
//    * Process props for directives
//    * This can extract target information and other rendering directives
//    */
//   public processDirectives(props: Record<string, any>): {
//     processedProps: Record<string, any>;
//     extractedDirectives: Directive[];
//   } {
//     const processedProps = { ...props };
//     const extractedDirectives: Directive[] = [];

//     // Check for explicit target property
//     if (processedProps.target && this.isValidTarget(processedProps.target)) {
//       extractedDirectives.push({
//         target: processedProps.target as DirectiveRenderTargetProp,
//       });
//       delete processedProps.target;
//     }

//     // Look for directive prefixes
//     Object.keys(processedProps).forEach((key) => {
//       // Check if this is a directive key (e.g. "dom:className")
//       const match = key.match(/^(dom|gpu|native):(.+)$/);
//       if (match) {
//         const [, target, propName] = match;

//         // Add to extracted directives
//         extractedDirectives.push({
//           target: target as DirectiveRenderTargetProp,
//           [propName]: processedProps[key],
//         });

//         // Remove the directive property from processed props
//         delete processedProps[key];
//       }
//     });

//     return { processedProps, extractedDirectives };
//   }

//   /**
//    * Check if the target is valid
//    */
//   private isValidTarget(target: string): boolean {
//     return ["dom", "gpu", "native"].includes(target);
//   }
// }

// /**
//  * Singleton instance of the DirectiveHandler
//  */
// export const directiveHandler = new DirectiveHandler();

// // For backward compatibility with existing code
// export const currentTarget = directiveHandler.getTarget.bind(directiveHandler);
// export const processDirectives =
//   directiveHandler.processDirectives.bind(directiveHandler);
