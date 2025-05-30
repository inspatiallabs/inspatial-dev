import { ComputationClass, getObserver } from "./core/index.ts";

/**
 * Custom node class for store properties that properly establishes bidirectional observer links
 */
export class StoreNodeClass extends ComputationClass<any> {
  constructor(value: any, equals?: false | ((a: any, b: any) => boolean)) {
    super(value, null, {
      equals,
      // Prevent node deletion when there are no observers
      // Store nodes should persist for the lifetime of the store
      unobserved: undefined,
    });
  }

  /**
   * Override read() to properly establish tracking through the parent's _read() method
   */
  override read(): any {
    // Call parent _read() which handles tracking properly
    return this._read();
  }
}
