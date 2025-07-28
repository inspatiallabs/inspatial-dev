import {
  type SignalValueType,
  createSignal,
  type SignalDisposerFunctionType,
  watch,
  read,
  nextTick,
} from "../../../signal.ts";
import {
  type ComponentProps,
  type ComponentFunction,
  getCurrentSelf,
  captureComponent,
  KEY_CTX,
} from "../../component/index.ts";
import { Fn } from "../fn/index.ts";
import type { RenderFunction } from "../render/index.ts";

export interface AsyncProps extends ComponentProps {
  future: Promise<any>;
  fallback?: SignalValueType<ComponentFunction> | ComponentFunction;
  catch?: SignalValueType<ComponentFunction> | ComponentFunction;
}

export function _asyncContainer(
  this: Promise<any>,
  name: string,
  fallback: any,
  catchErr: any,
  props: ComponentProps,
  ...children: any[]
): RenderFunction {
  const self = getCurrentSelf();
  const component = createSignal(undefined);
  let currentDispose: SignalDisposerFunctionType | null = null;

  const inputFuture = Promise.resolve(this);
  const resolvedFuture = inputFuture.then(
    captureComponent(function (result: any) {
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
      captureComponent(function (error: any) {
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
      captureComponent(function () {
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

export function Async(
  props: AsyncProps,
  then?: ComponentFunction,
  now?: ComponentFunction,
  handleErr?: ComponentFunction
): RenderFunction {
  const { future, fallback, catch: catchErr, ...restProps } = props;

  const modifiedFuture = Promise.resolve(future).then(
    captureComponent(function (result: any) {
      return Fn({ name: "Then" }, () => {
        const handler = read(then);
        return handler?.({ ...restProps, result });
      });
    })
  );
  return _asyncContainer.call(
    modifiedFuture,
    "Async",
    fallback ?? now,
    catchErr ?? handleErr,
    restProps
  );
}
