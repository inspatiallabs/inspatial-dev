import { read, type SignalValueType } from "../../../signal.ts";
import { Fn } from "../fn/index.ts";

export interface ParseProps {
  text: SignalValueType<string>;
  parser: SignalValueType<(text: string, R: any) => any>;
}

export function Parse({ text, parser }: ParseProps) {
  let currentText = "";
  let currentParser: ((text: string, R: any) => any) | null = null;
  let currentRender: ((R: any) => any) | null = null;

  return Fn({ name: "Parse" }, function () {
    const newText = read(text);
    const newParser = read(parser);

    if (newText === currentText && currentParser === newParser) {
      return currentRender;
    }

    currentText = newText;
    currentParser = newParser;

    return (currentRender = function (R: any) {
      return R.c(R.f, null, newParser(newText, R));
    });
  });
}
