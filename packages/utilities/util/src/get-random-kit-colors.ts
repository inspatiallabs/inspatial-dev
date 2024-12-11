/*##############################################(TYPES)##############################################*/

/** Represents a color value in the [{@link https://inspatial.dev/kit} InSpatial Kit] design system */
type KitColor = string;

/*##############################################(KIT-STATIC-COLORS)##############################################*/

/**
 * Static color palette for the [{@link https://inspatial.dev/kit} InSpatial Kit] design system.
 * Includes CSS variables and hex color codes.
 * @readonly
 */
export const InSpatialKitStaticColors = [
  "var(--brand)",
  "var(--primary)",
  "var(--secondary)",
  "var(--muted)",
  "var(--muted-surface)",
  "#5B9FFC", // blue
  "#F16E91", // pink
  "#52CD99", // green
  "#FF6B00", // orange
  "#FFD600", // yellow
  "#9000FF", // pop
  "#EF0381", // trackloud
  "#CE17D6", // pink
  "#8BD8F4", // crystal
  "#1b2240", // black
  "#03082E", // skyblack
  "#D4DCEF", // damp
  "#F9FAFC", // lav
  "#ffffff", // white
  "#EEF1FA", // white.light
  "#F9F9F9", // white.burn
];

/*##############################################(GET-RANDOM-KIT-COLOR-UTIL)##############################################*/
/**
 * Generates an array of random unique colors from the InSpatial Kit color palette.
 * Uses Fisher-Yates shuffle algorithm for unbiased random selection.
 *
 * @param count - The number of random colors to generate
 * @returns Array of randomly selected colors
 *
 * @example
 * ```typescript
 * // Get 3 random colors
 * const threeColors = getRandomKitColors(3);
 * // Example output: ["#5B9FFC", "var(--brand)", "#52CD99"]
 *
 * // Get all colors in random order
 * const allColors = getRandomKitColors(InSpatialKitStaticColors.length);
 *
 * // Invalid input returns empty array
 * const noColors = getRandomKitColors(-1); // returns []
 *
 * // Requesting more colors than available returns all colors in random order
 * const maxColors = getRandomKitColors(100); // returns all colors shuffled
 * ```
 */
export function getRandomKitColors(count: number): KitColor[] {
  if (count < 0) return [];
  if (count > InSpatialKitStaticColors.length) {
    count = InSpatialKitStaticColors.length;
  }

  const availableColors = [...InSpatialKitStaticColors];
  const selectedColors: KitColor[] = [];

  // Fisher-Yates shuffle and take first 'count' elements
  for (let i = 0; i < count && availableColors.length > 0; i++) {
    const randomIndex = Math.floor(Math.random() * availableColors.length);
    selectedColors.push(availableColors[randomIndex]);
    availableColors.splice(randomIndex, 1);
  }

  return selectedColors;
}
