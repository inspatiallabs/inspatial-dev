/*#################################(Shared JSX Types)#################################*/

/** JSX props interface */
export interface JSXProps {
  children?: any;
  key?: string | number | null;
  [key: string]: any;
}

/** Debug information for JSX elements */
export interface DebugInfo {
  fileName?: string;
  lineNumber?: number;
  columnNumber?: number;
}

/** Renderer interface for JSX operations */
export interface JSXRenderer {
  /** Create element function */
  c: (tag: any, props?: JSXProps, ...children: any[]) => any;
  /** Check if value is a node */
  isNode: (value: any) => boolean;
  /** Fragment marker */
  f: string;
}

/*#################################(Function Types)#################################*/

/** JSX development function type */
export type JSXDEVFunction = (
  tag: any,
  props: JSXProps,
  key?: string | number | null,
  ...args: any[]
) => any;

/** JSX function type for single elements */
export type JSXFunction = (
  tag: any,
  props: JSXProps,
  key?: string | number | null
) => any;

/** JSX function type for elements with static children */
export type JSXSFunction = (
  tag: any,
  props: JSXProps,
  key?: string | number | null
) => any;

/*#################################(Runtime Interfaces)#################################*/

/** JSX development runtime exports */
export interface JSXDevRuntime {
  jsxDEV: JSXDEVFunction;
  Fragment: string;
}

/** JSX production runtime exports */
export interface JSXProdRuntime {
  jsx: JSXFunction;
  jsxs: JSXSFunction;
  Fragment: string;
}

/** Base JSX runtime interface */
export interface JSXRuntimeBase {
  Fragment: string;
}

/*#################################(Default Export Interfaces)#################################*/

/** Development runtime default export interface */
export interface JSXDevRuntimeDefault extends JSXDevRuntime {
  wrap: (renderer: JSXRenderer) => JSXDevRuntime;
  default: JSXDevRuntimeDefault;
}

/** Production runtime default export interface */
export interface JSXProdRuntimeDefault extends JSXProdRuntime {
  wrap: (renderer: JSXRenderer) => JSXProdRuntime;
  default: JSXProdRuntimeDefault;
}
