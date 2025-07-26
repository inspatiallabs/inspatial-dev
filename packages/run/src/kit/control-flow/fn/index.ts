import {
  type SignalValueType,
  type SignalDisposerFunctionType,
  watch,
  read,
  peek,
  onDispose,
  nextTick,
} from "../../../signal.ts";
import { nop } from "../../../utils.ts";
import {
  type ComponentFunction,
  getCurrentRun,
} from "../../component/index.ts";
import type { RenderFunction } from "../render/index.ts";

export interface FnProps {
  name?: string;
  ctx?: any;
  catch?: SignalValueType<ComponentFunction | undefined> | ComponentFunction;
}

export function Fn(
  props: FnProps,
  handler?: SignalValueType<ComponentFunction>,
  handleErr?: ComponentFunction
): RenderFunction {
  const { name = "Fn", ctx, catch: catchErr } = props;

  if (!handler) {
    return nop;
  }

  if (!catchErr) {
    // catchErr = handleErr;
  }

  const run = getCurrentRun();

  if (!run) {
    return nop;
  }

  return function (R: any) {
    const fragment = R.createFragment(name);
    let currentRender: any = null;
    let currentDispose: SignalDisposerFunctionType | null = null;

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
            const errorHandler = peek(
              catchErr as SignalValueType<ComponentFunction | undefined>
            );
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
