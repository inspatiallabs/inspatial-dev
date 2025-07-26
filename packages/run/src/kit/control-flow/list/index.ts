import {
  type SignalValueType,
  type SignalDisposerFunctionType,
  peek,
  type Signal,
  onDispose,
  createSignal,
  collectDisposers,
  watch,
  read,
} from "../../../signal.ts";
import { removeFromArr } from "../../../utils.ts";
import {
  type ComponentFunction,
  exposeComponent,
} from "../../component/index.ts";
import { type RenderFunction } from "../render/index.ts";

export interface ListProps<T = any> {
  name?: string;
  each: SignalValueType<T[]>;
  track?: SignalValueType<keyof T>;
  indexed?: boolean;
  unkeyed?: boolean;
}

export function List<T>(
  props: ListProps<T>,
  itemTemplate: ComponentFunction
): RenderFunction {
  const { name = "List", each, track, indexed, unkeyed } = props;
  let currentData: any[] = [];

  let kv = track && new Map();
  let ks = indexed && new Map();
  let nodeCache = new Map();
  let disposers = new Map<any, SignalDisposerFunctionType>();

  // Unkeyed-specific state
  let rawSigEntries: Signal[] = [];
  let sigEntries: Signal | null = null;

  function _clear(): void {
    for (const [, _dispose] of Array.from(disposers)) _dispose(true);
    nodeCache = new Map();
    disposers = new Map();
    if (ks) ks = new Map();
    if (unkeyed) {
      rawSigEntries = [];
      if (sigEntries) sigEntries = createSignal([]);
    }
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
    removeFromArr(peek(each), itemData);
    (each as Signal).trigger();
  }

  function clear(): void {
    if (!currentData.length) return;
    _clear();
    if (kv) kv = new Map();
    currentData = [];
    if ((each as Signal).value?.length) (each as Signal).value = [];
  }

  onDispose(_clear);

  exposeComponent({
    getItem,
    remove,
    clear,
  });

  // Initialize unkeyed signals if needed
  if (unkeyed) {
    sigEntries = createSignal(rawSigEntries);

    watch(function () {
      const rawEntries = read(each);
      const oldLength = rawSigEntries.length;
      rawSigEntries.length = rawEntries.length;
      for (let i in rawEntries) {
        if (rawSigEntries[i]) rawSigEntries[i].value = rawEntries[i];
        else rawSigEntries[i] = createSignal(rawEntries[i]);
      }

      if (oldLength !== rawEntries.length) sigEntries!.trigger();
    });
  }

  return function (R: any) {
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

    // Special handling for unkeyed mode
    if (unkeyed) {
      watch(function () {
        const data = read(sigEntries!);
        if (!data || !data.length) return clear();

        currentData = [...data];

        // Clear existing nodes
        for (const [, _dispose] of Array.from(disposers)) _dispose(true);
        nodeCache = new Map();
        disposers = new Map();
        if (ks) ks = new Map();

        // Create nodes for all items
        for (let i = 0; i < currentData.length; i++) {
          const itemKey = i;
          const item = currentData[i];
          let idxSig = ks ? createSignal(i) : i;
          if (ks) ks.set(itemKey, idxSig);

          const dispose = collectDisposers(
            [],
            function () {
              const node = R.c(itemTemplate, { item, index: idxSig });
              nodeCache.set(itemKey, node);
              R.appendNode(fragment, node);
            },
            function (batch?: boolean) {
              if (!batch) {
                nodeCache.delete(itemKey);
                disposers.delete(itemKey);
                if (ks) ks.delete(itemKey);
              }
              const node = nodeCache.get(itemKey);
              if (node) R.removeNode(node);
            }
          );
          disposers.set(itemKey, dispose);
        }
      });

      return fragment;
    }

    // Original List logic for keyed/tracked mode
    // eslint-disable-next-line complexity
    watch(function () {
      /* eslint-disable max-depth */
      const data = read(each);
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
        const obsoleteDataKeys = Array.from(
          new Set([...currentData, ...oldData])
        ).slice(currentData.length);

        if (obsoleteDataKeys.length === oldData.length) {
          _clear();
          newData = currentData;
        } else {
          if (obsoleteDataKeys.length) {
            for (let oldItemKey of obsoleteDataKeys) {
              disposers.get(oldItemKey)!();
              removeFromArr(oldData, oldItemKey);
            }
          }

          const newDataKeys = Array.from(
            new Set([...oldData, ...currentData])
          ).slice(oldData.length);
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