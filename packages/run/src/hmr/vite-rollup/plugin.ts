import { env } from "../../env/get.ts";
import { createFilter, type FilterPattern, DEFAULT_INCLUDE_PATTERNS } from "../utils.ts";

const BEGIN = "/* ---- BEGIN INSPATIAL HOT RELOAD INJECT ---- */";
const END = "/* ----  END INSPATIAL HOT RELOAD INJECT  ---- */";

interface InSpatialPluginOptions {
	include?: FilterPattern;
	exclude?: FilterPattern;
	importSource?: string;
	enabled?: boolean;
}

interface TransformResult {
	code: string;
	map: any;
}

interface RollupPluginContext {
	meta: {
		watchMode?: boolean;
	};
}

interface ViteRollupPlugin {
	name: string;
	apply?: string;
	buildStart?(this: RollupPluginContext, options: any, inputOptions?: any): void;
	transform?(code: string, id: string): TransformResult | null;
}

export function InSpatial(options: InSpatialPluginOptions = {}): ViteRollupPlugin | undefined {
	const {
		include = DEFAULT_INCLUDE_PATTERNS,
		exclude,
		importSource = "../../../../src/hmr/hot-reload/index.ts",
	} = options;

	const filter = createFilter(include, exclude);

	const enabled = options.enabled ?? !env.isProduction();
	if (!enabled) return;

	// pre–serve only for Vite; for plain Rollup we check `command`
	const apply = "serve"; // Vite hint
	let isBuild = false; // Rollup flag

	const snippet = `${BEGIN}
if (import.meta.hot) {
	import("${importSource}").then(({setup}) => setup({
		data: import.meta.hot.data,
		current: import(/* @vite-ignore */import.meta.url),
		accept() { import.meta.hot.accept() },
		dispose(cb) {	import.meta.hot.dispose(cb)	},
		invalidate(reason) {
			if (import.meta.hot.invalidate) {
				import.meta.hot.invalidate(reason)
			} else {
				location.reload()
			}
		}
	}))
}
${END}
`;

	return {
		name: "InSpatial",
		apply,

		// Rollup-only: record whether we are running a production build
		buildStart(this: RollupPluginContext, _: any, inputOptions?: any): void {
			// inputOptions is undefined in Vite; OK
			if (inputOptions) {
				// rollup passes `{command: 'build'|'serve'}`
				isBuild = this.meta.watchMode === false; // equals "rollup -c" build
			}
		},

		transform(code: string, id: string): TransformResult | null {
			if (!filter(id)) return null; // wrong file type
			if (isBuild) return null; // production build – skip
			if (code.includes(BEGIN)) return null; // already injected

			return {
				code: `${code}\n\n${snippet}`,
				map: null,
			};
		},
	};
} 