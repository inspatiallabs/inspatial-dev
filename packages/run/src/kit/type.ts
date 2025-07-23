// Types
export type AnyFunction = (...args: any[]) => any;
export type Dispose = (batch?: boolean) => void;
export type Renderer = any; // TODO(@benemma): define the actual renderer interface