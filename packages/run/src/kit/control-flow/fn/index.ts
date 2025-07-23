// deno-lint-ignore-file ban-unused-ignore
import { peek, onDispose, watch, read, nextTick } from "@in/teract/signal-lite";
import { currentCtx } from "../../component/index.ts";
import type { AnyFunction, Renderer, Dispose } from "../../type.ts";

/*#################################(Types)#################################*/
export interface FnProps {
  name?: string;
  ctx?: any;
  catch?: any;
}

/*#################################(Fn)#################################*/
export function Fn(
  { name = "Fn", ctx, catch: catchErr }: FnProps,
  handler?: any,
  handleErr?: any
): AnyFunction {
  if (!handler) {
    return nop;
  }

  if (!catchErr) {
    catchErr = handleErr;
  }

  const run = currentCtx?.run;

  // deno-lint-ignore no-inner-declarations
  function nop() {
    return;
  }

  if (!run) {
    return nop;
  }

  return function (R: Renderer) {
    const fragment = R.createFragment(name);
    let currentRender: any = null;
    let currentDispose: Dispose | null = null;

    watch(function () {
      const newHandler = read(handler);

      if (!newHandler) {
        currentDispose?.();
        currentRender = currentDispose = null;
        return;
      }

      const newRender = newHandler(ctx);
      if (newRender === currentRender) {
        return;
      }

      currentRender = newRender;
      if (newRender !== undefined && newRender !== null) {
        const prevDispose = currentDispose;
        currentDispose = run(function () {
          let newResult: any = null;
          let errored = false;
          try {
            newResult = R.ensureElement(
              typeof newRender === "function" ? newRender(R) : newRender
            );
          } catch (err) {
            errored = true;
            const errorHandler = peek(catchErr);
            if (errorHandler) {
              newResult = R.ensureElement(errorHandler(err, name, ctx));
            } else {
              throw err;
            }
          }

          if (!errored && prevDispose) {
            prevDispose();
          }

          if (newResult !== undefined && newResult !== null) {
            R.appendNode(fragment, newResult);
            onDispose(nextTick.bind(null, R.removeNode.bind(null, newResult)));
          } else {
            if (errored && prevDispose) {
              onDispose(prevDispose);
            }
          }
        })[1];
      } else {
        currentDispose?.();
        currentDispose = null;
      }
    });

    return fragment;
  };
}
