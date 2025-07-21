export const DEFAULT_SANS_SERIF_FONT = {
  name: "Arial",
  xAvgCharWidth: 904,
  azAvgWidth: 934.5116279069767,
  unitsPerEm: 2048,
};

// Basic font metrics interface
interface FontMetrics {
  category: "serif" | "sans-serif";
  ascent: number;
  descent: number;
  lineGap: number;
  unitsPerEm: number;
  xWidthAvg: number;
}

const FONT_METRICS_MAP: Record<string, FontMetrics> = {
  arial: {
    category: "sans-serif",
    ascent: 1854,
    descent: -434,
    lineGap: 67,
    unitsPerEm: 2048,
    xWidthAvg: 904,
  },
  // Add more common fonts as needed ... keep module as independent as possible no dependencies!
};

function formatName(str: string): string {
  return str
    .replace(/(?:^\w|[A-Z]|\b\w)/g, function (word, index) {
      return index === 0 ? word.toLowerCase() : word.toUpperCase();
    })
    .replace(/\s+/g, "");
}

function formatOverrideValue(val: number) {
  return Math.abs(val * 100).toFixed(2);
}
export function calculateSizeAdjustValues(fontName: string) {
  const fontKey = formatName(fontName);
  const fontMetrics = FONT_METRICS_MAP[fontKey];

  if (!fontMetrics) {
    throw new Error(`Font metrics not found for ${fontName}`);
  }

  const { ascent, descent, lineGap, unitsPerEm, xWidthAvg } = fontMetrics;
  const mainFontAvgWidth = xWidthAvg / unitsPerEm;
  const fallbackFont = DEFAULT_SANS_SERIF_FONT;
  const fallbackFontAvgWidth =
    fallbackFont.xAvgCharWidth / fallbackFont.unitsPerEm;
  const sizeAdjust = xWidthAvg ? mainFontAvgWidth / fallbackFontAvgWidth : 1;

  return {
    ascent: formatOverrideValue(ascent / (unitsPerEm * sizeAdjust)),
    descent: formatOverrideValue(Math.abs(descent) / (unitsPerEm * sizeAdjust)),
    lineGap: formatOverrideValue(lineGap / (unitsPerEm * sizeAdjust)),
    fallbackFont: fallbackFont.name,
    sizeAdjust: formatOverrideValue(sizeAdjust),
  };
}
/**
 * Get precalculated fallback font metrics for the Google Fonts family.
 */
export function getFallbackMetrics(fontFamily: string) {
  try {
    const { ascent, descent, lineGap, fallbackFont, sizeAdjust } =
      calculateSizeAdjustValues(fontFamily);
    return {
      fallbackFont,
      ascentOverride: `${ascent}%`,
      descentOverride: `${descent}%`,
      lineGapOverride: `${lineGap}%`,
      sizeAdjust: `${sizeAdjust}%`,
    };
  } catch (_error) {
    console.error(
      `Failed to find font override values for font \`${fontFamily}\``
    );
  }
}
