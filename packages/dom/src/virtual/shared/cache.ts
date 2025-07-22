// @ts-ignore - Ignoring TS extension import error
import { isNotParsing } from "./parse-from-string.ts";

export const childNodesWM = new WeakMap();
export const childrenWM = new WeakMap();
export const querySelectorWM = new WeakMap();
export const querySelectorAllWM = new WeakMap();

export const get = <T>(
  wm: WeakMap<object, T>,
  self: object,
  method: (this: typeof self) => T
) => {
  if (wm.has(self)) return wm.get(self);
  const value = method.call(self);
  wm.set(self, value);
  return value;
};

export const reset = (parentNode: WeakKey) => {
  if (isNotParsing()) {
    while (parentNode) {
      childNodesWM.delete(parentNode);
      childrenWM.delete(parentNode);
      querySelectorWM.delete(parentNode);
      querySelectorAllWM.delete(parentNode);
      parentNode = (parentNode as Node).parentNode as WeakKey;
    }
  }
};
