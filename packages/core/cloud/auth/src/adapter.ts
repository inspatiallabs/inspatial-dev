import type { Context, Hono } from "@hono/hono";
import { StorageAdapter } from "./storage/storage.ts";

export type AdapterRoute = Hono;

export interface Adapter<Properties = any> {
  type: string;
  init: (route: AdapterRoute, options: AdapterOptions<Properties>) => void;
  client?: (input: {
    clientID: string;
    clientSecret: string;
    params: Record<string, string>;
  }) => Promise<Properties>;
}

export interface AdapterOptions<Properties> {
  name: string;
  success: (
    ctx: Context,
    properties: Properties,
    opts?: {
      invalidate?: (subject: string) => Promise<void>;
    }
  ) => Promise<Response>;
  forward: (ctx: Context, response: Response) => Response;
  set: <T>(
    ctx: Context,
    key: string,
    maxAge: number,
    value: T
  ) => Promise<void>;
  get: <T>(ctx: Context, key: string) => Promise<T>;
  unset: (ctx: Context, key: string) => Promise<void>;
  invalidate: (subject: string) => Promise<void>;
  storage: StorageAdapter;
}
export class AdapterError extends Error {}
export class AdapterUnknownError extends AdapterError {}
