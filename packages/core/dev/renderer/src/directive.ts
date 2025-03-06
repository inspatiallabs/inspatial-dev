// @ts-ignore - Ignoring TS extension import error
import { DirectiveRenderTargetProp } from "./types.ts";

// Global target state
export let currentTarget: DirectiveRenderTargetProp = "dom";

// Directive processor
export function processDirective(source: string) {
  const directive = source.match(/^"use (dom|gpu|native)"/)?.[1];
  if (directive) {
    currentTarget = directive as DirectiveRenderTargetProp;
  }
}
