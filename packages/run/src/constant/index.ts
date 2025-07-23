export function isPrimitive(val: any): boolean {
  return Object(val) !== val;
}

export const isProduction: boolean =
  (typeof globalThis !== "undefined" && 
   "Deno" in globalThis && 
   (globalThis as any).Deno && 
   typeof (globalThis as any).Deno.env !== "undefined"
    ? (globalThis as any).Deno.env.get("NODE_ENV") === "production"
    : typeof import.meta !== "undefined" && (import.meta as any).env?.PROD) ||
  false;

export function removeFromArr(arr: any[], val: any) {
  const index = arr.indexOf(val);
  if (index > -1) {
    arr.splice(index, 1);
  }
}

export function isThenable(val: any): boolean {
  return val && val.then?.call;
}

export function splitFirst(val: string, splitter: string): string[] {
  const idx = val.indexOf(splitter);
  if (idx < 0) return [val];
  const front = val.slice(0, idx);
  const back = val.slice(idx + splitter.length, val.length);
  return [front, back];
}
