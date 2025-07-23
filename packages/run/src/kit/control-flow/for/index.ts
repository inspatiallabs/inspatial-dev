import {
  peek,
  isSignal,
  onDispose,
  createSignal,
  collectDisposers,
  watch,
  read,
  type Signal,
} from "@in/teract/signal-lite";
import { removeFromArr } from "../../../constant/index.ts";
import { expose } from "../../component/index.ts";
import type { AnyFunction, Dispose, Renderer } from "../../type.ts";

/*#################################(Types)#################################*/
export interface ForProps {
  name?: string;
  entries: Signal<any[]> | any[];
  track?: string | Signal<string>;
  indexed?: boolean;
}

/*#################################(For)#################################*/
export function For(
  { name = "For", entries, track, indexed }: ForProps,
  itemTemplate: any
): AnyFunction {
  let currentData: any[] = [];

  let kv = track ? new Map<any, any>() : null;
  let ks = indexed ? new Map<any, Signal<number>>() : null;
  let nodeCache = new Map<any, any>();
  let disposers = new Map<any, Dispose>();

  function _clear(): void {
    // deno-lint-ignore prefer-const
    for (let [, _dispose] of disposers) _dispose(true);
    nodeCache = new Map();
    disposers = new Map();
    if (ks) ks = new Map();
  }

  function flushKS(): void {
    if (ks) {
      for (let i = 0; i < currentData.length; i++) {
        const sig = ks.get(currentData[i]);
        if (sig) sig.value = i;
      }
    }
  }

  function getItem(itemKey: any): any {
    return kv ? kv.get(itemKey) : itemKey;
  }

  function remove(itemKey: any): void {
    const itemData = getItem(itemKey);
    removeFromArr(peek(entries), itemData);
    if (isSignal(entries)) {
      entries.trigger();
    }
  }

  function clear(): void {
    if (!currentData.length) return;
    _clear();
    if (kv) kv = new Map();
    currentData = [];
    const entriesValue = isSignal(entries) ? entries.value : entries;
    if (entriesValue.length) {
      if (isSignal(entries)) {
        entries.value = [];
      }
    }
  }

  onDispose(_clear);

  expose({
    getItem,
    remove,
    clear,
  });

  return function (R: Renderer) {
    const fragment = R.createFragment(name);

    function getItemNode(itemKey: any): any {
      let node = nodeCache.get(itemKey);
      if (!node) {
        const item = kv ? kv.get(itemKey) : itemKey;
        let idxSig = ks ? ks.get(itemKey) : 0;
        if (ks && !idxSig) {
          idxSig = createSignal(0);
          ks.set(itemKey, idxSig);
        }
        const dispose = collectDisposers(
          [],
          function () {
            node = R.c(itemTemplate, { item, index: idxSig });
            nodeCache.set(itemKey, node);
          },
          function (batch?: boolean) {
            if (!batch) {
              nodeCache.delete(itemKey);
              disposers.delete(itemKey);
              if (ks) ks.delete(itemKey);
              if (kv) kv.delete(itemKey);
            }
            if (node) R.removeNode(node);
          }
        );
        disposers.set(itemKey, dispose);
      }
      return node;
    }

    // eslint-disable-next-line complexity
    watch(function () {
      /* eslint-disable max-depth */
      const data = read(entries);
      if (!data || !data.length) return clear();

      let oldData = currentData;
      if (track) {
        kv = new Map();
        const key = read(track);
        currentData = data.map(function (i: any) {
          const itemKey = i[key];
          kv!.set(itemKey, i);
          return itemKey;
        });
      } else currentData = [...data];

      let newData: any[] | null = null;

      if (oldData.length) {
        const obsoleteDataKeys = [
          ...new Set([...currentData, ...oldData]),
        ].slice(currentData.length);

        if (obsoleteDataKeys.length === oldData.length) {
          _clear();
          newData = currentData;
        } else {
          if (obsoleteDataKeys.length) {
            for (let oldItemKey of obsoleteDataKeys) {
              disposers.get(oldItemKey)?.();
              removeFromArr(oldData, oldItemKey);
            }
          }

          const newDataKeys = [...new Set([...oldData, ...currentData])].slice(
            oldData.length
          );
          const hasNewKeys = !!newDataKeys.length;

          let newDataCursor = 0;

          while (newDataCursor < currentData.length) {
            if (!oldData.length) {
              if (newDataCursor) newData = currentData.slice(newDataCursor);
              break;
            }

            const frontSet: any[][] = [];
            const backSet: any[][] = [];

            let frontChunk: any[] = [];
            let backChunk: any[] = [];

            let prevChunk = frontChunk;

            let oldDataCursor = 0;
            let oldItemKey = oldData[0];

            let newItemKey = currentData[newDataCursor];

            while (oldDataCursor < oldData.length) {
              const isNewKey = hasNewKeys && newDataKeys.includes(newItemKey);
              if (isNewKey || oldItemKey === newItemKey) {
                if (prevChunk !== frontChunk) {
                  backSet.push(backChunk);
                  backChunk = [];
                  prevChunk = frontChunk;
                }

                frontChunk.push(newItemKey);

                if (isNewKey) {
                  R.insertBefore(
                    getItemNode(newItemKey),
                    getItemNode(oldItemKey)
                  );
                } else {
                  oldDataCursor += 1;
                  oldItemKey = oldData[oldDataCursor];
                }
                newDataCursor += 1;
                newItemKey = currentData[newDataCursor];
              } else {
                if (prevChunk !== backChunk) {
                  frontSet.push(frontChunk);
                  frontChunk = [];
                  prevChunk = backChunk;
                }
                backChunk.push(oldItemKey);
                oldDataCursor += 1;
                oldItemKey = oldData[oldDataCursor];
              }
            }

            if (prevChunk === frontChunk) {
              frontSet.push(frontChunk);
            }

            backSet.push(backChunk);
            frontSet.shift();

            for (let i = 0; i < frontSet.length; i++) {
              const fChunk = frontSet[i];
              const bChunk = backSet[i];

              if (fChunk.length <= bChunk.length) {
                const beforeAnchor = getItemNode(bChunk[0]);
                backSet[i + 1] = bChunk.concat(backSet[i + 1]);
                bChunk.length = 0;

                for (let itemKey of fChunk) {
                  R.insertBefore(getItemNode(itemKey), beforeAnchor);
                }
              } else if (backSet[i + 1].length) {
                const beforeAnchor = getItemNode(backSet[i + 1][0]);
                for (let itemKey of bChunk) {
                  R.insertBefore(getItemNode(itemKey), beforeAnchor);
                }
              } else {
                R.appendNode(fragment, ...bChunk.map(getItemNode));
              }
            }

            oldData = ([] as any[]).concat(...backSet);
          }
        }
      } else {
        newData = currentData;
      }

      if (newData) {
        for (let newItemKey of newData) {
          const node = getItemNode(newItemKey);
          if (node) R.appendNode(fragment, node);
        }
      }

      flushKS();
    });

    return fragment;
  };
}
