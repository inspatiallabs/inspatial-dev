import {
  collectDisposersLite,
  nextTickLite,
  readLite,
  peekLite,
  watchLite,
  onDisposeLite,
  freezeLite,
  signalLite,
  isSignal,
} from "../../../../interact/signal-lite/index.ts";
  import { hotEnabled, enableHMR, inspatialHMR } from '../../hmr/plugin.ts'
  import { nop, removeFromArr, isThenable, isPrimitive } from '../../../interact/utils/index.ts'
  import { isProduction } from '../../../interact/constants/index.ts'
  
  // Types
  type AnyFunction = (...args: any[]) => any
  type Dispose = (batch?: boolean) => void
  type Renderer = any // You'll need to define the actual renderer interface
  
  interface Context {
    run: <T extends AnyFunction>(fn: T, ...args: Parameters<T>) => [ReturnType<T>, Dispose]
    render: any
    dispose: Dispose
    wrapper: any
    hasExpose: boolean
    self: any
  }
  
  interface ComponentInstance {
    [KEY_CTX]?: Context
  }
  
  interface LazyCache<T = any> {
    cache: T | null
  }
  
  interface ForProps {
    name?: string
    entries: Signal<any[]> | any[]
    track?: string | Signal<string>
    indexed?: boolean
  }
  
  interface IfProps {
    condition?: any
    true?: any
    else?: any
  }
  
  interface FnProps {
    name?: string
    ctx?: any
    catch?: any
  }
  
  interface DynamicProps {
    is: any
    ctx?: any
    $ref?: Signal<any> | ((node: any) => void)
    [key: string]: any
  }
  
  interface AsyncProps {
    future: Promise<any>
    fallback?: any
    catch?: any
    [key: string]: any
  }
  
  interface RenderProps {
    from: Signal<ComponentInstance> | ComponentInstance
  }
  
  const KEY_CTX = Symbol(isProduction ? '' : 'K_Ctx')
  
  let currentCtx: Context | null = null
  
  function _captured<T extends AnyFunction>(
    this: T,
    capturedCtx: Context | null,
    ...args: Parameters<T>
  ): ReturnType<T> {
    const prevCtx = currentCtx
    currentCtx = capturedCtx
  
    try {
      return this(...args)
    } finally {
      currentCtx = prevCtx
    }
  }
  
  function capture<T extends AnyFunction>(fn: T): T {
    return _captured.bind(freeze(fn), currentCtx) as T
  }
  
  function _runInSnapshot<T extends AnyFunction>(
    fn: T,
    ...args: Parameters<T>
  ): ReturnType<T> {
    return fn(...args)
  }
  
  function snapshot(): typeof capture {
    return capture(_runInSnapshot)
  }
  
  function exposeReducer(
    descriptors: PropertyDescriptorMap,
    [key, value]: [string, any]
  ): PropertyDescriptorMap {
    if (isSignal(value)) {
      descriptors[key] = {
        get: value.get.bind(value),
        set: value.set.bind(value),
        enumerable: true,
        configurable: true
      }
    } else {
      descriptors[key] = {
        value,
        enumerable: true,
        configurable: true
      }
    }
  
    return descriptors
  }
  
  function expose(kvObj: Record<string, any>): void {
    if (!currentCtx || isPrimitive(kvObj)) {
      return
    }
  
    const entries = Object.entries(kvObj)
    if (entries.length) {
      currentCtx.hasExpose = true
  
      const descriptors = entries.reduce(exposeReducer, {})
  
      Object.defineProperties(currentCtx.self, descriptors)
  
      if (currentCtx.wrapper) {
        Object.defineProperties(currentCtx.wrapper, descriptors)
      }
    }
  }
  
  function render(instance: ComponentInstance, renderer: Renderer): any {
    const ctx = instance[KEY_CTX]
    if (!ctx) {
      return
    }
  
    const { run, render: renderComponent } = ctx
    if (!renderComponent || typeof renderComponent !== 'function') return renderComponent
  
    return run(renderComponent, renderer)[0]
  }
  
  function dispose(instance: ComponentInstance): void {
    const ctx = instance[KEY_CTX]
    if (!ctx) {
      return
    }
  
    ctx.dispose()
  }
  
  function getCurrentSelf(): any {
    return currentCtx?.self
  }
  
  async function _lazyLoad<T = any>(
    this: LazyCache<T>,
    loader: () => Promise<any>,
    symbol: string | null | undefined,
    ...args: any[]
  ): Promise<any> {
    const run = snapshot()
    if (!this.cache) {
      const result = await loader()
      if ((symbol === undefined || symbol === null) && typeof result === 'function') {
        this.cache = result as T
      } else {
        this.cache = result[symbol ?? 'default']
      }
  
      if (hotEnabled) {
        const component = this.cache as any
        this.cache = function(...args: any[]) {
          return function(R: Renderer) {
            return R.c(component, ...args)
          }
        } as T
      }
    }
  
    return run(this.cache as AnyFunction, ...args)
  }
  
  function lazy<T = any>(
    loader: () => Promise<any>,
    symbol?: string | null
  ): (...args: any[]) => Promise<any> {
    return _lazyLoad.bind({ cache: null } as LazyCache<T>, loader, symbol)
  }
  
  function Fn(
    { name = 'Fn', ctx, catch: catchErr }: FnProps,
    handler?: any,
    handleErr?: any
  ): AnyFunction {
    if (!handler) {
      return nop
    }
  
    if (!catchErr) {
      catchErr = handleErr
    }
  
    const run = currentCtx?.run
  
    if (!run) {
      return nop
    }
  
    return function(R: Renderer) {
      const fragment = R.createFragment(name)
      let currentRender: any = null
      let currentDispose: Dispose | null = null
  
      watch(function() {
        const newHandler = read(handler)
  
        if (!newHandler) {
          currentDispose?.()
          currentRender = currentDispose = null
          return
        }
  
        const newRender = newHandler(ctx)
        if (newRender === currentRender) {
          return
        }
  
        currentRender = newRender
        if (newRender !== undefined && newRender !== null) {
          const prevDispose = currentDispose
          currentDispose = run(function() {
            let newResult: any = null
            let errored = false
            try {
              newResult = R.ensureElement((typeof newRender === 'function') ? newRender(R) : newRender)
            } catch (err) {
              errored = true
              const errorHandler = peek(catchErr)
              if (errorHandler) {
                newResult = R.ensureElement(errorHandler(err, name, ctx))
              } else {
                throw err
              }
            }
  
            if (!errored && prevDispose) {
              prevDispose()
            }
  
            if (newResult !== undefined && newResult !== null) {
              R.appendNode(fragment, newResult)
              onDispose(nextTick.bind(null, R.removeNode.bind(null, newResult)))
            } else {
              if (errored && prevDispose) {
                onDispose(prevDispose)
              }
            }
          })[1]
        } else {
          currentDispose?.()
          currentDispose = null
        }
      })
  
      return fragment
    }
  }
  
  function For(
    { name = 'For', entries, track, indexed }: ForProps,
    itemTemplate: any
  ): AnyFunction {
    let currentData: any[] = []
  
    let kv = track ? new Map<any, any>() : null
    let ks = indexed ? new Map<any, Signal<number>>() : null
    let nodeCache = new Map<any, any>()
    let disposers = new Map<any, Dispose>()
  
    function _clear(): void {
      for (let [, _dispose] of disposers) _dispose(true)
      nodeCache = new Map()
      disposers = new Map()
      if (ks) ks = new Map()
    }
  
    function flushKS(): void {
      if (ks) {
        for (let i = 0; i < currentData.length; i++) {
          const sig = ks.get(currentData[i])
          if (sig) sig.value = i
        }
      }
    }
  
    function getItem(itemKey: any): any {
      return (kv ? kv.get(itemKey) : itemKey)
    }
  
    function remove(itemKey: any): void {
      const itemData = getItem(itemKey)
      removeFromArr(peek(entries), itemData)
      if (isSignal(entries)) {
        entries.trigger()
      }
    }
  
    function clear(): void {
      if (!currentData.length) return
      _clear()
      if (kv) kv = new Map()
      currentData = []
      const entriesValue = isSignal(entries) ? entries.value : entries
      if (entriesValue.length) {
        if (isSignal(entries)) {
          entries.value = []
        }
      }
    }
  
    onDispose(_clear)
  
    expose({
      getItem,
      remove,
      clear
    })
  
    return function(R: Renderer) {
      const fragment = R.createFragment(name)
  
      function getItemNode(itemKey: any): any {
        let node = nodeCache.get(itemKey)
        if (!node) {
          const item = kv ? kv.get(itemKey) : itemKey
          let idxSig = ks ? ks.get(itemKey) : 0
          if (ks && !idxSig) {
            idxSig = signal(0)
            ks.set(itemKey, idxSig)
          }
          const dispose = collectDisposers(
            [],
            function() {
              node = R.c(itemTemplate, { item, index: idxSig })
              nodeCache.set(itemKey, node)
            },
            function(batch?: boolean) {
              if (!batch) {
                nodeCache.delete(itemKey)
                disposers.delete(itemKey)
                if (ks) ks.delete(itemKey)
                if (kv) kv.delete(itemKey)
              }
              if (node) R.removeNode(node)
            }
          )
          disposers.set(itemKey, dispose)
        }
        return node
      }
  
      // eslint-disable-next-line complexity
      watch(function() {
        /* eslint-disable max-depth */
        const data = read(entries)
        if (!data || !data.length) return clear()
  
        let oldData = currentData
        if (track) {
          kv = new Map()
          const key = read(track)
          currentData = data.map(function(i: any) {
            const itemKey = i[key]
            kv!.set(itemKey, i)
            return itemKey
          })
        } else currentData = [...data]
  
        let newData: any[] | null = null
  
        if (oldData.length) {
          const obsoleteDataKeys = [...new Set([...currentData, ...oldData])].slice(currentData.length)
  
          if (obsoleteDataKeys.length === oldData.length) {
            _clear()
            newData = currentData
          } else {
            if (obsoleteDataKeys.length) {
              for (let oldItemKey of obsoleteDataKeys) {
                disposers.get(oldItemKey)?.()
                removeFromArr(oldData, oldItemKey)
              }
            }
  
            const newDataKeys = [...new Set([...oldData, ...currentData])].slice(oldData.length)
            const hasNewKeys = !!newDataKeys.length
  
            let newDataCursor = 0
  
            while (newDataCursor < currentData.length) {
  
              if (!oldData.length) {
                if (newDataCursor) newData = currentData.slice(newDataCursor)
                break
              }
  
              const frontSet: any[][] = []
              const backSet: any[][] = []
  
              let frontChunk: any[] = []
              let backChunk: any[] = []
  
              let prevChunk = frontChunk
  
              let oldDataCursor = 0
              let oldItemKey = oldData[0]
  
              let newItemKey = currentData[newDataCursor]
  
              while (oldDataCursor < oldData.length) {
                const isNewKey = hasNewKeys && newDataKeys.includes(newItemKey)
                if (isNewKey || oldItemKey === newItemKey) {
                  if (prevChunk !== frontChunk) {
                    backSet.push(backChunk)
                    backChunk = []
                    prevChunk = frontChunk
                  }
  
                  frontChunk.push(newItemKey)
  
                  if (isNewKey) {
                    R.insertBefore(getItemNode(newItemKey), getItemNode(oldItemKey))
                  } else {
                    oldDataCursor += 1
                    oldItemKey = oldData[oldDataCursor]
                  }
                  newDataCursor += 1
                  newItemKey = currentData[newDataCursor]
                } else {
                  if (prevChunk !== backChunk) {
                    frontSet.push(frontChunk)
                    frontChunk = []
                    prevChunk = backChunk
                  }
                  backChunk.push(oldItemKey)
                  oldDataCursor += 1
                  oldItemKey = oldData[oldDataCursor]
                }
              }
  
              if (prevChunk === frontChunk) {
                frontSet.push(frontChunk)
              }
  
              backSet.push(backChunk)
              frontSet.shift()
  
              for (let i = 0; i < frontSet.length; i++) {
                const fChunk = frontSet[i]
                const bChunk = backSet[i]
  
                if (fChunk.length <= bChunk.length) {
                  const beforeAnchor = getItemNode(bChunk[0])
                  backSet[i + 1] = bChunk.concat(backSet[i + 1])
                  bChunk.length = 0
  
                  for (let itemKey of fChunk) {
                    R.insertBefore(getItemNode(itemKey), beforeAnchor)
                  }
                } else if (backSet[i + 1].length) {
                  const beforeAnchor = getItemNode(backSet[i + 1][0])
                  for (let itemKey of bChunk) {
                    R.insertBefore(getItemNode(itemKey), beforeAnchor)
                  }
                } else {
                  R.appendNode(fragment, ...bChunk.map(getItemNode))
                }
              }
  
              oldData = ([] as any[]).concat(...backSet)
            }
          }
        } else {
          newData = currentData
        }
  
        if (newData) {
          for (let newItemKey of newData) {
            const node = getItemNode(newItemKey)
            if (node) R.appendNode(fragment, node)
          }
        }
  
        flushKS()
      })
  
      return fragment
    }
  }
  
  function If(
    { condition, true: trueCondition, else: otherwise }: IfProps,
    trueBranch?: any,
    falseBranch?: any
  ): any {
    if (otherwise) {
      falseBranch = otherwise
    }
    if (trueCondition) {
      condition = trueCondition
    }
  
    if (isSignal(condition)) {
      return Fn({ name: 'If' }, function() {
        if (condition.value) return trueBranch
        else return falseBranch
      })
    }
  
    if (typeof condition === 'function') {
      return Fn({ name: 'If' }, function() {
        if (condition()) {
          return trueBranch
        } else {
          return falseBranch
        }
      })
    }
  
    if (condition) return trueBranch
    return falseBranch
  }
  
  function _dynContainer(
    this: any,
    name: string,
    catchErr: any,
    ctx: any,
    { $ref, ...props }: DynamicProps,
    ...children: any[]
  ): any {
    const self = currentCtx!.self
  
    let syncRef: ((node: any) => void) | null = null
  
    if ($ref) {
      if (isSignal($ref)) {
        syncRef = function(node: any) {
          $ref.value = node
        }
      } else if (typeof $ref === 'function') {
        syncRef = $ref
      } else if (!isProduction) {
        throw new Error(`Invalid $ref type: ${typeof $ref}`)
      }
    }
  
    let oldCtx: Context | null = null
    props.$ref = (newInstance: ComponentInstance) => {
      if (oldCtx) {
        oldCtx.wrapper = null
        oldCtx = null
      }
  
      const newCtx = newInstance?.[KEY_CTX]
      if (newCtx) {
        if (newCtx.hasExpose) {
          const extraKeys = Object.getOwnPropertyDescriptors(newInstance)
          delete extraKeys[KEY_CTX]
          Object.defineProperties(self, extraKeys)
        }
  
        newCtx.wrapper = self
        oldCtx = newCtx
      }
  
      syncRef?.(newInstance)
    }
  
    let current: any = null
    let renderFn: any = null
  
    return Fn({ name, ctx }, () => {
      const component = read(this)
      if (current === component) {
        return renderFn
      }
  
      if (component === undefined || component === null) {
        return (current = renderFn = null)
      }
  
      current = component
      renderFn = function(R: Renderer) {
        return R.c(component, props, ...children)
      }
  
      return renderFn
    }, catchErr)
  }
  
  function Dynamic(
    { is, ctx, ...props }: DynamicProps,
    ...children: any[]
  ): any {
    props.$ref = signal()
    expose({
      current: props.$ref
    })
    return _dynContainer.call(is, 'Dynamic', null, ctx, props, ...children)
  }
  
  function _asyncContainer(
    this: Promise<any>,
    name: string,
    fallback: any,
    catchErr: any,
    props: Record<string, any>,
    ...children: any[]
  ): any {
    const self = getCurrentSelf()
    const component = signal()
    let currentDispose: Dispose | null = null
  
    const inputFuture = Promise.resolve(this)
    const resolvedFuture = inputFuture.then(capture(function(result: any) {
      if (self[KEY_CTX]) {
        currentDispose?.()
        currentDispose = watch(function() {
          component.value = read(result)
        })
      }
    }))
  
    if (catchErr) {
      resolvedFuture.catch(capture(function(error: any) {
        if (self[KEY_CTX]) {
          currentDispose?.()
          currentDispose = watch(function () {
            const handler = read(catchErr)
            if (handler) {
              if (typeof handler === 'function') {
                component.value = handler({ ...props, error }, ...children)
              } else {
                component.value = handler
              }
            }
          })
        }
      }))
    }
  
    if (fallback) {
      nextTick(capture(function() {
        if (self[KEY_CTX] && !component.peek()) {
          currentDispose?.()
          currentDispose = watch(function () {
            const handler = read(fallback)
            if (handler) {
              if (typeof handler === 'function') {
                component.value = handler({ ...props }, ...children)
              } else {
                component.value = handler
              }
            }
          })
        }
      }))
    }
  
    return Fn({ name }, function() {
      return component.value
    })
  }
  
  function Async(
    { future, fallback, catch: catchErr, ...props }: AsyncProps,
    then?: any,
    now?: any,
    handleErr?: any
  ): any {
    future = Promise.resolve(future).then(capture(function(result: any) {
      return Fn({ name: 'Then' }, () => {
        const handler = read(then)
        return then?.({ ...props, result })
      })
    }))
    return _asyncContainer.call(future, 'Async', fallback ?? now, catchErr ?? handleErr, props)
  }
  
  function Render({ from }: RenderProps): AnyFunction {
    return function(R: Renderer) {
      return R.c(Fn, { name: 'Render' }, function() {
        const instance = read(from)
        if (instance !== null && instance !== undefined) return render(instance, R)
      })
    }
  }
  
  class Component implements ComponentInstance {
    [KEY_CTX]?: Context
  
    constructor(tpl: AnyFunction, props: Record<string, any>, ...children: any[]) {
      const ctx: Context = {
        run: null as any,
        render: null,
        dispose: null as any,
        wrapper: null,
        hasExpose: false,
        self: this
      }
  
      const prevCtx = currentCtx
      currentCtx = ctx
  
      const disposers: Dispose[] = []
  
      ctx.run = capture(function<T extends AnyFunction>(
        fn: T,
        ...args: Parameters<T>
      ): [ReturnType<T>, Dispose] {
        let result: ReturnType<T>
        const cleanup = collectDisposers([], function() {
          result = fn(...args)
        }, function(batch?: boolean) {
          if (!batch) {
            removeFromArr(disposers, cleanup)
          }
        })
        disposers.push(cleanup)
        return [result!, cleanup]
      })
  
      try {
        ctx.dispose = collectDisposers(disposers, function() {
          let renderFn = tpl(props, ...children)
          if (isThenable(renderFn)) {
            const { fallback, catch: catchErr, ..._props } = props
            renderFn = _asyncContainer.call(renderFn, 'Future', fallback, catchErr, _props, ...children)
          }
          ctx.render = renderFn
        }, () => {
          Object.defineProperty(this, KEY_CTX, {
            value: null,
            enumerable: false
          })
        })
      } catch (error) {
        for (let i of disposers) i(true)
        throw error
      } finally {
        currentCtx = prevCtx
      }
  
      Object.defineProperty(this, KEY_CTX, {
        value: ctx,
        enumerable: false,
        configurable: true
      })
    }
  }
  
  const emptyProp = { $ref: null }
  
  const createComponent = (function() {
    function createComponentRaw(
      tpl: any,
      props?: Record<string, any>,
      ...children: any[]
    ): Component {
      if (isSignal(tpl)) {
        return new Component(_dynContainer.bind(tpl, 'Signal', null, null), props ?? {}, ...children)
      }
      const { $ref, ..._props } = (props ?? emptyProp)
      const component = new Component(tpl, _props, ...children)
      if ($ref) {
        if (isSignal($ref)) {
          $ref.value = component
        } else if (typeof $ref === 'function') {
          $ref(component)
        } else if (!isProduction) {
          throw new Error(`Invalid $ref type: ${typeof $ref}`)
        }
      }
      return component
    }
  
    if (hotEnabled) {
      const builtins = new WeakSet([Fn, For, If, Dynamic, Async, Render, Component])
      function makeDyn(tpl: any, handleErr: any) {
        return _dynContainer.bind(tpl, null, handleErr, tpl)
      }
      return enableHMR({ builtins, makeDyn, Component, createComponentRaw })
    }
  
    return createComponentRaw
  })()
  
  export {
    capture,
    snapshot,
    expose,
    render,
    dispose,
    getCurrentSelf,
    lazy,
    Fn,
    For,
    If,
    Dynamic,
    Async,
    Render,
    Component,
    createComponent
  }
  
  export type {
    Context,
    ComponentInstance,
    ForProps,
    IfProps,
    FnProps,
    DynamicProps,
    AsyncProps,
    RenderProps
  }