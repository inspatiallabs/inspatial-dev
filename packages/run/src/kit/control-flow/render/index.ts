import { read, type Signal } from "@in/teract/signal-lite";
import { type ComponentInstance, KEY_CTX } from "../../component/index.ts";
import type { AnyFunction, Renderer } from "../../type.ts";
import { Fn } from "../fn/index.ts";

/*#################################(Types)#################################*/
export interface RenderProps {
  from: Signal<ComponentInstance> | ComponentInstance;
}

/*#################################(Render)#################################*/

function render(instance: ComponentInstance, renderer: Renderer): any {
  const ctx = instance[KEY_CTX];
  if (!ctx) {
    return;
  }

  const { run, render: renderComponent } = ctx;
  if (!renderComponent || typeof renderComponent !== "function")
    return renderComponent;

  return run(renderComponent, renderer)[0];
}

export function Render({ from }: RenderProps): AnyFunction {
  return function (R: Renderer) {
    return R.c(Fn, { name: "Render" }, function () {
      const instance = read(from);
      if (instance !== null && instance !== undefined)
        return render(instance, R);
    });
  };
}
