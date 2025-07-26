/**
 * @fileoverview Shared utilities for HMR plugins
 * @module @inspatial/run/hmr/utils
 */

/**
 * Filter pattern types for file inclusion/exclusion
 */
export type FilterPattern = string | RegExp | Array<string | RegExp>;

/**
 * Filter function interface
 */
export interface FilterFunction {
	(id: string): boolean;
}

/**
 * Creates a filter function for file inclusion/exclusion based on glob patterns
 * 
 * @param include - Patterns to include (defaults to include all)
 * @param exclude - Patterns to exclude
 * @returns Filter function that returns true if file should be included
 * 
 * @example
 * ```typescript
 * // Include only TypeScript files, exclude node_modules
 * const filter = createFilter(
 *   ["**\/*.ts", "**\/*.tsx"],
 *   ["**\/node_modules\/**"]
 * );
 * 
 * console.log(filter("src/app.tsx")); // true
 * console.log(filter("node_modules\/lib.js")); // false
 * ```
 */
export function createFilter(include: FilterPattern = [], exclude: FilterPattern = []): FilterFunction {
	const includePatterns = Array.isArray(include) ? include : [include];
	const excludePatterns = Array.isArray(exclude) ? exclude : [exclude];

	// Convert glob patterns to regex
	function globToRegex(pattern: string | RegExp): RegExp {
		if (pattern instanceof RegExp) {
			return pattern;
		}
		return new RegExp(
			pattern
				.replace(/\./g, "\\.")
				.replace(/\*\*/g, ".*")
				.replace(/\*/g, "[^/]*")
				.replace(/\?/g, "[^/]")
		);
	}

	const includeRegexes = includePatterns.map(globToRegex);
	const excludeRegexes = excludePatterns.map(globToRegex);

	return function filter(id: string): boolean {
		// Check excludes first
		if (excludeRegexes.some((regex) => regex.test(id))) {
			return false;
		}

		// If no includes specified, include everything (that's not excluded)
		if (includePatterns.length === 0) {
			return true;
		}

		// Check includes
		return includeRegexes.some((regex) => regex.test(id));
	};
}

/**
 * Default file patterns for InSpatial HMR
 */
export const DEFAULT_INCLUDE_PATTERNS: string[] = ["**/*.jsx", "**/*.tsx", "**/*.mdx"]; 