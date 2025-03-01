// deno-lint-ignore-file no-explicit-any

import { NativeNode } from "../../types.ts";

// NativeScript Renderer
export class NativeRenderer {
  private static instance: NativeRenderer;

  private constructor() {}

  static getInstance(): NativeRenderer {
    if (!NativeRenderer.instance) {
      NativeRenderer.instance = new NativeRenderer();
    }
    return NativeRenderer.instance;
  }

  createElement(type: string, props: any): NativeNode {
    // Create NativeScript views based on type
    switch (type.toLowerCase()) {
      case "view":
        return this.createView(props);
      case "text":
        return this.createText(props);
      case "button":
        return this.createButton(props);
      case "stack":
        return this.createStack(props);
      default:
        throw new Error(`Unknown native element type: ${type}`);
    }
  }

  private createView(props: any): NativeNode {
    return {
      type: "View",
      props,
      target: "native",
      view: {}, // Create actual NativeScript View
      children: [],
    };
  }

  private createText(props: any): NativeNode {
    return {
      type: "Text",
      props,
      target: "native",
      view: {}, // Create actual NativeScript Label
    };
  }

  private createButton(props: any): NativeNode {
    return {
      type: "Button",
      props,
      target: "native",
      view: {}, // Create actual NativeScript Button
    };
  }

  private createStack(props: any): NativeNode {
    return {
      type: "Stack",
      props,
      target: "native",
      view: {}, // Create actual NativeScript StackLayout
      children: [],
    };
  }
}
