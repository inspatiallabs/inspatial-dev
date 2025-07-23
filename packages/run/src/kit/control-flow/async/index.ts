import { watch, read, nextTick, createSignal } from "@in/teract/signal-lite";
import { getCurrentSelf, capture, KEY_CTX } from "../../component/index.ts";
import type { Dispose } from "../../type.ts";
import { Fn } from "../fn/index.ts";

/*#################################(Types)#################################*/
export interface AsyncProps {
  future: Promise<any>;
  fallback?: any;
  catch?: any;
  [key: string]: any;
}

/*#################################(Async Container)#################################*/
export function _asyncContainer(
  this: Promise<any>,
  name: string,
  fallback: any,
  catchErr: any,
  props: Record<string, any>,
  ...children: any[]
): any {
  const self = getCurrentSelf();
  const component = createSignal(null);
  let currentDispose: Dispose | null = null;

  const inputFuture = Promise.resolve(this);
  const resolvedFuture = inputFuture.then(
    capture(function (result: any) {
      if (self[KEY_CTX]) {
        currentDispose?.();
        currentDispose = watch(function () {
          component.value = read(result);
        });
      }
    })
  );

  if (catchErr) {
    resolvedFuture.catch(
      capture(function (error: any) {
        if (self[KEY_CTX]) {
          currentDispose?.();
          currentDispose = watch(function () {
            const handler = read(catchErr);
            if (handler) {
              if (typeof handler === "function") {
                component.value = handler({ ...props, error }, ...children);
              } else {
                component.value = handler;
              }
            }
          });
        }
      })
    );
  }

  if (fallback) {
    nextTick(
      capture(function () {
        if (self[KEY_CTX] && !component.peek()) {
          currentDispose?.();
          currentDispose = watch(function () {
            const handler = read(fallback);
            if (handler) {
              if (typeof handler === "function") {
                component.value = handler({ ...props }, ...children);
              } else {
                component.value = handler;
              }
            }
          });
        }
      })
    );
  }

  return Fn({ name }, function () {
    return component.value;
  });
}

/*#################################(Async)#################################*/
export function Async(
  { future, fallback, catch: catchErr, ...props }: AsyncProps,
  then?: any,
  now?: any,
  handleErr?: any
): any {
  future = Promise.resolve(future).then(
    capture(function (result: any) {
      return Fn({ name: "Then" }, () => {
        return then?.({ ...props, result });
      });
    })
  );
  return _asyncContainer.call(
    future,
    "Async",
    fallback ?? now,
    catchErr ?? handleErr,
    props
  );
}
