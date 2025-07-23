import { read, type Signal } from "@in/teract/signal-lite";
import { Fn } from "../fn/index.ts";
import type { AnyFunction, Renderer } from "../../type.ts";

/*#################################(Types)#################################*/

/** Parser function type that processes text and returns renderable content */
type ParserFunction = (text: string, renderer: Renderer) => any;

/** Props interface for Parse component */
interface ParseProps {
  /** Text content to parse - can be a signal or direct value */
  text: Signal<string> | string;
  /** Parser function that processes the text */
  parser: Signal<ParserFunction> | ParserFunction;
}

/** Component function type that takes renderer context */
type ComponentFunction = (renderer: Renderer) => any;

/*#################################(Parse)#################################*/
export function Parse({ text, parser }: ParseProps): AnyFunction {
  let currentText: string = "";
  let currentParser: ParserFunction | null = null;
  let currentRender: ComponentFunction | null = null;

  return Fn({ name: "Parse" }, function (): ComponentFunction {
    const newText: string = read(text);
    const newParser: ParserFunction = read(parser);

    if (newText === currentText && currentParser === newParser) {
      return currentRender!;
    }

    currentText = newText;
    currentParser = newParser;

    return (currentRender = function (R: Renderer): any {
      return R.c(R.f, null, newParser(newText, R));
    });
  });
}
