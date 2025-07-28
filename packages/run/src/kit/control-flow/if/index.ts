import { type SignalValueType, isSignal, type Signal } from "../../../signal.ts";
import type { ComponentFunction } from "../../component/index.ts";
import type { RenderFunction } from "../render/index.ts";
import { Fn } from "../fn/index.ts";

export interface IfProps {
  condition?: SignalValueType<any>;
  true?: SignalValueType<any>;
  else?: any;
}

export function If(
  props: IfProps,
  trueBranch?: ComponentFunction,
  falseBranch?: ComponentFunction
): ComponentFunction | RenderFunction {
  let { condition, true: trueCondition, else: otherwise } = props;

  if (otherwise) {
    falseBranch = otherwise;
  }
  if (trueCondition) {
    condition = trueCondition;
  }

  if (isSignal(condition)) {
    return Fn({ name: "If" }, function () {
      if ((condition as Signal).value) return trueBranch;
      else return falseBranch;
    });
  }

  if (typeof condition === "function") {
    return Fn({ name: "If" }, function () {
      if (condition()) {
        return trueBranch;
      } else {
        return falseBranch;
      }
    });
  }

  if (condition) return trueBranch as any;
  return falseBranch as any;
}
