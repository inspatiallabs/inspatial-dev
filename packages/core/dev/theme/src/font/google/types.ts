export type AdjustFontFallback = {
  fallbackFont: string;
  ascentOverride?: string;
  descentOverride?: string;
  lineGapOverride?: string;
  sizeAdjust?: string;
};

export type FontLoader = (options: {
  functionName: string;
  variableName: string;
  data: any[];
  emitFontFile: (
    content: Uint8Array,
    ext: string,
    preload: boolean,
    isUsingSizeAdjust?: boolean
  ) => string;
  resolve: (src: string) => string;
  isDev: boolean;
  isServer: boolean;
  loaderContext: any;
  denoInstance?: typeof Deno;
}) => Promise<{
  css: string;
  fallbackFonts?: string[];
  variable?: string;
  adjustFontFallback?: AdjustFontFallback;
  weight?: string;
  style?: string;
}>;
