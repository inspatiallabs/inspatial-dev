import { isSignal } from "@in/teract/signal-lite";
import { Fn } from "../fn/index.ts";

/*#################################(Types)#################################*/
export interface IfProps {
  condition?: any;
  true?: any;
  else?: any;
}

/*#################################(If)#################################*/

export function If(
  { condition, true: trueCondition, else: otherwise }: IfProps,
  trueBranch?: any,
  falseBranch?: any
): any {
  if (otherwise) {
    falseBranch = otherwise;
  }
  if (trueCondition) {
    condition = trueCondition;
  }

  if (isSignal(condition)) {
    return Fn({ name: "If" }, function () {
      if (condition.value) return trueBranch;
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

  if (condition) return trueBranch;
  return falseBranch;
}
