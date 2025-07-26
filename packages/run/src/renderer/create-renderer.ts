import { isSignal, type Signal } from "../signal.ts";
import { type Component, createComponent, Fn, render } from "../kit/index.ts";
import { removeFromArr } from "../utils.ts";
import { env } from "../env/index.ts";
import type { DebugContext } from "../debug/index.ts";

/*#################################(Types)#################################*/

export type AnyFunction = (...args: any[]) => any;

/** Node operations interface for the renderer */
interface NodeOps {
  /** Check if a value is a valid node */
  isNode: (value: any) => boolean;
  /** Create a new element node */
  createNode: (tag: string) => any;
  /** Create a text node */
  createTextNode: (text: string | Signal<any>) => any;
  /** Create an anchor node for fragments */
  createAnchor: (text: string) => any;
  /** Create a document fragment */
  createFragment: () => any;
  /** Remove a node from its parent */
  removeNode: (node: any) => void;
  /** Append nodes to a parent */
  appendNode: (parent: any, ...nodes: any[]) => void;
  /** Insert a node before a reference node */
  insertBefore: (node: any, ref: any) => void;
  /** Set properties on a node */
  setProps: (node: any, props: Record<string, any>) => void;
}

/** Fragment data structure */
type FragmentData = [
  anchorStart: any,
  children: any[],
  anchorEnd: any,
  flags: { connected: boolean }
];

/** Element creation props */
interface ElementProps {
  $ref?: Signal<any> | ((node: any) => void) | any;
  children?: any;
  [key: string]: any;
}

/** Renderer interface */
interface Renderer extends NodeOps {
  nodeOps: NodeOps;
  id: symbol;
  normalizeChildren: (children: any[]) => any[];
  isFragment: (node: any) => boolean;
  createFragment: (name?: string) => any;
  createElement: (
    tag: string | AnyFunction,
    props?: ElementProps,
    ...children: any[]
  ) => any;
  ensureElement: (element: any) => any;
  removeNode: (node: any) => void;
  appendNode: (parent: any, ...nodes: any[]) => void;
  insertBefore: (node: any, ref: any) => void;
  Fragment: string;
  render: (target: any, ...args: any[]) => Component;
  text: (text: string | Signal<any>) => any;
  c: (
    tag: string | AnyFunction,
    props?: ElementProps,
    ...children: any[]
  ) => any;
  f: string;
}

/** Component renderer function type */
type ComponentRenderFunction = (instance: Component, renderer: Renderer) => any;

/*#################################(Constants)#################################*/

const Fragment = "<>";

/*#################################(Renderer)#################################*/

export function createRenderer(
  nodeOps: NodeOps,
  rendererID?: string | symbol
): Renderer {
  const {
    isNode,
    createNode,
    createTextNode,
    createAnchor,
    createFragment: createFragmentRaw,
    removeNode: removeNodeRaw,
    appendNode: appendNodeRaw,
    insertBefore: insertBeforeRaw,
    setProps,
  } = nodeOps;

  const fragmentMap = new WeakMap<any, FragmentData>();
  const parentMap = new WeakMap<any, any>();

  function isFragment(i: any): boolean {
    return i && fragmentMap.has(i);
  }

  function createFragment(name?: string): any {
    const fragment = createFragmentRaw();
    const anchorStart = createAnchor(
      env.isProduction()
        ? ""
        : name === undefined || name === null
        ? ""
        : `<${name}>`
    );
    const anchorEnd = createAnchor(
      env.isProduction()
        ? ""
        : name === undefined || name === null
        ? ""
        : `</${name}>`
    );
    appendNodeRaw(fragment, anchorStart, anchorEnd);
    parentMap.set(anchorStart, fragment);
    parentMap.set(anchorEnd, fragment);
    fragmentMap.set(fragment, [
      anchorStart,
      [],
      anchorEnd,
      { connected: false },
    ]);
    return fragment;
  }

  function flatChildrenReducer(result: any[], i: any): any[] {
    if (isFragment(i)) result.push(...expandFragment(i));
    else result.push(i);
    return result;
  }

  function flattenChildren(children: any[]): any[] {
    return children.reduce(flatChildrenReducer, []);
  }

  function _expandFragment(
    anchorStart: any,
    children: any[],
    anchorEnd: any,
    flags: { connected: boolean }
  ): any[] {
    const flattened = flattenChildren(children);
    flattened.unshift(anchorStart);
    flattened.push(anchorEnd);
    return flattened;
  }

  function expandFragment(node: any): any[] {
    const [anchorStart, children, anchorEnd, flags] = fragmentMap.get(node)!;
    if (flags.connected) {
      return _expandFragment(anchorStart, children, anchorEnd, flags);
    }

    flags.connected = true;
    return [node];
  }

  function removeNode(node: any): void {
    const parent = parentMap.get(node);

    if (!parent) return;

    if (isFragment(parent)) {
      const [, children] = fragmentMap.get(parent)!;
      removeFromArr(children, node);
    }

    parentMap.delete(node);

    if (isFragment(node)) {
      const [anchorStart, children, anchorEnd, flags] = fragmentMap.get(node)!;
      if (flags.connected) {
        const expanded = _expandFragment(
          anchorStart,
          children,
          anchorEnd,
          flags
        );
        expanded.unshift(node);
        (appendNodeRaw as any)(...expanded);
        flags.connected = false;
      }
    } else {
      removeNodeRaw(node);
    }
  }

  function appendNode(parent: any, ...nodes: any[]): void {
    if (isFragment(parent)) {
      const [, , anchorEnd] = fragmentMap.get(parent)!;
      for (let node of nodes) {
        insertBefore(node, anchorEnd);
      }
      return;
    } else {
      for (let node of nodes) {
        removeNode(node);
        parentMap.set(node, parent);
      }
      const flattened = flattenChildren(nodes);
      const allNodes = [parent, ...flattened];
      (appendNodeRaw as any)(...allNodes);
    }
  }

  function insertBefore(node: any, ref: any): void {
    removeNode(node);

    const parent = parentMap.get(ref);
    parentMap.set(node, parent);

    if (isFragment(parent)) {
      const [, children, anchorEnd] = fragmentMap.get(parent)!;
      if (anchorEnd === ref) {
        children.push(node);
      } else {
        const idx = children.indexOf(ref);
        children.splice(idx, 0, node);
      }
    }

    if (isFragment(ref)) {
      const [anchorStart] = fragmentMap.get(ref)!;
      ref = anchorStart;
    }

    if (isFragment(node)) {
      for (let child of expandFragment(node)) insertBeforeRaw(child, ref);
      return;
    }

    insertBeforeRaw(node, ref);
  }

  function ensureElement(el: any): any {
    if (el === null || el === undefined || isNode(el)) return el;
    return createTextNode(el);
  }

  function normalizeChildren(children: any[]): any[] {
    const normalizedChildren: any[] = [];

    if (children.length) {
      let mergedTextBuffer = "";
      // deno-lint-ignore no-inner-declarations
      function flushTextBuffer(): void {
        if (mergedTextBuffer) {
          normalizedChildren.push(createTextNode(mergedTextBuffer));
          mergedTextBuffer = "";
        }
      }
      // deno-lint-ignore no-inner-declarations
      function flatChildren(childArr: any[]): void {
        for (let child of childArr) {
          if (child !== null && child !== undefined) {
            if (isNode(child)) {
              flushTextBuffer();
              normalizedChildren.push(child);
            } else if (isSignal(child)) {
              flushTextBuffer();
              normalizedChildren.push(createTextNode(child));
            } else if (typeof child === "function") {
              flushTextBuffer();
              normalizedChildren.push(
                createElement(Fn, { name: "Inline" }, child)
              );
            } else if (Array.isArray(child)) {
              flatChildren(child);
            } else {
              mergedTextBuffer += child;
            }
          }
        }
      }
      flatChildren(children);
      flushTextBuffer();
    }

    return normalizedChildren;
  }

  function createElement(
    tag: string | AnyFunction,
    props?: ElementProps,
    ...children: any[]
  ): any {
    if (typeof tag === "string") {
      const normalizedChildren = normalizeChildren(children);
      const node = tag === Fragment ? createFragment("") : createNode(tag);

      if (props) {
        // `children` is omitted when passing to the node
        const { $ref, children: _, ...restProps } = props;
        setProps(node, restProps);
        if ($ref) {
          if (isSignal($ref)) {
            $ref.value = node;
          } else if (typeof $ref === "function") {
            $ref(node);
          } else if (!env.isProduction()) {
            throw new Error(`Invalid $ref type: ${typeof $ref}`);
          }
        }
      }

      if (normalizedChildren.length) {
        const allNodes = [node, ...normalizedChildren];
        (appendNode as any)(...allNodes);
      }

      return node;
    }

    const instance = createComponent(tag, props, ...children);

    return ensureElement(render(instance, renderer));
  }

  function renderComponent(target: any, ...args: any[]): Component {
    const instance = (createComponent as any)(...args);
    
    // Get component name for debug tracking
    const componentName = args[0] && typeof args[0] === 'function' 
      ? args[0].name || 'Anonymous' 
      : 'Component';
    
    // Track render if debug context is available
    const debugCtx = (renderer as any)._debugCtx as DebugContext | undefined;
    const trackRender = debugCtx?.trackRender(componentName);
    
    const node = render(instance, renderer);
    if (target && node) appendNode(target, node);
    
    // Complete render tracking
    trackRender?.();
    
    return instance;
  }

  const renderer: Renderer = {
    ...nodeOps,
    nodeOps,
    id: (rendererID as symbol) || Symbol("InSpatial Renderer"),
    normalizeChildren,
    isFragment,
    createFragment,
    createElement,
    ensureElement,
    removeNode,
    appendNode,
    insertBefore,
    Fragment,
    render: renderComponent,
    text: createTextNode,
    c: createElement,
    f: Fragment,
  };

  return renderer;
}
