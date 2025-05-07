import type { OwnerClass } from "./owner.ts";

export class NotReadyErrorClass extends Error {}

export class NoOwnerErrorClass extends Error {
  constructor(details?: string) {
    let baseMsg = __DEV__ ? "Context can only be accessed under a reactive root." : "";
    if (__DEV__ && details) baseMsg += ` Details: ${details}`;
    super(baseMsg);
  }
}

export class ContextNotFoundErrorClass extends Error {
  constructor(details?: string) {
    let baseMsg =
      __DEV__
        ? "Context must either be created with a default value or a value must be provided before accessing it."
        : "";
    if (__DEV__ && details) baseMsg += ` Details: ${details}`;
    super(baseMsg);
  }
}

export class EffectErrorClass extends Error {
  override cause: unknown;
  constructor(effect: Function, cause: unknown) {
    super(__DEV__ ? `Uncaught error while running effect:\n\n  ${effect.toString()}\n` : "");
    this.cause = cause;
  }
}

export interface ErrorHandlerType {
  (error: unknown, node: OwnerClass): void;
}
