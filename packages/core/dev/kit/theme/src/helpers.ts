/*#######################################(Theme Functions)###########################################*/

// APCA contrast function (simplified version)
export function APCAcontrast(text: number[], background: number[]): number {
  const [Rt, Gt, Bt] = text.map((c) => c / 255);
  const [Rb, Gb, Bb] = background.map((c) => c / 255);

  const Yt = 0.2126 * Rt + 0.7152 * Gt + 0.0722 * Bt;
  const Yb = 0.2126 * Rb + 0.7152 * Gb + 0.0722 * Bb;

  const deltaY = Yt > Yb ? Yt - Yb : Yb - Yt;
  const contrast = 100 * Math.pow(deltaY, 0.6);

  return Yt > Yb ? contrast : -contrast;
}

// Helper function to parse HSL string to RGB array
export function hslToRgb(h: number, s: number, l: number): number[] {
  s /= 100;
  l /= 100;
  const k = (n: number) => (n + h / 30) % 12;
  const a = s * Math.min(l, 1 - l);
  const f = (n: number) =>
    l - a * Math.max(-1, Math.min(k(n) - 3, Math.min(9 - k(n), 1)));
  return [255 * f(0), 255 * f(8), 255 * f(4)].map(Math.round);
}

// Helper function to parse HSL string
export function parseHSL(hslString: string): {
  h: number;
  s: number;
  l: number;
} {
  const [h, s, l] = hslString.match(/\d+/g)!.map(Number);
  return { h, s, l };
}

// Helper function to create HSL string
export function hslToString({
  h,
  s,
  l,
}: {
  h: number;
  s: number;
  l: number;
}): string {
  return `hsl(${h}, ${s}%, ${l}%)`;
}

// Generate theme mode function
export default function generateThemeMode(brandColor: string) {
  const brand = parseHSL(brandColor);

  const generatePalette = (
    baseHue: number,
    baseSaturation: number,
    darkMode: boolean
  ) => {
    const lightness = darkMode ? 20 : 95;
    const step = darkMode ? 10 : -10;
    return {
      background: hslToString({
        h: baseHue,
        s: baseSaturation * 0.3,
        l: lightness,
      }),
      surface: hslToString({
        h: baseHue,
        s: baseSaturation * 0.2,
        l: lightness + step,
      }),
      primary: hslToString({
        h: (baseHue + 30) % 360,
        s: baseSaturation * 0.8,
        l: 50,
      }),
      secondary: hslToString({
        h: (baseHue + 60) % 360,
        s: baseSaturation * 0.6,
        l: 55,
      }),
      muted: hslToString({
        h: baseHue,
        s: baseSaturation * 0.1,
        l: darkMode ? 40 : 80,
      }),
    };
  };

  const lightPalette = generatePalette(brand.h, brand.s, false);
  const darkPalette = generatePalette(brand.h, brand.s, true);

  // Adjust colors for proper contrast
  const adjustColorForContrast = (
    color: string,
    background: string,
    targetContrast: number = 60
  ): string => {
    let { h, s, l } = parseHSL(color);
    let rgbColor = hslToRgb(h, s, l);
    const rgbBackground = hslToRgb(
      ...(Object.values(parseHSL(background)) as [number, number, number])
    );
    let contrast = APCAcontrast(rgbColor, rgbBackground);
    const step = contrast < targetContrast ? 1 : -1;

    while (Math.abs(contrast) < targetContrast && l > 0 && l < 100) {
      l += step;
      rgbColor = hslToRgb(h, s, l);
      contrast = APCAcontrast(rgbColor, rgbBackground);
    }

    return hslToString({ h, s, l });
  };

  lightPalette.primary = adjustColorForContrast(
    lightPalette.primary,
    lightPalette.background
  );
  lightPalette.secondary = adjustColorForContrast(
    lightPalette.secondary,
    lightPalette.background
  );
  darkPalette.primary = adjustColorForContrast(
    darkPalette.primary,
    darkPalette.background
  );
  darkPalette.secondary = adjustColorForContrast(
    darkPalette.secondary,
    darkPalette.background
  );

  return {
    light: {
      brand: brandColor,
      ...lightPalette,
    },
    dark: {
      brand: brandColor,
      ...darkPalette,
    },
    semantic: {
      action: hslToString({ h: (brand.h + 120) % 360, s: brand.s, l: 50 }),
      warning: hslToString({ h: 45, s: 100, l: 50 }),
      info: hslToString({ h: (brand.h + 180) % 360, s: brand.s, l: 50 }),
      error: hslToString({ h: 0, s: 100, l: 50 }),
      success: hslToString({ h: 120, s: 100, l: 50 }),
    },
  };
}

/**
 * Formats an array of values into a string that can be used error messages.
 * ["a", "b", "c"] => "`a`, `b`, `c`"
 */
export const formatAvailableValues = (values: string[]): string =>
  values.map((val) => `\`${val}\``).join(", ");
