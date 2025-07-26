// eslint-disable-next-line no-empty-function
export function nop(): void {}

export function cached<T, R>(handler: (arg: T) => R): (arg: T) => R {
	const store = new Map<T, R>()
	return function(arg: T): R {
		let val = store.get(arg)
		if (val === undefined) {
			val = handler(arg)
			store.set(arg, val)
		}
		return val
	}
}

export function cachedStrKeyNoFalsy<T>(handler: (key: string) => T): (key: string) => T {
	const store: Record<string, T> = Object.create(null)
	return function(key: string): T {
		return (store[key] || (store[key] = handler(key)))
	}
}

export function removeFromArr<T>(arr: T[], val: T): void {
  const index = arr.indexOf(val)
  if (index > -1) {
    arr.splice(index, 1)
  }
}

export function isPrimitive(val: unknown): val is string | number | boolean | null | undefined | symbol | bigint {
	return Object(val) !== val
}

export function isThenable<T = unknown>(val: unknown): val is Promise<T> | { then: (onFulfilled?: (value: unknown) => T | PromiseLike<T>) => PromiseLike<T> } {
	return Boolean(val && typeof (val as any).then === 'function')
}

export function splitFirst(val: string, splitter: string): [string] | [string, string] {
	const idx = val.indexOf(splitter)
	if (idx < 0) return [val]
	const front = val.slice(0, idx)
	const back = val.slice(idx + splitter.length, val.length)
	return [front, back]
} 