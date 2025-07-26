const BEGIN = "/* ---- BEGIN INSPATIAL HOT RELOAD INJECT ---- */";
const END = "/* ----  END INSPATIAL HOT RELOAD INJECT  ---- */";

interface LoaderContext {
	resourcePath: string;
	getOptions?(): LoaderOptions | undefined;
}

interface LoaderOptions {
	importSource?: string;
	importSourcePath?: string;
}

function inSpatialHotReload(this: LoaderContext, source: string): string {
	if (source.includes(BEGIN)) return source;

	const { importSource = "./index.ts", importSourcePath } =
		this.getOptions?.() || {};

	let code = source.replace(
		/\s*\/\*\s*@inspatial\s+webpack\s*\*\/\s*import\.meta\.hot/g,
		"import.meta.webpackHot"
	);

	if (this.resourcePath === importSourcePath) {
		return code;
	}

	const snippet = `${BEGIN}
if (import.meta.webpackHot) {
	import("${importSource}").then(m => m.setup({
		data: import.meta.webpackHot.data,
		current: import(${JSON.stringify(this.resourcePath)}),
		accept() { import.meta.webpackHot.accept() },
		dispose(cb) { import.meta.webpackHot.dispose(cb) },
		invalidate(reason) { import.meta.webpackHot.decline(reason) }
	}));
}
${END}
`;
	code += `\n\n${snippet}`;

	return code;
}

export default inSpatialHotReload; 