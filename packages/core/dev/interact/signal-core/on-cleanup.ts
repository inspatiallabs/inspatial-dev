import { currentOwner } from "./owner.ts";
import { DisposableType } from "./types.ts";

/**
 * Runs an effect once before the reactive scope is disposed
 * @param fn an effect that should run only once on cleanup
 *
 * @returns the same {@link fn} function that was passed in
 * */
export function onCleanup(fn: DisposableType): DisposableType {
  if (!currentOwner) return fn;

  const node = currentOwner;

  if (!node._disposal) {
    node._disposal = fn;
  } else if (Array.isArray(node._disposal)) {
    node._disposal.push(fn);
  } else {
    node._disposal = [node._disposal, fn];
  }
  return fn;
}
