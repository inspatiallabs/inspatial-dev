	import { signalLite } from "../../../interact/signal-lite/index.ts";
	import { isProduction, isPrimitive } from "../constant/index.ts";

	export const hotEnabled =
	!isProduction && !!(/* @InSpatial webpack */ import.meta.hot);

	export const KEY_HMRWRAP = Symbol("K_HMRWRAP");
	export const KEY_HMRWRAPPED = Symbol("K_HMRWARPPED");

	const toString = Object.prototype.toString;

	function compareVal(origVal: any, newVal: any): boolean {
	return (
		toString.call(origVal) !== toString.call(newVal) ||
		String(origVal) !== String(newVal)
	);
	}

	function makeHMR(fn) {
	if (typeof fn !== "function") {
		return fn;
	}
	const wrapped = fn.bind(null);
	wrapped[KEY_HMRWRAPPED] = true;
	return wrapped;
	}

	function wrapComponent(fn) {
	const wrapped = signalLite(fn, makeHMR);
	Object.defineProperty(fn, KEY_HMRWRAP, {
		value: wrapped,
		enumerable: false,
	});
	wrapped.name = fn.name;
	wrapped.hot = false;
	return wrapped;
	}

	function handleError(err: any, _: any, { name, hot }: { name: string, hot: boolean }) {
	if (hot) {
		console.error(
		`[InSpatial HMR] Error happened when rendering <${name}>:\n`,
		err
		);
	} else {
		throw err;
	}
	}

	export function enableHMR({
	builtins: any,
	makeDyn: any,
	Component: any,
	createComponentRaw: any,
	}) {
	console.info("InSpatial Ran Hot Module Replacement.");
	return function (tpl: any, props: any, ...children: any[]) {
		let hotLevel = 0;

		if (typeof tpl === "function" && !builtins.has(tpl)) {
		if (tpl[KEY_HMRWRAP]) {
			tpl = tpl[KEY_HMRWRAP];
			hotLevel = 2;
		} else if (!tpl[KEY_HMRWRAPPED]) {
			tpl = wrapComponent(tpl);
			hotLevel = 1;
		}
		}

		if (hotLevel) {
		return new Component(makeDyn(tpl, handleError), props ?? {}, ...children);
		}

		return createComponentRaw(tpl, props, ...children);
	};
	}

	async function update(newModule: any, invalidate: any) {
	newModule = await newModule;
	if (!newModule) {
		return;
	}
	const oldModule = Object.entries(await this);
	for (let [key, origVal] of oldModule) {
		const newVal = newModule[key];

		if (
		typeof origVal === "function" &&
		typeof newVal === "function" &&
		(key === "default" || key[0].toUpperCase() === key[0])
		) {
		let wrapped = origVal[KEY_HMRWRAP];
		if (wrapped) {
			wrapped.hot = true;
		} else {
			wrapped = wrapComponent(origVal);
		}
		if (typeof newVal === "function") {
			Object.defineProperty(newVal, KEY_HMRWRAP, {
			value: wrapped,
			enumerable: false,
			});
		}
		wrapped.value = newVal;
		} else {
		let invalid = false;

		if ((isPrimitive(origVal) || isPrimitive(newVal)) && origVal !== newVal) {
			invalid = true;
		} else {
			invalid = compareVal(origVal, newVal);
			if (!invalid) {
			console.warn(
				`[InSpatial HMR] Export "${key}" does not seem to have changed. Refresh the page manually if neessary.`
			);
			}
		}

		if (invalid) {
			invalidate(`[InSpatial HMR] Non HMR-able export "${key}" changed.`);
		}
		}
	}
	}

	function onDispose(data: any) {
	data[KEY_HMRWRAP] = this;
	}

	export function setup({ data, current, accept, dispose, invalidate }: { data: any, current: any, accept: any, dispose: any, invalidate: any }) {
	if (data?.[KEY_HMRWRAP]) {
		update.call(data[KEY_HMRWRAP], current, invalidate);
	}
	dispose(onDispose.bind(current));
	accept();
	}
