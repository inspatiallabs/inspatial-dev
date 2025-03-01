import { validateGoogleFont } from "./validate.ts";
import { googleFontAxes } from "./axes.ts";
import { getGoogleFontsUrl } from "./font-url.ts";
import { findFontFilesInCss } from "./find.ts";
import { getFallbackMetrics } from "./fallback-metrics.ts";
import { fetchStylesheet } from "./fetch-css.ts";
import { fetchFont } from "./fetch-font.ts";
import { FontLoader, AdjustFontFallback } from "./types.ts";

const styleCache = new Map<string, string | null>();
const fontCache = new Map<string, Uint8Array | null>();

const reHasRegExp = /[|\\{}()[\]^$+*?.-]/;
const reReplaceRegExp = /[|\\{}()[\]^$+*?.-]/g;

function escapeStringRegexp(str: string) {
  if (reHasRegExp.test(str)) {
    return str.replace(reReplaceRegExp, "\\$&");
  }
  return str;
}

/**
 * A loader for Google Fonts that downloads and processes font files for self-hosting.
 * This loader fetches font files from Google Fonts, converts them to a self-hosted format,
 * and provides CSS with updated font-face declarations.
 *
 * @param {Object} options - The configuration options for the font loader
 * @param {string} options.functionName - The name of the function being called (used for error messages)
 * @param {string} options.variableName - Variable name for CSS variable support
 * @param {Array<Object>} options.data - Array containing font configuration object
 * @param {Function} options.emitFontFile - Function to handle font file emission
 * @param {Function} options.resolve - Function to resolve file paths
 * @param {boolean} options.isDev - Whether the loader is running in development mode
 * @param {boolean} options.isServer - Whether the loader is running on the server
 * @param {Object} options.loaderContext - Context object for the loader
 * @param {Deno} [options.denoInstance] - Optional custom Deno instance for environment variables
 *
 * @returns {Promise<Object>} A promise that resolves to an object containing:
 * - css: The processed CSS with self-hosted font URLs
 * - fallbackFonts: Array of fallback font families
 * - variable: CSS variable name if CSS variables are used
 * - adjustFontFallback: Font metrics for fallback adjustment
 * - weight: Font weight if a single weight is used
 * - style: Font style if a single style is used
 *
 * @example
 * // Basic usage with a single font weight
 * const result = await googleFont({
 *   functionName: 'GoogleFont',
 *   variableName: '--font-roboto',
 *   data: [{
 *     fontFamily: 'Roboto',
 *     weights: ['400'],
 *     styles: ['normal'],
 *     display: 'swap',
 *     preload: true,
 *     subsets: ['latin'],
 *     adjustFontFallback: true
 *   }],
 *   emitFontFile: (content, ext, preload) => {
 *     // Save font file and return public URL
 *     return `/fonts/roboto-${preload ? 'preload-' : ''}${Date.now()}.${ext}`;
 *   },
 *   resolve: (src) => src,
 *   isDev: true,
 *   isServer: true,
 *   loaderContext: {}
 * });
 *
 * @example
 * // Usage with variable fonts and multiple weights
 * const result = await googleFont({
 *   functionName: 'GoogleFont',
 *   variableName: '--font-inter',
 *   data: [{
 *     fontFamily: 'Inter',
 *     weights: ['variable'],
 *     styles: ['normal'],
 *     display: 'swap',
 *     preload: true,
 *     subsets: ['latin'],
 *     adjustFontFallback: true,
 *     variable: '--font-inter',
 *     selectedVariableAxes: ['wght']
 *   }],
 *   emitFontFile: (content, ext, preload, isUsingSizeAdjust) => {
 *     // Example of handling variable fonts
 *     const prefix = isUsingSizeAdjust ? 'adjusted-' : '';
 *     return `/fonts/inter-${prefix}${preload ? 'preload-' : ''}${Date.now()}.${ext}`;
 *   },
 *   resolve: (src) => src,
 *   isDev: true,
 *   isServer: true,
 *   loaderContext: {}
 * });
 *
 * @example
 * // Usage with custom Deno instance and proxy support
 * const denoInstance = {
 *   env: new Map([
 *     ['https_proxy', 'http://proxy.example.com:8080'],
 *     ['NEXT_FONT_GOOGLE_MOCKED_RESPONSES', '/path/to/mocks.json']
 *   ])
 * };
 *
 * const result = await googleFont({
 *   functionName: 'GoogleFont',
 *   data: [{
 *     fontFamily: 'Roboto',
 *     weights: ['400', '700'],
 *     styles: ['normal', 'italic'],
 *     display: 'swap',
 *     preload: true,
 *     subsets: ['latin', 'latin-ext'],
 *     adjustFontFallback: true
 *   }],
 *   emitFontFile: (content, ext, preload) => `/fonts/font-${Date.now()}.${ext}`,
 *   resolve: (src) => src,
 *   isDev: true,
 *   isServer: true,
 *   loaderContext: {},
 *   denoInstance
 * });
 *
 * @example
 * // Error handling in development mode
 * try {
 *   const result = await googleFont({
 *     functionName: 'GoogleFont',
 *     data: [{
 *       fontFamily: 'NonexistentFont',
 *       weights: ['400'],
 *       styles: ['normal'],
 *       display: 'swap'
 *     }],
 *     emitFontFile: (content, ext) => `/fonts/font.${ext}`,
 *     resolve: (src) => src,
 *     isDev: true,
 *     isServer: true,
 *     loaderContext: {}
 *   });
 * } catch (error) {
 *   // In development, falls back to system fonts
 *   console.error('Font loading failed:', error);
 * }
 *
 * @throws {Error} Throws an error if font fetching fails in production mode
 * @throws {Error} Throws an error if the font configuration is invalid
 * @throws {Error} Throws an error if required options are missing
 */
export const googleFont: FontLoader = async ({
  functionName,
  data,
  emitFontFile,
  isDev,
  isServer,
  denoInstance,
}) => {
  const {
    fontFamily,
    weights,
    styles,
    display,
    preload,
    selectedVariableAxes,
    fallback,
    adjustFontFallback,
    variable,
    subsets,
  } = validateGoogleFont(functionName, data[0]);

  const fontAxes = googleFontAxes(
    fontFamily,
    weights,
    styles,
    selectedVariableAxes
  );

  const url = getGoogleFontsUrl(fontFamily, fontAxes, display);

  const adjustFontFallbackMetrics: AdjustFontFallback | undefined =
    adjustFontFallback ? getFallbackMetrics(fontFamily) : undefined;

  const result = {
    fallbackFonts: fallback,
    weight:
      weights.length === 1 && weights[0] !== "variable"
        ? weights[0]
        : undefined,
    style: styles.length === 1 ? styles[0] : undefined,
    variable,
    adjustFontFallback: adjustFontFallbackMetrics,
  };

  try {
    const hasCachedCSS = styleCache.has(url);
    let fontFaceDeclarations = hasCachedCSS
      ? styleCache.get(url)
      : await fetchStylesheet(url, fontFamily, isDev, denoInstance).catch(
          (err) => {
            console.error(err);
            return null;
          }
        );

    if (!hasCachedCSS) {
      styleCache.set(url, fontFaceDeclarations ?? null);
    } else {
      styleCache.delete(url);
    }

    if (fontFaceDeclarations == null) {
      throw new Error(`Failed to fetch \`${fontFamily}\` from Google Fonts.`);
    }

    fontFaceDeclarations = fontFaceDeclarations.split("body {", 1)[0];

    const fontFiles = findFontFilesInCss(
      fontFaceDeclarations,
      preload ? subsets : undefined
    );

    const downloadedFiles = await Promise.all(
      fontFiles.map(async ({ googleFontFileUrl, preloadFontFile }) => {
        const hasCachedFont = fontCache.has(googleFontFileUrl);
        const fontFileBuffer = hasCachedFont
          ? fontCache.get(googleFontFileUrl)
          : await fetchFont(googleFontFileUrl, isDev).catch((err) => {
              console.error(err);
              return null;
            });

        if (!hasCachedFont) {
          fontCache.set(googleFontFileUrl, fontFileBuffer ?? null);
        } else {
          fontCache.delete(googleFontFileUrl);
        }

        if (fontFileBuffer == null) {
          throw new Error(
            `Failed to fetch \`${fontFamily}\` from Google Fonts.`
          );
        }

        const ext = /\.(woff|woff2|eot|ttf|otf)$/.exec(googleFontFileUrl)![1];
        const selfHostedFileUrl = emitFontFile(
          fontFileBuffer,
          ext,
          preloadFontFile,
          !!adjustFontFallbackMetrics
        );

        return {
          googleFontFileUrl,
          selfHostedFileUrl,
        };
      })
    );

    let updatedCssResponse = fontFaceDeclarations;
    for (const { googleFontFileUrl, selfHostedFileUrl } of downloadedFiles) {
      updatedCssResponse = updatedCssResponse.replace(
        new RegExp(escapeStringRegexp(googleFontFileUrl), "g"),
        selfHostedFileUrl
      );
    }

    return {
      ...result,
      css: updatedCssResponse,
    };
  } catch (err) {
    if (isDev) {
      if (isServer) {
        console.error(
          `Failed to download \`${fontFamily}\` from Google Fonts. Using fallback font instead.\n\n${
            (err as Error).message
          }}`
        );
      }

      let css = `@font-face {
    font-family: '${fontFamily} Fallback';
    src: local("${adjustFontFallbackMetrics?.fallbackFont ?? "Arial"}");`;
      if (adjustFontFallbackMetrics) {
        css += `
    ascent-override:${adjustFontFallbackMetrics.ascentOverride};
    descent-override:${adjustFontFallbackMetrics.descentOverride};
    line-gap-override:${adjustFontFallbackMetrics.lineGapOverride};
    size-adjust:${adjustFontFallbackMetrics.sizeAdjust};`;
      }
      css += "\n}";

      return {
        ...result,
        css,
      };
    } else {
      throw err;
    }
  }
};
